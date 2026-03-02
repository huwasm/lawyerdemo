---
title: Handover — Session 4: UI Symmetry, Prompt Fixes & Pipeline Resilience
created: 2026-03-02
updated: 2026-03-02
status: active
author: claude+user
---

# Handover — Session 4: UI Symmetry, Prompt Fixes & Pipeline Resilience

## Summary

Session 4 focused on three areas: (1) making the dashboard form **symmetrical** — both Client and Defendant sections now show ALL fields (name, address, vehicle info, party type flags), eliminating blind spots where a pedestrian client's flags were hidden or a defendant's vehicle details were missing; (2) fixing **AI prompt bias** in insurance code extraction that caused misreads ("36" → "639"); (3) adding **comprehensive debug logging** to the entire approve pipeline, and making the **retainer download step resilient** with retry logic and graceful failure.

---

## Completed

### Dashboard UI Symmetry (`app/dashboard/page.tsx`)

- [x] **15 new state variables** added for symmetric form layout:
  - Defendant vehicle detail fields: `defendantPlate`, `defendantPlateState`, `defendantVehicleYearMake`, `defendantVehicleType`, `defendantInsCode`, `defendantAddress`, `defendantCity`, `defendantState`, `defendantZip`
  - Client party type flags: `clientIsVehicle`, `clientVehicleNum`, `clientIsBicyclist`, `clientIsPedestrian`, `clientIsOtherPed`, `showClientFlags`
- [x] **`defendantVehicleNum` default** changed from `useState(2)` → `useState(0)` (no misleading "2" badge before extraction)
- [x] **`defendantIsVehicle` default** changed from `useState(true)` → `useState(false)` (no false-blue Vehicle badge before extraction)
- [x] **Client section** now shows party type flags (Vehicle, Bicyclist, Pedestrian, Other Pedestrian) — always visible, no toggle
- [x] **Defendant section** now shows full vehicle detail fields (Registration Plate, State of Reg, Vehicle Year & Make, Vehicle Type, Ins Code) + address row
- [x] **Flags always visible** — removed `showClientFlags`/`showDefendantFlags` conditional rendering and toggle buttons; both default to `true` and flags are always rendered
- [x] **Vehicle number badges** display `{clientVehicleNum || ""}` and `{defendantVehicleNum || ""}` — show empty when 0 (before extraction)
- [x] **`populateFields()`** updated to set all 15 new fields from extraction data
- [x] **`populateFieldsNoMatch()`** updated similarly
- [x] **`handleReset()`** updated to reset all 15 new fields to defaults

### AI Extraction Prompt Fix (`lib/providers/types.ts`)

- [x] **Ins code digit range** changed from "3-5 digit" → "1-5 digits" (allows 2-digit codes like "36")
- [x] **Ins code examples** changed from biased `"639", "042", "11433"` → neutral `"36", "42", "100", "11433"`
- [x] **Extract-exactly rule** added: "Extract EXACTLY what is printed — do NOT guess or pad. If the box is empty or unreadable, use ''"
- [x] **Pedestrian ins code rule** added: "For pedestrians/bicyclists this will be ''"
- [x] **Fallback behavior**: AI instructed to return `""` (empty string) when unsure — NOT "N/A", not any letters

### Debug Logging (Approve Pipeline)

- [x] **`app/api/approve/route.ts`** — `log()` helper with `[Approve][Step N]` prefix; logs at every step:
  - Step 0: pipeline start with client/matter/email info
  - Step 1: custom field count and update result
  - Step 2: retainer template ID and filename
  - Step 3: calendar ID and SOL date
  - Step 4: document list, matching, download size, retry attempts
  - Step 5: email recipient, Calendly type, PDF attach status, Resend result
  - Pipeline total duration on success and failure
- [x] **`lib/clio.ts`** — `clog()` helper with `[Clio][functionName]` prefix:
  - `clioFetch()`: HTTP method + path, response time, status, error body (first 500 chars)
  - `updateMatterCustomFields()`: existing field count, merge stats (N updates, N new)
  - `getMatterDocuments()`: document count
  - `downloadDocument()`: version info, download byte count, failure messages
  - All other functions: key parameter logging
