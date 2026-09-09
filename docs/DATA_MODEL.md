# Data model — implemented Prisma schema

The authoritative schema is `services/api/prisma/schema.prisma`; the initial SQL migration is `services/api/prisma/migrations/202609080001_initial/migration.sql`. Both exist and were applied to a local PostgreSQL database. Seed data is explicitly synthetic/demo.

The original EER diagram is absent. Research text names User specializations, SOSAlert, HarassmentReport, AIAnalysisLog, CounselingSession and KnowledgeBase; the detailed staff catalog adds Legal Advisor and a shared case identity. The following is an IMPLEMENTATION DECISION derived from that textual evidence, not a transcription of unseen diagrams.

## Normalization decisions

- User contains encrypted NIC/phone, hashed credentials, preferences and security settings. Role is a five-value enum. StaffProfile contains role-specific staff identifier, jurisdiction and practitioner information; no four separate account systems.
- Case is the stable shared incident; Report contains the submission. Assignment is the Case officer relation plus audited CaseEvent history. A database-generated sequence gives the `SL-` reference; owner/request-key uniqueness supports idempotency.
- Evidence holds metadata and SHA-256 directly, without a redundant EvidenceHash table. Bytes live in encrypted private object storage. CaseEvidence is the many-to-many case attachment relation; EvidenceAccess records reads.
- CounselingAppointment holds booking/session lifecycle and pseudonym. CounselingNote and CounselingMessage are separate encrypted records. Only the assigned counselor can read clinical notes; the client sees appropriate booking/chat data. No separate duplicate CounselingClient identity is created.
- LegalResource stores each reviewed language-specific resource and source metadata; an unpublished draft is not a legal answer. LegalQuery and LegalMessage connect consenting users and assigned advisors.
- ModelMetric and ModelAuditEvent belong to ModelVersion; no metric is seeded as a measured research result. Retraining requests are audit metadata, not actual training jobs.
- OutboxEvent stores minimal audience/resource references; AuditLog omits message bodies. DeletionJob records active-data erasure attempts. Redis is not an alternative case database.

## Actual tables, relations and constraints

This table is extracted from the checked-in schema. Full scalar fields, timestamps, enums, defaults and delete behavior remain in the schema; optional relations should not be interpreted as universal access rights.

