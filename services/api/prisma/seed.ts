import '../src/core/env';
import { Db } from '../src/core/db';
import { CryptoService } from '../src/core/crypto';
import { hash } from 'argon2';
import { required } from '../src/core/env';
async function seed() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Demo seeding is disabled in production');
  const db = new Db();
  const crypto = new CryptoService();
  await db.$connect();
  const passwordHash = await hash(required('SEED_PASSWORD'));
  const accounts = [
    { login: crypto.identity('200012345678'), name: 'Risini Demo', role: 'USER' as const },
    { login: 'SL-ADM-0192', name: 'Nimali Demo', role: 'ADMIN' as const },
    { login: 'WP-CDU-0044', name: 'Officer Silva Demo', role: 'POLICE' as const },
    { login: 'CNS-0071', name: 'Dr. Ishara Demo', role: 'COUNSELOR' as const },
    { login: 'LGL-0012', name: 'Adv. Fernando Demo', role: 'LEGAL_ADVISOR' as const },
  ];
  const users = [];
  for (const a of accounts) {
    users.push(
      await db.user.upsert({
        where: { login: a.login },
        update: { passwordHash, status: 'ACTIVE' },
        create: {
          ...a,
          passwordHash,
          verified: true,
          demo: true,
          ...(a.role === 'USER'
            ? { nicCipher: crypto.seal('200012345678'), phoneCipher: crypto.seal('+94000000000') }
            : {
                staff: {
                  create: {
                    credentialId: a.login,
                    jurisdiction: 'Colombo',
                    specialization: a.role === 'COUNSELOR' ? 'Clinical counseling' : null,
                    languages: ['en', 'si', 'ta'],
                    verifiedAt: new Date(),
                  },
                },
              }),
        },
      }),
    );
  }
  const [user, admin, police, counselor, legal] = users;
  if (!user || !admin || !police || !counselor || !legal) throw new Error('Seed accounts missing');
  const existing = await db.case.findUnique({ where: { reference: 'SL-2291' } });
  if (!existing)
    await db.case.create({
      data: {
        reference: 'SL-2291',
        ownerId: user.id,
        officerId: police.id,
        requestKey: 'documented-demo-case',
        category: 'CYBER_HARASSMENT',
        priority: 'HIGH',
        anonymous: true,
        triage: 'IN_REVIEW',
        demo: true,
        report: {
          create: {
            occurredAt: new Date(),
            narrativeCipher: crypto.seal(
              'DEMONSTRATION ONLY: A fictional message was reported for review. No real person or incident is represented.',
            ),
          },
        },
        events: {
          create: [
            { type: 'FILED', publicText: 'Report received', actorId: user.id },
            { type: 'ASSIGNED', publicText: 'Assigned to Police', actorId: admin.id },
          ],
        },
      },
    });
  for (let day = 1; day <= 14; day++) {
    const startsAt = new Date();
    startsAt.setUTCHours(10, 30, 0, 0);
    startsAt.setUTCDate(startsAt.getUTCDate() + day);
    await db.counselorSlot.upsert({
      where: { counselorId_startsAt: { counselorId: counselor.id, startsAt } },
      create: { counselorId: counselor.id, startsAt },
      update: {},
    });
  }
  for (const title of [
    'Cyber Crimes Act',
    'Domestic Violence Act',
    'Workplace protections',
    'Filing a police complaint',
  ]) {
    if (!(await db.legalResource.findFirst({ where: { title } })))
      await db.legalResource.create({
        data: { title, body: '', authorId: legal.id, published: false },
      });
  }
  await db.modelVersion.upsert({
    where: { id: 'development-rules-v1' },
    create: {
      id: 'development-rules-v1',
      name: 'Harassment analysis development adapter',
      provider: 'development',
      demo: true,
      deployedAt: new Date(),
    },
    update: {},
  });
  if (!(await db.dangerZone.count()))
    await db.dangerZone.create({
      data: {
        label: 'Illustrative low-lit stretch — not validated',
        latitude: 6.8649,
        longitude: 79.8997,
        radiusMeters: 100,
        reportCount: 6,
        demo: true,
      },
    });
  console.log(
    'Seeded five explicitly synthetic development accounts, shared case SL-2291, counselor slots, draft resource titles and a non-validated model registry. Password is SEED_PASSWORD in .env.',
  );
  await db.$disconnect();
}
void seed();
