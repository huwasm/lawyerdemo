# TASKS — Implementation Backlog

> Last updated: 2026-03-02
> Priority: top = do first, bottom = do last


## Flow Diagram

[1] Team member uploads police report PDF to dashboard
       |
       v
[2] AI extracts all fields → structured JSON
    Uses OpenAI GPT-4o (default) or Anthropic Claude — switchable via env flag
    Extracts ALL names, dates, locations, vehicle info, officer notes
       |
       v
[3] AUTO-MATCH to Clio Matter
    API gets all Matters with client names → matches by First+Last name
    → Identifies: who is client, who is defendant, which Matter to update
    → Also retrieves client email from the Contact
       |
       v
[4] DASHBOARD shows:
    - Extracted fields (editable)
    - Matched client name (highlighted)
    - Client email (from Clio Contact)
    - Confidence scores per field
    Team reviews, corrects if needed
       |
       v
[5] Press "APPROVE" → everything below is automatic, zero human input:
    |
    |---> [5a] Custom fields pushed into Clio Matter (PATCH /matters)
    |
    |---> [5b] Retainer Agreement generated in Clio (POST /document_automations)
    |
    |---> [5c] Statute of Limitations calendar entry (POST /calendar_entries)
    |          Date = accident date + 8 years
    |
    |---> [5d] Download retainer PDF from Clio
    |
    |---> [5e] Send personalized email to client with:
               - Retainer PDF attached
               - Warm tone referencing their accident (AI-drafted from officer notes)
               - Seasonal Calendly link (Mar-Aug → office / Sep-Feb → virtual)
    |
    DONE. Nothing else needs to happen. Pipeline complete.





---

## Phase 2: Clio Custom Fields (DONE)

- [x] Query EU Clio: `GET /custom_fields?fields=id,name` — check what exists
- [x] Create 8 custom fields via API (`POST /custom_fields`)
- [x] Get all 8 field IDs → put in `.env.local` + `.env.vercel`

### Custom Field IDs (EU Account)

| # | Name | Type | ID | Default | Required |
|---|---|---|---|---|---|
| 1 | Accident Date | date | 482348 | true | false |
| 2 | Accident Location | text_line | 482369 | true | false |
| 3 | Defendant Name | text_line | 483293 | true | false |
| 4 | Client Gender | picklist (Male/Female) | 483299 | true | false |
| 5 | Registration Plate | text_line | 483302 | true | false |
| 6 | Number Injured | numeric (integer) | 483296 | true | false |
| 7 | Accident Description | text_area | 483305 | true | false |
| 8 | Statute of Limitations Date | date | 483308 | true | false |

**Deleted**: Injury Present (482372, checkbox) — replaced by Number Injured

### Why custom fields?

**A) In Clio**: Clio is a CRM (Client Relationship Management) for lawyers. Custom fields let us store extracted police report data (accident date, defendant name, etc.) directly on each Matter (case). This is where the data lives in the CRM — queryable, reportable, and visible to the attorney.

**B) In `.env.local` + `.env.vercel`**: Our app code needs to know *which* Clio field ID to write to. When we `PATCH /matters/{id}`, we send `{id: 482348, value: "12/06/2018"}`. The code reads `CLIO_FIELD_ACCIDENT_DATE` from the env to get that ID number.

**C) Why Vercel too?**: Our Next.js app runs on Vercel in production. The API routes (`/api/extract`, `/api/match`, `/api/approve`) run as serverless functions on Vercel's servers — they need the same env vars to connect to Clio, OpenAI, Anthropic, and Resend. `.env.local` = localhost, `.env.vercel` = production.

---

## Phase 3: Test AI Extraction

- [ ] Upload Guillermo Reyes PDF → verify all fields correct
- [ ] Verify confidence scores display
- [ ] Test with OpenAI provider (current default)
- [ ] Test with Anthropic provider (switch env flag)

---

## Phase 4: Test Clio Match

- [ ] Verify `/api/match` finds EU test Matter (ID 14525933)
- [ ] Verify client name fuzzy matching works
- [ ] Confirm contact email fallback (known issue with nested field syntax)

