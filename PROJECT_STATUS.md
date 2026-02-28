# PROJECT STATUS — Hackathon Checklist

> Last updated: 2026-02-28
> This file is the single source of truth for what's done, what's broken, and what's TODO.

---

## 1. API Calls Tested (EU account: eu.app.clio.com)

### Working

| API Call | Endpoint | Gotcha |
|---|---|---|
| OAuth Token Exchange | `POST /oauth/token` | MUST use `application/x-www-form-urlencoded`, NOT JSON |
| Get Matter with Client | `GET /matters/{id}?fields=client{name}` | Use `fields=` to include client relation |
| Update Custom Fields | `PATCH /matters/{id}` | Send `custom_field_values` array with `{id, value}` |
| Generate Retainer PDF | `POST /document_automations` | Undocumented endpoint! Needs `template_id` + `matter_id` |
| List Documents | `GET /documents?matter_id=X` | Use to find generated retainer doc ID |
| Get Document Info | `GET /documents/{id}` | Returns `latest_document_version.id` (760390130) |
| Create Calendar Entry | `POST /calendar_entries` | Needs `calendar_owner.id` = **CALENDAR ID**, not User ID! |
| List Calendars | `GET /calendars` | Found Calendar ID 437603 (Eric Wang) |

### Broken — Needs Fix

| API Call | Endpoint | Problem | Next step |
|---|---|---|---|
| Get Contact Email String | `GET /contacts/{id}?fields=email_addresses{address}` | Error: invalid field syntax | Try `?fields=email_addresses` without nesting |
| Download PDF from Clio | `GET /documents/{id}/download` | Empty response | Try `GET /document_versions/760390130/download` |

### Not Yet Tested

| API Call | Endpoint | Why needed |
|---|---|---|
| Download via Version ID | `GET /document_versions/760390130/download` | Alternative PDF download approach |
| Contact email (simple) | `GET /contacts/{id}?fields=email_addresses` | Get email without nested field syntax |
| List Custom Fields | `GET /custom_fields.json` | Need field IDs for PATCH calls |
| Search Matters by name | `GET /matters?query=Castillo` | Needed for auto-match flow |

---

## 2. What We Already Have

### Credentials (EU Test Account)

| Item | Value |
|---|---|
| Base URL | `https://eu.app.clio.com` |
| App ID | 4100 |
| Client ID | `gAB5MWWemVFYpBqt5Mf2WRpPdxDVegujAcp2q0oC` |
| Client Secret | `8EcCDxt37YFwhqukLFwUem3fI6B3TIrqzxxgjHlj` |
| Access Token | `4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT` |
| Matter ID (test) | 14525933 |
| Contact ID (test) | 22674092 |
| Calendar ID | 437603 (Eric Wang) |
| Template ID | 359618 |

### Data from Clio Matter (pre-created by paralegal)

- Client First Name (from Contact on Matter)
- Client Last Name (from Contact on Matter)
- Client Email (on the Contact in Clio)
- Responsible Attorney (on the Matter)

---

## 3. Retainer Merge Fields

| Merge Field | Source | Where in Police Report | Clio Custom Field | Notes |
|---|---|---|---|---|
| `[Client Name]` | Police Report → AI | Driver Name (V1 or V2) | Contact First+Last | Matched by Clio Matter client name |
| `[Law Firm Name]` | Hardcoded | N/A | N/A | "Richards & Law" |
| `[Date of Accident]` | Police Report → AI | Box 1 — Month/Day/Year | Accident Date (date) | Always present |
| `[Defendant Name]` | Police Report → AI | Driver Name (other party) | Defendant Name (text_line) | The non-client party |
| `[his/her]` | Police Report → AI | Box 3 — Sex (M/F) | Client Gender (picklist) | M→his, F→her. Appears 7+ times |
| `[he/she]` | Police Report → AI | Box 3 — Sex (M/F) | Client Gender (picklist) | Same field |
| `[Accident Location]` | Police Report → AI | Box 28/29 — Road + intersection | Accident Location (text_line) | Combine road + intersection + borough |
| `[Registration Plate Number]` | Police Report → AI | Box 4/5 — Plate Number | Registration Plate (text_line) | Empty if pedestrian/cyclist → "N/A" |
| `[Statute of Limitations Date]` | Calculated | N/A | Statute of Limitations Date (date) | Accident date + 8 years |
| `[Name of Client]` | Police Report → AI | Same as Client Name | Contact Name | Signature line |
| `[Name of Attorney]` | Hardcoded | N/A | N/A | "Andrew Richards" |

