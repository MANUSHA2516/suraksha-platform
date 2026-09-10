# Traceability matrix — documentation-to-code audit

All three source documents are authoritative; all 47 catalog screens have an implementation path. Status includes the limitations in SCREEN_INVENTORY and OPEN_GAPS. Tests listed are existing files with the coverage scope stated in the inventory; smoke tests do not prove all workflows or visual parity.

| Requirement/source | Screen | Frontend component | API (prefix /v1) | Database entity | Automated evidence | Status |
|---|---|---|---|---|---|---|
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 1 | M01 | `apps/mobile/src/features/onboarding.tsx` | — | — | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 2 | M02 | `apps/mobile/src/features/onboarding.tsx` | POST /auth/login | User, RefreshSession | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 3 | M03 | `apps/mobile/src/features/onboarding.tsx` | PATCH /me/preferences | User | `apps/mobile/test/flows.test.tsx` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 4 | M04 | `apps/mobile/src/features/onboarding.tsx` | — | — | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 5 | M05 | `apps/mobile/src/features/onboarding.tsx` | — | — | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 6 | M06 | `apps/mobile/src/features/onboarding.tsx` | — | — | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 7 | M07 | `apps/mobile/src/features/onboarding.tsx` | POST /auth/register | User, Consent, RefreshSession | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 8 | M08 | `apps/mobile/src/features/onboarding.tsx` | POST /me/security/pin | User, AuditLog | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 9 | M09 | `apps/mobile/src/features/onboarding.tsx` | PATCH /me/preferences | User | `apps/mobile/test/flows.test.tsx` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 10 | M10 | `apps/mobile/src/features/onboarding.tsx` | POST /me/security/unlock | User, AuditLog | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 11 | M11 | `apps/mobile/src/features/onboarding.tsx` | GET /me; PATCH /me/preferences; DELETE /me | User, DeletionJob, AuditLog | `apps/mobile/test/flows.test.tsx` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 12 | M12 | `apps/mobile/src/features/safety.tsx` | GET /me/overview | Case, Evidence, Notification | `apps/mobile/test/flows.test.tsx` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 13 | M13 | `apps/mobile/src/features/safety.tsx` | POST /sos | SOSAlert, LocationEvent, NotificationDelivery, AuditLog | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 14 | M14 | `apps/mobile/src/features/safety.tsx` | GET /sos/:id; PATCH /sos/:id/status | SOSAlert, SOSEvent, NotificationDelivery | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 15 | M15 | `apps/mobile/src/features/safety.tsx` | GET /contacts; POST /contacts; DELETE /contacts/:id | TrustedContact | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 16 | M16 | `apps/mobile/src/features/safety.tsx` | POST /location/shares; DELETE /location/shares/:id; POST /location/events | LocationShare, LocationEvent, TrustedContact | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 17 | M17 | `apps/mobile/src/features/safety.tsx` | POST /routes; GET /danger-zones | DangerZone, LocationEvent | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 18 | M18 | `apps/mobile/src/features/evidence.tsx` | GET /evidence | Evidence | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 19 | M19 | `apps/mobile/src/features/evidence.tsx` | POST /evidence | Evidence, AuditLog | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`, `tests/providers.test.ts` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 20 | M20 | `apps/mobile/src/features/evidence.tsx` | GET /evidence/:id; POST /evidence/:id/unlock; GET /evidence/:id/content | Evidence, EvidenceAccess | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`, `tests/providers.test.ts` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 21 | M21 | `apps/mobile/src/features/evidence.tsx` | POST /analysis | AIAnalysis, Evidence, ModelVersion | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`, `tests/providers.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 22 | M22 | `apps/mobile/src/features/evidence.tsx` | GET /analysis/:id | AIAnalysis, Evidence | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`, `tests/providers.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 23 | M23 | `apps/mobile/src/features/reporting.tsx` | POST /legal/queries; GET /legal/queries/:id; POST /legal/queries/:id/messages; POST /legal/queries/:id/escalate | LegalQuery, LegalMessage, LegalResource | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 24 | M24 | `apps/mobile/src/features/reporting.tsx` | — | ReportCategory (shared enum) | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 25 | M25 | `apps/mobile/src/features/reporting.tsx` | POST /reports; GET /evidence | Case, Report, CaseEvidence, CaseEvent | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 26 | M26 | `apps/mobile/src/features/reporting.tsx` | GET /cases/:reference; GET /cases/:reference/messages; POST /cases/:reference/messages | Case, CaseEvent, CaseMessage | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 27 | M27 | `apps/mobile/src/features/reporting.tsx` | GET /community/posts; POST /community/posts; POST /community/posts/:id/comments; POST /community/flags; PUT /community/posts/:id/like | CommunityPost, CommunityComment, CommunityLike, ModerationItem | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 28 | M28 | `apps/mobile/src/features/reporting.tsx` | GET /legal/resources; GET /legal/resources/:id | LegalResource | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 29 | M29 | `apps/mobile/src/features/wellbeing.tsx` | POST /wellbeing/check-ins | WellbeingCheckIn | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 30 | M30 | `apps/mobile/src/features/wellbeing.tsx` | GET /wellbeing/check-ins/:id; PATCH /wellbeing/check-ins/:id | WellbeingCheckIn | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_UI_Screens_user NEW RESULT.docx Screen 31 | M31 | `apps/mobile/src/features/wellbeing.tsx` | GET /counselors/availability; POST /counseling/appointments | StaffProfile, CounselorSlot, CounselingAppointment, Consent | `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 1.1 | S01 | `apps/web/src/features/sign-in.tsx` | POST /auth/login | User, StaffProfile, RefreshSession | `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 1.2 | S02 | `apps/web/src/features/admin.tsx` | GET /admin/overview; GET /events | Case, SOSAlert, User, AuditLog | `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 1.3 | S03 | `apps/web/src/features/admin.tsx` | GET /admin/users; POST /admin/users; PATCH /admin/users/:id | User, StaffProfile, AuditLog | `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 1.4 | S04 | `apps/web/src/features/cases.tsx` | GET /cases | Case, Report | `tests/integration.test.ts`, `tests/e2e/staff.spec.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 1.5 | S05 | `apps/web/src/features/cases.tsx` | GET /cases/:reference; POST /cases/:reference/assignment; POST /cases/:reference/actions | Case, CaseEvent, Evidence, AIAnalysis | `tests/integration.test.ts`, `tests/e2e/staff.spec.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 1.6 | S06 | `apps/web/src/features/admin.tsx` | GET /admin/moderation; PATCH /admin/moderation/:id | ModerationItem, CommunityPost, CommunityComment, AuditLog | `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 1.7 | S07 | `apps/web/src/features/admin.tsx` | GET /admin/models; POST /admin/model-events | ModelVersion, ModelMetric, ModelAuditEvent | `tests/integration.test.ts`, `tests/providers.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 2.1 | S08 | `apps/web/src/features/sign-in.tsx` | POST /auth/login | User, StaffProfile, RefreshSession | `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 2.2 | S09 | `apps/web/src/features/police.tsx` | GET /police/alerts; POST /sos/:id/respond | SOSAlert, SOSEvent, StaffProfile, LocationEvent | `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 2.3 | S10 | `apps/web/src/features/cases.tsx` | GET /cases/:reference; GET /evidence/:id/content; POST /cases/:reference/actions | Case, CaseEvent, CaseEvidence, LocationEvent, EvidenceAccess | `tests/integration.test.ts`, `tests/e2e/staff.spec.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 2.4 | S11 | `apps/web/src/features/cases.tsx` | PATCH /cases/:reference/status | Case, CaseEvent, AuditLog | `tests/integration.test.ts`, `tests/e2e/staff.spec.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 3.1 | S12 | `apps/web/src/features/sign-in.tsx` | POST /auth/login | User, StaffProfile, RefreshSession | `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 3.2 | S13 | `apps/web/src/features/counseling.tsx` | GET /counseling/appointments; GET /counseling/sessions/:id/messages | CounselingAppointment, CounselingMessage | `tests/integration.test.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 3.3 | S14 | `apps/web/src/features/counseling.tsx` | GET /counseling/clients/:id; POST /counseling/sessions/:id/start; POST /counseling/sessions/:id/escalate | CounselingAppointment, CounselingNote, Consent | `tests/integration.test.ts`, `tests/e2e/staff.spec.ts` | PARTIALLY IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 3.4 | S15 | `apps/web/src/features/counseling.tsx` | POST /counseling/sessions/:id/notes | CounselingNote, CounselingAppointment, CounselorSlot, AuditLog | `tests/integration.test.ts` | IMPLEMENTED |
| Suraksha_Screen_Admin,police,counsilor.docx 4.1 | S16 | `apps/web/src/features/legal.tsx` | GET /legal/queries; PATCH /legal/queries/:id; POST /legal/queries/:id/messages; POST /legal/resources; PATCH /legal/resources/:id | LegalQuery, LegalMessage, LegalResource, StaffProfile | `tests/integration.test.ts` | IMPLEMENTED |

