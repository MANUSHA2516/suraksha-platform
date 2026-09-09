# Screen inventory — implementation audit

The three authoritative DOCX files define **47 unique screens: 31 mobile and 16 staff**. Source descriptions and linked embedded images below remain the visual requirements. All 47 have concrete frontend implementations; status distinguishes functioning screens from incomplete documented behavior. No fourth document is required (C20).

Routes/components/endpoints are IMPLEMENTATION DECISIONS. Mobile uses named React Navigation screens, not web URL routes. All NestJS endpoint paths below have `/v1` prefix. Shared native/device and visual limitations are in G21; a rendered screen is not evidence of pixel-perfect parity. Test references describe actual coverage, not a claim that every control is tested.

## M01 — Welcome to Suraksha

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 1; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image1.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M01 (/welcome is the source navigation label).
- Purpose: This is the splash screen shown the moment the application icon is opened for the very first time, before onboarding begins. It presents the Suraksha shield-and-checkmark mark together with the app name in a calm, reassuring layout, establishing the platform's protective identity before any personal data is requested. A three-dot progress indicator at the bottom hints that a short guided setup follows.
- Major components and documented actions:

- Introduces the Suraksha brand and its protective purpose
- Signals that a short, guided setup flow follows
- Single "Get Started" action moves the user into onboarding

- Inputs/actions: Get Started.
- Outputs: Authentication gateway.
- Backend dependencies / endpoints: —.
- Related entities: —.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M02 — Secure Login / Register

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 2; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image2.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M02 (/auth is the source navigation label).
- Purpose: This is the authentication gateway. A segmented control lets the user switch between "Log In" and "Register", and — unlike a conventional email/password form — identity is established using the user's National Identity Card (NIC) number together with their phone number. This mirrors the identity-verification model used elsewhere in the platform, since the same NIC identity is later checked by an Administrator when verifying professional and community accounts. Trust badges for SOS, Encryption and Verification are pinned to the bottom of the screen, reassuring the user of the platform's safety posture at the very first sensitive input.
- Major components and documented actions:

- NIC number + phone number used as the login/registration identifier
- One-tap toggle between Log In and Register
- Persistent SOS / Encrypted / Verified trust indicators
- "Register with your NIC in one step" shortcut for new users

- Inputs/actions: NIC, phone, possession proof or password (conflict C03).
- Outputs: Authenticated session or registration handoff.
- Backend dependencies / endpoints: POST /auth/login.
- Related entities: User, RefreshSession.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M03 — Choose Your Language

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 3; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image3.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M03 (/onboarding/language is the source navigation label).
- Purpose: Presented as part of the onboarding wizard, this screen lets the user pick the interface language from Sinhala, Tamil, and English. Placing language choice this early ensures that every subsequent safety and legal-aid screen is accessible to users from Sri Lanka's three main language communities, directly supporting the trilingual requirement identified as a gap in existing local safety apps. A progress stepper across the top tracks the user's position in the onboarding flow, and the SOS/Encrypted/Verified trust row reappears at the bottom.
- Major components and documented actions:

- Selects interface language (Sinhala / Tamil / English)
- Sets the language used for all later legal, AI-detection, and support content
- Changeable later at any time from Settings

- Inputs/actions: en / si / ta.
- Outputs: Saved locale; English fallback if translation missing.
- Backend dependencies / endpoints: PATCH /me/preferences.
- Related entities: User.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Verified Sinhala/Tamil translations are unavailable; selected locale uses explicit English fallback (G04).

## M04 — Onboarding Highlight — "One Tap. Instant Help."

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 4; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image4.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M04 (/onboarding/sos is the source navigation label).
- Purpose: The first of three feature-highlight cards shown after language selection, introducing the SOS mechanism before the user ever needs it. It explains in one sentence that a single trigger sends the user's live location to trusted contacts and the nearest verified responder, so that when a real emergency later occurs the behaviour of the SOS button is already familiar rather than something to be learned under stress.
- Major components and documented actions:

- Previews the SOS / emergency-alert capability
- Sets expectations: one action, live location shared, trusted contacts + responder notified
- Skippable — a "Skip" link is provided for returning or impatient users

- Inputs/actions: Next / Skip.
- Outputs: Evidence highlight or account creation.
- Backend dependencies / endpoints: —.
- Related entities: —.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M05 — Onboarding Highlight — "Your Evidence, Encrypted"

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 5; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image5.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M05 (/onboarding/evidence is the source navigation label).
- Purpose: The second onboarding highlight introduces the Evidence Vault concept ahead of first use. It tells the user that screenshots, audio, and location data can be stored safely, hidden from anyone else who uses the same phone, previewing the encrypted, tamper-evident storage that underpins later evidence-collection and legal-reporting screens.
- Major components and documented actions:

- Previews encrypted evidence storage (screenshots, audio, location)
- Reassures the user that vault contents remain hidden from other phone users
- Prepares the user for the disguise/PIN mechanism introduced next

- Inputs/actions: Next / Skip.
- Outputs: Responder highlight or account creation.
- Backend dependencies / endpoints: —.
- Related entities: —.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M06 — Onboarding Highlight — "Always Someone Watching Over You"

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 6; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image6.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M06 (/onboarding/responders is the source navigation label).
- Purpose: The third and final onboarding highlight introduces the human side of the platform: a always-available, verified responder network standing behind the automated features. It closes the feature-preview carousel and hands the user off to account creation with a "Get Started" action.
- Major components and documented actions:

- Previews the 24/7 verified-responder network behind SOS and reporting
- Final step of the feature-highlight carousel before registration

- Inputs/actions: Get Started.
- Outputs: Account form.
- Backend dependencies / endpoints: —.
- Related entities: —.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M07 — Create Your Account

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 7; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image7.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M07 (/register is the source navigation label).
- Purpose: This is the registration form, collecting the minimum information needed to create an account: full name, mobile number, and a password (with an inline password-strength requirement of at least 8 characters, a number, and a symbol). A mandatory checkbox confirms agreement to the Terms and Privacy Policy and that the user is 16 or older. A progress stepper shows this as one step within account setup, and a "Sign in" link is offered for anyone who already has an account and reached this screen by mistake.
- Major components and documented actions:

- Captures full name, mobile number, and password
- Enforces password-strength and age/consent requirements before account creation
- Links back to Sign In for existing users

