import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Db } from '../core/db';
import { CryptoService } from '../core/crypto';
import { AuthedRequest, Roles } from '../auth/auth';
import type { Principal } from '@suraksha/types';
import { reportSchema, messageSchema } from '@suraksha/validation';
import { parse } from '../core/http';
import { evidenceSelect } from '../evidence/evidence';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { canAdvance } from '@suraksha/shared';
import type { Prisma } from '@prisma/client';
@Injectable()
export class CaseService {
  constructor(
    @Inject(Db) private db: Db,
    @Inject(CryptoService) private crypto: CryptoService,
  ) {}
  async allowed(user: Principal, reference: string) {
    const item = await this.db.case.findUnique({
      where: { reference },
      include: {
        owner: true,
        officer: { select: { id: true, name: true } },
        report: true,
        evidence: { include: { evidence: { select: evidenceSelect } } },
        events: { orderBy: { createdAt: 'asc' } },
        analyses: true,
      },
    });
    if (!item) throw new NotFoundException();
    if (!(
      user.role === 'ADMIN' ||
      (user.role === 'USER' && item.ownerId === user.id) ||
      (user.role === 'POLICE' && item.officerId === user.id)
    ))
      throw new ForbiddenException('This case is not assigned to you');
    return item;
  }
  async view(user: Principal, reference: string) {
    const item = await this.allowed(user, reference);
    const analyses = await this.db.aIAnalysis.findMany({
      where: { ownerId: item.ownerId, OR: [
        { caseId: item.id },
        { evidenceId: { in: item.evidence.map((link) => link.evidenceId) } },
      ] },
    });
    return {
      id: item.id,
      reference: item.reference,
      category: item.category,
      stage: item.stage,
      triage: item.triage,
      priority: item.priority,
      anonymous: item.anonymous,
      escalated: item.escalated,
      version: item.version,
      createdAt: item.createdAt,
      demo: item.demo,
      reporter: item.anonymous && user.role === 'ADMIN' ? 'Anonymous' : item.owner.name,
      officer: item.officer,
      narrative: item.report ? this.crypto.open(item.report.narrativeCipher) : '',
      evidence: item.evidence.map((x) => x.evidence),
      events: item.events.map((e) => ({
        id: e.id,
        type: e.type,
        publicText: e.publicText,
        createdAt: e.createdAt,
        ...(user.role !== 'USER' && e.privateCipher
          ? { privateNote: this.crypto.open(e.privateCipher) }
          : {}),
      })),
      analysis: analyses.map((a) => ({
        id: a.id,
        classification: a.classification,
        riskLevel: a.riskLevel,
        confidence: a.confidence,
        modelVersion: a.modelVersion,
        validationStatus: a.validationStatus,
      })),
    };
  }
  async list(user: Principal) {
    const where: Prisma.CaseWhereInput =
      user.role === 'ADMIN'
        ? {}
        : user.role === 'POLICE'
          ? { officerId: user.id }
          : { ownerId: user.id };
    const rows = await this.db.case.findMany({
      where,
      select: { reference: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return Promise.all(rows.map((r) => this.view(user, r.reference)));
  }
  async create(user: Principal, body: unknown) {
    const input = parse(reportSchema, body);
    const existing = await this.db.case.findUnique({
      where: { ownerId_requestKey: { ownerId: user.id, requestKey: input.idempotencyKey } },
    });
    if (existing) return this.view(user, existing.reference);
    const item = await this.db.$transaction(async (tx) => {
      const ids = [...new Set(input.evidenceIds)];
      const count = await tx.evidence.count({ where: { id: { in: ids }, ownerId: user.id } });
      if (count !== ids.length) throw new ForbiddenException('Attach only your own evidence');
      const created = await tx.case.create({
        data: {
          reference: `pending-${randomUUID()}`,
          ownerId: user.id,
          category: input.category,
          anonymous: input.anonymous,
          requestKey: input.idempotencyKey,
          demo: user.demo,
          report: {
            create: {
              occurredAt: input.occurredAt,
              narrativeCipher: this.crypto.seal(input.description),
            },
          },
        },
      });
      const reference = `SL-${created.number + 2290}`;
      await tx.case.update({ where: { id: created.id }, data: { reference } });
      for (const evidenceId of ids)
        await tx.caseEvidence.create({ data: { caseId: created.id, evidenceId } });
      await tx.evidence.updateMany({ where: { id: { in: ids } }, data: { sealedAt: new Date() } });
      await tx.caseEvent.create({
        data: {
          caseId: created.id,
          actorId: user.id,
          type: 'FILED',
          publicText: 'Report received',
        },
      });
      await tx.auditLog.create({
        data: { actorId: user.id, action: 'REPORT_FILED', resourceId: created.id },
      });
      await tx.outboxEvent.create({
        data: { type: 'case.created', resourceId: reference, audienceId: 'ADMIN' },
      });
      return { reference };
    });
    return this.view(user, item.reference);
  }
  async assign(user: Principal, reference: string, body: unknown) {
    const input = parse(
      z.object({ officerId: z.string().uuid(), expectedVersion: z.number().int() }),
      body,
    );
    const item = await this.allowed(user, reference);
    const officer = await this.db.user.findFirst({
      where: { id: input.officerId, role: 'POLICE', verified: true, status: 'ACTIVE' },
    });
    if (!officer) throw new ForbiddenException('Choose an active verified officer');
    await this.db.$transaction(async (tx) => {
      const updated = await tx.case.updateMany({
        where: { id: item.id, version: input.expectedVersion, stage: { not: 'RESOLVED' } },
        data: { officerId: officer.id, triage: 'IN_REVIEW', version: { increment: 1 } },
      });
      if (updated.count !== 1)
        throw new ConflictException('Case changed or is resolved; refresh it');
      await tx.caseEvent.create({
        data: {
          caseId: item.id,
          actorId: user.id,
          type: 'ASSIGNED',
          publicText: 'Assigned to Police',
        },
      });
      await tx.auditLog.create({
        data: { actorId: user.id, action: 'CASE_ASSIGNED', resourceId: item.id },
      });
      for (const audienceId of [item.ownerId, officer.id, 'ADMIN'])
        await tx.outboxEvent.create({
          data: { type: 'case.assigned', resourceId: reference, audienceId },
        });
      await tx.notification.create({
        data: {
          userId: officer.id,
          type: 'CASE_ASSIGNED',
          message: 'A case has been assigned to you',
          resourceId: reference,
        },
      });
    });
    return this.view(user, reference);
  }
  async status(user: Principal, reference: string, body: unknown) {
    const input = parse(
      z.object({
        stage: z.enum(['FILED', 'UNDER_INVESTIGATION', 'SUSPECT_CONTACTED', 'RESOLVED']),
        notes: z.string().max(10000),
        expectedVersion: z.number().int(),
      }),
      body,
    );
    const item = await this.allowed(user, reference);
    if (!canAdvance(item.stage, input.stage))
      throw new ConflictException('Choose the next investigation stage');
    await this.db.$transaction(async (tx) => {
      const result = await tx.case.updateMany({
        where: { id: item.id, officerId: user.id, version: input.expectedVersion },
        data: { stage: input.stage, version: { increment: 1 } },
      });
      if (result.count !== 1) throw new ConflictException('Case changed; refresh before saving');
      await tx.caseEvent.create({
        data: {
          caseId: item.id,
          actorId: user.id,
          type: input.stage,
          publicText: input.stage.toLowerCase().replaceAll('_', ' '),
          privateCipher: this.crypto.seal(input.notes),
        },
      });
      await tx.auditLog.create({
        data: { actorId: user.id, action: 'CASE_STATUS_UPDATED', resourceId: item.id },
      });
      for (const audienceId of [item.ownerId, user.id, 'ADMIN'])
        await tx.outboxEvent.create({
          data: { type: 'case.statusChanged', resourceId: reference, audienceId },
        });
    });
    return this.view(user, reference);
  }
  async action(user: Principal, reference: string, body: unknown) {
    const input = parse(
      z.object({
        type: z.enum(['REQUEST_INFO', 'INTERNAL_NOTE', 'ESCALATE', 'RESOLVE']),
        note: z.string().max(10000).default(''),
        expectedVersion: z.number().int(),
      }),
      body,
    );
    const item = await this.allowed(user, reference);
    if (user.role === 'POLICE' && input.type === 'RESOLVE')
      throw new ForbiddenException('Use the investigation stepper');
    await this.db.$transaction(async (tx) => {
      const result = await tx.case.updateMany({
        where: { id: item.id, version: input.expectedVersion },
        data: {
          version: { increment: 1 },
          ...(input.type === 'ESCALATE' ? { escalated: true } : {}),
          ...(input.type === 'RESOLVE' ? { stage: 'RESOLVED' } : {}),
        },
      });
      if (!result.count) throw new ConflictException('Refresh the case');
      await tx.caseEvent.create({
        data: {
          caseId: item.id,
          actorId: user.id,
          type: input.type,
          publicText:
            input.type === 'INTERNAL_NOTE'
              ? 'Case reviewed'
              : input.type.toLowerCase().replaceAll('_', ' '),
          privateCipher: this.crypto.seal(input.note),
        },
      });
      await tx.auditLog.create({
        data: { actorId: user.id, action: input.type, resourceId: item.id },
      });
      await tx.outboxEvent.create({
        data: { type: 'case.updated', resourceId: reference, audienceId: item.ownerId },
      });
    });
    return this.view(user, reference);
  }
  async messages(user: Principal, reference: string, body?: unknown) {
    const item = await this.allowed(user, reference);
    if (user.role === 'ADMIN') throw new ForbiddenException('Case officer messages are private');
    if (body) {
      const input = parse(messageSchema, body);
      await this.db.caseMessage.create({
        data: { caseId: item.id, senderId: user.id, bodyCipher: this.crypto.seal(input.body) },
      });
    }
    return (
      await this.db.caseMessage.findMany({
        where: { caseId: item.id },
        orderBy: { createdAt: 'asc' },
        take: 200,
      })
    ).map((m) => ({
      id: m.id,
      body: this.crypto.open(m.bodyCipher),
      mine: m.senderId === user.id,
      createdAt: m.createdAt,
    }));
  }
}
@Controller()
export class CaseController {
  constructor(@Inject(CaseService) private cases: CaseService) {}
  @Roles('USER') @Post('reports') create(@Req() r: AuthedRequest, @Body() b: unknown) {
    return this.cases.create(r.user, b);
  }
  @Roles('USER', 'ADMIN', 'POLICE') @Get('cases') list(@Req() r: AuthedRequest) {
    return this.cases.list(r.user);
  }
  @Roles('USER', 'ADMIN', 'POLICE') @Get('cases/:reference') get(
    @Req() r: AuthedRequest,
    @Param('reference') ref: string,
  ) {
    return this.cases.view(r.user, ref);
  }
  @Roles('ADMIN') @Post('cases/:reference/assignment') assign(
    @Req() r: AuthedRequest,
    @Param('reference') ref: string,
    @Body() b: unknown,
  ) {
    return this.cases.assign(r.user, ref, b);
  }
  @Roles('POLICE') @Patch('cases/:reference/status') status(
    @Req() r: AuthedRequest,
    @Param('reference') ref: string,
    @Body() b: unknown,
  ) {
    return this.cases.status(r.user, ref, b);
  }
  @Roles('ADMIN', 'POLICE') @Post('cases/:reference/actions') action(
    @Req() r: AuthedRequest,
    @Param('reference') ref: string,
    @Body() b: unknown,
  ) {
    return this.cases.action(r.user, ref, b);
  }
  @Roles('USER', 'POLICE') @Get('cases/:reference/messages') messages(
    @Req() r: AuthedRequest,
    @Param('reference') ref: string,
  ) {
    return this.cases.messages(r.user, ref);
  }
  @Roles('USER', 'POLICE') @Post('cases/:reference/messages') message(
    @Req() r: AuthedRequest,
    @Param('reference') ref: string,
    @Body() b: unknown,
  ) {
    return this.cases.messages(r.user, ref, b);
  }
}
