# Open gaps and implementation state

**Implementation in progress.** The user resolved the source-count discrepancy: the THREE DOCX files and derived 47-screen baseline are authoritative. No additional document or approval is required.

| ID | Gap | Evidence / next requirement | Classification |
|---|---|---|---|
| G01 | Source count resolved | User confirms the three DOCX files are the complete source specification; C20. | RESOLVED |
| G02 | EER, use-case, architecture and DFD originals missing | Research references them, but all 37 embedded research images are UI screenshots; no embeddings or independent diagram files found. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| G03 | All application code, infrastructure and tests absent | 47-screen inventory is a proposed implementation baseline only. | NOT IMPLEMENTED |
| G04 | Sinhala/Tamil verified translations absent | Language selection labels exist, not complete screen translations. Build en/si/ta catalogs with explicit English fallback; no claim of translation completeness. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| G05 | Harassment datasets, trained weights, evaluation runs absent | Need consent/licensing, annotation guidelines, held-out partitions, versioned baseline and transformer artifacts. Development model must be labeled non-validated; confidence may be unavailable. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| G06 | Clinical screener inconsistent/incomplete | See C08. Only one question; no approved instrument or scoring configuration. Booking must not depend on inventing a diagnosis. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| G07 | Curated legal content and policy documents absent | Guide names and partial chatbot examples are insufficient. Require authoritative source metadata, language-specific review and publication workflow. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| G08 | Real emergency/SMS/push/SSO providers unavailable | Implement provider interfaces and explicit local outbox; dispatch status must never imply contact with real emergency services. Staff eligibility verification process/provider required. | BLOCKED BY EXTERNAL SERVICE |
| G09 | Map/routing/danger-zone data unavailable | Local fixture provider must label routes illustrative. Define jurisdiction boundaries and stale-position threshold. Permission denied, GPS unavailable, stale readings and network failure must remain distinct. | BLOCKED BY EXTERNAL SERVICE for real coverage |
| G10 | Native disguise behavior not investigated/implemented | Need Android/iOS build assets, supported icon/name mechanisms, device tests; internal calculator/notes/weather and immediate relock still required. Do not claim OS-level concealment. | NOT IMPLEMENTED |
| G11 | Production key lifecycle undefined | User allows env key for prototype; production needs key IDs, rotation/recovery, access separation and secure disposal. Device-derived model differs; C07. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| G12 | Deletion versus sealed evidence retention unresolved | M11 promises all account/vault/messages erased. Define treatment of assigned investigations, audit references, backups and object versions; no silent retention under an erase-all promise. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| G13 | Jobs/skills beyond Home entry | Missing fourth document may expand scope; no dedicated available screen. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| G14 | Staff secondary views lack screenshots | Legal response/editor/profile/impact, police list/profile, counselor messages/client list, recovery, staff edit, incident messaging still need functional supporting views. | PARTIALLY SPECIFIED, NOT IMPLEMENTED |
| G15 | Engineering states absent in mockups | Infer loading, empty, validation, expired session, authorization denial, offline, upload retry, optimistic-update rollback, inaccessible GPS, failed delivery, 404 and 500 states. | NOT IMPLEMENTED |
| G16 | Chat/video sessions and crisis/CID destinations unspecified | Need transport provider, roster, consent policy and acknowledgment workflows. Local session lifecycle cannot claim a connected clinical call. | BLOCKED BY EXTERNAL SERVICE for live calls; routing policy unspecified |
| G17 | Research evaluation not conducted | Needs ethics approval, participant consent, actual samples, SUS and pre/post instruments, annotation agreement and model/security/usability measurements. Do not fabricate results. | NOT IMPLEMENTED; requires real research |
| G18 | Offline emergency access not designed | Research 1.3 names it; no offline dispatch workflow supplied. Cached emergency UI and queued events are not a delivered SOS. | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |

The requested four final statuses cannot truthfully describe wholly absent application code as implemented/partially implemented. This pre-implementation audit therefore adds **NOT IMPLEMENTED**; reassess every row against actual code and test evidence after the source gate is resolved.
