import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  ForbiddenException,
  Get,
  Inject,
  Injectable,
  Post,
  Req,
  Res,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Db } from '../core/db';
import { CryptoService } from '../core/crypto';
import { hash, verify } from 'argon2';
import { randomBytes, randomUUID } from 'node:crypto';
import { loginSchema, registerSchema } from '@suraksha/validation';
import type { Principal, Role } from '@suraksha/types';
import { parse } from '../core/http';
import type { Request, Response } from 'express';
import type { User, Prisma } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
export type AuthedRequest = Request & { user: Principal; sessionId: string };
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
export function safeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    verified: user.verified,
    locale: user.locale,
    disguise: user.disguise,
    notificationsEnabled: user.notificationsEnabled,
    locationDefault: user.locationDefault,
    biometricEnabled: user.biometricEnabled,
    hasPin: !!user.pinHash,
    demo: user.demo,
  };
}
@Injectable()
export class AuthService {
  constructor(
    @Inject(Db) private db: Db,
    @Inject(JwtService) private jwt: JwtService,
    @Inject(CryptoService) private crypto: CryptoService,
  ) {}
  async issue(
    user: User,
    family: string = randomUUID(),
    db: Prisma.TransactionClient | Db = this.db,
  ) {
    const refreshToken = randomBytes(48).toString('base64url');
    const session = await db.refreshSession.create({
      data: {
        userId: user.id,
        family,
        tokenHash: this.crypto.hash(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    return {
      accessToken: this.jwt.sign({ sub: user.id, sid: session.id }, { expiresIn: '10m' }),
      refreshToken,
      user: safeUser(user),
    };
  }
  async register(body: unknown) {
    const input = parse(registerSchema, body);
    const user = await this.db.user.create({
      data: {
        login: this.crypto.identity(input.nic),
        name: input.name,
        phoneCipher: this.crypto.seal(input.phone),
        nicCipher: this.crypto.seal(input.nic),
        passwordHash: await hash(input.password),
        consents: { create: { scope: 'ACCOUNT_TERMS_16_PLUS', version: 'prototype-2026-09' } },
        demo: process.env.NODE_ENV !== 'production',
      },
    });
    await this.audit(user.id, 'REGISTER');
    return this.issue(user);
  }
  async login(body: unknown) {
    const input = parse(loginSchema, body);
    const login = /^(?:\d{12}|\d{9}[vVxX])$/.test(input.login)
      ? this.crypto.identity(input.login)
      : input.login;
    const user = await this.db.user.findUnique({ where: { login } });
    if (!user || user.status !== 'ACTIVE' || !(await verify(user.passwordHash, input.password)))
      throw new UnauthorizedException('Invalid credentials');
    if (user.role !== 'USER' && !user.verified)
      throw new ForbiddenException('Staff verification is required');
    await this.audit(user.id, 'LOGIN');
    return this.issue(user);
  }
  async refresh(token: string) {
    const current = await this.db.refreshSession.findUnique({
      where: { tokenHash: this.crypto.hash(token) },
      include: { user: true },
    });
    if (!current) throw new UnauthorizedException();
    if (current.revokedAt) {
      await this.db.refreshSession.updateMany({
        where: { family: current.family },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Session replay detected; sign in again');
    }
    if (current.expiresAt < new Date() || current.user.status !== 'ACTIVE')
      throw new UnauthorizedException();
    const result = await this.db.$transaction(async (tx) => {
      const claimed = await tx.refreshSession.updateMany({
        where: { id: current.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (claimed.count !== 1) {
        await tx.refreshSession.updateMany({
          where: { family: current.family },
          data: { revokedAt: new Date() },
        });
        return null;
      }
      return this.issue(current.user, current.family, tx);
    });
    if (!result) throw new UnauthorizedException('Refresh replay detected');
    return result;
  }

  async principal(token: string) {
    try {
      const payload = this.jwt.verify<{ sub: string; sid: string }>(token);
      const session = await this.db.refreshSession.findUnique({
        where: { id: payload.sid },
        include: { user: { include: { staff: true } } },
      });
      if (
        !session ||
        session.userId !== payload.sub ||
        session.revokedAt ||
        session.expiresAt < new Date() ||
        session.user.status !== 'ACTIVE'
      )
        throw new Error();
      if (session.user.role !== 'USER' && !session.user.verified) throw new Error();
      return {
        user: { ...safeUser(session.user), jurisdiction: session.user.staff?.jurisdiction },
        sessionId: session.id,
      };
    } catch {
      throw new UnauthorizedException('Session expired; sign in again');
    }
  }
  async logout(sessionId: string) {
    const session = await this.db.refreshSession.findUniqueOrThrow({ where: { id: sessionId } });
    await this.db.refreshSession.updateMany({
      where: { family: session.family },
      data: { revokedAt: new Date() },
    });
    await this.audit(session.userId, 'LOGOUT');
  }
  audit(actorId: string, action: string, resourceId?: string) {
    return this.db.auditLog.create({ data: { actorId, action, resourceId } });
  }
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private reflector: Reflector,
    @Inject(AuthService) private auth: AuthService,
  ) {}
  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride('public', [context.getHandler(), context.getClass()]))
      return true;
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token =
      req.headers.authorization?.replace(/^Bearer /, '') || req.cookies?.suraksha_access;
    if (!token) throw new UnauthorizedException();
    const principal = await this.auth.principal(token);
    req.user = principal.user;
    req.sessionId = principal.sessionId;
    if (req.cookies?.suraksha_access && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.headers.origin;
      if (origin !== process.env.WEB_ORIGIN) throw new ForbiddenException('Invalid request origin');
    }
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles && !roles.includes(req.user.role))
      throw new ForbiddenException('This workspace is restricted to its authorized role');
    return true;
  }
}
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private auth: AuthService) {}
  private send(session: Awaited<ReturnType<AuthService['issue']>>, req: Request, res: Response) {
    if (req.headers['x-suraksha-client'] === 'web') {
      if (req.headers.origin !== process.env.WEB_ORIGIN)
        throw new ForbiddenException('Invalid origin');
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
      };
      res.cookie('suraksha_access', session.accessToken, { ...options, maxAge: 600000 });
      const remember =
        req.body?.rememberDevice === true || req.cookies?.suraksha_remember === 'yes';
      res.cookie('suraksha_remember', remember ? 'yes' : 'no', {
        ...options,
        maxAge: remember ? 7 * 86400000 : undefined,
      });
      res.cookie('suraksha_refresh', session.refreshToken, {
        ...options,
        path: '/v1/auth',
        maxAge: remember ? 7 * 86400000 : undefined,
      });
      return { user: session.user };
    }
    return session;
  }
  @Public() @Post('register') async register(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.send(await this.auth.register(body), req, res);
  }
  @Public() @Post('login') async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.send(await this.auth.login(body), req, res);
  }
  @Public() @Post('refresh') async refresh(
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.cookies?.suraksha_refresh && req.headers.origin !== process.env.WEB_ORIGIN)
      throw new ForbiddenException();
    const token = req.cookies?.suraksha_refresh || body.refreshToken;
    if (typeof token !== 'string') throw new UnauthorizedException();
    return this.send(await this.auth.refresh(token), req, res);
  }
  @Get('me') me(@Req() req: AuthedRequest) {
    return req.user;
  }
  @Post('logout') async logout(
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.sessionId);
    res.clearCookie('suraksha_access', { path: '/' });
    res.clearCookie('suraksha_remember', { path: '/' });
    res.clearCookie('suraksha_refresh', { path: '/v1/auth' });
    return { ok: true };
  }
}