### Conditional paragraphs

- IF `No. Injured > 0` → include bodily injury paragraph
- IF `No. Injured = 0` → include property damage only paragraph

---

## 4. Custom Fields to Create in Clio

| # | Field Name | Clio Type | Maps to | Field ID |
|---|---|---|---|---|
| 1 | Accident Date | date | `[Date of Accident]` | _fill after creation_ |
| 2 | Accident Location | text_line | `[Accident Location]` | _fill after creation_ |
| 3 | Defendant Name | text_line | `[Defendant Name]` | _fill after creation_ |
| 4 | Client Gender | picklist (Male/Female) | `[his/her]`, `[he/she]` | _fill after creation_ |
| 5 | Registration Plate | text_line | `[Registration Plate Number]` | _fill after creation_ |
| 6 | Number Injured | numeric | Conditional paragraph trigger | _fill after creation_ |
| 7 | Accident Description | text_area | Email personalization | _fill after creation_ |
| 8 | Statute of Limitations Date | date | `[Statute of Limitations Date]` | _fill after creation_ |

---

## 5. Email Fields

| Field | Source | Example (Guillermo case) |
|---|---|---|
| To (email) | Clio Contact email | hackathon email for submission |
| Client First Name | Police Report → AI | "Guillermo" |
| Date of Accident | Police Report → AI | "December 6, 2018" |
| Accident narrative | Officer Notes → AI rewrite | Warm version of officer notes |
| Retainer PDF attachment | Downloaded from Clio | Generated by document automation |
| Calendly Link | Seasonal logic | Mar-Aug = office, Sep-Feb = virtual |
| Signature | Hardcoded | "Andrew Richards" |

---

## 6. Clio Setup Tasks (inside Clio UI)

### Account & App Registration

- [ ] 1. Create US Clio Manage account (clio.com → Sign Up, need VPN from EU)
- [ ] 2. Register new Developer App (Settings → API → Developer Applications → Add)
- [ ] 3. Copy Client ID → `CLIO_CLIENT_ID` in .env
- [ ] 4. Copy Client Secret → `CLIO_CLIENT_SECRET` in .env
- [ ] 5. Set Redirect URI: `http://localhost:3000/api/auth/callback/clio`
- [ ] 6. Run OAuth flow → get Access Token → `CLIO_ACCESS_TOKEN` in .env

### Create 8 Custom Fields

- [ ] 7. "Accident Date" — type: date, parent: Matter
- [ ] 8. "Accident Location" — type: text_line, parent: Matter
- [ ] 9. "Defendant Name" — type: text_line, parent: Matter
- [ ] 10. "Client Gender" — type: picklist (Male/Female), parent: Matter
- [ ] 11. "Registration Plate" — type: text_line, parent: Matter
- [ ] 12. "Number Injured" — type: numeric, parent: Matter
- [ ] 13. "Accident Description" — type: text_area, parent: Matter
- [ ] 14. "Statute of Limitations Date" — type: date, parent: Matter
- [ ] 15. Get all Custom Field IDs via `GET /custom_fields.json` → put in code config

### Retainer Template

- [ ] 16. Upload retainer Word template (Documents → Templates → Upload)
- [ ] 17. Install Clio Draft Word Add-in (Microsoft Word → Add-ins)
- [ ] 18. Convert `[bracket]` merge fields to `{Clio merge fields}` using Clio Draft
- [ ] 19. Re-upload converted template to Clio
- [ ] 20. Note Template ID via `GET /document_templates.json`

### Create 5 Test Matters + Contacts

- [ ] 21. Matter: REYES v FRANCOIS (standard car vs car)
- [ ] 22. Contact: Guillermo Reyes + email
- [ ] 23. Matter: NOEL v FREESE (female client — pronoun test)
- [ ] 24. Contact: Darshame Noel + email
- [ ] 25. Matter: CASTILLO v DORJEE (client is PEDESTRIAN, V2)
- [ ] 26. Contact: Fausto Castillo + email (no registration plate)
- [ ] 27. Matter: GRILLO v GRILLO (client is BICYCLIST, V2)
- [ ] 28. Contact: John Grillo + email (same last name both parties)
- [ ] 29. Matter: VINCENT v VINCENT (female + commercial vehicle)
- [ ] 30. Contact: Mardochee Vincent + email

### Calendar