- Inputs/actions: NIC carried from gateway, full name, phone, password, terms and 16+ consent.
- Outputs: Account and session; PIN setup.
- Backend dependencies / endpoints: POST /auth/register.
- Related entities: User, Consent, RefreshSession.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M08 — Secure Your App (PIN Setup)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 8; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image8.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M08 (/security/pin is the source navigation label).
- Purpose: Immediately after account creation, the user is required to set the 6-digit PIN that will later unlock the disguised app (see Figure 2 / Guardian Mode, below). A numeric keypad is used to enter and confirm the PIN, and a toggle is provided to additionally enable fingerprint unlock for a faster, equally private alternative. This step operationalises the "encrypted and disguise-protected" promise made during onboarding before the user leaves the setup flow.
- Major components and documented actions:

- Sets the 6-digit PIN used to unlock Guardian Mode from the disguise
- Optional fingerprint unlock toggle
- Changeable later from Settings → App lock & disguise mode

- Inputs/actions: 6-digit PIN and confirmation; biometric preference.
- Outputs: PIN configured; native biometric capability result.
- Backend dependencies / endpoints: POST /me/security/pin.
- Related entities: User, AuditLog.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M09 — Choose Your Disguise

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 9; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image9.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M09 (/security/disguise is the source navigation label).
- Purpose: As the final configuration step before the app is first used, the user selects which everyday application Suraksha should imitate on the home screen and app icon — the options implemented are Calculator, Notes, and Weather. This is central to the survivor-safety model of the application: it allows the tool to remain hidden from an abuser who inspects the victim's phone, while remaining only one correct PIN entry away from full functionality. The choice can be changed later at any time from Settings.
- Major components and documented actions:

- Selects the disguise identity: Calculator, Notes, or Weather
- Determines the home-screen icon and the app's default, harmless-looking appearance
- Reversible at any time from Settings

- Inputs/actions: Calculator / Notes / Weather.
- Outputs: Disguise selection persisted.
- Backend dependencies / endpoints: PATCH /me/preferences.
- Related entities: User.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Internal disguise works and Android launcher module exists; iOS alternate assets and device validation remain (G10).

## M10 — Guardian Mode (Disguise Unlock)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 10; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image10.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M10 (/security/unlock is the source navigation label).
- Purpose: This screen demonstrates the application's core safety mechanism in daily use: by default the app is disguised as an ordinary utility (calculator, notes, or weather, per the user's choice), and entering the private PIN set up earlier lifts the disguise and switches the device into "Guardian mode," unlocking the real Suraksha application. A segmented PIN-progress indicator and a clear "Continue to Suraksha" action are provided, along with a "Back to calculator" fallback link, so the disguise can be re-engaged instantly if someone else picks up the device.
- Major components and documented actions:

- PIN entry gate that lifts the disguise and reveals the real application
- Instant fallback back to the disguised utility if interrupted
- The single mechanism separating an abuser's casual inspection from the survivor's private tools

- Inputs/actions: PIN or supported device biometric.
- Outputs: Guardian unlock or fallback utility.
- Backend dependencies / endpoints: POST /me/security/unlock.
- Related entities: User, AuditLog.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M11 — Settings — Account and Privacy

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 11; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image11.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M11 (/settings is the source navigation label).
- Purpose: The Settings screen consolidates all safety-critical configuration in one place: interface language, the app-lock/disguise mode (PIN and fingerprint), default location-sharing behaviour, notification preferences, and information about the current app version. A clearly separated, high-friction "Delete my data" action — protected behind an explicit confirmation dialog warning that the action permanently erases the account, vault contents, and messages and cannot be undone — gives the user full, unambiguous control to walk away from the platform entirely at any time.
- Major components and documented actions:

- Central hub for language, app-lock/disguise, location-sharing, and notification settings
- Displays current app version under "About Suraksha"
- Irreversible, confirmation-gated full account and data deletion

- Inputs/actions: Language, lock, sharing, notifications, explicit erase confirmation.
- Outputs: Updated preferences or deletion progress.
- Backend dependencies / endpoints: GET /me; PATCH /me/preferences; DELETE /me.
- Related entities: User, DeletionJob, AuditLog.
- Frontend component: `apps/mobile/src/features/onboarding.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Active account/object deletion exists; backup, legal-hold retention and verified recovery semantics remain unresolved (G12).

## M12 — Home Dashboard

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 12; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image12.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M12 (/home is the source navigation label).
- Purpose: Once unlocked, the user lands on a personalised home dashboard ("Good evening, Risini — Here's your safety overview") that summarises the account's safety status at a glance. Quick-access tiles are provided for the SOS Emergency trigger, the Evidence Vault (showing item count), the AI-powered Ask Legal Aid chat, a mental-health Check-in, and Jobs/opportunities, with a bottom navigation bar (Home, Knowledge, SOS, Vault, Profile) giving persistent access to every major functional area of the app.
- Major components and documented actions:

- Personalised greeting and at-a-glance safety-status overview
- One-tap quick-access tiles: SOS Emergency, Evidence Vault, Ask Legal Aid, Check-in, Jobs
- Persistent bottom navigation across the app's major sections

- Inputs/actions: Quick tile / tab selection.
- Outputs: Personalized summary and destinations.
- Backend dependencies / endpoints: GET /me/overview.
- Related entities: Case, Evidence, Notification.
- Frontend component: `apps/mobile/src/features/safety.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M13 — SOS Emergency

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 13; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image13.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M13 (/sos is the source navigation label).
- Purpose: The SOS screen implements a deliberate "hold-to-alert" pattern (hold for 2 seconds) to minimise accidental triggering while still allowing a fast, low-visibility response in a genuine emergency. Activating the button immediately alerts the user's trusted contacts and the nearest police unit and shares the user's live location, with a visible "Cancel" option retained in case the alert was triggered by mistake.
- Major components and documented actions:

- 2-second press-and-hold gesture prevents accidental triggering
- Simultaneously notifies trusted contacts and the nearest police unit with live location
- Cancel option available up to the point of confirmed dispatch