## Functional groups

| Requirement | Screens | Existing implementation and evidence | Status / remaining scope |
|---|---|---|---|
| F01 | M01–M11 | onboarding.tsx; auth/auth.ts, core/me.ts; integration + mobile tests | PARTIALLY IMPLEMENTED — G04/G10/G12/G21 |
| F02 | M12 | safety.tsx Home; GET /me/overview; mobile screen test | IMPLEMENTED — Jobs entry only; G13 |
| F03 | M13–M16/S09 | safety controllers/providers; SOSAlert/SOSEvent; integration SOS and hold test | PARTIALLY IMPLEMENTED — G08 |
| F04 | M16–M17 | LocationShare/LocationEvent; SafeRouteProvider; position unit tests | PARTIALLY IMPLEMENTED — G09 |
| F05 | M18–M20/S05/S10 | evidence service; S3 AES-GCM; provider tamper/authorization tests | IMPLEMENTED — device qualification G21 |
| F06 | M21–M22/S07 | analysis.ts and services/ai; AIAnalysis; provider and Python tests | PARTIALLY IMPLEMENTED — G05/G19 |
| F07 | M24–M26/S04–S05/S10–S11 | cases.ts; Case/Report/CaseEvent; integration + Playwright shared reference | IMPLEMENTED |
| F08 | M23/M28/S16 | legal.ts; LegalQuery/LegalMessage/LegalResource; advisor isolation test | PARTIALLY IMPLEMENTED — G07 |
| F09 | M29–M31/S12–S15 | counseling.ts; appointments/notes/consent; private-note integration test | PARTIALLY IMPLEMENTED — G06/G16 |
| F10 | M27/S06 | community.ts; pending publication/moderation/audit; integration test | PARTIALLY IMPLEMENTED — manual moderation works; no validated AI moderation |
| F11 | S01–S16 | workspace.tsx/admin.ts; verified staff and scoped API guards; RBAC tests | IMPLEMENTED — supporting recovery needs provider G08 |
| F12 | S07 | ModelVersion/ModelMetric/ModelAuditEvent; admin monitoring; no seeded accuracy | PARTIALLY IMPLEMENTED — evaluation and drift pipeline G05 |

