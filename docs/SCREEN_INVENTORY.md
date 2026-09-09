# Screen inventory — provisional source baseline

Only three substantive documents are present. The fourth source and referenced design diagrams have not been supplied. This is an inventory of **47 unique catalog screens**, not a claim that the application exists. Research Figures 1–37 duplicate subsets of these screens; they do not add 37 further screens.

Source screen names, purposes and component descriptions below are transcribed from the catalogs. Routes, API contracts, normalized entity names, component paths and test names are **proposed implementation decisions**, pending the missing source. No application code or tests exist yet. “Implemented” in a source title describes its mockup, not this repository.

Status for every entry: **NOT IMPLEMENTED — source analysis only**. This explicit additional status avoids mislabeling absent code as partially implemented or externally blocked.

## M01 — Welcome to Suraksha

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 1; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image1.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/welcome`.
- Purpose: This is the splash screen shown the moment the application icon is opened for the very first time, before onboarding begins. It presents the Suraksha shield-and-checkmark mark together with the app name in a calm, reassuring layout, establishing the platform's protective identity before any personal data is requested. A three-dot progress indicator at the bottom hints that a short guided setup follows.
- Major components and documented actions:

- Introduces the Suraksha brand and its protective purpose
- Signals that a short, guided setup flow follows
- Single "Get Started" action moves the user into onboarding

- Inputs / actionable controls: Get Started.
- Outputs: Authentication gateway.
- Backend dependencies / proposed endpoints: —.
- Related entities: —.
- Planned component: `apps/mobile/src/screens/M01.tsx`.
- Planned automated test: `welcome-navigation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M02 — Secure Login / Register

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 2; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image2.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/auth`.
- Purpose: This is the authentication gateway. A segmented control lets the user switch between "Log In" and "Register", and — unlike a conventional email/password form — identity is established using the user's National Identity Card (NIC) number together with their phone number. This mirrors the identity-verification model used elsewhere in the platform, since the same NIC identity is later checked by an Administrator when verifying professional and community accounts. Trust badges for SOS, Encryption and Verification are pinned to the bottom of the screen, reassuring the user of the platform's safety posture at the very first sensitive input.
- Major components and documented actions:

- NIC number + phone number used as the login/registration identifier
- One-tap toggle between Log In and Register
- Persistent SOS / Encrypted / Verified trust indicators
- "Register with your NIC in one step" shortcut for new users

- Inputs / actionable controls: NIC, phone, possession proof or password (conflict C03).
- Outputs: Authenticated session or registration handoff.
- Backend dependencies / proposed endpoints: POST /auth/login; POST /auth/challenges.
- Related entities: User, AuthChallenge, RefreshSession.
- Planned component: `apps/mobile/src/screens/M02.tsx`.
- Planned automated test: `authentication` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M03 — Choose Your Language

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 3; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image3.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/onboarding/language`.
- Purpose: Presented as part of the onboarding wizard, this screen lets the user pick the interface language from Sinhala, Tamil, and English. Placing language choice this early ensures that every subsequent safety and legal-aid screen is accessible to users from Sri Lanka's three main language communities, directly supporting the trilingual requirement identified as a gap in existing local safety apps. A progress stepper across the top tracks the user's position in the onboarding flow, and the SOS/Encrypted/Verified trust row reappears at the bottom.
- Major components and documented actions:

- Selects interface language (Sinhala / Tamil / English)
- Sets the language used for all later legal, AI-detection, and support content
- Changeable later at any time from Settings

- Inputs / actionable controls: en / si / ta.
- Outputs: Saved locale; English fallback if translation missing.
- Backend dependencies / proposed endpoints: PATCH /me/preferences.
- Related entities: UserPreference.
- Planned component: `apps/mobile/src/screens/M03.tsx`.
- Planned automated test: `locale-preferences` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M04 — Onboarding Highlight — "One Tap. Instant Help."

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 4; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image4.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/onboarding/sos`.
- Purpose: The first of three feature-highlight cards shown after language selection, introducing the SOS mechanism before the user ever needs it. It explains in one sentence that a single trigger sends the user's live location to trusted contacts and the nearest verified responder, so that when a real emergency later occurs the behaviour of the SOS button is already familiar rather than something to be learned under stress.
- Major components and documented actions:

- Previews the SOS / emergency-alert capability
- Sets expectations: one action, live location shared, trusted contacts + responder notified
- Skippable — a "Skip" link is provided for returning or impatient users

- Inputs / actionable controls: Next / Skip.
- Outputs: Evidence highlight or account creation.
- Backend dependencies / proposed endpoints: —.
- Related entities: —.
- Planned component: `apps/mobile/src/screens/M04.tsx`.
- Planned automated test: `onboarding-navigation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M05 — Onboarding Highlight — "Your Evidence, Encrypted"

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 5; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image5.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/onboarding/evidence`.
- Purpose: The second onboarding highlight introduces the Evidence Vault concept ahead of first use. It tells the user that screenshots, audio, and location data can be stored safely, hidden from anyone else who uses the same phone, previewing the encrypted, tamper-evident storage that underpins later evidence-collection and legal-reporting screens.
- Major components and documented actions:

- Previews encrypted evidence storage (screenshots, audio, location)
- Reassures the user that vault contents remain hidden from other phone users
- Prepares the user for the disguise/PIN mechanism introduced next

- Inputs / actionable controls: Next / Skip.
- Outputs: Responder highlight or account creation.
- Backend dependencies / proposed endpoints: —.
- Related entities: —.
- Planned component: `apps/mobile/src/screens/M05.tsx`.
- Planned automated test: `onboarding-navigation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M06 — Onboarding Highlight — "Always Someone Watching Over You"

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 6; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image6.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/onboarding/responders`.
- Purpose: The third and final onboarding highlight introduces the human side of the platform: a always-available, verified responder network standing behind the automated features. It closes the feature-preview carousel and hands the user off to account creation with a "Get Started" action.
- Major components and documented actions:

- Previews the 24/7 verified-responder network behind SOS and reporting
- Final step of the feature-highlight carousel before registration

- Inputs / actionable controls: Get Started.
- Outputs: Account form.
- Backend dependencies / proposed endpoints: —.
- Related entities: —.
- Planned component: `apps/mobile/src/screens/M06.tsx`.
- Planned automated test: `onboarding-navigation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M07 — Create Your Account

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 7; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image7.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/register`.
- Purpose: This is the registration form, collecting the minimum information needed to create an account: full name, mobile number, and a password (with an inline password-strength requirement of at least 8 characters, a number, and a symbol). A mandatory checkbox confirms agreement to the Terms and Privacy Policy and that the user is 16 or older. A progress stepper shows this as one step within account setup, and a "Sign in" link is offered for anyone who already has an account and reached this screen by mistake.
- Major components and documented actions:

- Captures full name, mobile number, and password
- Enforces password-strength and age/consent requirements before account creation
- Links back to Sign In for existing users

- Inputs / actionable controls: NIC carried from gateway, full name, phone, password, terms and 16+ consent.
- Outputs: Account and session; PIN setup.
- Backend dependencies / proposed endpoints: POST /auth/register.
- Related entities: User, Consent, RefreshSession.
- Planned component: `apps/mobile/src/screens/M07.tsx`.
- Planned automated test: `registration-validation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M08 — Secure Your App (PIN Setup)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 8; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image8.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/security/pin`.
- Purpose: Immediately after account creation, the user is required to set the 6-digit PIN that will later unlock the disguised app (see Figure 2 / Guardian Mode, below). A numeric keypad is used to enter and confirm the PIN, and a toggle is provided to additionally enable fingerprint unlock for a faster, equally private alternative. This step operationalises the "encrypted and disguise-protected" promise made during onboarding before the user leaves the setup flow.
- Major components and documented actions:

- Sets the 6-digit PIN used to unlock Guardian Mode from the disguise
- Optional fingerprint unlock toggle
- Changeable later from Settings → App lock & disguise mode

- Inputs / actionable controls: 6-digit PIN and confirmation; biometric preference.
- Outputs: PIN configured; native biometric capability result.
- Backend dependencies / proposed endpoints: POST /me/security/pin.
- Related entities: UserSecurity, AuditLog.
- Planned component: `apps/mobile/src/screens/M08.tsx`.
- Planned automated test: `app-lock` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M09 — Choose Your Disguise

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 9; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image9.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/security/disguise`.
- Purpose: As the final configuration step before the app is first used, the user selects which everyday application Suraksha should imitate on the home screen and app icon — the options implemented are Calculator, Notes, and Weather. This is central to the survivor-safety model of the application: it allows the tool to remain hidden from an abuser who inspects the victim's phone, while remaining only one correct PIN entry away from full functionality. The choice can be changed later at any time from Settings.
- Major components and documented actions:

- Selects the disguise identity: Calculator, Notes, or Weather
- Determines the home-screen icon and the app's default, harmless-looking appearance
- Reversible at any time from Settings

- Inputs / actionable controls: Calculator / Notes / Weather.
- Outputs: Disguise selection persisted.
- Backend dependencies / proposed endpoints: PATCH /me/preferences.
- Related entities: UserPreference.
- Planned component: `apps/mobile/src/screens/M09.tsx`.
- Planned automated test: `disguise` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M10 — Guardian Mode (Disguise Unlock)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 10; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image10.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/security/unlock`.
- Purpose: This screen demonstrates the application's core safety mechanism in daily use: by default the app is disguised as an ordinary utility (calculator, notes, or weather, per the user's choice), and entering the private PIN set up earlier lifts the disguise and switches the device into "Guardian mode," unlocking the real Suraksha application. A segmented PIN-progress indicator and a clear "Continue to Suraksha" action are provided, along with a "Back to calculator" fallback link, so the disguise can be re-engaged instantly if someone else picks up the device.
- Major components and documented actions:

- PIN entry gate that lifts the disguise and reveals the real application
- Instant fallback back to the disguised utility if interrupted
- The single mechanism separating an abuser's casual inspection from the survivor's private tools

- Inputs / actionable controls: PIN or supported device biometric.
- Outputs: Guardian unlock or fallback utility.
- Backend dependencies / proposed endpoints: POST /me/security/unlock.
- Related entities: UserSecurity, AuditLog.
- Planned component: `apps/mobile/src/screens/M10.tsx`.
- Planned automated test: `app-lock` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M11 — Settings — Account and Privacy

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 11; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image11.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/settings`.
- Purpose: The Settings screen consolidates all safety-critical configuration in one place: interface language, the app-lock/disguise mode (PIN and fingerprint), default location-sharing behaviour, notification preferences, and information about the current app version. A clearly separated, high-friction "Delete my data" action — protected behind an explicit confirmation dialog warning that the action permanently erases the account, vault contents, and messages and cannot be undone — gives the user full, unambiguous control to walk away from the platform entirely at any time.
- Major components and documented actions:

- Central hub for language, app-lock/disguise, location-sharing, and notification settings
- Displays current app version under "About Suraksha"
- Irreversible, confirmation-gated full account and data deletion