- Inputs/actions: Continuous 2-second hold; current location or unavailable status.
- Outputs: Persisted alert and actual development delivery state.
- Backend dependencies / endpoints: POST /sos.
- Related entities: SOSAlert, LocationEvent, NotificationDelivery, AuditLog.
- Frontend component: `apps/mobile/src/features/safety.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Durable SOS and hold activation work; emergency delivery uses an explicit development provider (G08).

## M14 — Help Is On The Way

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 14; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image14.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M14 (/sos/:id is the source navigation label).
- Purpose: Following a successful SOS trigger, this confirmation screen shows live tracking status on a map, confirms that the nearest police unit has been notified (with distance shown, e.g. 1.2 km away), and lists which trusted contacts have been alerted. A prominent "I am safe now" button lets the user stand the alert down once the situation has been resolved, closing the loop for the responding parties.
- Major components and documented actions:

- Live map showing the user's position and the responding police unit
- Confirms which police unit and which trusted contacts have been notified
- "I am safe now" action to stand down an active alert

- Inputs/actions: I am safe now.
- Outputs: Live state, contact delivery results, closure.
- Backend dependencies / endpoints: GET /sos/:id; PATCH /sos/:id/status.
- Related entities: SOSAlert, SOSEvent, NotificationDelivery.
- Frontend component: `apps/mobile/src/features/safety.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Foreground positions and alert lifecycle work; external responder dispatch/ETA is unavailable (G08).

## M15 — Add Trusted Contacts

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 15; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image15.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M15 (/contacts is the source navigation label).
- Purpose: As part of onboarding (and revisitable at any time), the user builds a list of trusted contacts who will be notified first during an SOS event, before or alongside police involvement, giving the user a softer first line of support. Each contact shows their relationship to the user (e.g. "Amma", "Friend") and phone number, with priority contacts flagged, and additional contacts can be added at any time from Settings.
- Major components and documented actions:

- Add / remove trusted contacts with name, relationship, and phone number
- Flags priority contacts notified first during an SOS event
- Extensible later from Settings without repeating onboarding

- Inputs/actions: Name, relationship, phone, priority.
- Outputs: Own contact list.
- Backend dependencies / endpoints: GET /contacts; POST /contacts; DELETE /contacts/:id.
- Related entities: TrustedContact.
- Frontend component: `apps/mobile/src/features/safety.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M16 — Sharing Location

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 16; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image16.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M16 (/location/share is the source navigation label).
- Purpose: This screen allows the user to share their real-time location with a specific trusted contact ("Share with Amma") for a defined duration (shown here as 2 hours), visualised on a live map. A single toggle enables or disables sharing, and a "Stop sharing" action is always available, balancing safety benefits with the user's control over their own privacy.
- Major components and documented actions:

- Live-location sharing with a named trusted contact
- Time-boxed sharing window (e.g. 2 hours) rather than indefinite tracking
- Toggle on/off and an always-available "Stop sharing" override

- Inputs/actions: Contact, duration, sharing toggle, location consent.
- Outputs: Expiring share; immediate stop.
- Backend dependencies / endpoints: POST /location/shares; DELETE /location/shares/:id; POST /location/events.
- Related entities: LocationShare, LocationEvent, TrustedContact.
- Frontend component: `apps/mobile/src/features/safety.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Consented expiring shares and foreground positions persist; recipient delivery and background tracking remain (G08/G09).

## M17 — Route Home (Safe Navigation)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 17; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image17.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M17 (/location/route is the source navigation label).
- Purpose: The Safe Route feature calculates a walking route home while actively avoiding areas that have been reported as danger zones by other users, and flags any low-lit stretches ahead ("Low-lit stretch ahead — reported by 6 users this month"). Colour-coded route segments distinguish the safe path from danger zones, and a "Start safe navigation" action begins live, geo-fenced guidance with automatic alerts if the user deviates into a flagged area.
- Major components and documented actions:

- Routes around community-reported danger zones rather than shortest-path only
- Surfaces crowd-sourced warnings (e.g. poor lighting) along the route
- Live, geo-fenced navigation with deviation alerts once started

- Inputs/actions: Origin, destination, GPS permission, Start navigation.
- Outputs: Provider route and community warnings with provenance.
- Backend dependencies / endpoints: POST /routes; GET /danger-zones.
- Related entities: DangerZone, LocationEvent.
- Frontend component: `apps/mobile/src/features/safety.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Provider-backed illustrative coordinates only; validated routing, geofencing and low-light data are unavailable (G09).

## M18 — Evidence Vault

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 18; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image18.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M18 (/vault is the source navigation label).
- Purpose: The Evidence Vault provides tamper-evident, encrypted storage for all evidence the user has collected, including screenshots, voice notes, and location trails, each timestamped, labelled with its type (Threat, Audio, GPS), and tagged with when it was added. A single "Add evidence" action lets the user grow this collection at any time, and the vault contents can later be attached directly to a formal report.
- Major components and documented actions:

- Encrypted, tamper-evident storage for screenshots, audio, and location trails
- Per-item timestamp, type tag, and recency label
- Direct attachment of stored items to a new report

- Inputs/actions: Add evidence / select item.
- Outputs: Own encrypted evidence metadata.
- Backend dependencies / endpoints: GET /evidence.
- Related entities: Evidence.
- Frontend component: `apps/mobile/src/features/evidence.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M19 — Add Evidence

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 19; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image19.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M19 (/vault/add is the source navigation label).
- Purpose: This screen allows the user to capture or import new evidence in four formats — Photo, Audio, Video, or Chat log — together with an optional note describing what happened, when, and where. Once submitted, items are immediately "Encrypted & saved" to the vault, reinforcing the chain-of-custody requirements needed if the evidence is later used in a legal or police process.
- Major components and documented actions:

- Four capture/import types: Photo, Audio, Video, Chat log
- Optional free-text note for context (what/when/where)
- Immediate encryption on save to preserve chain-of-custody