## Cross-cutting requirements

| ID | Existing implementation / test evidence | Status |
|---|---|---|
| N01 | Monorepo, Compose, Prisma migration/seed; full build commands | IMPLEMENTED |
| N02 | auth/auth.ts; default guard/role/ownership checks; token replay and directed role tests | IMPLEMENTED |
| N03 | Explicit case/legal/clinical projections; anonymous owner and restricted notes integration assertions | IMPLEMENTED |
| N04 | core/crypto.ts and evidence.ts; MinIO encryption, digest and tamper tests | PARTIALLY IMPLEMENTED — production key IDs/rotation G11 |
| N05 | OutboxEvent and authenticated SSE; current lists refetched after events | PARTIALLY IMPLEMENTED — durable reconnect/backpressure and realtime revocation tests G22 |
| N06 | shared locales/en/si/ta; accessible controls and locale fallback | PARTIALLY IMPLEMENTED — verified translations and assistive-device audit G04/G21 |
| N07 | Explicit demo modes, null confidence, draft legal content, no false emergency receipt; provider tests | IMPLEMENTED |
| N08 | 43 Vitest, 37 mobile, 3 Python, browser cross-role tests; see VERIFICATION.md | PARTIALLY IMPLEMENTED — device and comprehensive screen regression coverage G21 |
| N09 | Nine baseline documents, 47-row traceability, README and audit script | IMPLEMENTED |
| N10 | Confirmed active-data deletion and consent revocation; no fake offline dispatch | PARTIALLY IMPLEMENTED — recovery, backup retention and offline policy G12/G18 |
| RESEARCH | services/ai/RESEARCH.md; interfaces, preprocessing and demo only | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS — datasets, approved study and real evaluations absent |
| JOBS | M12 entry explains source limit; no fabricated employment module | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS — detailed product scope absent |