---

## Phase 5: Test Custom Field PATCH

- [ ] `PATCH /matters/14525933` with all 8 custom fields
- [ ] Verify in Clio UI that fields populated on Matter

---

## Phase 6: Test Retainer Generation (DONE — EU)

- [x] `POST /document_automations` → verified, creates PDF in Clio
- [x] List documents on Matter → finds generated retainer by name filter
- [x] Download retainer PDF — **EU uses `GET /documents/{id}/download.json`** (NOT `/document_versions/{id}/download` which returns 404 on EU)
- [x] Download confirmed: 135,158 bytes, valid PDF, via 303 redirect → S3

> **EU-WORKAROUND:** Code in `lib/clio.ts` → `downloadDocument()` uses `/documents/{id}/download.json` with manual redirect handling (strips Auth header before following to S3). Search for `EU-WORKAROUND` in the code. US Clio may support the standard endpoint — test during Phase 13.

---

## Phase 7: Test Calendar Entry (DONE — EU)

- [x] `POST /calendar_entries` → SOL date (accident + 8 years)
- [x] Verified calendar entry created on Calendar ID 437603

---

## Phase 8: Test Email (DONE — EU)

- [x] Resend sends email to `hwasmer1@gmail.com` (free tier only sends to account owner)
- [x] Email contains: AI-drafted paragraph, retainer PDF attachment (135KB), Calendly link
- [x] Seasonal Calendly logic confirmed (Nov → virtual link)
- [x] Resend API key: `re_6qt6Pu4n_...` (old key `re_gj55WNM8_...` was revoked)

> **Limitation:** Resend free tier with `onboarding@resend.dev` sender can only send to account owner email (`hwasmer1@gmail.com`). To send to `talent.legal-engineer...@swans.co`, need verified domain at resend.com/domains.

---

## Phase 9: Full End-to-End (DONE — EU, Castillo case)

- [x] Upload Castillo PDF → extract → review → approve → **all 5 steps green**
- [x] Verified in Clio: custom fields, retainer, calendar
- [x] Email received in Gmail (`hwasmer1@gmail.com`) with retainer PDF attached
- [x] Full pipeline: **9,932ms (~10 seconds)**

```
Pipeline run — 2026-03-02 — Castillo v Dorjee
Step 1: Custom fields      ✅  8 fields updated (236ms + 253ms)
Step 2: Retainer generated  ✅  Template #359618 (137ms)
Step 3: Calendar entry      ✅  SOL 2030-11-16 (429ms)
Step 4: PDF download        ✅  135,158 bytes from S3 (EU workaround)
Step 5: Email sent          ✅  Resend ID a9f3e8e7-... (502ms)
```

- [ ] Still need: test Reyes (demo case), Noel, Grillo, Vincent → see Phase 10

---

## Phase 10: Edge Case Testing

- [ ] Darshame Noel — Female (she/her), gender=F
- [ ] Fausto Castillo — Pedestrian, V2 is client, no plate → "N/A", injured=1
- [ ] John Grillo — Bicyclist, V2 is client, same last names both parties
- [ ] Mardochee Vincent — Female, commercial vehicle, same last names

---

## Phase 11: Onboarding Screens

3 user types, each gets a tailored first-run experience:

### 1. Lawyer Boss (Andrew Richards) — firm owner/attorney
- Overview of what the tool does (30-second pitch)
- ROI: time saved per intake, error reduction
- Admin settings: toggle which pre-approve checklist items are required vs hidden
- Link to Clio integration status

### 2. Dashboard Operator (paralegal/legal assistant) — daily user

**Upload step:**
- Desktop: drag-and-drop PDF, or click to browse
- Mobile: camera capture (photo → image extraction), or file picker
- Supports PDF, JPG, PNG

**Review step:**
- All extracted fields shown, editable
- Confidence badges (green/yellow/red) per field
- Matched client name highlighted

**Pre-Approve Checklist (surgical checklist concept):**
Before the "Approve" button activates, operator must check off items like:
1. ☐ Client name matches Clio Matter
2. ☐ Accident date is correct
3. ☐ Defendant name is correct
4. ☐ All vehicle/pedestrian info verified
5. ☐ Officer notes reviewed