- [x] **`lib/email.ts`** — `elog()` helper with `[Email]` prefix:
  - AI paragraph drafting time and char count
  - Calendly link type (office vs virtual)
  - PDF attachment filename and size
  - Resend API response time and result

### Pipeline Resilience (Download Step)

- [x] **`downloadDocument()` in `lib/clio.ts`** — wrapped in try-catch; returns `null` on failure instead of throwing
- [x] **Step 4 in approve route** — wrapped in outer try-catch; retries up to 3 times (wait 4s, 5s, 5s = ~14s total); non-fatal if all retries fail — pipeline continues to email step
- [x] **Email sent without PDF** if download fails — the `retainerPdf` will be an empty Buffer, and the step shows status "skipped" with explanation

---

## In Progress

- [ ] **End-to-end pipeline testing** — the 500 error on approve was caused by `downloadDocument` throwing; the retry + try-catch fix has been applied but NOT yet re-tested
- [ ] **All 5 test PDFs** — need full extraction + approve + verify for each

---

## Blocked / Issues

| Issue | Detail | Status |
|-------|--------|--------|
| Approve 500 error | `downloadDocument` threw when Clio returned error on PDF download. Root cause: either timing (doc not ready) or EU token permissions. | **Fixed** — try-catch + retry logic applied. Needs re-test. |
| Resend API key | Not configured in `.env.local` → email step will fail | Blocked — need to sign up at resend.com |
| US Clio account | Required for hackathon submission — EU account is dev-only | Blocked — need VPN + clio.com signup |
| EU write permissions | EU test token can't create contacts/matters via API | Workaround: created manually in Clio UI |

---

## Key Files Changed (Session 4)

| File | Lines | What Changed |
|------|-------|-------------|
| `app/dashboard/page.tsx` | ~1222 | +15 state vars, symmetric form (both sides show all fields), flags always visible, vehicle badges empty when 0, reset updated |
| `lib/providers/types.ts` | 197 | ins_code prompt: 1-5 digits, neutral examples, extract-exactly rule, empty-string fallback |
| `app/api/approve/route.ts` | 185 | `log()` helper, 5-step debug logging, Step 4 retry loop (3 attempts), try-catch for non-fatal download |
| `lib/clio.ts` | 232 | `clog()` helper, all functions logged, `downloadDocument` wrapped in try-catch |
| `lib/email.ts` | 122 | `elog()` helper, AI draft timing, Calendly type, PDF size, Resend timing |

All 5 files have uncommitted changes (`git status -s` shows `M` on each).

---

## State Variable Inventory (Dashboard)

### Client Section (21 vars)
```typescript
clientFirst, clientLast, clientGender, clientEmail,
clientPlate, clientPlateState, clientVehicleYearMake, clientVehicleType, clientInsCode,
clientAddress, clientCity, clientState, clientZip,
clientIsVehicle, clientVehicleNum, clientIsBicyclist, clientIsPedestrian, clientIsOtherPed,
showClientFlags (always true)
```

### Defendant Section (20 vars)
```typescript
defendantFirst, defendantLast,
defendantPlate, defendantPlateState, defendantVehicleYearMake, defendantVehicleType, defendantInsCode,
defendantAddress, defendantCity, defendantState, defendantZip,
defendantVehicle (combined year+make+type string),
defendantIsVehicle, defendantVehicleNum, defendantIsBicyclist, defendantIsPedestrian, defendantIsOtherPed,
showDefendantFlags (always true)
```

### Accident / Location / Pipeline (15 vars)
```typescript
accidentDate, accidentTime, dayOfWeek, noVehicles, noInjured, noKilled,
showExtraAccident, accidentLocation, officerNotes,
matterId, statuteDate, clientEmail (also in client),
phase, steps[], error
```

### Total: ~65 state variables in dashboard

---

## Bugs Fixed (Session 4)

