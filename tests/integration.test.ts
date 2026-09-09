import 'reflect-metadata';
import { config } from 'dotenv';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { hash } from 'argon2';
config();
const { AppModule } = require('../services/api/dist/app');
const { Db } = require('../services/api/dist/core/db');
const { Errors } = require('../services/api/dist/core/http');
const { CryptoService } = require('../services/api/dist/core/crypto');
let app: INestApplication;
let db: any;
const tokens: Record<string, string> = {};
const ids: Record<string, string> = {};
const created: string[] = [];
let reference = '';
let evidenceId = '';
let clientId = '';
let appointmentId = '';
let queryId = '';
const roles = ['USER', 'ADMIN', 'POLICE', 'COUNSELOR', 'LEGAL_ADVISOR'];
function get(path: string, role = 'USER') {
  return request(app.getHttpServer())
    .get('/v1' + path)
    .set('Authorization', 'Bearer ' + tokens[role]);
}
function post(path: string, body: unknown, role = 'USER') {
  return request(app.getHttpServer())
    .post('/v1' + path)
    .set('Authorization', 'Bearer ' + tokens[role])
    .send(body);
}
beforeAll(async () => {
  app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new Errors());
  await app.init();
  db = app.get(Db);
  const password = process.env.SEED_PASSWORD!;
  const passwordHash = await hash(password);
  for (const role of [
    ...roles,
    'OTHER_POLICE',
    'OTHER_COUNSELOR',
    'OTHER_LEGAL_ADVISOR',
    'OTHER_USER',
  ]) {
    const actualRole = role.replace('OTHER_', '');
    const u = await db.user.create({
      data: {
        login: 'test-' + randomUUID(),
        name: 'Test ' + role,
        role: actualRole,
        verified: true,
        demo: true,
        passwordHash,
        ...(actualRole !== 'USER'
          ? { staff: { create: { credentialId: 'TEST-' + randomUUID(), jurisdiction: 'Colombo' } } }
          : {}),
      },
    });
    created.push(u.id);
    ids[role] = u.id;
    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ login: u.login, password });
    expect(login.status).toBe(201);
    tokens[role] = login.body.accessToken;
  }
  clientId = ids.USER!;
});
afterAll(async () => {
  if (db) {
    for (const id of created) {
      await db.case.deleteMany({ where: { ownerId: id } });
      await db.aIAnalysis.deleteMany({ where: { ownerId: id } });
      await db.evidence.deleteMany({ where: { ownerId: id } });
      await db.sOSAlert.deleteMany({ where: { ownerId: id } });
      await db.legalQuery.deleteMany({ where: { ownerId: id } });
      await db.counselingAppointment.deleteMany({
        where: { OR: [{ clientId: id }, { counselorId: id }] },
      });
      await db.counselorSlot.deleteMany({ where: { counselorId: id } });
      await db.communityComment.deleteMany({ where: { authorId: id } });
      await db.communityPost.deleteMany({ where: { authorId: id } });
      await db.user.delete({ where: { id } });
    }
  }
  await app?.close();
});
describe('Authentication and server-side RBAC', () => {
  it('requires authentication', async () => {
    expect((await request(app.getHttpServer()).get('/v1/cases')).status).toBe(401);
  });
  for (const [owner, path] of [
    ['ADMIN', '/admin/users'],
    ['POLICE', '/police/alerts'],
    ['COUNSELOR', '/counseling/clients/' + randomUUID()],
    ['LEGAL_ADVISOR', '/legal/queries'],
    ['USER', '/contacts'],
  ])
    for (const other of roles.filter(
      (r) => r !== owner && !(path === '/legal/queries' && r === 'USER'),
    ))
      it(`${other} cannot access ${owner} endpoint`, async () => {
        expect((await get(path!, other)).status).toBe(403);
      });
  it('rotates refresh credentials and revokes a replayed token family', async () => {
    const u = await db.user.findUnique({ where: { id: ids.OTHER_USER } });
    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ login: u.login, password: process.env.SEED_PASSWORD });
    const old = login.body.refreshToken;
    const next = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refreshToken: old });
    expect(next.status).toBe(201);
    expect(next.body.refreshToken).not.toBe(old);
    expect(
      (await request(app.getHttpServer()).post('/v1/auth/refresh').send({ refreshToken: old }))
        .status,
    ).toBe(401);
    expect(
      (
        await request(app.getHttpServer())
          .get('/v1/me')
          .set('Authorization', 'Bearer ' + next.body.accessToken)
      ).status,
    ).toBe(401);
  });
});
describe('Cross-role case and evidence integration', () => {
  it('encrypts evidence and stores real hash metadata', async () => {
    const bytes = Buffer.from('Private synthetic test evidence');
    const result = await request(app.getHttpServer())
      .post('/v1/evidence')
      .set('Authorization', 'Bearer ' + tokens.USER)
      .field('kind', 'Chat log')
      .attach('file', bytes, 'test.txt');
    expect(result.status).toBe(201);
    evidenceId = result.body.id;
    expect(result.body.sha256).toBe(app.get(CryptoService).hash(bytes));
    expect(result.body).not.toHaveProperty('objectKey');
  });
  it('does not let another user view or attach the evidence', async () => {
    expect((await get('/evidence/' + evidenceId, 'OTHER_USER')).status).toBe(403);
    const result = await post(
      '/reports',
      {
        category: 'CYBER_HARASSMENT',
        occurredAt: new Date().toISOString(),
        anonymous: true,
        evidenceIds: [evidenceId],
        idempotencyKey: randomUUID(),
      },
      'OTHER_USER',
    );
    expect(result.status).toBe(403);
  });
  it('creates an anonymous report with one stable reference and idempotency', async () => {
    const input = {
      category: 'CYBER_HARASSMENT',
      occurredAt: new Date().toISOString(),
      description: 'Synthetic integration report',
      anonymous: true,
      evidenceIds: [evidenceId],
      idempotencyKey: randomUUID(),
    };
    const result = await post('/reports', input);
    expect(result.status).toBe(201);
    reference = result.body.reference;
    expect(reference).toMatch(/^SL-\d+$/);
    expect((await post('/reports', input)).body.reference).toBe(reference);
    expect((await get('/cases/' + reference, 'ADMIN')).body.reporter).toBe('Anonymous');
  });
  it('admin assigns Police and Police updates the same case visible to User', async () => {
    const c = await get('/cases/' + reference, 'ADMIN');
    const assigned = await post(
      '/cases/' + reference + '/assignment',
      { officerId: ids.POLICE, expectedVersion: c.body.version },
      'ADMIN',
    );
    expect(assigned.status).toBe(201);
    const police = await get('/cases/' + reference, 'POLICE');
    expect(police.body.reference).toBe(reference);
    expect((await get('/cases/' + reference, 'OTHER_POLICE')).status).toBe(403);
    const updated = await request(app.getHttpServer())
      .patch('/v1/cases/' + reference + '/status')
      .set('Authorization', 'Bearer ' + tokens.POLICE)
      .send({
        stage: 'UNDER_INVESTIGATION',
        notes: 'Restricted internal investigation note',
        expectedVersion: police.body.version,
      });
    expect(updated.status).toBe(200);
    const user = await get('/cases/' + reference);
    expect(user.body.reference).toBe(reference);
    expect(user.body.stage).toBe('UNDER_INVESTIGATION');
    expect(JSON.stringify(user.body)).not.toContain('Restricted internal');
  });
  it('requires a PIN proof for sealed user downloads and denies unrelated staff', async () => {
    expect((await get('/evidence/' + evidenceId + '/content')).status).toBe(403);
    expect((await get('/evidence/' + evidenceId + '/content', 'COUNSELOR')).status).toBe(403);
    expect((await get('/evidence/' + evidenceId + '/content', 'OTHER_POLICE')).status).toBe(403);
    expect((await get('/evidence/' + evidenceId + '/content', 'POLICE')).status).toBe(200);
    await post('/me/security/pin', { pin: '482691' });
    const proof = await post('/evidence/' + evidenceId + '/unlock', { pin: '482691' });
    expect(
      (
        await request(app.getHttpServer())
          .get('/v1/evidence/' + evidenceId + '/content')
          .set('Authorization', 'Bearer ' + tokens.USER)
          .set('X-Unlock-Proof', proof.body.proof)
      ).status,
    ).toBe(200);
  });
  it('rejects stale case version and skipped investigation stage', async () => {
    expect(
      (
        await request(app.getHttpServer())
          .patch('/v1/cases/' + reference + '/status')
          .set('Authorization', 'Bearer ' + tokens.POLICE)
          .send({ stage: 'RESOLVED', notes: 'skip', expectedVersion: 1 })
      ).status,
    ).toBe(409);
  });
});
describe('Safety, legal, clinical and moderation flows', () => {
  it('creates a durable development SOS without pretending dispatch', async () => {
    const result = await post('/sos', { idempotencyKey: randomUUID(), locationState: 'DENIED' });
    expect(result.status).toBe(201);
    expect(result.body.deliveryMode).toBe('development');
    expect(result.body.deliveries[0].status).toBe('DEVELOPMENT_RECORDED');
    expect((await post('/sos/' + result.body.id + '/respond', {}, 'POLICE')).status).toBe(201);
  });
  it('escalates a legal query and isolates advisor ownership', async () => {
    const q = await post('/legal/queries', { body: 'Synthetic workplace rights question' });
    queryId = q.body.id;
    expect((await get('/legal/queries/' + queryId, 'LEGAL_ADVISOR')).status).toBe(403);
    await post('/legal/queries/' + queryId + '/escalate', {});
    await request(app.getHttpServer())
      .patch('/v1/legal/queries/' + queryId)
      .set('Authorization', 'Bearer ' + tokens.LEGAL_ADVISOR)
      .send({});
    expect((await get('/legal/queries/' + queryId, 'OTHER_LEGAL_ADVISOR')).status).toBe(403);
    expect(
      (
        await post(
          '/legal/queries/' + queryId + '/messages',
          { body: 'Human advisor response for this test.' },
          'LEGAL_ADVISOR',
        )
      ).status,
    ).toBe(201);
    expect((await get('/legal/queries/' + queryId)).body.status).toBe('ANSWERED');
  });
  it('books once, hides screening without consent and restricts clinical notes', async () => {
    await post('/wellbeing/check-ins', { answer: 'Several days', shared: false });
    const slot = await db.counselorSlot.create({
      data: { counselorId: ids.COUNSELOR, startsAt: new Date(Date.now() + 86400000) },
    });
    const a = await post('/counseling/appointments', { slotId: slot.id });
    expect(a.status).toBe(201);
    appointmentId = a.body.id;
    expect((await post('/counseling/appointments', { slotId: slot.id })).status).toBe(409);
    const client = await get('/counseling/clients/' + appointmentId, 'COUNSELOR');
    expect(client.body.screening).toBe(null);
    expect(JSON.stringify(client.body)).not.toContain(clientId);
    for (const role of ['ADMIN', 'POLICE', 'OTHER_COUNSELOR'])
      expect((await get('/counseling/clients/' + appointmentId, role)).status).toBe(403);
    const note = await post(
      '/counseling/sessions/' + appointmentId + '/notes',
      { summary: 'Private test clinical note', cadence: 'One-time', risk: 'Low' },
      'COUNSELOR',
    );
    expect(note.status).toBe(201);
    expect(
      (await get('/counseling/clients/' + appointmentId, 'COUNSELOR')).body.history[0].notes[0]
        .summary,
    ).toBe('Private test clinical note');
  });
  it('books follow-up atomically and rolls back a note when its slot is already taken', async () => {
    const slot = await db.counselorSlot.create({
      data: {
        counselorId: ids.COUNSELOR,
        startsAt: new Date(Date.now() + 3 * 86400000),
        durationMinutes: 45,
      },
    });
    const body = {
      summary: 'Follow-up transaction test',
      cadence: 'Weekly',
      risk: 'Low',
      nextSlotId: slot.id,
    };
    const saved = await post('/counseling/sessions/' + appointmentId + '/notes', body, 'COUNSELOR');
    expect(saved.status).toBe(201);
    expect(saved.body.followup).toBeTruthy();
    const next = await db.counselingAppointment.findUnique({ where: { id: saved.body.followup } });
    expect(next.clientId).toBe(ids.USER);
    expect(next.counselorId).toBe(ids.COUNSELOR);
    const count = await db.counselingNote.count({ where: { appointmentId } });
    const conflict = await post(
      '/counseling/sessions/' + appointmentId + '/notes',
      body,
      'COUNSELOR',
    );
    expect(conflict.status).toBe(409);
    expect(await db.counselingNote.count({ where: { appointmentId } })).toBe(count);
  });
  it('withdraws screening consent from the assigned counselor view immediately', async () => {
    const check = await post('/wellbeing/check-ins', { answer: 'Several days', shared: true });
    expect(
      (await get('/counseling/clients/' + appointmentId, 'COUNSELOR')).body.screening,
    ).not.toBeNull();
    await request(app.getHttpServer())
      .patch('/v1/wellbeing/check-ins/' + check.body.id)
      .set('Authorization', 'Bearer ' + tokens.USER)
      .send({ shared: false })
      .expect(200);
    expect(
      (await get('/counseling/clients/' + appointmentId, 'COUNSELOR')).body.screening,
    ).toBeNull();
  });
  it('requires an owned unexpired share for foreground location and stops after revocation', async () => {
    const position = {
      latitude: 6.9,
      longitude: 79.8,
      accuracy: 15,
      capturedAt: new Date().toISOString(),
    };
    expect((await post('/location/events', position)).status).toBe(403);
    const contact = await post('/contacts', {
      name: 'Synthetic contact',
      relationship: 'Friend',
      phone: '+94000000000',
    });
    const share = await post('/location/shares', { contactId: contact.body.id, minutes: 5 });
    expect(share.status).toBe(201);
    expect(
      (await post('/location/shares', { contactId: contact.body.id, minutes: 5 }, 'OTHER_USER'))
        .status,
    ).toBe(403);
    expect((await post('/location/events', position)).status).toBe(201);
    await request(app.getHttpServer())
      .delete('/v1/location/shares/' + share.body.id)
      .set('Authorization', 'Bearer ' + tokens.USER)
      .expect(200);
    expect((await post('/location/events', position)).status).toBe(403);
  });
  it('keeps community content pending then publishes via audited moderation', async () => {
    const p = await post('/community/posts', { body: 'Synthetic peer support story' });
    expect(p.body.status).toBe('PENDING');
    expect(
      (await get('/community/posts', 'OTHER_USER')).body.some((x: any) => x.id === p.body.id),
    ).toBe(false);
    const item = await db.moderationItem.findFirst({ where: { postId: p.body.id } });
    expect(
      (
        await request(app.getHttpServer())
          .patch('/v1/admin/moderation/' + item.id)
          .set('Authorization', 'Bearer ' + tokens.ADMIN)
          .send({ action: 'APPROVE' })
      ).status,
    ).toBe(200);
    const published = (await get('/community/posts', 'OTHER_USER')).body.find(
      (x: any) => x.id === p.body.id,
    );
    expect(published.body).toBe('Synthetic peer support story');
    expect(published).not.toHaveProperty('authorId');
    expect(
      await db.auditLog.count({ where: { resourceId: item.id, action: 'MODERATION_APPROVE' } }),
    ).toBe(1);
  });
});