- Inputs/actions: Photo / audio / video / chat log file; optional note.
- Outputs: Encrypted object and integrity metadata.
- Backend dependencies / endpoints: POST /evidence.
- Related entities: Evidence, AuditLog.
- Frontend component: `apps/mobile/src/features/evidence.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`, `tests/providers.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Four evidence formats can be imported or a text note entered; in-app camera/microphone recording remains (G19).

## M20 — Evidence Detail — Sealed Record (Screenshot_0231)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 20; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image20.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M20 (/vault/:id is the source navigation label).
- Purpose: Once an item (here, Screenshot_0231) has been attached to a report, it becomes a locked, sealed evidence record: the raw content is hidden behind an encrypted preview that can only be unlocked with the user's PIN, while its capture time, location tag, and SHA-256 integrity hash remain visible and verified. This design preserves evidentiary integrity while still allowing the user to attach the sealed item to an active report.
- Major components and documented actions:

- PIN-gated encrypted preview once an item is sealed to a case
- Visible, verified capture time, location tag, and SHA-256 integrity hash
- "Attach to report" action without ever exposing the raw file unnecessarily

- Inputs/actions: PIN unlock; attach to report.
- Outputs: Authorized preview, capture metadata and verified hash.
- Backend dependencies / endpoints: GET /evidence/:id; POST /evidence/:id/unlock; GET /evidence/:id/content.
- Related entities: Evidence, EvidenceAccess.
- Frontend component: `apps/mobile/src/features/evidence.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`, `tests/providers.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. PIN-gated verified metadata, text/image preview and attachment work; audio/video playback remains (G19).

## M21 — Scan a Message

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 21; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image21.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M21 (/scan is the source navigation label).
- Purpose: This screen lets the user upload a screenshot or paste the text of a message they have received, which is then analysed by the platform's AI harassment-detection model (supporting Sinhala, Tamil, and English). In the implemented example, the model flags "Harassment detected — threatening language pattern" with an 87% confidence score, and offers the user the option to Dismiss the flag or Escalate to Legal Aid directly from the result.
- Major components and documented actions:

- Upload screenshot or paste raw text for AI harassment analysis
- Trilingual detection model (Sinhala / Tamil / English)
- Confidence-scored flag with Dismiss or Escalate-to-Legal-Aid actions

- Inputs/actions: Message text or screenshot requiring OCR provider.
- Outputs: Analysis record; dismiss or legal handoff.
- Backend dependencies / endpoints: POST /analysis.
- Related entities: AIAnalysis, Evidence, ModelVersion.
- Frontend component: `apps/mobile/src/features/evidence.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`, `tests/providers.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Text analysis calls the real FastAPI demo service; screenshot OCR and trained models are unavailable (G05/G19).

## M22 — AI Analysis Result

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 22; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image22.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M22 (/scan/:id is the source navigation label).
- Purpose: Following a scan, this screen presents the full AI risk classification for the submitted message — in this case a High-risk / Threat + Blackmail classification at 92% model confidence, with a plain-language note that the language matches known coercion patterns. The result is saved automatically to the user's encrypted evidence vault and filed, and a direct "Talk to Legal Chatbot" action is provided, along with a short explanation of what happens next (evidence encrypted, available in the vault, legal aid notified only if the user chooses to file a report).
- Major components and documented actions:

- Full risk classification with confidence score and plain-language rationale
- Automatic save-to-vault and filing of the analysed message
- One-tap handoff into the Legal Aid chatbot

- Inputs/actions: View result / Talk to Legal Chatbot.
- Outputs: Risk, confidence availability, model provenance, vault save state.
- Backend dependencies / endpoints: GET /analysis/:id.
- Related entities: AIAnalysis, Evidence.
- Frontend component: `apps/mobile/src/features/evidence.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`, `tests/providers.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Real stored analysis and vault linkage; confidence and validated threat score are intentionally unavailable (G05).

## M23 — Legal Aid Chat

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 23; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image23.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M23 (/legal/chat is the source navigation label).
- Purpose: The AI Legal Aid Chat gives the user instant, conversational access to plain-language legal information (for example, an explanation of the Computer Crimes Act No. 24 of 2007 in response to a question about online blackmail) and can guide the user step-by-step through filing a formal report or connecting them directly with a human legal advisor. The chat is marked confidential and available 24/7, reducing the barrier to seeking legal guidance immediately after an incident.
- Major components and documented actions:

- Conversational, plain-language answers to legal questions
- Guides the user directly into the report-filing flow on request
- Marked confidential and available 24/7

- Inputs/actions: Question, human escalation consent.
- Outputs: Sourced informational response or human query queue.
- Backend dependencies / endpoints: POST /legal/queries; GET /legal/queries/:id; POST /legal/queries/:id/messages; POST /legal/queries/:id/escalate.
- Related entities: LegalQuery, LegalMessage, LegalResource.
- Frontend component: `apps/mobile/src/features/reporting.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Persistent query/chat, consent and advisor fallback work; source-grounded automated answers await a legal corpus (G07).

## M24 — Start a Report — "What Happened?" (Category Selection)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 24; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image24.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M24 (/reports/new/category is the source navigation label).
- Purpose: This is Step 1 of the reporting workflow, where the user selects the category that best matches their situation from options such as Cyber Harassment, Domestic Violence, Workplace Harassment, and Public Transport Abuse. Categorising the incident at the outset allows the system to route the report to the correct downstream workflow and to pre-fill relevant legal guidance later in the process.
- Major components and documented actions:

- Category selection: Cyber Harassment, Domestic Violence, Workplace Harassment, Public Transport Abuse
- Determines downstream routing and applicable legal guidance
- First of a 3-step report-filing wizard

- Inputs/actions: Cyber Harassment / Domestic Violence / Workplace Harassment / Public Transport Abuse.
- Outputs: Report draft category.
- Backend dependencies / endpoints: —.
- Related entities: ReportCategory (shared enum).
- Frontend component: `apps/mobile/src/features/reporting.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M25 — Cyber Harassment Report Form

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 25; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image25.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M25 (/reports/new/details is the source navigation label).
- Purpose: As Step 2 of the reporting workflow, the report form collects structured details of the incident — when it happened, supporting evidence pulled directly from the Evidence Vault ("2 items from Vault selected"), and an optional free-text description — while a "Submit anonymously" toggle lets the user choose whether to hide their identity from anyone but the assigned case handler. This balances the need for actionable detail with the user's right to control their own exposure.
- Major components and documented actions:

- Structured incident details: date, linked vault evidence, free-text description
- "Submit anonymously" toggle to hide identity from all but the case handler
- Direct evidence attachment from the Vault rather than re-uploading