| Bug | Symptom | Root Cause | Fix | File |
|-----|---------|-----------|-----|------|
| "Vehicle 2" badge shown before extraction | Blue "Vehicle" badge with "2" appeared in Defendant section before any PDF uploaded | `defendantVehicleNum` defaulted to `useState(2)`, `defendantIsVehicle` to `useState(true)` | Changed defaults to `0` and `false` | `page.tsx` |
| Client pedestrian flag not visible | Castillo (pedestrian) showed no flag indicators in Client section | Client section had no party type flag fields; only Defendant section had them | Added 5 client flag state vars + UI elements | `page.tsx` |
| Defendant missing vehicle details | Defendant section showed no plate/address/vehicle fields | Only Client section had vehicle detail fields | Added 9 defendant detail state vars + UI elements | `page.tsx` |
| Ins code "36" misread as "639" | AI extracted "639" from a report that clearly shows "36" | Prompt said "3-5 digit" and used "639" as first example, biasing AI toward 3+ digits | Changed to "1-5 digits", neutral examples, "extract EXACTLY" rule | `types.ts` |
| Client flags hidden behind toggle | Pedestrian/Bicyclist flags needed "Show Flags" click | `showClientFlags` defaulted to `false` with conditional rendering | Flags always rendered, no toggle button | `page.tsx` |
| Approve 500 on document download | Pipeline crashed when Clio PDF download failed | `downloadDocument` → `clioFetch` threw on non-OK response, no try-catch | try-catch in `downloadDocument` + retry loop in approve route | `clio.ts`, `approve/route.ts` |

---

## Architecture Snapshot

```
Browser (React dashboard — 1222 lines, single file)
    │
    ├── POST /api/extract (91 lines)
    │     → AI Provider (Claude Vision / GPT-4o)
    │     → Supabase Storage (PDF) + DB (extraction JSON)
    │
    ├── POST /api/match (117 lines)
    │     → Clio API: GET /matters (list open)
    │     → Clio API: GET /contacts/{id} (get email)
    │     → Returns: matched matter + client/defendant identification
    │
    ├── POST /api/approve (185 lines) — 5-step pipeline:
    │     Step 1: Clio API: PATCH /matters/{id} (custom fields — merge existing)
    │     Step 2: Clio API: POST /document_automations (generate retainer)
    │     Step 3: Clio API: POST /calendar_entries (SOL date)
    │     Step 4: Clio API: GET /documents + GET /document_versions/{id}/download
    │              (retry 3x, non-fatal if fails)
    │     Step 5: AI draft paragraph → Resend API (send email with PDF)
    │
    └── GET /api/reports (47 lines)
          → Supabase DB (list/fetch saved reports)
```

### Lib Files
```
lib/clio.ts        (232 lines) — 8 Clio API endpoints + logging
lib/email.ts       (122 lines) — AI paragraph + Resend sending + logging
lib/providers/
  types.ts         (197 lines) — ExtractionResult types + EXTRACTION_PROMPT + DRAFT_PROMPT
  anthropic.ts     (62 lines)  — Claude Sonnet implementation
  openai.ts        (76 lines)  — GPT-4o implementation
lib/ai.ts          (29 lines)  — Provider router (env flag switch)
lib/calendly.ts    (18 lines)  — Seasonal office/virtual link logic
lib/supabase.ts    (18 lines)  — Client + table/bucket constants
lib/extraction.ts  (7 lines)   — Thin wrapper
```

---

## Environment Variables (30 total)

Grouped in `.env.example`:

1. **Clio API** (6): `CLIO_BASE_URL`, `CLIO_CLIENT_ID`, `CLIO_CLIENT_SECRET`, `CLIO_ACCESS_TOKEN`, `CLIO_CALENDAR_ID`, `CLIO_TEMPLATE_ID`
2. **Clio Custom Field IDs** (8): `CLIO_FIELD_ACCIDENT_DATE` through `CLIO_FIELD_STATUTE_DATE`
3. **AI Provider** (4): `AI_PROVIDER_ANTHROPIC`, `AI_PROVIDER_OPENAI`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
4. **Supabase** (2): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
5. **Email** (1): `RESEND_API_KEY`
6. **App Config** (5+1): `LAW_FIRM_NAME`, `ATTORNEY_NAME`, `STATUTE_YEARS`, `CALENDLY_OFFICE`, `CALENDLY_VIRTUAL`, `HACKATHON_EMAIL`

