import { EmergencyDeliveryProvider, SafeRouteProvider } from './providers';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  Sse,
} from '@nestjs/common';
import { Db } from '../core/db';
import { CryptoService } from '../core/crypto';
import { AuthService, AuthedRequest, Roles } from '../auth/auth';
import { parse } from '../core/http';
import { contactSchema, positionSchema } from '@suraksha/validation';
import { isFreshPosition } from '@suraksha/shared';
import { z } from 'zod';
import { interval, concatMap } from 'rxjs';
@Controller()
export class SafetyController {
  constructor(
    @Inject(Db) private db: Db,
    @Inject(CryptoService) private crypto: CryptoService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(EmergencyDeliveryProvider) private delivery: EmergencyDeliveryProvider,
    @Inject(SafeRouteProvider) private routes: SafeRouteProvider,
  ) {}
  @Roles('USER') @Get('contacts') async contacts(@Req() r: AuthedRequest) {
    return (
      await this.db.trustedContact.findMany({
        where: { ownerId: r.user.id },
        orderBy: { priority: 'desc' },
      })
    ).map((c) => ({
      id: c.id,
      name: c.name,
      relationship: c.relationship,
      phone: this.crypto.open(c.phoneCipher),
      priority: c.priority,
    }));
  }
  @Roles('USER') @Post('contacts') async contact(@Req() r: AuthedRequest, @Body() body: unknown) {
    const { phone, ...input } = parse(contactSchema, body);
    return this.db.trustedContact.create({
      data: { ...input, phoneCipher: this.crypto.seal(phone), ownerId: r.user.id },
      select: { id: true },
    });
  }
  @Roles('USER') @Delete('contacts/:id') async removeContact(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    await this.db.trustedContact.deleteMany({ where: { id, ownerId: r.user.id } });
    return { ok: true };
  }
  @Roles('USER') @Post('sos') async activate(@Req() r: AuthedRequest, @Body() body: unknown) {
    const input = parse(
      z
        .object({
          idempotencyKey: z.string().uuid(),
          location: positionSchema.optional(),
          locationState: z.enum(['AVAILABLE', 'DENIED', 'UNAVAILABLE', 'STALE']),
        })
        .strict(),
      body,
    );
    const previous = await this.db.sOSAlert.findUnique({
      where: { ownerId_requestKey: { ownerId: r.user.id, requestKey: input.idempotencyKey } },
    });
    if (previous) return this.sos(r, previous.id);
    if (process.env.DELIVERY_PROVIDER !== 'development')
      throw new ForbiddenException('No production emergency provider is configured');
    const contacts = await this.db.trustedContact.findMany({
      where: { ownerId: r.user.id },
      orderBy: { priority: 'desc' },
    });
    const alert = await this.db.$transaction(async (tx) => {
      const location =
        input.location && isFreshPosition(input.location.capturedAt) ? input.location : null;
      const created = await tx.sOSAlert.create({
        data: {
          ownerId: r.user.id,
          requestKey: input.idempotencyKey,
          locationState: location ? 'AVAILABLE' : input.location ? 'STALE' : input.locationState,
          events: { create: { type: 'ACTIVATED', actorId: r.user.id } },
          deliveries: {
            create: this.delivery.prepare(contacts.map((c) => c.name)),
          },
        },
      });
      if (location)
        await tx.locationEvent.create({
          data: { ...location, ownerId: r.user.id, sosId: created.id },
        });
      for (const audienceId of [r.user.id, 'ADMIN', 'POLICE:Colombo'])
        await tx.outboxEvent.create({
          data: { type: 'sos.created', resourceId: created.id, audienceId },
        });
      await tx.auditLog.create({
        data: { actorId: r.user.id, action: 'SOS_ACTIVATED', resourceId: created.id },
      });
      return created;
    });
    return this.sos(r, alert.id);
  }
  @Roles('USER', 'ADMIN', 'POLICE') @Get('sos/:id') async sos(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    const item = await this.db.sOSAlert.findUniqueOrThrow({
      where: { id },
      include: {
        locations: { orderBy: { capturedAt: 'desc' }, take: 20 },
        events: { orderBy: { createdAt: 'asc' } },
        deliveries: true,
      },
    });
    if (r.user.role === 'USER' && item.ownerId !== r.user.id) throw new ForbiddenException();
    if (r.user.role === 'POLICE' && item.jurisdiction !== r.user.jurisdiction)
      throw new ForbiddenException();
    const { ownerId: _owner, requestKey: _key, ...view } = item;
    return { ...view, deliveryMode: 'development', responderConfirmed: item.responderId !== null };
  }
  @Roles('USER', 'POLICE') @Patch('sos/:id/status') async close(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = parse(z.object({ status: z.enum(['SAFE', 'CANCELLED']) }), body);
    const item = await this.db.sOSAlert.findUniqueOrThrow({ where: { id } });
    if (!(item.ownerId === r.user.id || item.responderId === r.user.id))
      throw new ForbiddenException();
    if (input.status === 'CANCELLED' && item.status === 'RESPONDING')
      throw new ForbiddenException('Use I am safe now after a responder joins');
    await this.db.$transaction([
      this.db.sOSAlert.update({ where: { id }, data: { status: input.status } }),
      this.db.sOSEvent.create({ data: { sosId: id, type: input.status, actorId: r.user.id } }),
      this.db.outboxEvent.create({
        data: { type: 'sos.closed', resourceId: id, audienceId: 'POLICE:' + item.jurisdiction },
      }),
    ]);
    return this.sos(r, id);
  }
  @Roles('POLICE') @Get('police/alerts') async alerts(@Req() r: AuthedRequest) {
    const items = await this.db.sOSAlert.findMany({
      where: { jurisdiction: r.user.jurisdiction, status: { in: ['ACTIVE', 'RESPONDING'] } },
      orderBy: { createdAt: 'asc' },
    });
    return Promise.all(items.map((x) => this.sos(r, x.id)));
  }
  @Roles('POLICE') @Post('sos/:id/respond') async respond(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    const updated = await this.db.sOSAlert.updateMany({
      where: { id, jurisdiction: r.user.jurisdiction, responderId: null, status: 'ACTIVE' },
      data: { responderId: r.user.id, status: 'RESPONDING' },
    });
    if (!updated.count) throw new ForbiddenException('Alert unavailable or already assigned');
    await this.db.sOSEvent.create({
      data: { sosId: id, type: 'RESPONDER_JOINED', actorId: r.user.id },
    });
    return this.sos(r, id);
  }
  @Roles('USER') @Get('location/shares') shares(@Req() r: AuthedRequest) {
    return this.db.locationShare.findMany({
      where: { ownerId: r.user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { contact: { select: { id: true, name: true } } },
    });
  }
  @Roles('USER') @Post('location/shares') async share(
    @Req() r: AuthedRequest,
    @Body() body: unknown,
  ) {
    const input = parse(
      z.object({ contactId: z.string().uuid(), minutes: z.number().int().min(5).max(120) }),
      body,
    );
    const contact = await this.db.trustedContact.findFirst({
      where: { id: input.contactId, ownerId: r.user.id },
    });
    if (!contact) throw new ForbiddenException();
    return this.db.locationShare.create({
      data: {
        ownerId: r.user.id,
        contactId: input.contactId,
        expiresAt: new Date(Date.now() + input.minutes * 60000),
      },
    });
  }
  @Roles('USER') @Delete('location/shares/:id') async stop(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    await this.db.locationShare.updateMany({
      where: { id, ownerId: r.user.id },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }
  @Roles('USER') @Post('location/events') async location(
    @Req() r: AuthedRequest,
    @Body() body: unknown,
  ) {
    const input = parse(positionSchema.extend({ sosId: z.string().uuid().optional() }), body);
    if (!isFreshPosition(input.capturedAt)) throw new ForbiddenException('Location is stale');
    if (input.sosId) {
      const sos = await this.db.sOSAlert.findFirst({
        where: { id: input.sosId, ownerId: r.user.id, status: { in: ['ACTIVE', 'RESPONDING'] } },
      });
      if (!sos) throw new ForbiddenException();
    } else if (
      !(await this.db.locationShare.count({
        where: { ownerId: r.user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      }))
    )
      throw new ForbiddenException('Start a consented share first');
    return this.db.locationEvent.create({ data: { ...input, ownerId: r.user.id } });
  }
  @Get('danger-zones') zones() {
    return this.db.dangerZone.findMany({ take: 100 });
  }
  @Roles('USER') @Post('routes') async route(@Body() body: unknown) {
    const input = parse(z.object({ origin: positionSchema, destination: positionSchema }), body);
    return this.routes.plan(input.origin, input.destination, await this.zones());
  }
  @Get('notifications') notifications(@Req() r: AuthedRequest) {
    return this.db.notification.findMany({
      where: { userId: r.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  @Patch('notifications/:id') async read(@Req() r: AuthedRequest, @Param('id') id: string) {
    await this.db.notification.updateMany({
      where: { id, userId: r.user.id },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }
  @Sse('events') events(@Req() r: AuthedRequest) {
    let since = new Date();
    return interval(2000).pipe(
      concatMap(async () => {
        let principal;
        try {
          principal = await this.auth.principal(
            r.headers.authorization?.replace(/^Bearer /, '') || r.cookies?.suraksha_access || '',
          );
        } catch {
          return { data: { type: 'session.expired' } };
        }
        const audience = [
          r.user.id,
          ...(r.user.role === 'ADMIN' ? ['ADMIN'] : []),
          ...(principal.user.role === 'POLICE' ? ['POLICE:' + principal.user.jurisdiction] : []),
        ];
        const now = new Date();
        const events = await this.db.outboxEvent.findMany({
          where: { audienceId: { in: audience }, createdAt: { gt: since, lte: now } },
          select: { id: true, type: true, resourceId: true },
          take: 100,
        });
        since = now;
        return { data: { events } };
      }),
    );
  }
}