- Inputs/actions: Incident date, own vault item IDs, optional narrative, anonymous toggle.
- Outputs: Single shared case reference.
- Backend dependencies / endpoints: POST /reports; GET /evidence.
- Related entities: Case, Report, CaseEvidence, CaseEvent.
- Frontend component: `apps/mobile/src/features/reporting.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M26 — Report Tracking (#SL-2291)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 26; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image26.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M26 (/reports/:reference is the source navigation label).
- Purpose: Once submitted, the user can follow their case's progress through a simple status tracker — Received, Under review (shown here as assigned to the Cyber Crime unit), and Awaiting update, with an estimated turnaround time — matching the same case reference number used across the Admin and Police dashboards elsewhere in the platform. A "Message case officer" action keeps a direct communication channel open, and the screen reiterates that the case is encrypted and tied to the same #SL-2291 identifier used across the whole system.
- Major components and documented actions:

- Step-based status tracker: Received → Under review → Awaiting update
- Shared case reference number (#SL-2291) traceable across Police/Admin views
- Direct "Message case officer" communication channel

- Inputs/actions: Message case officer.
- Outputs: Owner-safe timeline and same case reference.
- Backend dependencies / endpoints: GET /cases/:reference; GET /cases/:reference/messages; POST /cases/:reference/messages.
- Related entities: Case, CaseEvent, CaseMessage.
- Frontend component: `apps/mobile/src/features/reporting.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M27 — Community

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 27; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image27.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M27 (/community is the source navigation label).
- Purpose: The Community screen is a moderated space where users can anonymously share their experiences and receive peer support, with each post showing relative time and comment count (e.g. "Finally reported after 6 months, feeling lighter today"). Every post passes through the AI content-moderation pipeline before being visible to other users, ensuring the space remains safe and constructive rather than a vector for further harassment.
- Major components and documented actions:

- Anonymous posting and peer-support commenting
- Like/comment counts surfaced per post
- All content passes AI moderation before publication

- Inputs/actions: Anonymous post/comment, like, report reason.
- Outputs: Moderated publication and counts without identity leakage.
- Backend dependencies / endpoints: GET /community/posts; POST /community/posts; POST /community/posts/:id/comments; POST /community/flags; PUT /community/posts/:id/like.
- Related entities: CommunityPost, CommunityComment, CommunityLike, ModerationItem.
- Frontend component: `apps/mobile/src/features/reporting.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## M28 — Know Your Rights (Knowledge Hub)

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 28; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image28.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M28 (/knowledge is the source navigation label).
- Purpose: This screen provides a searchable library of plain-language legal guides covering topics such as the Cyber Crimes Act, the Domestic Violence Act, workplace protections, and how to file a police complaint. Each guide displays an estimated reading time (typically 4–8 minutes) and is available in all three supported languages, supporting informed decision-making independently of the AI chat.
- Major components and documented actions:

- Searchable library of plain-language legal guides
- Per-guide estimated reading time
- Available in Sinhala, Tamil, and English

- Inputs/actions: Search, guide selection, locale.
- Outputs: Published curated guide with source and reading time.
- Backend dependencies / endpoints: GET /legal/resources; GET /legal/resources/:id.
- Related entities: LegalResource.
- Frontend component: `apps/mobile/src/features/reporting.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Reviewed-resource publication/search exists; seeded titles are unpublished drafts without legal text (G07).

## M29 — Wellness Check-In — "How Are You, Really?"

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 29; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image29.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M29 (/wellbeing/check-in is the source navigation label).
- Purpose: Implemented as a short, GAD-7-style screening questionnaire, this screen periodically checks in on the user's emotional wellbeing through simple, non-clinical questions such as feeling tense or on edge in the past week. A progress indicator (Question 3 of 9) and reassurance text keep the tone supportive rather than clinical, and results remain private throughout.
- Major components and documented actions:

- Short, validated-style (GAD-7-inspired) wellbeing screener
- Question-by-question progress indicator
- Explicitly framed as non-diagnostic and private

- Inputs/actions: Documented question responses; instrument incomplete.
- Outputs: Private non-diagnostic check-in; no invented validated score.
- Backend dependencies / endpoints: POST /wellbeing/check-ins.
- Related entities: WellbeingCheckIn.
- Frontend component: `apps/mobile/src/features/wellbeing.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Only the single documented check-in prompt is implemented; full validated instrument is not specified (G06).

## M30 — Your Check-In Result

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 30; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image30.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M30 (/wellbeing/results/:id is the source navigation label).
- Purpose: On completion, the check-in produces a plain-language result — in this example, "Mild anxiety" with a score of 8/21 — along with a note that results are private and not shared without consent and that this is not a diagnosis. A direct "Book a counselor" call-to-action bridges the wellbeing check straight into professional support if the user chooses to proceed, with a suggested retake in 2 weeks.
- Major components and documented actions:

- Plain-language result and numeric score (e.g. 8/21) from the check-in
- Explicit "not a diagnosis", private, not-shared framing
- One-tap bridge into booking a counselor

- Inputs/actions: View own result / Book a counselor.
- Outputs: Private result, instrument provenance, booking handoff.
- Backend dependencies / endpoints: GET /wellbeing/check-ins/:id; PATCH /wellbeing/check-ins/:id.
- Related entities: WellbeingCheckIn.
- Frontend component: `apps/mobile/src/features/wellbeing.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **PARTIALLY IMPLEMENTED**. Non-diagnostic response and sharing consent work; no unsupported clinical score is displayed (G06).

## M31 — Book a Counselling Session

- Source: `Suraksha_UI_Screens_user NEW RESULT.docx`, Screen 31; [embedded visual reference](<sources/Suraksha_UI_Screens_user NEW RESULT/image31.png>).
- Actor / platform: USER / mobile.
- Route/navigation: React Navigation M31 (/counseling/book is the source navigation label).
- Purpose: This screen lets the user choose from a list of available counselors, each showing their specialisation, language, and next available slot (e.g. a clinical counsellor available today at 4pm, a trauma-informed counsellor tomorrow, a family counsellor on Friday), and confirm a booking with a single tap. The session is explicitly marked as confidential and free of charge, removing two common barriers — cost and privacy concerns — to seeking professional help.
- Major components and documented actions:

- Browse counselors by specialisation, language, and next available slot
- One-tap booking confirmation
- Explicitly confidential and free of charge