### Current `.env.local` State

| Group | Status |
|-------|--------|
| Clio API (EU) | ✅ Filled (EU test account — App ID 4100) |
| Clio Custom Field IDs | ✅ Filled (EU field IDs) |
| AI Provider | ✅ Filled (both keys, currently OpenAI) |
| Supabase | ✅ Filled |
| Resend | ❌ **EMPTY** — needs API key |
| App Config | ✅ Filled |

---

## Clio Integration State

### EU Test Account
```
Base URL:      https://eu.app.clio.com
App ID:        4100
Client ID:     gAB5MWWemVFYpBqt5Mf2WRpPdxDVegujAcp2q0oC
Client Secret: 8EcCDxt37YFwhqukLFwUem3fI6B3TIrqzxxgjHlj
Token:         4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT
Calendar ID:   437603
Template ID:   359618
```

### Proven Clio API Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v4/matters` (list) | GET | ✅ Works | With `status=open`, returns up to 200 |
| `/api/v4/matters/{id}` (read) | GET | ✅ Works | With `custom_field_values` fields |
| `/api/v4/matters/{id}` (update) | PATCH | ✅ Works | Custom field merge (GET existing → include IDs) |
| `/api/v4/contacts/{id}` | GET | ✅ Works | Email addresses return IDs, not strings |
| `/api/v4/document_automations` | POST | ✅ Works | `formats: ["pdf"]` must be array |
| `/api/v4/documents` (list) | GET | ✅ Works | Filter by `matter_id` |
| `/api/v4/documents/{id}` | GET | ⚠️ Needs test | Gets `latest_document_version` |
| `/api/v4/document_versions/{id}/download` | GET | ⚠️ Needs test | May fail on EU token — non-fatal |
| `/api/v4/calendar_entries` | POST | ✅ Works | Uses `calendar_owner.id` = calendar ID |

### Clio API Gotchas (cumulative)

1. Custom fields: `"custom_field": {"id": 123}` — NOT `"custom_field_id": 123`
2. Custom field update: GET existing values first, include their `id` to update (not duplicate)
3. Document automation: `"formats": ["pdf"]` must be an array
4. Calendar owner: use CALENDAR ID, not User ID
5. Contact email: `email_addresses` returns objects with IDs, not email strings — workaround: `HACKATHON_EMAIL` env var
6. EU write permissions: token can't create contacts/matters via API — create manually in UI
7. Document download: may fail if document not yet generated — needs retry + graceful failure

---

## AI Extraction Prompt Summary

Location: `lib/providers/types.ts` → `EXTRACTION_PROMPT`

Key design decisions:
1. **Physical form layout** — describes exact position of every MV-104AN field (Box A-F, rows, vehicle sections)
2. **Box D/E/F DOUBLE-CHECK** — forces AI to write raw readings into `header_raw` debug field
3. **Ins code: 1-5 digits** — neutral examples ("36", "42", "100", "11433"), extract-exactly rule
4. **Plate separation** — plate_number is text only, plate_state is separate 2-letter code
5. **Pedestrian/bicyclist** — vehicle fields should be empty strings `""`
6. **Empty-string fallback** — AI returns `""` when unsure, never "N/A"

Extracted fields: 32+ (see `docs/field-mapping.csv`)

---

## What's Left To Do

### Priority 1: Re-test the Approve Pipeline
- [ ] Re-run approve for Reyes case after the download retry fix
- [ ] Check server console logs for the new `[Approve]`, `[Clio]`, `[Email]` prefixed output
- [ ] Verify Steps 1-3 complete, Step 4 either succeeds or gracefully skips, Step 5 may fail (no Resend key)

### Priority 2: Get Resend API Key
- [ ] Sign up at resend.com (free tier)
- [ ] Put `RESEND_API_KEY` in `.env.local`
- [ ] Re-test full pipeline end-to-end

