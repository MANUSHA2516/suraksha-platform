# Data model — provisional, no Prisma schema yet

R3.4.3 and R3.8 name an EER model but the diagram itself is absent. The following distinction prevents a proposed schema from being misrepresented as a transcription of unseen cardinalities.

## Direct textual EER evidence

- Generalized User specializes disjointly into Woman, Police, Counsellor, Admin.
- Named entities include SOSAlert, HarassmentReport, AIAnalysisLog, CounselingSession, KnowledgeBase.
- Named relationships: SETS, SUBMITS, TRIGGERS, GENERATES, BOOKS, PROVIDES, HAS, RESPONDS_TO, MANAGES. R3.8 explains emergency contacts, reports generating analysis logs, counselor bookings and police responses to SOS.
- S4.1 adds Legal Advisor; S cross-role integration requires one shared case reference.

## Proposed normalization from textual evidence and screens

| Aggregate / planned tables | Key fields and relationships | Constraint / privacy requirement |
|---|---|---|
| User, UserIdentity, UserSecurity, UserPreference, Consent | UUID, role enum, account status; private NIC/phone, password/PIN hashes; language, disguise; consent version/time/scope | Unique normalized phone/NIC lookup design; encrypted sensitive identity; no NIC in logs; disjoint role |
| StaffProfile, PoliceProfile, CounselorProfile, LegalAdvisorProfile | Unique user FK, staff identifier, credential verification; jurisdiction, clinical specializations, languages | No self-selected verified staff role; indexes on jurisdiction/status |
| RefreshSession, AuthChallenge | User FK, token digest, token family, expiry, revocation/replacement, challenge attempt count | Atomic rotation; replay revokes family; no plaintext stored tokens |
| Case, Report, CaseAssignment, CaseEvent, CaseMessage | Stable unique reference, owner, category, stage, triage, priority, anonymous flag; narrative/date; handler and assignment history; event sequence/version | One incident identity, FK links, author projections; indexed owner/handler/status/date; concurrency control |
| Evidence, EvidenceHash, CaseEvidence, EvidenceAccess | Owner, random object key, media type/size, encrypted metadata as needed, capture time, note/location, key ID/nonce/tag, digest, sealedAt; case join | Binary outside DB; finalization state; immutable sealed content; owner-scoped attachments; audited reads |
| SOSAlert, SOSEvent, TrustedContact | Owner, activation/cancel/dispatch/respond/resolved timestamps; responder/jurisdiction; contact priority and private phone | Durable lifecycle, idempotency, atomic responder claim |
| LocationEvent, LocationShare, DangerZone, RouteSession | Owner/incident, time/accuracy/coordinates, recipient, expiresAt/revokedAt, zone/source confidence, route provider | Purpose-limited indexed events; current consent; stale-position handling; no general staff tracking |
| AIAnalysis (AIAnalysisLog), ModelVersion, ModelMetric, ModelAuditEvent, RetrainingRun | Evidence/case FK, classification/risk, nullable confidence, model version; language, metric value/run, deployedAt, drift, dataset/run provenance | Non-validated demo flag; no fabricated evaluation; encrypted input evidence rather than unprotected duplicate text |
| LegalQuery, LegalMessage, LegalResource, LegalResourceTranslation, KnowledgeBase | Owner, optional case FK, assigned advisor, query status, source citations; published resource versions/locales, review metadata, optional embeddings | Private query thread; public reviewed resources only; search/version indexes; no auto-publication of private answers |
| CounselingClient, CounselorSlot, CounselingAppointment, CounselingSession | Pseudonymous client ID, private user relation, counselor/slot/status, modality/start/end | Unique reserved slot or PostgreSQL range exclusion; no identity in counselor response |
| CounselingNote, CounselingMessage, WellbeingCheckIn, ScreeningInstrument | Assigned session; encrypted summary/risk/cadence; private instrument/version/answers/score; explicit sharing consent FK | Stronger authorization than ordinary case metadata; private scoring; no undefined instrument output |
| CommunityPost, CommunityComment, CommunityLike, ModerationItem, ModerationEvent | Private author FK, content, publication status, parent post, unique user/post like, flag source/reason, moderator decision | No author identities in public payload; pending before publication; audited decisions |
| Notification, NotificationDelivery, OutboxEvent, AuditLog | Recipient, safe event type, provider/mode/status, retry/ack timestamps; actor/resource/action/request/time | Transactional outbox; redacted payloads; scoped feeds, append-only audit semantics |
| DeletionJob | User, confirmation/time, per-store cleanup status, retry/error, completedAt | Do not claim erase-all until completed; custody/backups policy unresolved |

## Proposed consistency boundaries

Report/case/evidence linkage/event/outbox creation; assignment/event/outbox changes; stage transition/version/event; SOS creation/outbox and responder claim; clinical note/follow-up slot; moderation decision/publication/audit; refresh rotation/revocation are transaction boundaries. External object/provider writes require retry/idempotency and compensation.

Foreign keys, UUID primary keys, unique case references, createdAt/updatedAt, appropriate tombstones and composite indexes are required. Soft deletion is not equivalent to the promised full erasure. Database migrations, seed data and exact cardinalities remain unimplemented and subject to missing-diagram review.

Development seed should retain one clearly labeled case SL-2291 across User/Admin/Police, a pseudonymous clinical client 4482 and the documented legal query/resource titles. Seed identities and contact numbers must be synthetic, with real deliveries disabled. Do not seed invented research measurements as real results.