**Admin configurable**: Lawyer Boss can show/hide checklist items from admin settings. Only visible items are required. Config stored in Supabase (or env/JSON initially).

**No-match handling:**
- If auto-match fails → 3 options:
  1. Search Clio Matters manually (search bar in dashboard)
  2. Edit extracted fields and retry match
  3. Skip match — enter Matter ID directly in the dashboard (power user). App calls `GET /matters/{id}` to pull details from Clio.

**Post-Approve confirmation:**
- All 5 pipeline steps show traffic lights (green ✓ / yellow ⏳ / red ✗)
- Daily log of processed reports (table view)
- Click any report to see full audit trail

### 3. Swans Team (hackathon judges) — evaluators
- Quick demo walkthrough
- Explains the 5-step pipeline
- Shows sample before/after (PDF → Clio fields populated)
- Link to run a demo report

---

## Phase 10B: Session Persistence & Redo / Overwrite Logic

### Problem
When the dashboard has a report loaded (extracted data, matched matter, review in progress) and the page reloads — everything is lost. All state is in React `useState`, nothing survives a refresh.

### What's needed

**A) Save state to database (Supabase)**
- After extraction → save extracted JSON + filename + status "draft" to `intake_reports`
- After match → update row with `matter_id`
- On page load → check for in-progress drafts, offer to resume
- After approve → update status to "approved" or "error"
- This means Phase 12 (Supabase) is a prerequisite for this, or we implement both together

**B) Redo / Retry logic**
- If approve partially fails (e.g. custom fields updated but retainer generation failed):
  - Traffic light shows: ✅ Fields → ✅ Retainer → ❌ Calendar → ⏳ Email
  - "Retry" button appears next to failed steps
  - Retry only re-runs the failed step(s), not the whole pipeline
- Questions to investigate (DO NOT CHECK NOW, just track):
  - Can we `PATCH /matters/{id}` again with same custom fields? (overwrite safe?)
  - Can we `POST /document_automations` again? (creates duplicate retainer?)
  - Can we `POST /calendar_entries` again? (creates duplicate calendar entry?)
  - Does Clio have idempotency keys or upsert behavior?

**C) Report history & status**
- Processed reports list (table view) with traffic light status per report
- Columns: Date, Filename, Matter, Client, Status (green/yellow/red), Actions
- Click to expand → see audit log per step
- Filter: All / Completed / Failed / In Progress
- "Redo" button on failed reports → reopens review screen with saved data

### Dependencies
- Requires Phase 12 (Supabase) to be done first (or done together)
- Approve API route needs to be refactored to support per-step retry

---

## Phase 12: Supabase — Audit Trail & Deduplication

### Why
Legal tools need audit trails. Every report processed, every action taken, traceable. Also prevents duplicate processing — if Matter X was already processed, warn the user.

### Tables

**`intake_reports`**
| Column | Type | Purpose |
|---|---|---|
| id | uuid | Primary key |
| created_at | timestamptz | When report was uploaded |
| filename | text | Original PDF filename |
| extracted_json | jsonb | Full AI extraction result |
| matter_id | int | Clio Matter ID (for dedup) |
| matter_name | text | e.g. "Reyes v Francois" |
| client_name | text | Matched client |
| status | text | draft / approved / error |
| approved_at | timestamptz | When user clicked approve |
| approved_by | text | User email (if auth enabled) |
| error_message | text | If pipeline failed |

**`audit_log`**
| Column | Type | Purpose |
|---|---|---|
| id | uuid | Primary key |
| created_at | timestamptz | When action happened |
| report_id | uuid | FK → intake_reports |
| action | text | extracted / matched / fields_updated / retainer_generated / calendar_created / email_sent |
| detail | jsonb | Action-specific data (e.g. field IDs, doc ID, email ID) |
| success | bool | Did it work? |
| error | text | Error message if failed |

### Deduplication Logic
- Before `POST /api/approve`: check `intake_reports` for existing row with same `matter_id` + `status = 'approved'`
- If found → show warning: "This Matter was already processed on {date}. Continue anyway?"
- User can override, but it's logged