### Priority 3: Test All 5 PDFs
- [ ] Reyes v Francois — standard case (V1 = client)
- [ ] Noel v Freese — female client (she/her pronouns)
- [ ] Castillo v Dorjee — **V2 pedestrian** (client has no vehicle)
- [ ] Grillo v Kim — **V2 bicyclist** (client has no vehicle)
- [ ] Vincent v Trent — female client, check no_injured

### Priority 4: US Clio Account Setup
- [ ] Create US Clio account at clio.com (use VPN if in EU)
- [ ] Register app → Client ID, Client Secret
- [ ] Get OAuth token
- [ ] Create 8 custom fields → get field IDs
- [ ] Upload retainer template → get template ID
- [ ] Create 5 test Matters with Contacts
- [ ] Get attorney calendar ID
- [ ] Update `.env.local` (change `CLIO_BASE_URL` to `https://app.clio.com`)

### Priority 5: Submission
- [ ] Record 15-minute demo video
- [ ] Write Email #1 (team intro)
- [ ] Write Email #2 (technical approach)
- [ ] Send Email #3 (Guillermo Reyes retainer — auto-generated)
- [ ] Deploy to Vercel with US Clio credentials

---

## Git Status

### Uncommitted changes (5 files):
```
M app/api/approve/route.ts
M app/dashboard/page.tsx
M lib/clio.ts
M lib/email.ts
M lib/providers/types.ts
```

### Recent commits:
```
58b98b2 Enhance dashboard functionality with additional state management
60c30f8 Update .gitignore to include Claude settings file
ba32ef6 Update ANALYSIS and CLAUDE_CODE_BRIEFING
15621e7 Add Supabase integration for PDF extraction and storage
1adc71d Update project configuration and structure
3f353ff all done now do the backend work
76c5e40 extraction start working, clio credentials testing
fa64ee0 first setup
```

---

## Session History (Cumulative)

| Session | Date | Focus | Key Outcomes |
|---------|------|-------|-------------|
| 1 | Feb 28, 2026 | Initial build | Full MVP: all routes, all lib files, dual AI, 14 mockups, Vercel deploy |
| 2 | Mar 1 (AM) | UI refinement | Dashboard restructure, defendant flags, field-mapping CSV, ins_code extraction |
| 3 | Mar 1 (PM) | Bug fixes + testing | Custom field merge fix, prompt rewrite for OCR accuracy, Supabase schema fix, security cleanup, 5 test Matters |
| **4** | **Mar 2** | **UI symmetry + pipeline** | **Symmetric form (both sides all fields), ins_code prompt fix, debug logging, download retry + resilience** |

---

## Quick Reference

| Need to... | Look at... |
|-----------|-----------|
| Change the AI extraction prompt | `lib/providers/types.ts` (line 54+) |
| Change how Clio fields are pushed | `app/api/approve/route.ts` (line 59-86) |
| Change the email template | `lib/email.ts` (line 86-99) |
| Change Clio API calls | `lib/clio.ts` |
| Change the dashboard UI | `app/dashboard/page.tsx` |
| Add/change debug logging | `log()` in approve, `clog()` in clio, `elog()` in email |
| See all extracted fields | `docs/field-mapping.csv` |
| Understand the Clio API | `CLAUDE_CODE_BRIEFING.md` |
| Understand the business problem | `ANALYSIS.md` |
| See test case details | `ANALYSIS.md` ("5 Test Cases Compared") |

---

## Notes for Next Session

1. **The 500 error fix is untested** — the retry + try-catch was applied but the user hasn't re-run the approve pipeline yet. First action should be to re-test.
2. **All 5 modified files are uncommitted** — consider committing before making more changes.
3. **Dashboard is ~1222 lines** in a single file — if it gets much larger, consider extracting sections into components.
4. **The `registrationPlate` sent to Clio approve is `clientPlate`** (line 414) — this is correct for the hackathon (client's plate goes to Clio custom field "Registration Plate").
5. **Empty Buffer workaround**: When retainerPdf is null, the email is sent with `Buffer.from("")` (empty attachment). This might cause issues with Resend — may need to conditionally omit the attachment entirely.
6. **Debug logging is verbose** — good for development, but should be reduced or made conditional before production deployment.
