import 'reflect-metadata';
import { config } from 'dotenv';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
config();
const { AppModule } = require('../services/api/dist/app');
const { Db } = require('../services/api/dist/core/db');
const { CryptoService } = require('../services/api/dist/core/crypto');
const { ObjectStore } = require('../services/api/dist/evidence/evidence');
const { Errors } = require('../services/api/dist/core/http');
const enabled = process.env.RUN_PROVIDER_TESTS === '1';
describe.skipIf(!enabled)('Real MinIO and FastAPI integration', () => {
  let app: INestApplication;
  let db: any;
  let userId: string;
  let token: string;
  beforeAll(async () => {
    process.env.EVIDENCE_PROVIDER = 's3';
    app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('v1');
    app.useGlobalFilters(new Errors());
    await app.init();
    db = app.get(Db);
    const nic = String(Date.now()).slice(-12);
    const login = await request(app.getHttpServer()).post('/v1/auth/register').send({
      name: 'Provider test',
      nic,
      phone: '+94000000000',
      password: 'Synthetic123!',
      consent: true,
    });
    expect(login.status).toBe(201);
    token = login.body.accessToken;
    userId = login.body.user.id;
  });
  afterAll(async () => {
    if (userId) {
      for (const e of await db.evidence.findMany({ where: { ownerId: userId } }))
        await app.get(ObjectStore).remove(e.objectKey);
      await db.case.deleteMany({ where: { ownerId: userId } });
      await db.aIAnalysis.deleteMany({ where: { ownerId: userId } });
      await db.evidence.deleteMany({ where: { ownerId: userId } });
      await db.user.delete({ where: { id: userId } });
    }
    await app?.close();
  });
  it('writes encrypted private objects to MinIO and rejects tampered ciphertext', async () => {
    const bytes = Buffer.from('Synthetic confidential ' + randomUUID());
    const res = await request(app.getHttpServer())
      .post('/v1/evidence')
      .set('Authorization', 'Bearer ' + token)
      .field('kind', 'Chat log')
      .attach('file', bytes, 'private.txt');
    expect(res.status).toBe(201);
    const record = await db.evidence.findUnique({ where: { id: res.body.id } });
    const stored = await app.get(ObjectStore).get(record.objectKey);
    expect(stored.includes(bytes)).toBe(false);
    expect(app.get(CryptoService).decrypt(stored)).toEqual(bytes);
    const publicRead = await fetch(
      `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${record.objectKey}`,
    );
    expect(publicRead.status).toBe(403);
    stored[stored.length - 1] ^= 1;
    expect(() => app.get(CryptoService).decrypt(stored)).toThrow();
  });
  it('calls FastAPI and saves analysis text into the encrypted vault without a fabricated confidence', async () => {
    const result = await request(app.getHttpServer())
      .post('/v1/analysis')
      .set('Authorization', 'Bearer ' + token)
      .send({ text: 'Synthetic blackmail test message', language: 'en' });
    expect(result.status).toBe(201);
    expect(result.body.confidence).toBe(null);
    expect(result.body.validationStatus).toBe('NON_VALIDATED_DEVELOPMENT');
    const evidence = await db.evidence.findUnique({ where: { id: result.body.evidenceId } });
    expect(
      app
        .get(CryptoService)
        .decrypt(await app.get(ObjectStore).get(evidence.objectKey))
        .toString(),
    ).toBe('Synthetic blackmail test message');
    const report = await request(app.getHttpServer())
      .post('/v1/reports')
      .set('Authorization', 'Bearer ' + token)
      .send({
        category: 'CYBER_HARASSMENT',
        occurredAt: new Date().toISOString(),
        anonymous: true,
        evidenceIds: [evidence.id],
        idempotencyKey: randomUUID(),
      });
    expect(report.status).toBe(201);
    expect(report.body.analysis).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: result.body.id,
          confidence: null,
          modelVersion: result.body.modelVersion,
        }),
      ]),
    );
    const read = await request(app.getHttpServer())
      .get('/v1/cases/' + report.body.reference)
      .set('Authorization', 'Bearer ' + token);
    expect(read.body.analysis[0].id).toBe(result.body.id);
  });
});