### Integration Points
| File | What to add |
|---|---|
| `app/api/extract/route.ts` | Insert `intake_reports` row (status=draft) after extraction |
| `app/api/match/route.ts` | Update row with `matter_id` + check for duplicates |
| `app/api/approve/route.ts` | Insert `audit_log` entries at each pipeline step, update status to approved |
| `app/dashboard/page.tsx` | Show duplicate warning if match returns existing report |

### Auth (Optional)
- Google sign-in via Supabase Auth
- Simple: just need email to track who approved what
- Skip if time is short — can use "anonymous" in `approved_by`

---

## Phase 13: US Clio Account Switch

> **Full checklist:** See [`docs/EU_TO_US_MIGRATION.md`](EU_TO_US_MIGRATION.md) for step-by-step with curl commands.
> **Zero code changes needed** — everything is env vars.

- [ ] **Step 1:** Create US Clio account (VPN to US → clio.com → free trial, firm "Richards & Law")
- [ ] **Step 2:** Register app in US Clio → get `CLIO_CLIENT_ID` + `CLIO_CLIENT_SECRET`
- [ ] **Step 3:** OAuth flow → get `CLIO_ACCESS_TOKEN`
- [ ] **Step 4:** Create 8 custom fields → get all `CLIO_FIELD_*` IDs
- [ ] **Step 5a:** Upload retainer template → get `CLIO_TEMPLATE_ID`
- [ ] **Step 5b:** Get `CLIO_CALENDAR_ID` for Andrew Richards
- [ ] **Step 5c:** Create 5 test Matters + Contacts (Reyes, Noel, Castillo, Grillo, Vincent)
- [ ] **Step 6:** Test download endpoint on US (may support standard `/document_versions/{id}/download`)
- [ ] **Step 7:** Update `.env.local` — 14 Clio env vars (see migration doc for full table)
- [ ] **Step 8:** Update `.env.vercel` — same 14 vars, then redeploy
- [ ] **Step 9:** Run full pipeline (Phase 9) on US — verify all 5 steps green
- [ ] **Step 10:** Change `HACKATHON_EMAIL` to `talent.legal-engineer.hackathon.automation-email@swans.co` (requires verified Resend domain)

### EU↔US Quick Switch
```bash
# Save current config:
cp .env.local .env.eu    # EU backup
cp .env.local .env.us    # US backup (after setting up US)

# Switch to EU:
cp .env.eu .env.local && npm run dev

# Switch to US:
cp .env.us .env.local && npm run dev
```

---

## Phase 14: UI Polish & Mobile

- [ ] Pick intake design (5 mobile + 5 desktop mockups in `docs/design-mockup/`)
- [ ] Implement responsive layout
- [ ] Add camera capture for mobile (photo → image extraction)
- [ ] Add image file support (JPG/PNG → AI extraction)
- [ ] Pick admin design (2 options in `docs/design-mockup/admin/`)

---

## Phase 15: Deploy & Submit

- [ ] Import `.env.vercel` into Vercel
- [ ] Verify production build works
- [ ] Run all 5 reports on production
- [ ] Record 15-min demo video
- [ ] Send 3 submission emails

---

## Done

- [x] Phase 0: Route rename (`/` → `/dashboard`) — `app/dashboard/page.tsx`
- [x] Phase 1: `.env.vercel` created, `.env.local` filled, port 3001
- [x] Phase 2: Clio custom fields created (8 fields, EU account)
- [x] Phase 5: Custom field PATCH — 8 fields update on approve
- [x] Phase 6: Retainer generation + download (EU workaround: `/documents/{id}/download.json`)
- [x] Phase 7: Calendar entry creation (SOL = accident + 8 years)
- [x] Phase 8: Email sending via Resend (with PDF attachment, AI-drafted paragraph, Calendly link)
- [x] Phase 9: Full pipeline 5/5 — Castillo case on EU (2026-03-02, ~10s)
- [x] Session 5: Fixed download 404 (EU endpoint), fixed Resend 401 (new API key), fixed Resend 403 (recipient restriction)
