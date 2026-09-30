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
  const demoCases = [
    { reference: 'SL-2291', category: 'CYBER_HARASSMENT', priority: 'HIGH', stage: 'FILED', age: 0 },
    {
      reference: 'SL-2292',
      category: 'WORKPLACE_HARASSMENT',
      priority: 'MEDIUM',
      stage: 'UNDER_INVESTIGATION',
      age: 2,
    },
    {
      reference: 'SL-2293',
      category: 'PUBLIC_TRANSPORT_ABUSE',
      priority: 'LOW',
      stage: 'FILED',
      age: 5,
    },
  ] as const;
  for (const demoCase of demoCases) {
    const createdAt = new Date();
    createdAt.setUTCDate(createdAt.getUTCDate() - demoCase.age);
    const { age: _age, ...caseData } = demoCase;
    if (!(await db.case.findUnique({ where: { reference: demoCase.reference } })))
      await db.case.create({
        data: {
          ...caseData,
          ownerId: user.id,
          officerId: police.id,
          requestKey:
            demoCase.reference === 'SL-2291'
              ? 'documented-demo-case'
              : `documented-demo-case-${demoCase.reference}`,
          anonymous: true,
          triage: demoCase.stage === 'FILED' ? 'NEW' : 'IN_REVIEW',
          demo: true,
          createdAt,
          report: {
            create: {
              occurredAt: createdAt,
              narrativeCipher: crypto.seal(
                `DEMONSTRATION ONLY: Fictional ${demoCase.category.toLowerCase().replaceAll('_', ' ')} report. No real person or incident is represented.`,
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
  }
  for (const demoCase of demoCases) {
    const seededCase = await db.case.findUnique({ where: { reference: demoCase.reference } });
    if (!seededCase) continue;
    for (const entry of [
      { action: 'REPORT_FILED', actorId: user.id },
      { action: 'CASE_ASSIGNED', actorId: admin.id },
    ]) {
      if (
        !(await db.auditLog.findFirst({
          where: { action: entry.action, resourceId: seededCase.id },
        }))
      )
        await db.auditLog.create({
          data: { ...entry, resourceId: seededCase.id },
        });
    }
  }
  const demoAlerts = [
    { key: 'demo-sos-01', status: 'ACTIVE', latitude: 6.9271, longitude: 79.8612 },
    { key: 'demo-sos-02', status: 'ACTIVE', latitude: 6.9147, longitude: 79.9729 },
    { key: 'demo-sos-03', status: 'RESPONDING', latitude: 6.8625, longitude: 79.8997 },
  ] as const;
  for (const [index, alert] of demoAlerts.entries()) {
    const createdAt = new Date(Date.now() - index * 12 * 60_000);
    const seededAlert = await db.sOSAlert.upsert({
      where: { ownerId_requestKey: { ownerId: user.id, requestKey: alert.key } },
      update: {
        status: alert.status,
        responderId: alert.status === 'RESPONDING' ? police.id : null,
      },
      create: {
        ownerId: user.id,
        requestKey: alert.key,
        status: alert.status,
        responderId: alert.status === 'RESPONDING' ? police.id : null,
        locationState: 'AVAILABLE',
        createdAt,
        events: { create: { type: 'ACTIVATED', actorId: user.id, createdAt } },
        locations: {
          create: {
            ownerId: user.id,
            latitude: alert.latitude,
            longitude: alert.longitude,
            accuracy: 18,
            capturedAt: createdAt,
          },
        },
      },
    });
    if (
      !(await db.auditLog.findFirst({
        where: { action: 'SOS_ACTIVATED', resourceId: seededAlert.id },
      }))
    )
      await db.auditLog.create({
        data: { actorId: user.id, action: 'SOS_ACTIVATED', resourceId: seededAlert.id },
      });
  }
  for (let day = -1; day <= 14; day++) {
    const startsAt = new Date();
    startsAt.setUTCHours(10, 30, 0, 0);
    startsAt.setUTCDate(startsAt.getUTCDate() + day);
    await db.counselorSlot.upsert({
      where: { counselorId_startsAt: { counselorId: counselor.id, startsAt } },
      create: { counselorId: counselor.id, startsAt },
      update: {},
    });
  }
  const demoSessions = [
    { day: -1, status: 'COMPLETED', modality: 'CHAT', concern: 'Workplace wellbeing' },
    { day: 1, status: 'BOOKED', modality: 'VIDEO', concern: 'Stress support' },
    { day: 2, status: 'BOOKED', modality: 'CHAT', concern: 'Follow-up check-in' },
  ] as const;
  const clientAlias = `Client #${crypto.hash(user.id).slice(0, 6).toUpperCase()}`;
  for (const session of demoSessions) {
    const startsAt = new Date();
    startsAt.setUTCHours(10, 30, 0, 0);
    startsAt.setUTCDate(startsAt.getUTCDate() + session.day);
    const slot = await db.counselorSlot.findUnique({
      where: { counselorId_startsAt: { counselorId: counselor.id, startsAt } },
    });
    if (!slot) throw new Error('Demo counselor slot missing');
    const appointment = await db.counselingAppointment.upsert({
      where: { slotId: slot.id },
      update: { status: session.status, concern: session.concern },
      create: {
        clientId: user.id,
        counselorId: counselor.id,
        slotId: slot.id,
        clientAlias,
        modality: session.modality,
        status: session.status,
        concern: session.concern,
      },
    });
    if (session.status === 'COMPLETED' && !(await db.counselingNote.count({ where: { appointmentId: appointment.id } })))
      await db.counselingNote.create({
        data: {
          appointmentId: appointment.id,
          summaryCipher: crypto.seal('DEMONSTRATION ONLY: Fictional session focused on support options.'),
          cadence: 'Weekly',
          cadenceNoteCipher: crypto.seal('Review available support resources at the next session.'),
          risk: 'Low',
        },
      });
    if (!(await db.counselingMessage.count({ where: { appointmentId: appointment.id } })))
      await db.counselingMessage.createMany({
        data: [
          {
            appointmentId: appointment.id,
            senderRole: 'USER',
            bodyCipher: crypto.seal('DEMONSTRATION ONLY: I would like to discuss support options.'),
          },
          {
            appointmentId: appointment.id,
            senderRole: 'COUNSELOR',
            bodyCipher: crypto.seal('Of course. We can review options together during the session.'),
          },
        ],
      });
  }
  const demoQueries = [
    {
      title: '[DEMO] Workplace rights information',
      status: 'NEW',
      advisorId: null,
      message: 'DEMONSTRATION ONLY: A fictional question about workplace support options.',
    },
    {
      title: '[DEMO] Request for protection guidance',
      status: 'IN_PROGRESS',
      advisorId: legal.id,
      message: 'DEMONSTRATION ONLY: A fictional request to learn what support may be available.',
    },
  ] as const;
  for (const query of demoQueries) {
    const existing = await db.legalQuery.findFirst({
      where: { ownerId: user.id, title: query.title },
    });
    if (!existing)
      await db.legalQuery.create({
        data: {
          ownerId: user.id,
          advisorId: query.advisorId,
          title: query.title,
          status: query.status,
          escalated: true,
          messages: {
            create: [
              { senderRole: 'USER', bodyCipher: crypto.seal(query.message) },
              {
                senderRole: 'INFORMATION',
                bodyCipher: crypto.seal(
                  'This fictional demo does not provide legal advice or represent a real person.',
                ),
              },
            ],
          },
        },
      });
  }
  for (const title of [
    'Cyber Crimes Act',
    'Domestic Violence Act',
    'Workplace protections',
    'Filing a police complaint',
  ]) {
    const resource = await db.legalResource.findFirst({ where: { title } });
    if (!resource)
      await db.legalResource.create({
        data: {
          title,
          body: 'DEMONSTRATION ONLY: Draft placeholder. Add reviewed content and an authoritative source before publishing.',
          authorId: legal.id,
          published: false,
        },
      });
    else if (!resource.body)
      await db.legalResource.update({
        where: { id: resource.id },
        data: {
          body: 'DEMONSTRATION ONLY: Draft placeholder. Add reviewed content and an authoritative source before publishing.',
        },
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
    'Seeded five synthetic development accounts, three demo cases, three demo SOS alerts, three counseling sessions, two legal queries, draft resources and a non-validated model registry. Password is SEED_PASSWORD in .env.',
  );
  await db.$disconnect();
}
void seed();