- Inputs / actionable controls: Language, lock, sharing, notifications, explicit erase confirmation.
- Outputs: Updated preferences or deletion progress.
- Backend dependencies / proposed endpoints: GET /me; PATCH /me/preferences; DELETE /me.
- Related entities: User, UserPreference, DeletionJob, AuditLog.
- Planned component: `apps/mobile/src/screens/M11.tsx`.
- Planned automated test: `account-deletion` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M12 — Home Dashboard

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 12; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image12.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/home`.
- Purpose: Once unlocked, the user lands on a personalised home dashboard ("Good evening, Risini — Here's your safety overview") that summarises the account's safety status at a glance. Quick-access tiles are provided for the SOS Emergency trigger, the Evidence Vault (showing item count), the AI-powered Ask Legal Aid chat, a mental-health Check-in, and Jobs/opportunities, with a bottom navigation bar (Home, Knowledge, SOS, Vault, Profile) giving persistent access to every major functional area of the app.
- Major components and documented actions:

- Personalised greeting and at-a-glance safety-status overview
- One-tap quick-access tiles: SOS Emergency, Evidence Vault, Ask Legal Aid, Check-in, Jobs
- Persistent bottom navigation across the app's major sections

- Inputs / actionable controls: Quick tile / tab selection.
- Outputs: Personalized summary and destinations.
- Backend dependencies / proposed endpoints: GET /me/overview.
- Related entities: Case, Evidence, Notification.
- Planned component: `apps/mobile/src/screens/M12.tsx`.
- Planned automated test: `home-navigation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M13 — SOS Emergency

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 13; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image13.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/sos`.
- Purpose: The SOS screen implements a deliberate "hold-to-alert" pattern (hold for 2 seconds) to minimise accidental triggering while still allowing a fast, low-visibility response in a genuine emergency. Activating the button immediately alerts the user's trusted contacts and the nearest police unit and shares the user's live location, with a visible "Cancel" option retained in case the alert was triggered by mistake.
- Major components and documented actions:

- 2-second press-and-hold gesture prevents accidental triggering
- Simultaneously notifies trusted contacts and the nearest police unit with live location
- Cancel option available up to the point of confirmed dispatch

- Inputs / actionable controls: Continuous 2-second hold; current location or unavailable status.
- Outputs: Persisted alert and actual development delivery state.
- Backend dependencies / proposed endpoints: POST /sos.
- Related entities: SOSAlert, LocationEvent, NotificationDelivery, AuditLog.
- Planned component: `apps/mobile/src/screens/M13.tsx`.
- Planned automated test: `sos-activation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M14 — Help Is On The Way

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 14; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image14.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/sos/:id`.
- Purpose: Following a successful SOS trigger, this confirmation screen shows live tracking status on a map, confirms that the nearest police unit has been notified (with distance shown, e.g. 1.2 km away), and lists which trusted contacts have been alerted. A prominent "I am safe now" button lets the user stand the alert down once the situation has been resolved, closing the loop for the responding parties.
- Major components and documented actions:

- Live map showing the user's position and the responding police unit
- Confirms which police unit and which trusted contacts have been notified
- "I am safe now" action to stand down an active alert

- Inputs / actionable controls: I am safe now.
- Outputs: Live state, contact delivery results, closure.
- Backend dependencies / proposed endpoints: GET /sos/:id; PATCH /sos/:id/status.
- Related entities: SOSAlert, SOSEvent, NotificationDelivery.
- Planned component: `apps/mobile/src/screens/M14.tsx`.
- Planned automated test: `sos-lifecycle` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M15 — Add Trusted Contacts

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 15; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image15.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/contacts`.
- Purpose: As part of onboarding (and revisitable at any time), the user builds a list of trusted contacts who will be notified first during an SOS event, before or alongside police involvement, giving the user a softer first line of support. Each contact shows their relationship to the user (e.g. "Amma", "Friend") and phone number, with priority contacts flagged, and additional contacts can be added at any time from Settings.
- Major components and documented actions:

- Add / remove trusted contacts with name, relationship, and phone number
- Flags priority contacts notified first during an SOS event
- Extensible later from Settings without repeating onboarding

- Inputs / actionable controls: Name, relationship, phone, priority.
- Outputs: Own contact list.
- Backend dependencies / proposed endpoints: GET /contacts; POST /contacts; DELETE /contacts/:id.
- Related entities: TrustedContact.
- Planned component: `apps/mobile/src/screens/M15.tsx`.
- Planned automated test: `trusted-contacts` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M16 — Sharing Location

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 16; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image16.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/location/share`.
- Purpose: This screen allows the user to share their real-time location with a specific trusted contact ("Share with Amma") for a defined duration (shown here as 2 hours), visualised on a live map. A single toggle enables or disables sharing, and a "Stop sharing" action is always available, balancing safety benefits with the user's control over their own privacy.
- Major components and documented actions:

- Live-location sharing with a named trusted contact
- Time-boxed sharing window (e.g. 2 hours) rather than indefinite tracking
- Toggle on/off and an always-available "Stop sharing" override

- Inputs / actionable controls: Contact, duration, sharing toggle, location consent.
- Outputs: Expiring share; immediate stop.
- Backend dependencies / proposed endpoints: POST /location/shares; DELETE /location/shares/:id; POST /location/events.
- Related entities: LocationShare, LocationEvent, TrustedContact.
- Planned component: `apps/mobile/src/screens/M16.tsx`.
- Planned automated test: `location-consent` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M17 — Route Home (Safe Navigation)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 17; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image17.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/location/route`.
- Purpose: The Safe Route feature calculates a walking route home while actively avoiding areas that have been reported as danger zones by other users, and flags any low-lit stretches ahead ("Low-lit stretch ahead — reported by 6 users this month"). Colour-coded route segments distinguish the safe path from danger zones, and a "Start safe navigation" action begins live, geo-fenced guidance with automatic alerts if the user deviates into a flagged area.
- Major components and documented actions:

- Routes around community-reported danger zones rather than shortest-path only
- Surfaces crowd-sourced warnings (e.g. poor lighting) along the route
- Live, geo-fenced navigation with deviation alerts once started

- Inputs / actionable controls: Origin, destination, GPS permission, Start navigation.
- Outputs: Provider route and community warnings with provenance.
- Backend dependencies / proposed endpoints: POST /routes; GET /danger-zones.
- Related entities: DangerZone, RouteSession, LocationEvent.
- Planned component: `apps/mobile/src/screens/M17.tsx`.
- Planned automated test: `route-provider` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M18 — Evidence Vault

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 18; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image18.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/vault`.
- Purpose: The Evidence Vault provides tamper-evident, encrypted storage for all evidence the user has collected, including screenshots, voice notes, and location trails, each timestamped, labelled with its type (Threat, Audio, GPS), and tagged with when it was added. A single "Add evidence" action lets the user grow this collection at any time, and the vault contents can later be attached directly to a formal report.
- Major components and documented actions:

- Encrypted, tamper-evident storage for screenshots, audio, and location trails
- Per-item timestamp, type tag, and recency label
- Direct attachment of stored items to a new report

- Inputs / actionable controls: Add evidence / select item.
- Outputs: Own encrypted evidence metadata.
- Backend dependencies / proposed endpoints: GET /evidence.
- Related entities: Evidence, EvidenceHash.
- Planned component: `apps/mobile/src/screens/M18.tsx`.
- Planned automated test: `evidence-list-authorization` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M19 — Add Evidence

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 19; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image19.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/vault/add`.
- Purpose: This screen allows the user to capture or import new evidence in four formats — Photo, Audio, Video, or Chat log — together with an optional note describing what happened, when, and where. Once submitted, items are immediately "Encrypted & saved" to the vault, reinforcing the chain-of-custody requirements needed if the evidence is later used in a legal or police process.
- Major components and documented actions:

- Four capture/import types: Photo, Audio, Video, Chat log
- Optional free-text note for context (what/when/where)
- Immediate encryption on save to preserve chain-of-custody

