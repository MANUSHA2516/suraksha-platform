import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Db } from '../core/db';
import { CryptoService } from '../core/crypto';
import { AuthedRequest, Roles } from '../auth/auth';
import { parse } from '../core/http';
import { messageSchema } from '@suraksha/validation';
import { z } from 'zod';
@Controller()
export class CounselingController {
  constructor(
    @Inject(Db) private db: Db,
    @Inject(CryptoService) private crypto: CryptoService,
  ) {}
  private async allowed(r: AuthedRequest, id: string) {
    const a = await this.db.counselingAppointment.findUniqueOrThrow({
      where: { id },
      include: { slot: true },
    });
    if (
      !(r.user.role === 'USER' && a.clientId === r.user.id) &&
      !(r.user.role === 'COUNSELOR' && a.counselorId === r.user.id)
    )
      throw new ForbiddenException('This care record is private');
    return a;
  }
  @Roles('USER') @Post('wellbeing/check-ins') checkin(
    @Req() r: AuthedRequest,
    @Body() body: unknown,
  ) {
    const input = parse(
      z.object({
        answer: z.enum([
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ]),
        shared: z.boolean().default(false),
      }),
      body,
    );
    return this.db.wellbeingCheckIn.create({
      data: {
        ownerId: r.user.id,
        answerCipher: this.crypto.seal(input.answer),
        shared: input.shared,
      },
      select: { id: true, instrument: true, shared: true, createdAt: true },
    });
  }
  @Roles('USER') @Get('wellbeing/check-ins/:id') async result(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    const item = await this.db.wellbeingCheckIn.findFirstOrThrow({
      where: { id, ownerId: r.user.id },
    });
    return {
      id,
      answer: this.crypto.open(item.answerCipher),
      shared: item.shared,
      score: null,
      instrument: item.instrument,
      notice:
        'Your check-in is saved privately. The source does not supply a complete validated questionnaire, so no anxiety score or diagnosis is calculated.',
    };
  }
  @Roles('USER') @Patch('wellbeing/check-ins/:id') async consent(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = parse(z.object({ shared: z.boolean() }), body);
    await this.db.wellbeingCheckIn.updateMany({ where: { id, ownerId: r.user.id }, data: input });
    return { ok: true };
  }
  @Roles('USER', 'COUNSELOR') @Get('counselors/availability') availability() {
    return this.db.counselorSlot.findMany({
      where: {
        startsAt: { gt: new Date() },
        appointments: { none: {} },
        counselor: { verified: true, status: 'ACTIVE' },
      },
      include: {
        counselor: {
          select: {
            id: true,
            name: true,
            staff: { select: { specialization: true, languages: true } },
          },
        },
      },
      orderBy: { startsAt: 'asc' },
      take: 100,
    });
  }
  @Roles('USER') @Post('counseling/appointments') async book(
    @Req() r: AuthedRequest,
    @Body() body: unknown,
  ) {
    const input = parse(
      z.object({ slotId: z.string().uuid(), modality: z.enum(['CHAT', 'VIDEO']).default('CHAT') }),
      body,
    );
    const slot = await this.db.counselorSlot.findFirstOrThrow({
      where: {
        id: input.slotId,
        startsAt: { gt: new Date() },
        counselor: { verified: true, status: 'ACTIVE' },
      },
    });
    const clientAlias = 'Client #' + this.crypto.hash(r.user.id).slice(0, 6).toUpperCase();
    const a = await this.db.counselingAppointment.create({
      data: {
        clientId: r.user.id,
        counselorId: slot.counselorId,
        slotId: slot.id,
        clientAlias,
        modality: input.modality,
      },
    });
    await this.db.notification.create({
      data: {
        userId: slot.counselorId,
        type: 'BOOKING',
        message: 'A confidential session has been booked',
        resourceId: a.id,
      },
    });
    return { id: a.id, clientAlias, startsAt: slot.startsAt, status: a.status };
  }
  @Roles('USER', 'COUNSELOR') @Get('counseling/appointments') async appointments(
    @Req() r: AuthedRequest,
  ) {
    const items = await this.db.counselingAppointment.findMany({
      where: r.user.role === 'USER' ? { clientId: r.user.id } : { counselorId: r.user.id },
      include: { slot: true },
      orderBy: { slot: { startsAt: 'asc' } },
      take: 100,
    });
    return items.map((a) => ({
      id: a.id,
      clientAlias: a.clientAlias,
      startsAt: a.slot.startsAt,
      status: a.status,
      modality: a.modality,
      concern: a.concern,
    }));
  }
  @Roles('COUNSELOR') @Get('counseling/clients/:id') async client(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    const a = await this.allowed(r, id);
    const history = await this.db.counselingAppointment.findMany({
      where: { clientId: a.clientId, counselorId: r.user.id },
      include: { slot: true, notes: true },
      orderBy: { slot: { startsAt: 'desc' } },
    });
    const screening = await this.db.wellbeingCheckIn.findFirst({
      where: { ownerId: a.clientId, shared: true },
      orderBy: { createdAt: 'desc' },
    });
    return {
      id: a.id,
      clientAlias: a.clientAlias,
      status: a.status,
      startsAt: a.slot.startsAt,
      modality: a.modality,
      screening: screening
        ? {
            answer: this.crypto.open(screening.answerCipher),
            instrument: screening.instrument,
            score: null,
          }
        : null,
      history: history.map((x) => ({
        id: x.id,
        startsAt: x.slot.startsAt,
        modality: x.modality,
        status: x.status,
        notes: x.notes.map((n) => ({
          id: n.id,
          summary: this.crypto.open(n.summaryCipher),
          cadence: n.cadence,
          risk: n.risk,
          createdAt: n.createdAt,
        })),
      })),
    };
  }
  @Roles('COUNSELOR') @Post('counseling/sessions/:id/start') async start(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    await this.allowed(r, id);
    await this.db.counselingAppointment.update({ where: { id }, data: { status: 'IN_SESSION' } });
    return { ok: true, videoProvider: 'unavailable', chatAvailable: true };
  }
  @Roles('COUNSELOR') @Post('counseling/sessions/:id/notes') async notes(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const a = await this.allowed(r, id);
    const input = parse(
      z.object({
        summary: z.string().min(1).max(20000),
        cadence: z.enum(['One-time', 'Weekly', 'Biweekly', 'Monthly']),
        cadenceNote: z.string().max(2000).default(''),
        risk: z.enum(['Low', 'Mid', 'Moderate', 'High']),
        nextSlotId: z.string().uuid().optional(),
      }),
      body,
    );
    return this.db.$transaction(async (tx) => {
      let followup: string | null = null;
      if (input.nextSlotId) {
        const slot = await tx.counselorSlot.findFirst({
          where: { id: input.nextSlotId, counselorId: r.user.id, startsAt: { gt: new Date() } },
        });
        if (!slot) throw new ConflictException('Choose your available follow-up slot');
        const next = await tx.counselingAppointment.create({
          data: {
            clientId: a.clientId,
            counselorId: r.user.id,
            slotId: slot.id,
            clientAlias: a.clientAlias,
            concern: 'Follow-up',
          },
        });
        followup = next.id;
      }
      const note = await tx.counselingNote.create({
        data: {
          appointmentId: id,
          summaryCipher: this.crypto.seal(input.summary),
          cadence: input.cadence,
          cadenceNoteCipher: this.crypto.seal(input.cadenceNote),
          risk: input.risk,
        },
      });
      await tx.counselingAppointment.update({ where: { id }, data: { status: 'COMPLETED' } });
      await tx.auditLog.create({
        data: { actorId: r.user.id, action: 'CLINICAL_NOTE_SAVED', resourceId: note.id },
      });
      return { id: note.id, followup };
    });
  }
  @Roles('COUNSELOR') @Post('counseling/sessions/:id/escalate') async escalate(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    await this.allowed(r, id);
    await this.db.auditLog.create({
      data: {
        actorId: r.user.id,
        action: 'CRISIS_REFERRAL_REQUESTED_PROVIDER_UNAVAILABLE',
        resourceId: id,
      },
    });
    return {
      status: 'RECORDED',
      notice: 'Referral recorded. No external crisis team is connected.',
    };
  }
  @Roles('USER', 'COUNSELOR') @Get('counseling/sessions/:id/messages') async messages(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    await this.allowed(r, id);
    return (
      await this.db.counselingMessage.findMany({
        where: { appointmentId: id },
        orderBy: { createdAt: 'asc' },
        take: 200,
      })
    ).map((m) => ({
      id: m.id,
      role: m.senderRole,
      body: this.crypto.open(m.bodyCipher),
      createdAt: m.createdAt,
    }));
  }
  @Roles('USER', 'COUNSELOR') @Post('counseling/sessions/:id/messages') async message(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.allowed(r, id);
    const input = parse(messageSchema, body);
    await this.db.counselingMessage.create({
      data: {
        appointmentId: id,
        senderRole: r.user.role,
        bodyCipher: this.crypto.seal(input.body),
      },
    });
    return this.messages(r, id);
  }
}