- Inputs/actions: Counselor, language, available slot; separate screening sharing consent.
- Outputs: Confidential booking confirmation.
- Backend dependencies / endpoints: GET /counselors/availability; POST /counseling/appointments.
- Related entities: StaffProfile, CounselorSlot, CounselingAppointment, Consent.
- Frontend component: `apps/mobile/src/features/wellbeing.tsx`.
- Automated evidence: `apps/mobile/test/flows.test.tsx`, `tests/integration.test.ts`. Mobile screen rendering; report submission and early SOS release have interaction assertions. Linked API tests cover aggregate workflows, not every screen control.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S01 — Admin Sign-In (Guardian Access Portal)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.1; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image1.png>).
- Actor / platform: ADMIN / web.
- Route/navigation: /admin/sign-in.
- Purpose: Restricted staff login screen for authorized response and field staff of the Suraksha safety network. Presented as a split panel: a branded trust panel on the left ("Protecting staff & communities, together") and the credential form on the right.
- Major components and documented actions:

- Staff ID field (e.g. SL-ADM-0192) and Password field
- "Remember this device" checkbox and "Forgot access code?" link
- Primary Sign In button
- Alternate authentication: "Sign in with Police ID SSO"
- Trust indicators: 256-bit end-to-end encryption, SL Police verified, ISO 27001

- Inputs/actions: Staff ID, password, remember device.
- Outputs: Verified staff session.
- Backend dependencies / endpoints: POST /auth/login.
- Related entities: User, StaffProfile, RefreshSession.
- Frontend component: `apps/web/src/features/sign-in.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S02 — Admin Dashboard — Overview

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.2; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image2.png>).
- Actor / platform: ADMIN / web.
- Route/navigation: /admin.
- Purpose: The administrator's landing page, giving a single-glance summary of platform-wide health and activity.
- Major components and documented actions:

- Key metrics: Total active users (18,402), Open reports (37), SOS events today (4), Staff/AI accuracy (94%)
- Weekly Activity trend chart (SOS and report volume over the week)
- Live Feed — a real-time stream of platform events (SOS triggered, check-in confirmed, escort request closed, staff verified, report flagged)
- Recent Incidents table — case ID, type, location, assigned officer, status, and elapsed time
- Left navigation: Dashboard, Reports, Users, Settings

- Inputs/actions: Search / incident selection.
- Outputs: Calculated counters, weekly chart, sanitized live feed.
- Backend dependencies / endpoints: GET /admin/overview; GET /events.
- Related entities: Case, SOSAlert, User, AuditLog.
- Frontend component: `apps/web/src/features/admin.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S03 — User Management

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.3; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image3.png>).
- Actor / platform: ADMIN / web.
- Route/navigation: /admin/users.
- Purpose: Central registry listing every account on the platform, with tools to verify, filter, and moderate accounts.
- Major components and documented actions:

- Counters: Total users (18,402), Verified (17,190), Pending review (148), Suspended (12)
- Filter tabs: All users / Women (Verified) / Police / Counselors / Pending
- Table columns: user name/ID, role detail, verification status, account status, view/edit actions
- "Add User" action for manually provisioning staff accounts

- Inputs/actions: Role/status filters; verified staff provisioning.
- Outputs: Account verification and suspension states.
- Backend dependencies / endpoints: GET /admin/users; POST /admin/users; PATCH /admin/users/:id.
- Related entities: User, StaffProfile, AuditLog.
- Frontend component: `apps/web/src/features/admin.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S04 — Reports Queue

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.4; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image4.png>).
- Actor / platform: ADMIN / web.
- Route/navigation: /admin/reports.
- Purpose: The administrator's central triage tool, listing every incoming complaint filed by users through the app.
- Major components and documented actions:

- Counters: Open reports (37), High priority (9), Escalated (5), Resolved today (21)
- Filter tabs: All reports / New / In review / Escalated / Unassigned / Resolved
- Table columns: report reference & category (Cyber harassment, Domestic, Workplace, Stalking, Public harassment), colour-coded priority, status, assigned handler, time filed

- Inputs/actions: Status, category, priority, assignment filters.
- Outputs: Triage queue.
- Backend dependencies / endpoints: GET /cases.
- Related entities: Case, Report.
- Frontend component: `apps/web/src/features/cases.tsx`.
- Automated evidence: `tests/integration.test.ts`, `tests/e2e/staff.spec.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S05 — Case Detail & Escalation Screen (#SL-2291)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.5; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image5.png>).
- Actor / platform: ADMIN / web.
- Route/navigation: /admin/cases/:reference.
- Purpose: Opened from the Reports Queue, this is the full case package for a single report, giving the administrator everything needed to triage and route it.
- Major components and documented actions:

- AI Risk Assessment banner explaining why the model flagged the case High risk (e.g. blacklisted language detected, anonymous filer, multiple evidence items attached) with a recommended action ('assign to Police within 1 hour')
- Evidence bundle — attached files (e.g. chat_thread_export.pdf, screenshot_message_02.jpg) with automatic hash verification
- Report narrative — the filer's free-text description of the incident
- Case activity / audit trail — chronological log of automated and manual actions
- Case details panel: status, priority, category, filer (anonymous/named), filed date
- Actions: Assign to Police, Request more info, add an internal note, Mark as resolved, Escalate immediately

- Inputs/actions: Officer, request info, internal note, resolve/escalate.
- Outputs: Same case assigned with auditable timeline.
- Backend dependencies / endpoints: GET /cases/:reference; POST /cases/:reference/assignment; POST /cases/:reference/actions.
- Related entities: Case, CaseEvent, Evidence, AIAnalysis.
- Frontend component: `apps/web/src/features/cases.tsx`.
- Automated evidence: `tests/integration.test.ts`, `tests/e2e/staff.spec.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S06 — Content Moderation

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.6; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image6.png>).
- Actor / platform: ADMIN / web.
- Route/navigation: /admin/moderation.
- Purpose: Queues community posts and comments that have been auto-flagged by the AI model or reported by users, for administrator review.
- Major components and documented actions:

- Counters: Pending review (23), Auto-flagged (14), Reported by users (9), Removed today (31)
- Filter tabs: All flagged / Posts / Comments / Auto-flagged / User-reported
- Each item shows the flag reason (e.g. a post sharing a phone number in violation of contact-sharing guidelines, a comment reported for harassment language)
- Per-item actions: Approve or Remove

- Inputs/actions: Post/comment/source filters; approve/remove reason.
- Outputs: Publication/removal and audit history.
- Backend dependencies / endpoints: GET /admin/moderation; PATCH /admin/moderation/:id.
- Related entities: ModerationItem, CommunityPost, CommunityComment, AuditLog.
- Frontend component: `apps/web/src/features/admin.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S07 — AI Model Monitoring (under Settings)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 1.7; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image7.png>).
- Actor / platform: ADMIN / web.
- Route/navigation: /admin/settings/models.
- Purpose: Gives the administrator oversight of every AI model running in production — the transparency and accountability layer behind the platform's automated detection features.
- Major components and documented actions:

- Top metrics: Harassment model accuracy (94.2%), False-positive rate (3.1%), Models in production (6), Regional performance score (91%)
- Model Performance table — Harassment detection, Contact-info detection, Spam/phishing detection, Crisis-language detection — each with accuracy %, drift status (Stable/Drifting), and last retrained date
- Sinhala / Tamil Coverage panel — per-language accuracy (English highest, Sinhala and Tamil trailing)
- Recent Audit Activity feed — moderator overrides, automatic escalations, and retraining events (e.g. 'retrain triggered — new Tamil dataset added')

- Inputs/actions: Language/model filter; audited override metadata.
- Outputs: Actual evaluation provenance or unavailable metrics.
- Backend dependencies / endpoints: GET /admin/models; POST /admin/model-events.
- Related entities: ModelVersion, ModelMetric, ModelAuditEvent.
- Frontend component: `apps/web/src/features/admin.tsx`.
- Automated evidence: `tests/integration.test.ts`, `tests/providers.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **PARTIALLY IMPLEMENTED**. Registry, stored metric display and model audit actions exist; evaluated metrics, drift and training pipeline are absent (G05).

## S08 — Officer Sign-In

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 2.1; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image8.png>).
- Actor / platform: POLICE / web.
- Route/navigation: /police/sign-in.
- Purpose: Restricted login for verified police units, presented as a split panel: a branded trust panel ("Respond faster. Protect more.") on the left and the credential form on the right.
- Major components and documented actions:

- Badge ID field (e.g. WP-CDU-0044) and Password field
- "Remember this device" checkbox and "Forgot access code?" link
- Alternate authentication: "Sign in with National Police ID"
- Trust indicators: verified police-unit access only, real-time SOS dispatch alerts, secure chain-of-custody evidence access, end-to-end encryption, GPS-enabled

- Inputs/actions: Badge ID, password, remember device.
- Outputs: Verified officer session.
- Backend dependencies / endpoints: POST /auth/login.
- Related entities: User, StaffProfile, RefreshSession.
- Frontend component: `apps/web/src/features/sign-in.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S09 — Active Alerts — Live SOS Map

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 2.2; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image9.png>).
- Actor / platform: POLICE / web.
- Route/navigation: /police/live.
- Purpose: The officer's landing screen — a real-time operational view of active emergencies in their jurisdiction.
- Major components and documented actions:

- Counters: Active SOS (3), Assigned to me (5), Avg response time (4.2 min), Resolved today (12)
- Live SOS Map with markers for active incidents (e.g. 'SOS – Nugegoda', 'Escort Unit 12')
- Alert Queue — cards per alert showing type, location, and elapsed time, each with a one-tap Respond button; lower-priority items get a View case button
- Left navigation: Live, Cases, Map, Profile

- Inputs/actions: Jurisdiction map, alert, Respond.
- Outputs: Scoped alert queue and response assignment.
- Backend dependencies / endpoints: GET /police/alerts; POST /sos/:id/respond.
- Related entities: SOSAlert, SOSEvent, StaffProfile, LocationEvent.
- Frontend component: `apps/web/src/features/police.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **PARTIALLY IMPLEMENTED**. Live database SOS queue and responder claiming exist; map is a coordinate visualization and dispatch is local (G08/G09).

## S10 — Case Investigation File (#SL-2291)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 2.3; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image10.png>).
- Actor / platform: POLICE / web.
- Route/navigation: /police/cases/:reference.
- Purpose: Opened from the Cases list, this presents the full investigation record for a case assigned to the officer.
- Major components and documented actions:

- Evidence bundle — sealed, hash-verified evidence carried over from the user's original report (e.g. chat_thread_export.pdf, screenshot_message_02.jpg)
- Location trail — reconstructed from the user's last known GPS points ('Last known location – Nugegoda Junction', 'En route – High Level Road', 'Starting point – Home address on file')
- Timeline — chronological case activity (evidence sealed for chain of custody → case opened by officer → evidence hash-verified → report routed to unit)
- Case metadata panel: status (Investigating), priority (High), category, assigned officer, filed/opened timestamps
- Actions: Update case status, Request additional evidence, Escalate to CID

- Inputs/actions: Authorized evidence request; additional evidence / CID escalation.
- Outputs: Assigned investigation package and timeline.
- Backend dependencies / endpoints: GET /cases/:reference; GET /evidence/:id/content; POST /cases/:reference/actions.
- Related entities: Case, CaseEvent, CaseEvidence, LocationEvent, EvidenceAccess.
- Frontend component: `apps/web/src/features/cases.tsx`.
- Automated evidence: `tests/integration.test.ts`, `tests/e2e/staff.spec.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **PARTIALLY IMPLEMENTED**. Assigned case, evidence, messaging and actions work; case-specific location trail has no ingestion/linkage yet (G20).

## S11 — Update Case Status

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 2.4; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image11.png>).
- Actor / platform: POLICE / web.
- Route/navigation: /police/cases/:reference/status.
- Purpose: A simple, auditable stepper for progressing an investigation through its lifecycle.
- Major components and documented actions:

- Stage stepper: Filed (complete) → Under investigation (current) → Suspect contacted → Resolved
- Investigation notes — free-text field recorded against the case file, visible to CID if the case is later escalated
- Cancel and Save update actions

