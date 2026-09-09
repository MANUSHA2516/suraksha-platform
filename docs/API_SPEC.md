# API specification — proposed contracts, not live endpoints

The three DOCX files are the complete authoritative source set, confirmed by the user on 2026-09-08. Referenced diagrams are absent; use the documented textual relationships and screen workflows. This is a pre-implementation API design linked to available screens, not generated OpenAPI from running code.

## Common conventions

Proposed prefix `/v1`; JSON except multipart evidence uploads and authorized binary downloads. Authenticated principal comes from verified access token/session, never a client-supplied owner or role. Staff verification, account state, assignment, consent and jurisdiction checks are separate from token validity. All list endpoints require bounded pagination and allowlisted filters/sort fields. Timestamps use UTC ISO 8601; case references are stable `SL-<sequence>` strings.

Error envelope: `{error:{code,message,requestId,fields?}}`. Codes: 400 validation, 401 authentication/expired session, 403 forbidden role, 404 missing or consistently concealed object, 409 stale version/duplicate booking/invalid transition, 413 oversized evidence, 429 rate limit, 503 unavailable provider. Never return stack traces, secrets or sensitive record contents in errors.

Mutating critical workflows accept idempotency keys; case mutations require an expected version. Staff sessions should use secure HttpOnly cookies through a web server boundary with CSRF/Origin checks; mobile tokens require native secure storage. Refresh tokens rotate atomically, are hashed in storage, and support logout, family replay revocation and suspension. Exact transport code is not implemented.

## Authentication contracts

- `POST /auth/register`: documented name/phone/NIC context, strong password, versioned consent and eligibility affirmation → USER account only; never accept a privileged role.
- `POST /auth/login`: staff identifier/password or mobile identity plus authentication proof → short-lived access session and rotating refresh session. NIC/phone alone never suffices.
- `POST /auth/refresh`: valid unrevoked refresh credential → replacement token pair; replay invalidates family.
- `POST /auth/logout`: revoke current refresh family; clear cookies/native credentials.
- `GET /auth/me`: current safe account projection and role destination.
- `POST /auth/challenges`: optional possession verification provider with expiry/attempt limits, only if configured. Local challenge delivery must be clearly identified.

## Core request / response examples

`POST /reports` (USER): `{category, occurredAt, description?, anonymous, evidenceIds[], idempotencyKey}` → `{reference,status,createdAt,version}`. Derive owner from session, verify every evidence ID belongs to owner and is finalized, atomically create case/report/links/events/outbox. Never accept reporter identity from an unrelated request field.

`POST /cases/:reference/assignment` (ADMIN): `{officerId,expectedVersion}` → safe case projection. Officer must be active and verified; assignment is auditable. No new case is created.

`PATCH /cases/:reference/status` (assigned POLICE): `{stage,notes,expectedVersion}` → same `{reference,status,version}`. Enforce lifecycle; separate private investigation notes from the user's public timeline.

`POST /evidence` (USER): multipart `{file,type,note?,capturedAt?,location?}` → `{id,state,sha256,capturedAt,sealedAt?}` only after authenticated encrypted object save. Key material/object URLs are never returned. Content download authenticates ownership/assignment, reauth proof where required, decrypts/verifies and records access.

`POST /sos` (USER): `{idempotencyKey,location?:{latitude,longitude,accuracy,capturedAt},locationState}` → `{id,status,deliveryMode,deliveries[]}`. State describes actual provider acknowledgment. A development outbox receipt is never real dispatch confirmation.

`POST /analysis` (USER): `{text,language:'auto'|'en'|'si'|'ta'}` → `{id,classification,riskLevel,confidence:null|number,modelVersion,validationStatus,explanationMetadata,evidenceId}`. `services/ai POST /analyze` is a service-to-service contract, not an unauthenticated bypass for user storage. Do not log raw message text or fabricate scores.

`POST /counseling/appointments` (USER): `{slotId,screeningConsentId?}` → appointment with pseudonymous client reference. Enforce unique reservation. `POST /counseling/sessions/:id/notes` (assigned COUNSELOR): `{summary,cadence,cadenceNote?,risk,nextSlotId?}` → note receipt plus follow-up appointment; both persist transactionally.

## Screen endpoint coverage

