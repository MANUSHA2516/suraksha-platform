# Role permission matrix — source-derived backend policy

Roles come from the detailed mobile and staff catalogs. R3.8's textual EER description omits Legal Advisor; S4.1 and the user's explicit five-role requirement add it. One account has one role (disjoint specialization), not separate authentication systems. Default deny applies to endpoints and individual records/fields.

| Capability / data | USER | ADMIN | POLICE | COUNSELOR | LEGAL_ADVISOR | Source |
|---|---|---|---|---|---|---|
| Own preferences/security/session | Own | Own | Own | Own | Own | M2–11, staff sign-ins |
| Account provision/verify/suspend | No staff provisioning | Manage; audited | No | No | No | S1.3 |
| Reports and case metadata | Own | Operational triage across cases | Assigned; jurisdiction policy for queues | No general case access; assigned care records only | No general case access; claimed legal queries only | S1.5/2.3, cross-role section |
| Anonymous reporter identity | Own | Hidden in triage | Assigned handler exception only | Pseudonymous client only | No implicit identity access | M25, S3.3 |
| Case assignment | No | Verified officer, audited | Respond to eligible SOS; no general reassignment | No | No | S1.5/2.2 |
| Investigation stage/notes | Safe timeline only | Triage actions; permitted operational timeline | Assigned case update | No | No | S2.3–2.4 |
| Internal case notes | No | Operational | Relevant assigned investigation | No | No | S1.5/2.3 |
| Evidence metadata/content | Own, PIN gate for sealed preview | Case-linked triage access, audited | Attached to assigned investigation, audited | No implicit access | No implicit access | M18–20, S1.5/2.3 |
| Trusted contacts/location shares | Own CRUD and consent | No general tracking | Responding incident location only | No | No | M15–17, S2.2–2.3 |
| SOS activate/close | Own | Operational event visibility | Eligible jurisdiction queue, assigned response | No general feed | No general feed | M13–14, S1.2/2.2 |
| Wellbeing responses/results | Own | No | No | Assigned care and explicit current consent | No | M29–30, S3.3 |
| Clinical notes | No automatic clinician-note read specified | No | No | Assigned session only | No | S3.3–3.4; conservative privacy boundary |
| Appointments | Own booking/status | No clinical details | No | Own assigned workload and follow-up | No | M31, S3.2–3.4 |
| Legal queries/messages | Own | No general private transcript access | No | No | Incoming queue minimum; assigned query response | M23, S4.1 |
| Published legal resources | Read/search | No implied authorship | Read | Read | Create/edit/review/publish | M28, S4.1 |
| Community | Anonymous posting/comment/like/flag | Flag queue, approve/remove | No moderation authority | No moderation authority | No moderation authority | M27, S1.6 |
| Model monitoring/override | Own analysis only | Registry/evaluation/override audit | Case-relevant analysis only | No global model access | No global model access | M21–22, S1.7 |
| Audit logs | Own public case timeline | Sanitized operational audit | Assigned case audit | Assigned clinical audit | Own query/resource audit | Staff case/model screens |

## Enforcement decisions to verify

- Verify the current account is active and staff credentials are verified, including after suspension or session revocation. A role in an old token must not bypass account state.
- Apply authorization predicates before database reads and before mutations, including evidence IDs supplied to report creation. Object storage is private; no stable public download URL.
- Responses use explicit role-specific projections. Never return an unrestricted ORM object and rely on UI hiding. General logs and realtime events contain identifiers and safe event types, not sensitive content.
- Anonymous identity exceptions do not reveal identity via filenames, global user lists joined to reports, audit actor fields, event payloads or exports. User management authority does not authorize correlation with anonymous reports.
- Subscription and every delivered realtime event must enforce the same owner/assignment/jurisdiction predicates. Reassignment revokes prior officer access.
- Cross-role access to protected role routes returns 403. Cross-owner nonexistent/hidden resources may use a consistent 404 policy to limit enumeration; document and test it.
- Minimum test set: all 20 directed pairs of distinct roles denied on representative restricted endpoints, unassigned same-role access, revoked/suspended accounts, admin clinical-note denial, counselor identity projection, screening consent withdrawal, evidence ownership/attachment authorization and legal-query isolation.

Jurisdiction configuration, CID/crisis-team membership, retention rules and legal referral evidence-sharing scope remain unspecified. Do not grant universal access to compensate.

Implementation: `services/api/src/auth/auth.ts` globally guards routes; role decorators restrict controllers/actions, and each record service checks ownership/assignment. Integration tests verify directed cross-role denials, anonymous projections and clinical isolation. Recovery/real staff eligibility validation are not provider-connected (G08).