- Inputs/actions: Filed / Under investigation / Suspect contacted / Resolved; investigation notes.
- Outputs: Transactional state transition visible to owner.
- Backend dependencies / endpoints: PATCH /cases/:reference/status.
- Related entities: Case, CaseEvent, AuditLog.
- Frontend component: `apps/web/src/features/cases.tsx`.
- Automated evidence: `tests/integration.test.ts`, `tests/e2e/staff.spec.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S12 — Counselor Sign-In

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 3.1; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image12.png>).
- Actor / platform: COUNSELOR / web.
- Route/navigation: /counselor/sign-in.
- Purpose: Restricted login for verified counselors, presented as a split panel: a branded trust panel ("Listen closely. Help fully.") on the left and the credential form on the right.
- Major components and documented actions:

- Practitioner ID field (e.g. CNS-0071) and Password field
- "Remember this device" checkbox and "Forgot access code?" link
- Alternate authentication: "Sign in with Health Ministry ID"
- Trust indicators: verified counselor access only, confidential case notes fully encrypted, direct escalation to police & support teams

- Inputs/actions: Practitioner ID, password, remember device.
- Outputs: Verified counselor session.
- Backend dependencies / endpoints: POST /auth/login.
- Related entities: User, StaffProfile, RefreshSession.
- Frontend component: `apps/web/src/features/sign-in.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S13 — Today's Sessions Dashboard

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 3.2; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image13.png>).
- Actor / platform: COUNSELOR / web.
- Route/navigation: /counselor/sessions.
- Purpose: The counselor's home screen, summarising the day's workload.
- Major components and documented actions:

- Counters: Sessions today, Active clients (38), Unread messages (6), Completed this week (22)
- Today's Sessions list — client ID, time, modality tag (Video/Chat), presenting-concern tag (e.g. 'Urgent', 'Follow-up', 'Crisis follow-up'), and a one-tap Join or View action
- Weekly progress bar (e.g. '33 of 50 sessions — 70%')
- Recent Messages panel with unread indicators
- Left navigation: Sessions, Clients, Messages, Profile

- Inputs/actions: Today/session selection; Join / View.
- Outputs: Assigned sessions, messages, weekly progress.
- Backend dependencies / endpoints: GET /counseling/appointments; GET /counseling/sessions/:id/messages.
- Related entities: CounselingAppointment, CounselingMessage.
- Frontend component: `apps/web/src/features/counseling.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **PARTIALLY IMPLEMENTED**. Appointments and private messages work; live audio/video transport and configured performance targets are absent (G16).

## S14 — Client Snapshot (#4482)

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 3.3; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image14.png>).
- Actor / platform: COUNSELOR / web.
- Route/navigation: /counselor/clients/:clientId.
- Purpose: Opened from the sessions list, this is an anonymised client-session detail view combining wellbeing history and clinical notes.
- Major components and documented actions:

- Client snapshot — most recent screening score (e.g. 8/27), risk level (Mid-severity), number of prior sessions completed
- Session history — past sessions with duration and modality (e.g. 'Second check-in – coping strategies, Video, 45 min')
- Care notes — free-text clinical observations and recommended cadence
- Side panel: Client ID, risk level, first/next session dates, assigned counselor
- Actions: Start session, View full history, Escalate to crisis team

- Inputs/actions: Start session / full history / crisis escalation.
- Outputs: Pseudonymous client snapshot with consented screening.
- Backend dependencies / endpoints: GET /counseling/clients/:id; POST /counseling/sessions/:id/start; POST /counseling/sessions/:id/escalate.
- Related entities: CounselingAppointment, CounselingNote, Consent.
- Frontend component: `apps/web/src/features/counseling.tsx`.
- Automated evidence: `tests/integration.test.ts`, `tests/e2e/staff.spec.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **PARTIALLY IMPLEMENTED**. Pseudonymous snapshot, consented screening and notes work; crisis action records intent without external dispatch (G16).

## S15 — Session Notes & Follow-Up

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 3.4; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image15.png>).
- Actor / platform: COUNSELOR / web.
- Route/navigation: /counselor/sessions/:id/notes.
- Purpose: A structured clinical note-taking form completed after a session concludes.
- Major components and documented actions:

- Session summary (free text)
- Follow-up cadence selector: One-time / Weekly / Biweekly / Monthly, plus a cadence detail note (e.g. 'Weekly check-ins for 4 weeks')
- Updated risk-assessment selector: Low / Mid / Moderate / High
- Next session date picker
- Cancel and Save & schedule follow-up actions

- Inputs/actions: Summary, cadence, cadence note, Low/Mid/Moderate/High, next date.
- Outputs: Encrypted clinical note and atomic follow-up booking.
- Backend dependencies / endpoints: POST /counseling/sessions/:id/notes.
- Related entities: CounselingNote, CounselingAppointment, CounselorSlot, AuditLog.
- Frontend component: `apps/web/src/features/counseling.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.

## S16 — Legal Queries Dashboard

- Source: `Suraksha_Screen_Admin,police,counsilor.docx`, 4.1; [embedded visual reference](<sources/Suraksha_Screen_Admin,police,counsilor/image16.png>).
- Actor / platform: LEGAL_ADVISOR / web.
- Route/navigation: /legal/queries.
- Purpose: The advisor's primary workspace for handling incoming legal questions and maintaining public guidance resources.
- Major components and documented actions:

- Counters: Open queries (9), Answered today (14), Avg response time (3.1 hr), Resources published (6)
- Query Queue — incoming questions (e.g. 'Cyber blackmail question', 'Workplace rights', 'Custody & safety planning', 'Restraining order process') with status tags (New / In progress / Answered) and a Respond or Continue action per item
- Monthly Impact panel — progress bar of queries answered this month (e.g. '215 of 250 — 87%')
- Resource Library — published guides that feed the user-side 'Know Your Rights' hub (e.g. 'Filing a police complaint – guide', 'Restraining orders explained', 'Know your workplace rights'), each with a view count
- Left navigation: Queries, Resources, Impact, Profile

- Inputs/actions: New/In progress/Answered, Respond/Continue, resource editing.
- Outputs: Query response, resource library and calculated impact.
- Backend dependencies / endpoints: GET /legal/queries; PATCH /legal/queries/:id; POST /legal/queries/:id/messages; POST /legal/resources; PATCH /legal/resources/:id.
- Related entities: LegalQuery, LegalMessage, LegalResource, StaffProfile.
- Frontend component: `apps/web/src/features/legal.tsx`.
- Automated evidence: `tests/integration.test.ts`. API policy/workflow coverage; Playwright covers case assignment/status and cross-workspace denial. No individual visual regression assertion for this screen.
- Implementation status: **IMPLEMENTED**. Native device and pixel-level visual validation remain a shared qualification; see G21.