| Screen | Allowed role before record policy | Proposed endpoints | Record policy |
|---|---|---|---|
| M01 | USER | — | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M02 | USER | POST /auth/login; POST /auth/challenges | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M03 | USER | PATCH /me/preferences | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M04 | USER | — | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M05 | USER | — | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M06 | USER | — | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M07 | USER | POST /auth/register | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M08 | USER | POST /me/security/pin | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M09 | USER | PATCH /me/preferences | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M10 | USER | POST /me/security/unlock | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M11 | USER | GET /me; PATCH /me/preferences; DELETE /me | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M12 | USER | GET /me/overview | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M13 | USER | POST /sos | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M14 | USER | GET /sos/:id; PATCH /sos/:id/status | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M15 | USER | GET /contacts; POST /contacts; DELETE /contacts/:id | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M16 | USER | POST /location/shares; DELETE /location/shares/:id; POST /location/events | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M17 | USER | POST /routes; GET /danger-zones | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M18 | USER | GET /evidence | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M19 | USER | POST /evidence | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M20 | USER | GET /evidence/:id; POST /evidence/:id/unlock; GET /evidence/:id/content | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M21 | USER | POST /analysis | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M22 | USER | GET /analysis/:id | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M23 | USER | POST /legal/queries; GET /legal/queries/:id; POST /legal/queries/:id/messages; POST /legal/queries/:id/escalate | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M24 | USER | — | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M25 | USER | POST /reports; GET /evidence | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M26 | USER | GET /cases/:reference; GET /cases/:reference/messages; POST /cases/:reference/messages | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M27 | USER | GET /community/posts; POST /community/posts; POST /community/posts/:id/comments; POST /community/flags; PUT /community/posts/:id/like | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M28 | USER | GET /legal/resources; GET /legal/resources/:id | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M29 | USER | POST /wellbeing/check-ins | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M30 | USER | GET /wellbeing/check-ins/:id | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| M31 | USER | GET /counselors/availability; POST /counseling/appointments | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S01 | ADMIN | POST /auth/login | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S02 | ADMIN | GET /admin/overview; GET /admin/events | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S03 | ADMIN | GET /admin/users; POST /admin/users; PATCH /admin/users/:id | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S04 | ADMIN | GET /admin/cases | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S05 | ADMIN | GET /cases/:reference; POST /cases/:reference/assignment; POST /cases/:reference/actions | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S06 | ADMIN | GET /admin/moderation; PATCH /admin/moderation/:id | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S07 | ADMIN | GET /admin/models; GET /admin/model-events; POST /admin/model-events | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S08 | POLICE | POST /auth/login | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S09 | POLICE | GET /police/alerts; POST /sos/:id/respond | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S10 | POLICE | GET /cases/:reference; GET /evidence/:id/content; POST /cases/:reference/actions | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S11 | POLICE | PATCH /cases/:reference/status | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S12 | COUNSELOR | POST /auth/login | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S13 | COUNSELOR | GET /counseling/appointments; GET /counseling/messages | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S14 | COUNSELOR | GET /counseling/clients/:clientId; POST /counseling/sessions; POST /counseling/escalations | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S15 | COUNSELOR | POST /counseling/sessions/:id/notes | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |
| S16 | LEGAL_ADVISOR | GET /legal/queries; PATCH /legal/queries/:id; POST /legal/queries/:id/messages; POST /legal/resources; PATCH /legal/resources/:id | ROLE_PERMISSION_MATRIX.md; own/assigned records as applicable |

## Realtime and provider interfaces

Proposed realtime events: `case.created`, `case.assigned`, `case.statusChanged`, `case.messageAdded`, `sos.created`, `sos.responded`, `sos.locationUpdated`, `sos.closed`, `notification.created`. Authenticate connection; authorize each subscription and each delivery against current owner/assignment/jurisdiction. No global sensitive broadcast. Events carry IDs/version plus minimal safe metadata; clients refetch authorized projections. Reconnect resumes from durable event cursors.

Provider boundaries: encrypted EvidenceObjectStore (S3/MinIO), EmergencyDeliveryProvider, PushProvider, Location/RouteProvider, OCRProvider, AnalyzerProvider, LegalRetriever, StaffSSOProvider, ClinicalSessionProvider. Local implementations explicitly return development provenance; absent live providers return unavailable, never success-shaped mock responses.

Full OpenAPI schemas, pagination cursors, rate-limit values, payload size limits and every concrete endpoint authorization test remain implementation work.
