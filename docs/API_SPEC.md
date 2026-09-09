# API specification — registered implementation

The NestJS API uses prefix `/v1`. All routes below require a verified current session unless explicitly public. `auth/auth.ts` supplies global authentication and role guards; services additionally enforce record ownership/assignment and consent. Route lists are extracted from decorators; exact request validators are in the linked implementation files and `packages/validation/src/index.ts`.

## Transport and errors

JSON requests except `POST /evidence` multipart and `/evidence/:id/content` binary downloads. Web sets `X-Suraksha-Client: web` for HttpOnly cookie sessions and sends credentials; mutating cookie requests require the configured Origin. Mobile uses `Authorization: Bearer <accessToken>`. Access lifetime is ten minutes; refresh credentials rotate atomically, are stored hashed, and expire in seven days. Replayed refresh credentials revoke their family. Web `rememberDevice` controls persistent refresh cookies.

Error envelope: `{ "error": { "code": 400, "message": "…", "requestId": "…", "fields": {} } }`. `code` is the numeric HTTP status; fields are optional. 400 validation, 401 missing/expired session, 403 forbidden role/record, 404 missing resource, 409 duplicate/stale transition, 413 upload size, 429 throttled, 500 unexpected failure, 503 AI unavailable. No stack or sensitive record is returned.

List responses are capped arrays, not complete cursor-paginated APIs (G23). Timestamps are ISO UTC. Report/SOS retry keys are client UUIDs; case mutations use `expectedVersion`. Create endpoints generally return 201, updates 200.

## Core contracts

- `POST /auth/register`: `{name,nic,phone,password,consent:true}`; creates USER only. A role field is rejected. No possession-verification provider is claimed.
- `POST /auth/login`: `{login,password,rememberDevice?:boolean}`; login is NIC or staff identifier. Non-web responses include `{accessToken,refreshToken,user}`; web receives cookies and safe user data.
- `POST /auth/refresh`: mobile `{refreshToken}` or web refresh cookie; returns rotated credentials. `POST /auth/logout` revokes current family. `GET /auth/me` returns safe user/session context.
- `POST /reports`: `{category,occurredAt,description?,anonymous,evidenceIds?:string[],idempotencyKey}`; returns the shared case projection. Categories are CYBER_HARASSMENT, DOMESTIC_VIOLENCE, WORKPLACE_HARASSMENT, PUBLIC_TRANSPORT_ABUSE. Evidence must belong to the caller.
- `POST /cases/:reference/assignment`: `{officerId,expectedVersion}`; Admin only, verified active officer. `PATCH /cases/:reference/status`: `{stage,notes,expectedVersion}`; assigned Police only, sequential FILED → UNDER_INVESTIGATION → SUSPECT_CONTACTED → RESOLVED.
- `POST /evidence`: multipart `file`, `kind` (Photo/Audio/Video/Chat log/Analysis), optional `note`; maximum 25 MB. Returns metadata/digest, never object keys or public URLs. `POST /evidence/:id/unlock` accepts `{pin}`; sealed-owner download sends returned proof in `X-Unlock-Proof`.
- `POST /sos`: `{idempotencyKey,locationState,location?}` where state is AVAILABLE/DENIED/UNAVAILABLE/STALE and position is `{latitude,longitude,accuracy,capturedAt}`. Response contains persisted alert/history/development delivery receipts, not dispatch confirmation.
- `POST /analysis`: `{text,language?:'auto'|'en'|'si'|'ta'}`; calls authenticated FastAPI `/analyze` and stores encrypted text evidence plus versioned analysis. Demo confidence is null. `GET /analysis/:id` is owner-scoped.
- `POST /legal/queries` creates a private informational query. Explicit escalation makes it claimable by an advisor; other advisors cannot read claimed conversations. Resource publication requires reviewed text and source URL, not a supplied title alone.
- `POST /counseling/appointments`: `{slotId}`; unique future counselor slot. Notes/follow-up use `/counseling/sessions/:id/notes` with `{summary,cadence,cadenceNote?,risk,nextSlotId?}` and are assigned-counselor-only. Generic Admin access is forbidden.
- `GET /events`: authenticated Server-Sent Events with minimal resource references. Clients refetch through ordinary policy-checked endpoints. Durable reconnect/backpressure is not implemented (G22).

