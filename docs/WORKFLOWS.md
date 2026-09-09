# Workflows — source requirements and implementation mapping

These workflows preserve source requirements. Concrete code/status is mapped in TRACEABILITY_MATRIX.md; OPEN_GAPS.md qualifies external dispatch, clinical scoring, OCR, native behavior and legal content. Screen IDs resolve in SCREEN_INVENTORY.md.

## Onboarding, security and privacy

M01 → M02 identity gateway → M03 locale → M04/M05/M06 skippable explanations → M07 registration → M08 six-digit PIN entry/confirmation and optional supported biometric → M09 disguise → M15 trusted contacts → M12 Home. Existing accounts authenticate, then unlock through M10. The source omits authentication proof from M02; the implementation adds a password per C03. Do not issue a session based only on NIC and phone.

App launch/re-entry presents chosen utility and locks sensitive routes. A verified PIN or supported native biometric unlocks Guardian Mode. “Back to calculator”/chosen utility immediately clears sensitive views. Relock on backgrounding; secure credential storage and evidence preview cleanup need device tests. M11 edits preferences and starts explicit-confirmation deletion; do not report erasure before object/account cleanup succeeds.

## Shared report → triage → investigation → tracker

1. M24 selects documented category; M25 selects date, owned vault evidence, optional narrative and anonymity.
2. `POST /reports` transaction creates one Case with unique reference, one Report, authorized CaseEvidence links, sealing metadata, initial CaseEvent and outbox event. An idempotency key prevents duplicate cases on retry. Reference allocation uses the database, not an in-process counter.
3. Persist AI assessment provenance on that same case. AI failure must not discard the report or silently lower risk; triage can proceed with assessment unavailable.
4. S04 lists the case; S05 sees the anonymous-safe package and assigns a verified officer. Assignment, event history and notification outbox commit atomically.
5. S10 loads the same reference and only its authorized evidence/location trail. Downloads verify integrity and append access events. Old assignments lose access.
6. S11 advances investigation stage with notes. A version check prevents lost concurrent updates. M26 receives the safe status projection and message thread for the original reference.
7. Requests for information, escalation and resolution are typed events on the same case, never copied cases. Internal notes must not leak into the user's timeline.

Implemented canonical stages: FILED → UNDER_INVESTIGATION → SUSPECT_CONTACTED → RESOLVED. Triage NEW/IN_REVIEW and escalation flags are separate fields/events. Exact early-resolution/reopening rules need specification; do not allow arbitrary transitions. Mobile labels Received/Under review/Awaiting update map to actual state/event history, not a fabricated ETA.

## Evidence capture and scan

M19 imports Photo, Audio, Video or Chat log and creates text notes; native capture remains G19. API checks file constraints and owner, calculates SHA-256, encrypts with AES-256-GCM under a fresh nonce, writes a private random object key and stores metadata. Storage and database are not a single atomic transaction. Metadata is returned after object creation and SQL insert; cleanup/recovery limitations are recorded in G12/G23. M18 lists metadata; M20 requires PIN reauthentication for sealed preview. Report attachments preserve immutable content and custody events.

M21 sends text to a versioned analyzer. Screenshot OCR remains G19. M22 shows classification, risk, available confidence and development/validation status. The analyzed text is encrypted into the vault; a case/legal query requires explicit user action. OCR/AI outage gets a recoverable error, not a synthetic risk score or a false “Filed”.

## SOS and location

M13 continuous two-second hold → persisted SOS alert/location availability → transactional delivery outbox → scoped Police S09 realtime visibility → per-recipient development/real delivery acknowledgments → M14 actual event history. Hold release cancels activation; pre-dispatch cancellation and post-dispatch “I am safe now” are separate transitions. Development provider never claims real police were contacted.

M15 manages priority contacts. M16 creates consented, expiring contact-specific sharing, submits timestamped positions and permits immediate stop/revocation. Denied permission, stale data and unavailable location are explicit, not coordinates (0,0). SOS can preserve an alert with unavailable location. S09 Respond atomically claims an eligible event to avoid competing assignments.

M17 requests a route around community danger zones, displays source/time of warnings and activates deviation alerts. Fixture geometry is labeled illustrative and cannot claim a safe real-world route. Live tracking/background permissions and offline delivery need platform/provider validation.

## Legal guidance and resources

M23 question → retrieve only published reviewed sources → informational response with sources, or “no reviewed information available” → user chooses human escalation → S16 queue → advisor claims New query → In progress → response → Answered. User reads the same query thread. Report filing remains a separate consented step. Query answers are private: publishing a resource requires an explicit reviewed editorial action and removal of identifying details.

S16 resource editor stores source URL/title, jurisdiction, review date, language, version, reading time and publication state → M28 searchable published content. Do not populate invented statutory explanations from incomplete screenshot examples.

## Wellbeing and counseling

M29 private check-in → M30 result from a configured instrument only → optional separate consent to share screening → M31 language/specialization/slot selection → atomic reservation → S13 assigned workload → S14 pseudonymous Client #4482-type view → session lifecycle → S15 encrypted notes plus follow-up reservation in one transaction. Overlapping bookings are rejected; note/follow-up failure must not leave half-completed care records. Booking does not imply consent to reveal screening or real name. Crisis referral records minimal necessary disclosure; destination policy remains a gap.

## Community and model oversight

M27 post/comment → pending moderation → model/provider assessment → publication only after policy-permitted review; unavailable model stays pending → user/AI flags → S06 approve/remove with reason and immutable audit. Public projections omit real author IDs. Approval/removal updates counts consistently; deleted/removed comments must not leak through thread endpoints.

S07 reads model registry and evaluation records by language. Deployment, drift, overrides and retraining are distinct audited events with dataset/run provenance. Unmeasured fields remain unavailable. Retraining metadata does not claim a trained/deployed artifact exists.