- [ ] 31. Get Calendar ID via `GET /calendars.json`
- [ ] 32. Note which calendar to use for `POST /calendar_entries`

### Verify

- [ ] 33. Test: `PATCH` custom fields on a Matter → verify in Clio UI
- [ ] 34. Test: `POST /document_automations` → verify PDF generated
- [ ] 35. Test: `POST /calendar_entries` → verify SOL date on calendar
- [ ] 36. Test: Download generated PDF via `GET /document_versions/{id}/download`

---

## 7. Setup Steps (outside Clio)

- [ ] Get Anthropic API key (console.anthropic.com)
- [ ] Get OpenAI API key (platform.openai.com)
- [ ] Get Resend API key (resend.com)
- [ ] Set up Supabase project (supabase.com)
- [ ] Set up Google Auth (console.cloud.google.com → Credentials)
- [ ] Fill `.env.local` with all values
- [ ] Run all 5 police reports through the app
- [ ] Record 15-min demo video
- [ ] Send 3 submission emails

---

## 8. Files Inventory

### In repo — Our docs

| File | Purpose |
|---|---|
| `ANALYSIS.md` | Full problem analysis v3 |
| `CLAUDE_CODE_BRIEFING.md` | Master tech spec — Claude Code reads this |
| `CLAUDE.md` | Project setup instructions (auto-read by Claude Code) |
| `PROJECT_STATUS.md` | This file — checklist and status tracker |
| `.env.example` | Environment variables template |

### In repo — Hackathon materials (`sample-data/`)

| File | Purpose |
|---|---|
| `Swans Applied AI Hackathon - The Challenge Brief .pdf` | Official requirements |
| `Example of All Expected Outputs - Hackathon 2026-01.pdf` | Expected output examples |
| `Retainer Agreement - Richards & Law [Hackathon].docx` | Retainer template with merge fields |
| `Retainer Agreement - Richards & Law [Hackathon].pdf` | PDF version (reference) |

### In repo — Police reports (`sample-data/`)

| File | Test case | Edge case |
|---|---|---|
| `GUILLERMO_REYES_v_LIONEL_FRANCOIS...pdf` | Standard car vs car | Male, V1=client, clean |
| `DARSHAME_NOEL_v_FRANCIS_E_FREESE...pdf` | Female client | she/her pronoun test |
| `FAUSTO_CASTILLO_v_CHIMIE_DORJEE...pdf` | Pedestrian | Client is V2, no plate |
| `JOHN_GRILLO_v_JOHN_GRILLO...pdf` | Bicyclist | Client is V2, same last names |
| `MARDOCHEE_VINCENT_v_MARDOCHEE_VINCENT...pdf` | Female + commercial | she/her + commercial vehicle |

### In repo — App code

| File | Purpose |
|---|---|
| `app/page.tsx` | Main dashboard (upload + editable fields) |
| `app/layout.tsx` | Root layout |
| `app/globals.css` | Tailwind global styles |
| `app/api/extract/` | API route: PDF → AI extraction |
| `app/api/match/` | API route: auto-match client in Clio |
| `app/api/approve/` | API route: approve → push to Clio + send email |
| `lib/clio.ts` | Clio API client (all API calls) |
| `lib/ai.ts` | AI provider router |
| `lib/extraction.ts` | PDF text extraction |
| `lib/email.ts` | Email sending (Resend) |
| `lib/calendly.ts` | Calendly link (seasonal logic) |
| `lib/providers/anthropic.ts` | Anthropic Claude provider |
| `lib/providers/openai.ts` | OpenAI GPT provider |
| `lib/providers/types.ts` | Shared AI types |

### In repo — Config

| File | Purpose |
|---|---|
| `.env.local` | Actual secrets (in .gitignore) |
| `package.json` | Next.js dependencies |
| `next.config.js` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind config |

### In repo — Docs

| File | Purpose |
|---|---|
| `docs/CONVENTIONS.md` | Code conventions |
| `docs/clio/README.md` | Clio integration docs |
| `docs/dashboard/README.md` | Dashboard docs |
| `docs/deploy/README.md` | Deploy instructions |
| `docs/setup/README.md` | Setup docs |
| `docs/_handover/` | Handover notes from initial build |

### NOT in repo (only in hackathon/ folder)

| File | Purpose |
|---|---|
| `dashboard-demo.html` | Interactive UI mockup (Clio colors) |
| `hackathon_checklist.xlsx` | Excel checklist (for human use) |
