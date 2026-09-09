import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Db } from '../core/db';
import { AuthedRequest, Roles } from '../auth/auth';
import { parse } from '../core/http';
import { messageSchema } from '@suraksha/validation';
import { z } from 'zod';
@Controller()
export class CommunityController {
  constructor(@Inject(Db) private db: Db) {}
  @Roles('USER') @Get('community/posts') async posts(@Req() r: AuthedRequest) {
    return this.db.communityPost.findMany({
      where: { OR: [{ status: 'PUBLISHED' }, { authorId: r.user.id, status: 'PENDING' }] },
      select: {
        id: true,
        body: true,
        status: true,
        createdAt: true,
        _count: { select: { likes: true } },
        comments: {
          where: { status: 'PUBLISHED' },
          select: { id: true, body: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  @Roles('USER') @Post('community/posts') async post(
    @Req() r: AuthedRequest,
    @Body() body: unknown,
  ) {
    const input = parse(messageSchema, body);
    return this.db.communityPost.create({
      data: {
        authorId: r.user.id,
        body: input.body,
        moderation: {
          create: {
            source: 'DEVELOPMENT_REVIEW',
            reason: 'Manual review required before publication; AI moderation is not validated',
          },
        },
      },
      select: { id: true, status: true },
    });
  }
  @Roles('USER') @Post('community/posts/:id/comments') async comment(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.db.communityPost.findFirstOrThrow({ where: { id, status: 'PUBLISHED' } });
    const input = parse(messageSchema, body);
    return this.db.communityComment.create({
      data: {
        postId: id,
        authorId: r.user.id,
        body: input.body,
        moderation: {
          create: { source: 'DEVELOPMENT_REVIEW', reason: 'Pending review before publication' },
        },
      },
      select: { id: true, status: true },
    });
  }
  @Roles('USER') @Put('community/posts/:id/like') async like(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
  ) {
    await this.db.communityPost.findFirstOrThrow({ where: { id, status: 'PUBLISHED' } });
    await this.db.communityLike.upsert({
      where: { postId_userId: { postId: id, userId: r.user.id } },
      create: { postId: id, userId: r.user.id },
      update: {},
    });
    return { ok: true };
  }
  @Roles('USER') @Post('community/flags') async flag(@Body() body: unknown) {
    const input = parse(
      z.object({ postId: z.string().uuid(), reason: z.string().min(3).max(500) }),
      body,
    );
    await this.db.communityPost.findFirstOrThrow({
      where: { id: input.postId, status: 'PUBLISHED' },
    });
    return this.db.moderationItem.create({ data: { ...input, source: 'USER_REPORTED' } });
  }
  @Roles('ADMIN') @Get('admin/moderation') queue() {
    return this.db.moderationItem.findMany({
      where: { status: 'PENDING' },
      include: {
        post: { select: { id: true, body: true } },
        comment: { select: { id: true, body: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }
  @Roles('ADMIN') @Patch('admin/moderation/:id') async moderate(
    @Req() r: AuthedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = parse(z.object({ action: z.enum(['APPROVE', 'REMOVE']) }), body);
    const item = await this.db.moderationItem.findFirstOrThrow({
      where: { id, status: 'PENDING' },
    });
    return this.db.$transaction(async (tx) => {
      const changed = await tx.moderationItem.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: input.action, decidedBy: r.user.id, decidedAt: new Date() },
      });
      if (!changed.count) throw new ForbiddenException('Item already reviewed');
      const status = input.action === 'APPROVE' ? 'PUBLISHED' : 'REMOVED';
      if (item.postId)
        await tx.communityPost.update({ where: { id: item.postId }, data: { status } });
      if (item.commentId)
        await tx.communityComment.update({ where: { id: item.commentId }, data: { status } });
      await tx.auditLog.create({
        data: { actorId: r.user.id, action: 'MODERATION_' + input.action, resourceId: id },
      });
      return { ok: true };
    });
  }
}
