import { Body, Controller, Get, Inject, Param, Patch, Post, Req } from '@nestjs/common';
import { Db } from '../core/db';
import { AuthedRequest, Roles, safeUser } from '../auth/auth';
import { parse } from '../core/http';
import { z } from 'zod';
import { password } from '@suraksha/validation';
import { hash } from 'argon2';
@Controller('admin')
@Roles('ADMIN')
export class AdminController {
  constructor(@Inject(Db) private db: Db) {}
  @Get('overview') async overview() {
    const [users, verified, openReports, sosToday, incidents, events] = await Promise.all([
      this.db.user.count({ where: { status: 'ACTIVE' } }),
      this.db.user.count({ where: { verified: true, status: 'ACTIVE' } }),
      this.db.case.count({ where: { stage: { not: 'RESOLVED' } } }),
      this.db.sOSAlert.count({
        where: { createdAt: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) } },
      }),
      this.db.case.findMany({
        select: {
          reference: true,
          category: true,
          stage: true,
          priority: true,
          createdAt: true,
          officer: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      this.db.auditLog.findMany({
        where: {
          action: {
            in: [
              'REPORT_FILED',
              'CASE_ASSIGNED',
              'SOS_ACTIVATED',
              'REGISTER',
              'MODERATION_APPROVE',
              'MODERATION_REMOVE',
            ],
          },
        },
        select: { id: true, action: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);
    const days = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        start.setUTCDate(start.getUTCDate() - 6 + i);
        const end = new Date(start.getTime() + 86400000);
        return {
          date: start.toISOString(),
          reports: await this.db.case.count({ where: { createdAt: { gte: start, lt: end } } }),
          sos: await this.db.sOSAlert.count({ where: { createdAt: { gte: start, lt: end } } }),
        };
      }),
    );
    return {
      users,
      verified,
      openReports,
      sosToday,
      incidents,
      events,
      days,
      provenance: 'Calculated from this database; development records may be present',
    };
  }
  @Get('users') async users() {
    return (
      await this.db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { staff: true },
      })
    ).map((u) => ({
      ...safeUser(u),
      status: u.status,
      credentialId: u.staff?.credentialId,
      createdAt: u.createdAt,
    }));
  }
  @Post('users') async add(@Req() r: AuthedRequest, @Body() body: unknown) {
    const input = parse(
      z.object({
        name: z.string().min(2).max(100),
        login: z.string().min(3).max(100),
        password,
        role: z.enum(['POLICE', 'COUNSELOR', 'LEGAL_ADVISOR', 'ADMIN']),
        jurisdiction: z.string().min(1).max(100),
      }),
      body,
    );
    const user = await this.db.user.create({
      data: {
        name: input.name,
        login: input.login,
        passwordHash: await hash(input.password),
        role: input.role,
        verified: false,
        demo: r.user.demo,
        staff: { create: { credentialId: input.login, jurisdiction: input.jurisdiction } },
      },
    });
    await this.db.auditLog.create({
      data: { actorId: r.user.id, action: 'STAFF_PROVISIONED', resourceId: user.id },
    });
    return safeUser(user);
  }
  @Patch('users/:id') async update(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = parse(
      z.object({
        verified: z.boolean().optional(),
        status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
      }),
      body,
    );
    await this.db.$transaction([
      this.db.user.update({ where: { id }, data: input }),
      this.db.refreshSession.updateMany({ where: { userId: id }, data: { revokedAt: new Date() } }),
      this.db.auditLog.create({
        data: { actorId: r.user.id, action: 'ACCOUNT_STATUS_CHANGED', resourceId: id },
      }),
    ]);
    return { ok: true };
  }
  @Get('models') models() {
    return this.db.modelVersion.findMany({
      include: { metrics: true, events: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }
  @Post('model-events') event(@Req() r: AuthedRequest, @Body() body: unknown) {
    const input = parse(
      z.object({
        modelId: z.string().min(1),
        type: z.enum(['OVERRIDE', 'RETRAINING_REQUESTED', 'DRIFT_REVIEW']),
        detail: z.string().min(5).max(1000),
      }),
      body,
    );
    return this.db.modelAuditEvent.create({ data: { ...input, actorId: r.user.id } });
  }
}