- Inputs / actionable controls: Photo / audio / video / chat log file; optional note.
- Outputs: Encrypted object and integrity metadata.
- Backend dependencies / proposed endpoints: POST /evidence.
- Related entities: Evidence, EvidenceHash, AuditLog.
- Planned component: `apps/mobile/src/screens/M19.tsx`.
- Planned automated test: `evidence-upload` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M20 — Evidence Detail — Sealed Record (Screenshot_0231)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 20; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image20.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/vault/:id`.
- Purpose: Once an item (here, Screenshot_0231) has been attached to a report, it becomes a locked, sealed evidence record: the raw content is hidden behind an encrypted preview that can only be unlocked with the user's PIN, while its capture time, location tag, and SHA-256 integrity hash remain visible and verified. This design preserves evidentiary integrity while still allowing the user to attach the sealed item to an active report.
- Major components and documented actions:

- PIN-gated encrypted preview once an item is sealed to a case
- Visible, verified capture time, location tag, and SHA-256 integrity hash
- "Attach to report" action without ever exposing the raw file unnecessarily

- Inputs / actionable controls: PIN unlock; attach to report.
- Outputs: Authorized preview, capture metadata and verified hash.
- Backend dependencies / proposed endpoints: GET /evidence/:id; POST /evidence/:id/unlock; GET /evidence/:id/content.
- Related entities: Evidence, EvidenceHash, EvidenceAccess.
- Planned component: `apps/mobile/src/screens/M20.tsx`.
- Planned automated test: `evidence-authorization` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M21 — Scan a Message

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 21; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image21.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/scan`.
- Purpose: This screen lets the user upload a screenshot or paste the text of a message they have received, which is then analysed by the platform's AI harassment-detection model (supporting Sinhala, Tamil, and English). In the implemented example, the model flags "Harassment detected — threatening language pattern" with an 87% confidence score, and offers the user the option to Dismiss the flag or Escalate to Legal Aid directly from the result.
- Major components and documented actions:

- Upload screenshot or paste raw text for AI harassment analysis
- Trilingual detection model (Sinhala / Tamil / English)
- Confidence-scored flag with Dismiss or Escalate-to-Legal-Aid actions

- Inputs / actionable controls: Message text or screenshot requiring OCR provider.
- Outputs: Analysis record; dismiss or legal handoff.
- Backend dependencies / proposed endpoints: POST /analysis.
- Related entities: AIAnalysis, Evidence, ModelVersion.
- Planned component: `apps/mobile/src/screens/M21.tsx`.
- Planned automated test: `analysis-provider` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M22 — AI Analysis Result

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 22; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image22.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/scan/:id`.
- Purpose: Following a scan, this screen presents the full AI risk classification for the submitted message — in this case a High-risk / Threat + Blackmail classification at 92% model confidence, with a plain-language note that the language matches known coercion patterns. The result is saved automatically to the user's encrypted evidence vault and filed, and a direct "Talk to Legal Chatbot" action is provided, along with a short explanation of what happens next (evidence encrypted, available in the vault, legal aid notified only if the user chooses to file a report).
- Major components and documented actions:

- Full risk classification with confidence score and plain-language rationale
- Automatic save-to-vault and filing of the analysed message
- One-tap handoff into the Legal Aid chatbot

- Inputs / actionable controls: View result / Talk to Legal Chatbot.
- Outputs: Risk, confidence availability, model provenance, vault save state.
- Backend dependencies / proposed endpoints: GET /analysis/:id.
- Related entities: AIAnalysis, Evidence.
- Planned component: `apps/mobile/src/screens/M22.tsx`.
- Planned automated test: `analysis-vault-consent` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M23 — Legal Aid Chat

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 23; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image23.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/legal/chat`.
- Purpose: The AI Legal Aid Chat gives the user instant, conversational access to plain-language legal information (for example, an explanation of the Computer Crimes Act No. 24 of 2007 in response to a question about online blackmail) and can guide the user step-by-step through filing a formal report or connecting them directly with a human legal advisor. The chat is marked confidential and available 24/7, reducing the barrier to seeking legal guidance immediately after an incident.
- Major components and documented actions:

- Conversational, plain-language answers to legal questions
- Guides the user directly into the report-filing flow on request
- Marked confidential and available 24/7

- Inputs / actionable controls: Question, human escalation consent.
- Outputs: Sourced informational response or human query queue.
- Backend dependencies / proposed endpoints: POST /legal/queries; GET /legal/queries/:id; POST /legal/queries/:id/messages; POST /legal/queries/:id/escalate.
- Related entities: LegalQuery, LegalMessage, KnowledgeBase.
- Planned component: `apps/mobile/src/screens/M23.tsx`.
- Planned automated test: `legal-query-flow` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M24 — Start a Report — "What Happened?" (Category Selection)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 24; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image24.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/reports/new/category`.
- Purpose: This is Step 1 of the reporting workflow, where the user selects the category that best matches their situation from options such as Cyber Harassment, Domestic Violence, Workplace Harassment, and Public Transport Abuse. Categorising the incident at the outset allows the system to route the report to the correct downstream workflow and to pre-fill relevant legal guidance later in the process.
- Major components and documented actions:

- Category selection: Cyber Harassment, Domestic Violence, Workplace Harassment, Public Transport Abuse
- Determines downstream routing and applicable legal guidance
- First of a 3-step report-filing wizard

- Inputs / actionable controls: Cyber Harassment / Domestic Violence / Workplace Harassment / Public Transport Abuse.
- Outputs: Report draft category.
- Backend dependencies / proposed endpoints: —.
- Related entities: ReportCategory (shared enum).
- Planned component: `apps/mobile/src/screens/M24.tsx`.
- Planned automated test: `report-category` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M25 — Cyber Harassment Report Form

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 25; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image25.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/reports/new/details`.
- Purpose: As Step 2 of the reporting workflow, the report form collects structured details of the incident — when it happened, supporting evidence pulled directly from the Evidence Vault ("2 items from Vault selected"), and an optional free-text description — while a "Submit anonymously" toggle lets the user choose whether to hide their identity from anyone but the assigned case handler. This balances the need for actionable detail with the user's right to control their own exposure.
- Major components and documented actions:

- Structured incident details: date, linked vault evidence, free-text description
- "Submit anonymously" toggle to hide identity from all but the case handler
- Direct evidence attachment from the Vault rather than re-uploading

