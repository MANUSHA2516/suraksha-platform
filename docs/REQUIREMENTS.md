# Requirements — authoritative source baseline

## Source register and review evidence

| Alias | File | Reviewed content |
|---|---|---|
| R | research proposal.docx | 538 extracted paragraphs; eight tables; 37 embedded UI images; methodology, scope, research limitations and references |
| M | Suraksha_UI_Screens_user NEW RESULT.docx | 1,026 paragraphs; 31 embedded mobile screenshots; Screens 1–31 |
| S | Suraksha_Screen_Admin,police,counsilor.docx | 204 paragraphs; 16 embedded staff screenshots; §§1.1–4.1 |
| — | README.md | Developer guide; not a substantive source specification |

Extraction output, original-image anchors, table-preserving blocks and SHA-256 source fingerprints are in `sources/`. `scripts/extract_documentation.py` recreates the extraction using Python's standard library. Contact sheets support visual comparison. No DOCX embeddings were present. No PDF or standalone original diagrams were found. The user confirmed these THREE DOCX files are the complete available specification (C20). All three were reviewed. Referenced original diagrams are absent; textual relationships define the implementation baseline.

## Functional requirements

Each inventory entry is independently required; these groups do not replace the detailed 47-screen inventory.

| ID | Required behavior | Primary source | Screens |
|---|---|---|---|
| F01 | NIC/phone identity gateway, registration consent, secure account, 6-digit PIN, optional biometrics, locale, working disguise and deletion controls | M1–11 | M01–M11 |
| F02 | Personalized Home and exact primary navigation; Jobs entry only; no detailed jobs workflow is specified | M12; R5.7.1 | M12 |
| F03 | Deliberate 2-second SOS activation, persisted emergency, trusted contacts/responder delivery outcomes, live tracking and safe closure | M13–16; S2.2 | M13–M16, S09 |
| F04 | Consent-bound expiring location sharing, safe routing around reported danger zones, low-light warnings and geofence alerts | M16–17; R1.3 | M16–M17 |
| F05 | Encrypted object evidence, capture/import four formats, metadata/hash verification, sealed PIN-gated preview and authorized case attachment | M18–20; S1.5/2.3 | M18–M20, S05, S10 |
| F06 | Trilingual text analysis pipeline; OCR abstraction; versioned results, vault save, opt-in legal escalation; no unsupported confidence claims | M21–22; R3.7/3.9 | M21–M22, S07 |
| F07 | Category/date/narrative/evidence/anonymous report; same case reference through admin assignment, police updates and user tracking/messages | M24–26; S cross-role section | M24–M26, S04–S05, S10–S11 |
| F08 | Informational source-grounded legal chat with human fallback, advisor query statuses, responses, reviewed resource library/search and impact | M23/28; S4.1 | M23, M28, S16 |
| F09 | Private non-diagnostic check-in, consented clinical visibility, counselor availability and booking, pseudonymous clients, notes and follow-up | M29–31; S3 | M29–M31, S12–S15 |
| F10 | Anonymous peer posts/comments/likes; moderation before publication; user/AI flag reasons; audited admin approve/remove | M27; S1.6 | M27, S06 |
| F11 | Verified staff accounts and one role-aware staff application, operational metrics, scoped queues, staff verification/suspension | S1–4 | S01–S16 |
| F12 | Model version/deployment/evaluation/language/drift/override/retraining provenance; distinguish unavailable and illustrative metrics | S1.7; R5.7 | S07 |

## Cross-cutting requirements from user instruction and source constraints

| ID | Requirement | Acceptance evidence (status in TRACEABILITY_MATRIX) |
|---|---|---|
| N01 | Shared TypeScript monorepo: React Native, Next.js, NestJS, PostgreSQL/Prisma, separate Python FastAPI AI, Redis/MinIO development infrastructure | Install, migration, seed, builds and both clients using one API |
| N02 | Argon2 credentials; expiring access tokens; rotating/revocable refresh sessions; audit and backend RBAC on every protected endpoint | Authentication, replay/revocation, all cross-role denials and ownership integration tests |
| N03 | Privacy projections: anonymous reporter identity only to assigned handler; counselor identity pseudonyms; consent-bound screening; no admin clinical-note read | Deliberate sensitive-field absence and object-level authorization tests |
| N04 | Private AES-256-GCM evidence objects, fresh nonce, SHA-256 verification, key IDs, authenticated download, audit | Real MinIO round-trip, tamper rejection, unauthorized download, linkage and transaction tests |
| N05 | Role/owner/jurisdiction scoped realtime; actual event/delivery history; no credentials, clinical notes or report narratives in general logs | Realtime subscription authorization and redaction tests |
| N06 | Trilingual-ready catalogs, Unicode, semantic controls, focus, screen reader labels, accessible errors | Locale fallback tests, web keyboard and mobile accessibility checks |
| N07 | Honest integration/model/research status; no invented legal content, metrics, certifications or confirmed emergency response | Provider-mode indicators and unavailable-result assertions |
| N08 | Meaningful API, UI, mobile and cross-role E2E tests; lint, format, strict types and production builds | Actual command output and artifacts, never source mockup claims |
| N09 | Reproducible documentation, conflict register, gaps, source-to-code audit and developer README | Every requirement linked to existing code/test before completion |
| N10 | Data deletion, recovery, consent revocation and offline operation must have explicit semantics | Deletion workflow/object cleanup, expired sharing and failed dispatch tests |

## Research requirements, not software metrics

R3 describes DSRM, a mixed-methods needs assessment, consented annotated corpora, independent annotation with Cohen's kappa and adjudication, classical TF-IDF baseline then lightweight multilingual transformer, cross-validation and held-out per-language precision/recall/F1/accuracy. Evaluation also requires SUS, paired pre/post awareness/reporting/help-seeking measures and thematic analysis. Target sample sizes are proposed research plans, not seeded production analytics. Ethical approval, licensed datasets and actual participant evaluation are external research work; this repository contains none of their results.

## Visual reference constraints

Preserve white mobile backgrounds, navy serif headings, rounded pale-blue cards/inputs, green onboarding/affirmative controls, blue functional actions, red emergency/destructive states, small uppercase context pills, progress tracks and documented five-tab navigation. Guardian Mode uses a full navy surface. Staff screens share a navy left rail, pale-blue workspace, white metric cards, compact tables and side metadata panels; police selection/emergency emphasis is red, other selected navigation generally green. Sign-in uses a blue branded split panel. Avoid literal trust claims unsupported by implementation.
