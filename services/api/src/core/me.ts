import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Db } from './db';
import { CryptoService } from './crypto';
import { ObjectStore, EvidenceService } from '../evidence/evidence';
import { AuthedRequest, Roles, safeUser } from '../auth/auth';
import { hash, verify } from 'argon2';
import { parse } from './http';
import { z } from 'zod';
@Controller('me')
export class MeController {
  constructor(
    @Inject(Db) private db: Db,
    @Inject(CryptoService) private crypto: CryptoService,
    @Inject(ObjectStore) private objects: ObjectStore,
    @Inject(EvidenceService) private evidence: EvidenceService,
  ) {}
  @Get() async me(@Req() r: AuthedRequest) {
    return safeUser(await this.db.user.findUniqueOrThrow({ where: { id: r.user.id } }));
  }
  @Roles('USER') @Get('overview') async overview(@Req() r: AuthedRequest) {
    return {
      user: await this.me(r),
      evidenceCount: await this.db.evidence.count({ where: { ownerId: r.user.id } }),
      openReports: await this.db.case.count({
        where: { ownerId: r.user.id, stage: { not: 'RESOLVED' } },
      }),
    };
  }
  @Patch('preferences') async preferences(@Req() r: AuthedRequest, @Body() body: unknown) {
    const input = parse(
      z
        .object({
          locale: z.enum(['en', 'si', 'ta']).optional(),
          disguise: z.enum(['calculator', 'notes', 'weather']).optional(),
          notificationsEnabled: z.boolean().optional(),
          locationDefault: z.boolean().optional(),
          biometricEnabled: z.boolean().optional(),
        })
        .strict(),
      body,
    );
    return safeUser(await this.db.user.update({ where: { id: r.user.id }, data: input }));
  }
  @Roles('USER') @Post('security/pin') async pin(@Req() r: AuthedRequest, @Body() body: unknown) {
    const input = parse(
      z.object({ pin: z.string().regex(/^\d{6}$/), currentPin: z.string().optional() }),
      body,
    );
    const u = await this.db.user.findUniqueOrThrow({ where: { id: r.user.id } });
    if (u.pinHash && (!input.currentPin || !(await verify(u.pinHash, input.currentPin))))
      throw new ForbiddenException('Enter your current PIN');
    await this.db.user.update({
      where: { id: u.id },
      data: { pinHash: await hash(input.pin), pinAttempts: 0, pinLockedUntil: null },
    });
    return { ok: true };
  }
  @Roles('USER') @Post('security/unlock') unlock(@Req() r: AuthedRequest, @Body() body: unknown) {
    return this.evidence.unlock(
      r.user,
      parse(z.object({ pin: z.string().regex(/^\d{6}$/) }), body).pin,
    );
  }
  @Roles('USER') @Delete() async erase(@Req() r: AuthedRequest, @Body() body: unknown) {
    parse(z.object({ confirmation: z.literal('DELETE EVERYTHING') }), body);
    const userId = r.user.id;
    const job = await this.db.deletionJob.create({ data: { userId, status: 'ERASING' } });
    await this.db.refreshSession.updateMany({ where: { userId }, data: { revokedAt: new Date() } });
    const evidence = await this.db.evidence.findMany({ where: { ownerId: userId } });
    for (const item of evidence) await this.objects.remove(item.objectKey);
    await this.db.$transaction(async (tx) => {
      await tx.case.deleteMany({ where: { ownerId: userId } });
      await tx.aIAnalysis.deleteMany({ where: { ownerId: userId } });
      await tx.evidence.deleteMany({ where: { ownerId: userId } });
      await tx.sOSAlert.deleteMany({ where: { ownerId: userId } });
      await tx.legalQuery.deleteMany({ where: { ownerId: userId } });
      await tx.counselingAppointment.deleteMany({ where: { clientId: userId } });
      await tx.wellbeingCheckIn.deleteMany({ where: { ownerId: userId } });
      await tx.communityComment.deleteMany({ where: { authorId: userId } });
      await tx.communityPost.deleteMany({ where: { authorId: userId } });
      await tx.communityLike.deleteMany({ where: { userId } });
      await tx.trustedContact.deleteMany({ where: { ownerId: userId } });
      await tx.locationEvent.deleteMany({ where: { ownerId: userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.consent.deleteMany({ where: { userId } });
      await tx.auditLog.updateMany({
        where: { actorId: userId },
        data: { actorId: null, resourceId: null },
      });
      await tx.outboxEvent.deleteMany({ where: { audienceId: userId } });
      await tx.user.update({
        where: { id: userId },
        data: {
          status: 'DELETED',
          name: 'Deleted account',
          login: 'deleted-' + userId,
          nicCipher: null,
          phoneCipher: null,
          passwordHash: 'revoked',
          pinHash: null,
        },
      });
      await tx.deletionJob.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    });
    return {
      status: 'COMPLETED',
      notice:
        'Active account data and evidence objects erased. Anonymous operational audit records remain.',
    };
  }
}
