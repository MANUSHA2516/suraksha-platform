import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Db } from '../core/db';
import { CryptoService } from '../core/crypto';
import { AuthedRequest, Roles } from '../auth/auth';
import { parse } from '../core/http';
import { messageSchema } from '@suraksha/validation';
import { z } from 'zod';
@Controller('legal')
export class LegalController {
  constructor(
    @Inject(Db) private db: Db,
    @Inject(CryptoService) private crypto: CryptoService,
  ) {}
  private async allowed(r: AuthedRequest, id: string) {
    const query = await this.db.legalQuery.findUniqueOrThrow({ where: { id } });
    if (r.user.role === 'USER' && query.ownerId !== r.user.id) throw new ForbiddenException();
    if (
      r.user.role === 'LEGAL_ADVISOR' &&
      (!query.escalated || (query.advisorId && query.advisorId !== r.user.id))
    )
      throw new ForbiddenException();
    return query;
  }
  @Roles('USER', 'LEGAL_ADVISOR') @Get('queries') async queries(@Req() r: AuthedRequest) {
    const where =
      r.user.role === 'USER'
        ? { ownerId: r.user.id }
        : { escalated: true, OR: [{ advisorId: null }, { advisorId: r.user.id }] };
    return this.db.legalQuery.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        escalated: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  @Roles('USER') @Post('queries') async create(@Req() r: AuthedRequest, @Body() body: unknown) {
    const input = parse(messageSchema, body);
    const query = await this.db.legalQuery.create({
      data: {
        ownerId: r.user.id,
        title: input.body.slice(0, 80),
        messages: {
          create: [
            { senderRole: 'USER', bodyCipher: this.crypto.seal(input.body) },
            {
              senderRole: 'INFORMATION',
              bodyCipher: this.crypto.seal(
                'This prototype has no reviewed legal answer for your question. You can ask a human legal advisor or browse the published resource library. Information is not legal representation.',
              ),
            },
          ],
        },
      },
      select: { id: true },
    });
    return this.detail(r, query.id);
  }
  @Roles('USER', 'LEGAL_ADVISOR') @Get('queries/:id') async detail(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    const query = await this.allowed(r, id);
    const messages = await this.db.legalMessage.findMany({
      where: { queryId: id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    return {
      id,
      title: query.title,
      status: query.status,
      escalated: query.escalated,
      assigned: query.advisorId === r.user.id,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.senderRole,
        body: this.crypto.open(m.bodyCipher),
        createdAt: m.createdAt,
      })),
    };
  }
  @Roles('USER') @Post('queries/:id/escalate') async escalate(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    await this.allowed(r, id);
    await this.db.legalQuery.update({ where: { id }, data: { escalated: true } });
    await this.db.auditLog.create({
      data: { actorId: r.user.id, action: 'LEGAL_ESCALATION_CONSENT', resourceId: id },
    });
    return this.detail(r, id);
  }
  @Roles('LEGAL_ADVISOR') @Patch('queries/:id') async claim(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    await this.allowed(r, id);
    const claimed = await this.db.legalQuery.updateMany({
      where: { id, escalated: true, OR: [{ advisorId: null }, { advisorId: r.user.id }] },
      data: { advisorId: r.user.id, status: 'IN_PROGRESS' },
    });
    if (!claimed.count) throw new ForbiddenException('Query already assigned');
    return this.detail(r, id);
  }
  @Roles('USER', 'LEGAL_ADVISOR') @Post('queries/:id/messages') async message(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const query = await this.allowed(r, id);
    if (r.user.role === 'LEGAL_ADVISOR' && query.advisorId !== r.user.id)
      throw new ForbiddenException('Claim this query first');
    const input = parse(messageSchema, body);
    await this.db.$transaction([
      this.db.legalMessage.create({
        data: { queryId: id, senderRole: r.user.role, bodyCipher: this.crypto.seal(input.body) },
      }),
      this.db.legalQuery.update({
        where: { id },
        data: { status: r.user.role === 'LEGAL_ADVISOR' ? 'ANSWERED' : 'IN_PROGRESS' },
      }),
      this.db.auditLog.create({
        data: { actorId: r.user.id, action: 'LEGAL_MESSAGE_SENT', resourceId: id },
      }),
    ]);
    return this.detail(r, id);
  }
  @Get('resources') resources(
    @Req() r: AuthedRequest,
    @Query('search') search = '',
    @Query('language') language = 'en',
  ) {
    return this.db.legalResource.findMany({
      where: {
        ...(r.user.role === 'LEGAL_ADVISOR' ? {} : { published: true }),
        language,
        title: { contains: search.slice(0, 100), mode: 'insensitive' },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }
  @Get('resources/:id') async resource(@Req() r: AuthedRequest, @Param('id') id: string) {
    const resource = await this.db.legalResource.findUniqueOrThrow({ where: { id } });
    if (!resource.published && r.user.role !== 'LEGAL_ADVISOR') throw new ForbiddenException();
    if (resource.published)
      await this.db.legalResource.update({ where: { id }, data: { views: { increment: 1 } } });
    return resource;
  }
  private resourceInput(body: unknown) {
    return parse(
      z
        .object({
          title: z.string().trim().min(3).max(150),
          body: z.string().max(50000),
          language: z.enum(['en', 'si', 'ta']),
          sourceUrl: z.string().url().optional(),
          published: z.boolean(),
          reviewed: z.boolean(),
          readMinutes: z.number().int().min(1).max(60),
        })
        .refine(
          (x) => !x.published || (x.reviewed && !!x.sourceUrl && x.body.length > 20),
          'Publishing requires reviewed source content',
        ),
      body,
    );
  }
  @Roles('LEGAL_ADVISOR') @Post('resources') async add(
    @Req() r: AuthedRequest,
    @Body() body: unknown,
  ) {
    const { reviewed, ...input } = this.resourceInput(body);
    return this.db.legalResource.create({
      data: { ...input, reviewedAt: reviewed ? new Date() : null, authorId: r.user.id },
    });
  }
  @Roles('LEGAL_ADVISOR') @Patch('resources/:id') async edit(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const { reviewed, ...input } = this.resourceInput(body);
    await this.db.auditLog.create({
      data: { actorId: r.user.id, action: 'LEGAL_RESOURCE_UPDATED', resourceId: id },
    });
    return this.db.legalResource.update({
      where: { id },
      data: { ...input, reviewedAt: reviewed ? new Date() : null, version: { increment: 1 } },
    });
  }
}