- Inputs / actionable controls: Incident date, own vault item IDs, optional narrative, anonymous toggle.
- Outputs: Single shared case reference.
- Backend dependencies / proposed endpoints: POST /reports; GET /evidence.
- Related entities: Case, Report, CaseEvidence, CaseEvent.
- Planned component: `apps/mobile/src/screens/M25.tsx`.
- Planned automated test: `cross-role-case` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M26 — Report Tracking (#SL-2291)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 26; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image26.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/reports/:reference`.
- Purpose: Once submitted, the user can follow their case's progress through a simple status tracker — Received, Under review (shown here as assigned to the Cyber Crime unit), and Awaiting update, with an estimated turnaround time — matching the same case reference number used across the Admin and Police dashboards elsewhere in the platform. A "Message case officer" action keeps a direct communication channel open, and the screen reiterates that the case is encrypted and tied to the same #SL-2291 identifier used across the whole system.
- Major components and documented actions:

- Step-based status tracker: Received → Under review → Awaiting update
- Shared case reference number (#SL-2291) traceable across Police/Admin views
- Direct "Message case officer" communication channel

- Inputs / actionable controls: Message case officer.
- Outputs: Owner-safe timeline and same case reference.
- Backend dependencies / proposed endpoints: GET /cases/:reference; GET /cases/:reference/messages; POST /cases/:reference/messages.
- Related entities: Case, CaseEvent, CaseMessage.
- Planned component: `apps/mobile/src/screens/M26.tsx`.
- Planned automated test: `cross-role-case` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M27 — Community

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 27; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image27.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/community`.
- Purpose: The Community screen is a moderated space where users can anonymously share their experiences and receive peer support, with each post showing relative time and comment count (e.g. "Finally reported after 6 months, feeling lighter today"). Every post passes through the AI content-moderation pipeline before being visible to other users, ensuring the space remains safe and constructive rather than a vector for further harassment.
- Major components and documented actions:

- Anonymous posting and peer-support commenting
- Like/comment counts surfaced per post
- All content passes AI moderation before publication

- Inputs / actionable controls: Anonymous post/comment, like, report reason.
- Outputs: Moderated publication and counts without identity leakage.
- Backend dependencies / proposed endpoints: GET /community/posts; POST /community/posts; POST /community/posts/:id/comments; POST /community/flags; PUT /community/posts/:id/like.
- Related entities: CommunityPost, CommunityComment, CommunityLike, ModerationItem.
- Planned component: `apps/mobile/src/screens/M27.tsx`.
- Planned automated test: `community-moderation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M28 — Know Your Rights (Knowledge Hub)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 28; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image28.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/knowledge`.
- Purpose: This screen provides a searchable library of plain-language legal guides covering topics such as the Cyber Crimes Act, the Domestic Violence Act, workplace protections, and how to file a police complaint. Each guide displays an estimated reading time (typically 4–8 minutes) and is available in all three supported languages, supporting informed decision-making independently of the AI chat.
- Major components and documented actions:

- Searchable library of plain-language legal guides
- Per-guide estimated reading time
- Available in Sinhala, Tamil, and English

- Inputs / actionable controls: Search, guide selection, locale.
- Outputs: Published curated guide with source and reading time.
- Backend dependencies / proposed endpoints: GET /legal/resources; GET /legal/resources/:id.
- Related entities: LegalResource, LegalResourceTranslation, KnowledgeBase.
- Planned component: `apps/mobile/src/screens/M28.tsx`.
- Planned automated test: `legal-resource-publication` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M29 — Wellness Check-In — "How Are You, Really?"

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 29; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image29.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/wellbeing/check-in`.
- Purpose: Implemented as a short, GAD-7-style screening questionnaire, this screen periodically checks in on the user's emotional wellbeing through simple, non-clinical questions such as feeling tense or on edge in the past week. A progress indicator (Question 3 of 9) and reassurance text keep the tone supportive rather than clinical, and results remain private throughout.
- Major components and documented actions:

- Short, validated-style (GAD-7-inspired) wellbeing screener
- Question-by-question progress indicator
- Explicitly framed as non-diagnostic and private

- Inputs / actionable controls: Documented question responses; instrument incomplete.
- Outputs: Private non-diagnostic check-in; no invented validated score.
- Backend dependencies / proposed endpoints: POST /wellbeing/check-ins.
- Related entities: WellbeingCheckIn, ScreeningInstrument.
- Planned component: `apps/mobile/src/screens/M29.tsx`.
- Planned automated test: `wellbeing-privacy` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M30 — Your Check-In Result

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 30; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image30.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/wellbeing/results/:id`.
- Purpose: On completion, the check-in produces a plain-language result — in this example, "Mild anxiety" with a score of 8/21 — along with a note that results are private and not shared without consent and that this is not a diagnosis. A direct "Book a counselor" call-to-action bridges the wellbeing check straight into professional support if the user chooses to proceed, with a suggested retake in 2 weeks.
- Major components and documented actions:

- Plain-language result and numeric score (e.g. 8/21) from the check-in
- Explicit "not a diagnosis", private, not-shared framing
- One-tap bridge into booking a counselor

- Inputs / actionable controls: View own result / Book a counselor.
- Outputs: Private result, instrument provenance, booking handoff.
- Backend dependencies / proposed endpoints: GET /wellbeing/check-ins/:id.
- Related entities: WellbeingCheckIn, ScreeningInstrument.
- Planned component: `apps/mobile/src/screens/M30.tsx`.
- Planned automated test: `wellbeing-privacy` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## M31 — Book a Counselling Session

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 31; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image31.png>).
- Actor / platform: USER / mobile.
- Proposed route/navigation: `/counseling/book`.
- Purpose: This screen lets the user choose from a list of available counselors, each showing their specialisation, language, and next available slot (e.g. a clinical counsellor available today at 4pm, a trauma-informed counsellor tomorrow, a family counsellor on Friday), and confirm a booking with a single tap. The session is explicitly marked as confidential and free of charge, removing two common barriers — cost and privacy concerns — to seeking professional help.
- Major components and documented actions:

- Browse counselors by specialisation, language, and next available slot
- One-tap booking confirmation
- Explicitly confidential and free of charge

- Inputs / actionable controls: Counselor, language, available slot; separate screening sharing consent.
- Outputs: Confidential booking confirmation.
- Backend dependencies / proposed endpoints: GET /counselors/availability; POST /counseling/appointments.
- Related entities: CounselorProfile, CounselorSlot, CounselingAppointment, Consent.
- Planned component: `apps/mobile/src/screens/M31.tsx`.
- Planned automated test: `counselor-booking` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S01 — Admin Sign-In (Guardian Access Portal)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.1; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image1.png>).
- Actor / platform: ADMIN / web.
- Proposed route/navigation: `/admin/sign-in`.
- Purpose: Restricted staff login screen for authorized response and field staff of the Suraksha safety network. Presented as a split panel: a branded trust panel on the left ("Protecting staff & communities, together") and the credential form on the right.
- Major components and documented actions:

- Staff ID field (e.g. SL-ADM-0192) and Password field
- "Remember this device" checkbox and "Forgot access code?" link
- Primary Sign In button
- Alternate authentication: "Sign in with Police ID SSO"
- Trust indicators: 256-bit end-to-end encryption, SL Police verified, ISO 27001

- Inputs / actionable controls: Staff ID, password, remember device.
- Outputs: Verified staff session.
- Backend dependencies / proposed endpoints: POST /auth/login.
- Related entities: User, StaffProfile, RefreshSession.
- Planned component: `apps/web/src/features/S01.tsx`.
- Planned automated test: `staff-authentication` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S02 — Admin Dashboard — Overview

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.2; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image2.png>).
- Actor / platform: ADMIN / web.
- Proposed route/navigation: `/admin`.
- Purpose: The administrator's landing page, giving a single-glance summary of platform-wide health and activity.
- Major components and documented actions:

- Key metrics: Total active users (18,402), Open reports (37), SOS events today (4), Staff/AI accuracy (94%)
- Weekly Activity trend chart (SOS and report volume over the week)
- Live Feed — a real-time stream of platform events (SOS triggered, check-in confirmed, escort request closed, staff verified, report flagged)
- Recent Incidents table — case ID, type, location, assigned officer, status, and elapsed time
- Left navigation: Dashboard, Reports, Users, Settings

- Inputs / actionable controls: Search / incident selection.
- Outputs: Calculated counters, weekly chart, sanitized live feed.
- Backend dependencies / proposed endpoints: GET /admin/overview; GET /admin/events.
- Related entities: Case, SOSAlert, User, AuditLog.
- Planned component: `apps/web/src/features/S02.tsx`.
- Planned automated test: `admin-overview` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S03 — User Management

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.3; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image3.png>).
- Actor / platform: ADMIN / web.
- Proposed route/navigation: `/admin/users`.
- Purpose: Central registry listing every account on the platform, with tools to verify, filter, and moderate accounts.
- Major components and documented actions:

- Counters: Total users (18,402), Verified (17,190), Pending review (148), Suspended (12)
- Filter tabs: All users / Women (Verified) / Police / Counselors / Pending
- Table columns: user name/ID, role detail, verification status, account status, view/edit actions
- "Add User" action for manually provisioning staff accounts

- Inputs / actionable controls: Role/status filters; verified staff provisioning.
- Outputs: Account verification and suspension states.
- Backend dependencies / proposed endpoints: GET /admin/users; POST /admin/users; PATCH /admin/users/:id.
- Related entities: User, StaffProfile, AuditLog.
- Planned component: `apps/web/src/features/S03.tsx`.
- Planned automated test: `staff-verification` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S04 — Reports Queue

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.4; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image4.png>).
- Actor / platform: ADMIN / web.
- Proposed route/navigation: `/admin/reports`.
- Purpose: The administrator's central triage tool, listing every incoming complaint filed by users through the app.
- Major components and documented actions:

- Counters: Open reports (37), High priority (9), Escalated (5), Resolved today (21)
- Filter tabs: All reports / New / In review / Escalated / Unassigned / Resolved
- Table columns: report reference & category (Cyber harassment, Domestic, Workplace, Stalking, Public harassment), colour-coded priority, status, assigned handler, time filed

- Inputs / actionable controls: Status, category, priority, assignment filters.
- Outputs: Triage queue.
- Backend dependencies / proposed endpoints: GET /admin/cases.
- Related entities: Case, Report.
- Planned component: `apps/web/src/features/S04.tsx`.
- Planned automated test: `cross-role-case` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S05 — Case Detail & Escalation Screen (#SL-2291)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.5; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image5.png>).
- Actor / platform: ADMIN / web.
- Proposed route/navigation: `/admin/cases/:reference`.
- Purpose: Opened from the Reports Queue, this is the full case package for a single report, giving the administrator everything needed to triage and route it.
- Major components and documented actions:

- AI Risk Assessment banner explaining why the model flagged the case High risk (e.g. blacklisted language detected, anonymous filer, multiple evidence items attached) with a recommended action ('assign to Police within 1 hour')
- Evidence bundle — attached files (e.g. chat_thread_export.pdf, screenshot_message_02.jpg) with automatic hash verification
- Report narrative — the filer's free-text description of the incident
- Case activity / audit trail — chronological log of automated and manual actions
- Case details panel: status, priority, category, filer (anonymous/named), filed date
- Actions: Assign to Police, Request more info, add an internal note, Mark as resolved, Escalate immediately

- Inputs / actionable controls: Officer, request info, internal note, resolve/escalate.
- Outputs: Same case assigned with auditable timeline.
- Backend dependencies / proposed endpoints: GET /cases/:reference; POST /cases/:reference/assignment; POST /cases/:reference/actions.
- Related entities: Case, CaseEvent, CaseAssignment, Evidence, AIAnalysis.
- Planned component: `apps/web/src/features/S05.tsx`.
- Planned automated test: `cross-role-case` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S06 — Content Moderation

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.6; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image6.png>).
- Actor / platform: ADMIN / web.
- Proposed route/navigation: `/admin/moderation`.
- Purpose: Queues community posts and comments that have been auto-flagged by the AI model or reported by users, for administrator review.
- Major components and documented actions:

- Counters: Pending review (23), Auto-flagged (14), Reported by users (9), Removed today (31)
- Filter tabs: All flagged / Posts / Comments / Auto-flagged / User-reported
- Each item shows the flag reason (e.g. a post sharing a phone number in violation of contact-sharing guidelines, a comment reported for harassment language)
- Per-item actions: Approve or Remove

- Inputs / actionable controls: Post/comment/source filters; approve/remove reason.
- Outputs: Publication/removal and audit history.
- Backend dependencies / proposed endpoints: GET /admin/moderation; PATCH /admin/moderation/:id.
- Related entities: ModerationItem, CommunityPost, CommunityComment, AuditLog.
- Planned component: `apps/web/src/features/S06.tsx`.
- Planned automated test: `community-moderation` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S07 — AI Model Monitoring (under Settings)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.7; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image7.png>).
- Actor / platform: ADMIN / web.
- Proposed route/navigation: `/admin/settings/models`.
- Purpose: Gives the administrator oversight of every AI model running in production — the transparency and accountability layer behind the platform's automated detection features.
- Major components and documented actions:

- Top metrics: Harassment model accuracy (94.2%), False-positive rate (3.1%), Models in production (6), Regional performance score (91%)
- Model Performance table — Harassment detection, Contact-info detection, Spam/phishing detection, Crisis-language detection — each with accuracy %, drift status (Stable/Drifting), and last retrained date
- Sinhala / Tamil Coverage panel — per-language accuracy (English highest, Sinhala and Tamil trailing)
- Recent Audit Activity feed — moderator overrides, automatic escalations, and retraining events (e.g. 'retrain triggered — new Tamil dataset added')

- Inputs / actionable controls: Language/model filter; audited override metadata.
- Outputs: Actual evaluation provenance or unavailable metrics.
- Backend dependencies / proposed endpoints: GET /admin/models; GET /admin/model-events; POST /admin/model-events.
- Related entities: ModelVersion, ModelMetric, ModelAuditEvent, RetrainingRun.
- Planned component: `apps/web/src/features/S07.tsx`.
- Planned automated test: `model-provenance` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S08 — Officer Sign-In

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 2.1; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image8.png>).
- Actor / platform: POLICE / web.
- Proposed route/navigation: `/police/sign-in`.
- Purpose: Restricted login for verified police units, presented as a split panel: a branded trust panel ("Respond faster. Protect more.") on the left and the credential form on the right.
- Major components and documented actions:

- Badge ID field (e.g. WP-CDU-0044) and Password field
- "Remember this device" checkbox and "Forgot access code?" link
- Alternate authentication: "Sign in with National Police ID"
- Trust indicators: verified police-unit access only, real-time SOS dispatch alerts, secure chain-of-custody evidence access, end-to-end encryption, GPS-enabled

- Inputs / actionable controls: Badge ID, password, remember device.
- Outputs: Verified officer session.
- Backend dependencies / proposed endpoints: POST /auth/login.
- Related entities: User, PoliceProfile, RefreshSession.
- Planned component: `apps/web/src/features/S08.tsx`.
- Planned automated test: `staff-authentication` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S09 — Active Alerts — Live SOS Map

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 2.2; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image9.png>).
- Actor / platform: POLICE / web.
- Proposed route/navigation: `/police/live`.
- Purpose: The officer's landing screen — a real-time operational view of active emergencies in their jurisdiction.
- Major components and documented actions:

- Counters: Active SOS (3), Assigned to me (5), Avg response time (4.2 min), Resolved today (12)
- Live SOS Map with markers for active incidents (e.g. 'SOS – Nugegoda', 'Escort Unit 12')
- Alert Queue — cards per alert showing type, location, and elapsed time, each with a one-tap Respond button; lower-priority items get a View case button
- Left navigation: Live, Cases, Map, Profile

- Inputs / actionable controls: Jurisdiction map, alert, Respond.
- Outputs: Scoped alert queue and response assignment.
- Backend dependencies / proposed endpoints: GET /police/alerts; POST /sos/:id/respond.
- Related entities: SOSAlert, SOSEvent, PoliceProfile, LocationEvent.
- Planned component: `apps/web/src/features/S09.tsx`.
- Planned automated test: `sos-jurisdiction` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S10 — Case Investigation File (#SL-2291)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 2.3; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image10.png>).
- Actor / platform: POLICE / web.
- Proposed route/navigation: `/police/cases/:reference`.
- Purpose: Opened from the Cases list, this presents the full investigation record for a case assigned to the officer.
- Major components and documented actions:

- Evidence bundle — sealed, hash-verified evidence carried over from the user's original report (e.g. chat_thread_export.pdf, screenshot_message_02.jpg)
- Location trail — reconstructed from the user's last known GPS points ('Last known location – Nugegoda Junction', 'En route – High Level Road', 'Starting point – Home address on file')
- Timeline — chronological case activity (evidence sealed for chain of custody → case opened by officer → evidence hash-verified → report routed to unit)
- Case metadata panel: status (Investigating), priority (High), category, assigned officer, filed/opened timestamps
- Actions: Update case status, Request additional evidence, Escalate to CID

- Inputs / actionable controls: Authorized evidence request; additional evidence / CID escalation.
- Outputs: Assigned investigation package and timeline.
- Backend dependencies / proposed endpoints: GET /cases/:reference; GET /evidence/:id/content; POST /cases/:reference/actions.
- Related entities: Case, CaseEvent, CaseEvidence, LocationEvent, EvidenceAccess.
- Planned component: `apps/web/src/features/S10.tsx`.
- Planned automated test: `police-case-access` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S11 — Update Case Status

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 2.4; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image11.png>).
- Actor / platform: POLICE / web.
- Proposed route/navigation: `/police/cases/:reference/status`.
- Purpose: A simple, auditable stepper for progressing an investigation through its lifecycle.
- Major components and documented actions:

- Stage stepper: Filed (complete) → Under investigation (current) → Suspect contacted → Resolved
- Investigation notes — free-text field recorded against the case file, visible to CID if the case is later escalated
- Cancel and Save update actions

- Inputs / actionable controls: Filed / Under investigation / Suspect contacted / Resolved; investigation notes.
- Outputs: Transactional state transition visible to owner.
- Backend dependencies / proposed endpoints: PATCH /cases/:reference/status.
- Related entities: Case, CaseEvent, AuditLog.
- Planned component: `apps/web/src/features/S11.tsx`.
- Planned automated test: `cross-role-case` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S12 — Counselor Sign-In

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 3.1; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image12.png>).
- Actor / platform: COUNSELOR / web.
- Proposed route/navigation: `/counselor/sign-in`.
- Purpose: Restricted login for verified counselors, presented as a split panel: a branded trust panel ("Listen closely. Help fully.") on the left and the credential form on the right.
- Major components and documented actions:

- Practitioner ID field (e.g. CNS-0071) and Password field
- "Remember this device" checkbox and "Forgot access code?" link
- Alternate authentication: "Sign in with Health Ministry ID"
- Trust indicators: verified counselor access only, confidential case notes fully encrypted, direct escalation to police & support teams

- Inputs / actionable controls: Practitioner ID, password, remember device.
- Outputs: Verified counselor session.
- Backend dependencies / proposed endpoints: POST /auth/login.
- Related entities: User, CounselorProfile, RefreshSession.
- Planned component: `apps/web/src/features/S12.tsx`.
- Planned automated test: `staff-authentication` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S13 — Today's Sessions Dashboard

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 3.2; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image13.png>).
- Actor / platform: COUNSELOR / web.
- Proposed route/navigation: `/counselor/sessions`.
- Purpose: The counselor's home screen, summarising the day's workload.
- Major components and documented actions:

- Counters: Sessions today, Active clients (38), Unread messages (6), Completed this week (22)
- Today's Sessions list — client ID, time, modality tag (Video/Chat), presenting-concern tag (e.g. 'Urgent', 'Follow-up', 'Crisis follow-up'), and a one-tap Join or View action
- Weekly progress bar (e.g. '33 of 50 sessions — 70%')
- Recent Messages panel with unread indicators
- Left navigation: Sessions, Clients, Messages, Profile

- Inputs / actionable controls: Today/session selection; Join / View.
- Outputs: Assigned sessions, messages, weekly progress.
- Backend dependencies / proposed endpoints: GET /counseling/appointments; GET /counseling/messages.
- Related entities: CounselingAppointment, CounselingSession, CounselingMessage.
- Planned component: `apps/web/src/features/S13.tsx`.
- Planned automated test: `counselor-access` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S14 — Client Snapshot (#4482)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 3.3; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image14.png>).
- Actor / platform: COUNSELOR / web.
- Proposed route/navigation: `/counselor/clients/:clientId`.
- Purpose: Opened from the sessions list, this is an anonymised client-session detail view combining wellbeing history and clinical notes.
- Major components and documented actions:

- Client snapshot — most recent screening score (e.g. 8/27), risk level (Mid-severity), number of prior sessions completed
- Session history — past sessions with duration and modality (e.g. 'Second check-in – coping strategies, Video, 45 min')
- Care notes — free-text clinical observations and recommended cadence
- Side panel: Client ID, risk level, first/next session dates, assigned counselor
- Actions: Start session, View full history, Escalate to crisis team

- Inputs / actionable controls: Start session / full history / crisis escalation.
- Outputs: Pseudonymous client snapshot with consented screening.
- Backend dependencies / proposed endpoints: GET /counseling/clients/:clientId; POST /counseling/sessions; POST /counseling/escalations.
- Related entities: CounselingClient, CounselingSession, CounselingNote, Consent.
- Planned component: `apps/web/src/features/S14.tsx`.
- Planned automated test: `counselor-privacy` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S15 — Session Notes & Follow-Up

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 3.4; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image15.png>).
- Actor / platform: COUNSELOR / web.
- Proposed route/navigation: `/counselor/sessions/:id/notes`.
- Purpose: A structured clinical note-taking form completed after a session concludes.
- Major components and documented actions:

- Session summary (free text)
- Follow-up cadence selector: One-time / Weekly / Biweekly / Monthly, plus a cadence detail note (e.g. 'Weekly check-ins for 4 weeks')
- Updated risk-assessment selector: Low / Mid / Moderate / High
- Next session date picker
- Cancel and Save & schedule follow-up actions

- Inputs / actionable controls: Summary, cadence, cadence note, Low/Mid/Moderate/High, next date.
- Outputs: Encrypted clinical note and atomic follow-up booking.
- Backend dependencies / proposed endpoints: POST /counseling/sessions/:id/notes.
- Related entities: CounselingNote, CounselingAppointment, CounselorSlot, AuditLog.
- Planned component: `apps/web/src/features/S15.tsx`.
- Planned automated test: `counseling-follow-up` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## S16 — Legal Queries Dashboard

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 4.1; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image16.png>).
- Actor / platform: LEGAL_ADVISOR / web.
- Proposed route/navigation: `/legal/queries`.
- Purpose: The advisor's primary workspace for handling incoming legal questions and maintaining public guidance resources.
- Major components and documented actions:

- Counters: Open queries (9), Answered today (14), Avg response time (3.1 hr), Resources published (6)
- Query Queue — incoming questions (e.g. 'Cyber blackmail question', 'Workplace rights', 'Custody & safety planning', 'Restraining order process') with status tags (New / In progress / Answered) and a Respond or Continue action per item
- Monthly Impact panel — progress bar of queries answered this month (e.g. '215 of 250 — 87%')
- Resource Library — published guides that feed the user-side 'Know Your Rights' hub (e.g. 'Filing a police complaint – guide', 'Restraining orders explained', 'Know your workplace rights'), each with a view count
- Left navigation: Queries, Resources, Impact, Profile

- Inputs / actionable controls: New/In progress/Answered, Respond/Continue, resource editing.
- Outputs: Query response, resource library and calculated impact.
- Backend dependencies / proposed endpoints: GET /legal/queries; PATCH /legal/queries/:id; POST /legal/queries/:id/messages; POST /legal/resources; PATCH /legal/resources/:id.
- Related entities: LegalQuery, LegalMessage, LegalResource, LegalAdvisorProfile.
- Planned component: `apps/web/src/features/S16.tsx`.
- Planned automated test: `legal-advisor-access` (absent).
- Implementation status: **NOT IMPLEMENTED**.

## Additional documented surfaces without dedicated catalog screens

These are not counted in the 47 catalog screens and must not disappear during implementation:

| Surface | Source | Proposed navigation | Dependency / acceptance evidence | Status |
|---|---|---|---|---|
| Jobs / skills entry | M12; research 5.7.1 | Home → Jobs | Keep entry visible; no invented listing platform | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| Calculator / Notes / Weather utilities | M09–M10 | App launch / immediate disguise fallback | Working internal utility; PIN boundary; platform-specific app identity | NOT IMPLEMENTED |
| Officer case list, Map, Profile | S09–S10 | Police sidebar | Authorized case list, map and own profile | NOT IMPLEMENTED; detailed layouts unspecified |
| Clients, Messages, Profile | S13–S15 | Counselor sidebar | Assigned-client list and private communications | NOT IMPLEMENTED; detailed layouts unspecified |
| Resources, Impact, Profile; query response | S16 | Legal sidebar / Respond | Curated editor, own profile, derived impact and private response thread | NOT IMPLEMENTED; detailed layouts unspecified |
| Legal sign-in | Shared verified staff access | /legal/sign-in | Shared staff authentication with LEGAL_ADVISOR restriction | NOT IMPLEMENTED; dedicated screenshot absent |
| Forgotten access / SSO | S01, S08, S12 | Sign-in links | Verified recovery and provider contract | BLOCKED BY EXTERNAL SERVICE for government SSO; recovery details unspecified |
| Account editing and staff provisioning | S03 | Users → Add User / Edit | Backend verification/suspension with audit and session revocation | NOT IMPLEMENTED |
| Case messages, info requests, internal notes, escalations | M26, S05, S10, S14 | Case actions | Typed events and privacy-filtered messages on original case | NOT IMPLEMENTED |
| Consent, Terms, Privacy Policy | M07; research 3.12 | Account creation / Settings | Versioned consent and supplied policy content | NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS |
| Error/loading/offline/permissions, 401/403/404/500 | User instruction §24; catalog Known Gaps | Relevant screen state | Accessible, recoverable errors; no false dispatch success | NOT IMPLEMENTED; engineering states inferred |