## Registered routes by controller

Paths here are relative to `/v1`. For record-level policy details see ROLE_PERMISSION_MATRIX.md. Public registration, login and refresh are the only unauthenticated NestJS endpoints.

### `services/api/src/auth/auth.ts`

| Method | Path |
|---|---|
| POST | /auth/register |
| POST | /auth/login |
| POST | /auth/refresh |
| GET | /auth/me |
| POST | /auth/logout |

### `services/api/src/core/me.ts`

| Method | Path |
|---|---|
| GET | /me |
| GET | /me/overview |
| PATCH | /me/preferences |
| POST | /me/security/pin |
| POST | /me/security/unlock |
| DELETE | /me |

### `services/api/src/cases/cases.ts`

| Method | Path |
|---|---|
| POST | /reports |
| GET | /cases |
| GET | /cases/:reference |
| POST | /cases/:reference/assignment |
| PATCH | /cases/:reference/status |
| POST | /cases/:reference/actions |
| GET | /cases/:reference/messages |
| POST | /cases/:reference/messages |

### `services/api/src/evidence/evidence.ts`

| Method | Path |
|---|---|
| GET | /evidence |
| POST | /evidence |
| GET | /evidence/:id |
| POST | /evidence/:id/unlock |
| GET | /evidence/:id/content |

### `services/api/src/safety/safety.ts`

| Method | Path |
|---|---|
| GET | /contacts |
| POST | /contacts |
| DELETE | /contacts/:id |
| POST | /sos |
| GET | /sos/:id |
| PATCH | /sos/:id/status |
| GET | /police/alerts |
| POST | /sos/:id/respond |
| GET | /location/shares |
| POST | /location/shares |
| DELETE | /location/shares/:id |
| POST | /location/events |
| GET | /danger-zones |
| POST | /routes |
| GET | /notifications |
| PATCH | /notifications/:id |
| GET (SSE) | /events |

### `services/api/src/support/analysis.ts`

| Method | Path |
|---|---|
| POST | /analysis |
| GET | /analysis/:id |

### `services/api/src/support/legal.ts`

| Method | Path |
|---|---|
| GET | /legal/queries |
| POST | /legal/queries |
| GET | /legal/queries/:id |
| POST | /legal/queries/:id/escalate |
| PATCH | /legal/queries/:id |
| POST | /legal/queries/:id/messages |
| GET | /legal/resources |
| GET | /legal/resources/:id |
| POST | /legal/resources |
| PATCH | /legal/resources/:id |

### `services/api/src/support/counseling.ts`

| Method | Path |
|---|---|
| POST | /wellbeing/check-ins |
| GET | /wellbeing/check-ins/:id |
| PATCH | /wellbeing/check-ins/:id |
| GET | /counselors/availability |
| POST | /counseling/appointments |
| GET | /counseling/appointments |
| GET | /counseling/clients/:id |
| POST | /counseling/sessions/:id/start |
| POST | /counseling/sessions/:id/notes |
| POST | /counseling/sessions/:id/escalate |
| GET | /counseling/sessions/:id/messages |
| POST | /counseling/sessions/:id/messages |

### `services/api/src/community/community.ts`

| Method | Path |
|---|---|
| GET | /community/posts |
| POST | /community/posts |
| POST | /community/posts/:id/comments |
| PUT | /community/posts/:id/like |
| POST | /community/flags |
| GET | /admin/moderation |
| PATCH | /admin/moderation/:id |

### `services/api/src/admin/admin.ts`

| Method | Path |
|---|---|
| GET | /admin/overview |
| GET | /admin/users |
| POST | /admin/users |
| PATCH | /admin/users/:id |
| GET | /admin/models |
| POST | /admin/model-events |

FastAPI separately exposes `GET /health` and `POST /analyze`; analysis requires the service bearer token. Its development model is not an externally evaluated classifier. No `/auth/challenges`, standalone `/admin/cases`, OCR or external dispatch endpoint is claimed.