| Table | Relations | Explicit unique/index constraints |
|---|---|---|
| User | staff: StaffProfile?; sessions: RefreshSession[]; contacts: TrustedContact[]; cases: Case[]; assignedCases: Case[]; evidence: Evidence[]; sos: SOSAlert[]; responses: SOSAlert[]; shares: LocationShare[]; locations: LocationEvent[]; analyses: AIAnalysis[]; queries: LegalQuery[]; assignedQueries: LegalQuery[]; checkIns: WellbeingCheckIn[]; slots: CounselorSlot[]; appointments: CounselingAppointment[]; counseling: CounselingAppointment[]; posts: CommunityPost[]; comments: CommunityComment[]; likes: CommunityLike[]; notifications: Notification[]; consents: Consent[]; deletions: DeletionJob[] | `id String @id @default(uuid())`; `login String @unique`; `@@index([role, status, verified])` |
| StaffProfile | user: User | `id String @id @default(uuid())`; `userId String @unique`; `credentialId String @unique` |
| RefreshSession | user: User | `id String @id @default(uuid())`; `tokenHash String @unique`; `@@index([userId, family])` |
| Consent | user: User | `id String @id @default(uuid())` |
| Case | owner: User; officer: User?; report: Report?; evidence: CaseEvidence[]; events: CaseEvent[]; messages: CaseMessage[]; analyses: AIAnalysis[] | `id String @id @default(uuid())`; `number Int @unique @default(autoincrement())`; `reference String @unique`; `@@unique([ownerId, requestKey])`; `@@index([officerId, stage])`; `@@index([ownerId, createdAt])` |
| Report | case: Case | `id String @id @default(uuid())`; `caseId String @unique` |
| CaseEvidence | case: Case; evidence: Evidence | `@@id([caseId,evidenceId])` |
| CaseEvent | case: Case | `id String @id @default(uuid())`; `@@index([caseId, createdAt])` |
| CaseMessage | case: Case | `id String @id @default(uuid())` |
| Evidence | owner: User; cases: CaseEvidence[]; access: EvidenceAccess[]; analyses: AIAnalysis[] | `id String @id @default(uuid())`; `objectKey String @unique`; `@@index([ownerId,createdAt])` |
| EvidenceAccess | evidence: Evidence | `id String @id @default(uuid())` |
| TrustedContact | owner: User; shares: LocationShare[] | `id String @id @default(uuid())` |
| SOSAlert | owner: User; responder: User?; events: SOSEvent[]; locations: LocationEvent[]; deliveries: NotificationDelivery[] | `id String @id @default(uuid())`; `@@unique([ownerId,requestKey])`; `@@index([jurisdiction,status])` |
| SOSEvent | sos: SOSAlert | `id String @id @default(uuid())` |
| LocationShare | owner: User; contact: TrustedContact | `id String @id @default(uuid())` |
| LocationEvent | owner: User; sos: SOSAlert? | `id String @id @default(uuid())`; `@@index([ownerId,capturedAt])` |
| DangerZone | — | `id String @id @default(uuid())` |
| AIAnalysis | owner: User; case: Case?; evidence: Evidence | `id String @id @default(uuid())` |
| ModelVersion | metrics: ModelMetric[]; events: ModelAuditEvent[] | `id String @id` |
| ModelMetric | model: ModelVersion | `id String @id @default(uuid())` |
| ModelAuditEvent | model: ModelVersion | `id String @id @default(uuid())` |
| LegalQuery | owner: User; advisor: User?; messages: LegalMessage[] | `id String @id @default(uuid())`; `@@index([advisorId,status])` |
| LegalMessage | query: LegalQuery | `id String @id @default(uuid())` |
| LegalResource | — | `id String @id @default(uuid())` |
| WellbeingCheckIn | owner: User | `id String @id @default(uuid())` |
| CounselorSlot | counselor: User; appointments: CounselingAppointment[] | `id String @id @default(uuid())`; `@@unique([counselorId,startsAt])` |
| CounselingAppointment | client: User; counselor: User; slot: CounselorSlot; notes: CounselingNote[]; messages: CounselingMessage[] | `id String @id @default(uuid())`; `slotId String @unique`; `@@index([counselorId,status])` |
| CounselingNote | appointment: CounselingAppointment | `id String @id @default(uuid())` |
| CounselingMessage | appointment: CounselingAppointment | `id String @id @default(uuid())` |
| CommunityPost | author: User; comments: CommunityComment[]; likes: CommunityLike[]; moderation: ModerationItem[] | `id String @id @default(uuid())` |
| CommunityComment | post: CommunityPost; author: User; moderation: ModerationItem[] | `id String @id @default(uuid())` |
| CommunityLike | post: CommunityPost; user: User | `@@id([postId,userId])` |
| ModerationItem | post: CommunityPost?; comment: CommunityComment? | `id String @id @default(uuid())` |
| Notification | user: User | `id String @id @default(uuid())` |
| NotificationDelivery | sos: SOSAlert | `id String @id @default(uuid())` |
| AuditLog | — | `id String @id @default(uuid())`; `@@index([actorId,createdAt])` |
| OutboxEvent | — | `id String @id @default(uuid())`; `@@index([audienceId,createdAt])` |
| DeletionJob | user: User | `id String @id @default(uuid())` |

## Transaction boundaries and limits

Report creation, assignment/status changes, refresh rotation, moderation and notes/follow-up use database transactions or conditional writes. Unique booking slots prevent concurrent double-booking. Object storage cannot participate in the SQL transaction: upload/erasure failures require operational cleanup and retries; production recovery jobs are a gap. Deletion tombstones the user and removes active private records, but backup/legal-hold rules are unresolved.

Sensitive reads enforce ownership/assignment before decryption. The ordinary Admin overview does not query clinical notes. A public/pseudonymous community projection omits author IDs. Staff role authorization does not itself authorize every case or evidence object.
