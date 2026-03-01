# Richards & Law — Smart Intake: Full Documentation

> **Project**: Swans Applied AI Hackathon Submission
> **Firm**: Richards & Law (Andrew Richards, Esq.)
> **Version**: 1.0
> **Date**: March 1, 2026

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [How It Works (End-to-End Flow)](#2-how-it-works-end-to-end-flow)
3. [Architecture](#3-architecture)
4. [File Structure](#4-file-structure)
5. [API Routes](#5-api-routes)
6. [Library Modules](#6-library-modules)
7. [Dashboard UI](#7-dashboard-ui)
8. [AI Extraction](#8-ai-extraction)
9. [Clio Integration](#9-clio-integration)
10. [Email System](#10-email-system)
11. [Database (Supabase)](#11-database-supabase)
12. [Environment Variables](#12-environment-variables)
13. [Setup Guide](#13-setup-guide)
14. [Test Cases](#14-test-cases)
15. [Known Issues & Workarounds](#15-known-issues--workarounds)
16. [Deployment](#16-deployment)

---

## 1. What This App Does

A personal injury law firm receives a police accident report (NYC form MV-104AN) from a new client. Today, a paralegal manually reads the PDF, types data into Clio Manage (legal CRM), drafts a retainer agreement, calendars a deadline, and emails the client. This takes 30-45 minutes per case.

**This app automates the entire workflow in under 60 seconds:**

1. **Upload** a police report PDF
2. **AI extracts** 32+ structured fields (names, dates, vehicles, injuries, location)
3. **Auto-matches** the extracted names to an existing Clio Matter
4. **Human reviews** the extracted data and edits if needed
5. **One click** triggers the full pipeline:
   - Pushes 8 custom fields to Clio
   - Generates a retainer agreement from a Clio template
   - Creates a Statute of Limitations calendar entry (accident date + 8 years)
   - Downloads the generated retainer PDF
   - Sends a personalized email to the client with the retainer attached

---

## 2. How It Works (End-to-End Flow)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Paralegal   │────▶│  Upload PDF  │────▶│  AI Extract  │
│  uploads PDF │     │  /api/extract│     │  Claude/GPT  │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                    ┌──────────────┐              │
                    │  Auto Match  │◀─────────────┘
                    │  /api/match  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Human Review│
                    │  Edit fields │
                    │  Dashboard   │
                    └──────┬───────┘
                           │ "Approve & Push to Clio"
                    ┌──────▼───────┐
                    │  /api/approve│
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼──────┐
   │ PATCH fields │ │ Retainer    │ │ Calendar     │
   │ in Clio     │ │ generation  │ │ SOL entry    │
   └─────────────┘ └──────┬──────┘ └──────────────┘
                          │
                   ┌──────▼──────┐
                   │ Download    │
                   │ retainer PDF│
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │ Email client│
                   │ via Resend  │
                   └─────────────┘
```

### Detailed Step Sequence

| Step | What Happens | API/Service | Duration |
|------|-------------|-------------|----------|
| 1 | User uploads MV-104AN PDF | Browser → `/api/extract` | — |
| 2 | PDF stored in Supabase Storage | `supabase.storage.upload()` | ~1s |
| 3 | PDF sent to AI for extraction | Claude Vision or GPT-4o | 5-15s |
| 4 | Extraction result saved to DB | `supabase.from().insert()` | ~0.5s |
| 5 | Extracted names sent for matching | `/api/match` → Clio API | ~2s |
| 6 | Clio Matters searched for name match | `GET /api/v4/matters` | ~1s |
| 7 | Dashboard populated with all fields | Browser state update | instant |
| 8 | **User reviews and edits fields** | Manual step | variable |
| 9 | User clicks "Approve & Push to Clio" | `/api/approve` | — |
| 10 | 8 custom fields pushed to Matter | `PATCH /api/v4/matters` | ~1s |
| 11 | Retainer generated from template | `POST /document_automations` | ~2s |
| 12 | SOL calendar entry created | `POST /calendar_entries` | ~1s |
| 13 | Wait for retainer PDF to generate | `setTimeout(3000)` | 3s |
| 14 | Retainer PDF downloaded from Clio | `GET /document_versions/.../download` | ~2s |
| 15 | Email drafted by AI + sent with PDF | Claude/GPT + Resend API | ~5s |

**Total automated time: ~20-30 seconds** (after human review)

---

## 3. Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) + React 18 | Single-page dashboard |
| Styling | Tailwind CSS + Clio brand colors | Consistent UI |
| AI Extraction | Claude Sonnet (`claude-sonnet-4-20250514`) | PDF → structured JSON |
| AI Alternative | GPT-4o (OpenAI Responses API) | Switchable via env flag |
| Legal CRM | Clio Manage API v4 (REST + OAuth 2.0) | Matters, fields, docs, calendar |
| Database | Supabase (PostgreSQL) | Reports, audit trail |
| File Storage | Supabase Storage | PDF uploads |
| Email | Resend API | Transactional email with PDF attachment |
| Deployment | Vercel | Serverless hosting |

### Design Principles

1. **Human-in-the-loop**: AI extracts, human verifies, then system executes
2. **Fail gracefully**: Each pipeline step can fail without blocking others
3. **Single source of truth**: Clio Manage is the canonical data store
4. **Dual AI providers**: Switch between Anthropic and OpenAI without code changes
5. **Audit trail**: Every action logged to Supabase for compliance

---

## 4. File Structure

```
lawyerdemo/
├── app/
│   ├── page.tsx                          # Root redirect → /dashboard
│   ├── layout.tsx                        # HTML shell, metadata
│   ├── globals.css                       # Tailwind base + Clio colors + animations
│   ├── dashboard/
│   │   └── page.tsx                      # Main dashboard (~950 lines, client component)
│   └── api/
│       ├── extract/route.ts              # POST: PDF upload → AI extraction → Supabase
│       ├── match/route.ts                # POST: Extracted names → Clio Matter matching
│       ├── approve/route.ts              # POST: Full 5-step approval pipeline
│       └── reports/route.ts              # GET: List or fetch saved reports
│
├── lib/
│   ├── clio.ts                           # Clio API v4 client (all endpoints)
│   ├── extraction.ts                     # Thin wrapper → AI provider
│   ├── email.ts                          # AI-drafted email + Resend sending
│   ├── calendly.ts                       # Seasonal Calendly link logic
│   ├── ai.ts                             # AI provider router (env flag based)
│   ├── supabase.ts                       # Supabase client + table/bucket names
│   └── providers/
│       ├── types.ts                      # AIProvider interface, extraction prompt, JSON parser
│       ├── anthropic.ts                  # Claude Sonnet implementation
│       └── openai.ts                     # GPT-4o implementation
│
├── docs/
│   ├── field-mapping.csv                 # All 32 fields with Clio mapping
│   ├── _handover/                        # Session handover notes
│   │   ├── README.md                     # Conventions
│   │   ├── 2026-02-28_initial_build.md   # Session 1 handover
│   │   └── 2026-03-01_dashboard_ui_refinement.md  # Session 2 handover
│   └── design-mockup/                    # 14 HTML mockups (mobile, desktop, admin)
│
├── sample-data/                          # 5 test police report PDFs
├── supabase/
│   └── migrations/
│       └── 20260301_001_create_intake_tables.sql  # DB schema
│
├── CLAUDE.md                             # Project instructions (auto-read by Claude Code)
├── CLAUDE_CODE_BRIEFING.md               # Complete technical specification
├── ANALYSIS.md                           # Problem analysis + test cases
├── DOCUMENTATION.md                      # This file
├── .env.example                          # Environment variable template
├── .gitignore                            # Ignores node_modules, .env, .next, etc.
├── package.json                          # Dependencies
├── tailwind.config.ts                    # Clio brand color palette
├── tsconfig.json                         # TypeScript configuration
└── next.config.js                        # Next.js configuration
```

---

## 5. API Routes

### `POST /api/extract`

**Purpose**: Upload a police report PDF, extract structured data using AI, save to database.

**Input**: `FormData` with a `file` field (PDF)

**Processing**:
1. Convert PDF to base64
2. Upload original PDF to Supabase Storage (`60001-intake-pdfs` bucket)
3. Send base64 to AI provider (Claude Vision or GPT-4o)
4. Save extraction result + metadata to `60001_intake_reports` table
5. Create audit log entry (`action: "extracted"`)

**Output**:
```json
{
  "success": true,
  "data": { /* ExtractionResult — see AI Extraction section */ },
  "reportId": "uuid",
  "extractionMs": 8234
}
```

**Error handling**: Storage and DB failures are non-blocking — extraction result still returned.

---

### `POST /api/match`

**Purpose**: Find which Clio Matter this police report belongs to by matching extracted names against Clio client names.

**Input**:
```json
{
  "all_persons": [{ "name": "REYES, GUILLERMO", "age": 29, "sex": "M" }],
  "vehicle_1": { "driver_name_first": "GUILLERMO", "driver_name_last": "REYES" },
  "vehicle_2": { "driver_name_first": "LIONEL", "driver_name_last": "FRANCOIS" }
}
```

**Processing**:
1. Fetch all open Clio Matters via `GET /api/v4/matters?status=open`
2. For each Matter, compare client name against V1 AND V2 driver names
3. Name matching: normalize (lowercase, strip punctuation), check if Clio name contains first + last
4. For matches, fetch Contact email via `GET /api/v4/contacts/{id}`
5. Fallback to `HACKATHON_EMAIL` env var if email not found

**Output**:
```json
{
  "success": true,
  "matchCount": 1,
  "matches": [{
    "matter": { "id": 14525933, "client": { "id": 22674092, "name": "Guillermo Reyes" } },
    "matchedVehicle": 1,
    "clientFirst": "GUILLERMO",
    "clientLast": "REYES",
    "defendantFirst": "LIONEL",
    "defendantLast": "FRANCOIS",
    "clientEmail": "talent.legal-engineer.hackathon.automation-email@swans.co"
  }]
}
```

**Critical insight**: The client is NOT always Vehicle 1. In 2 of 5 test cases (Castillo, Grillo), the client is Vehicle 2 (pedestrian/bicyclist). The match logic checks both sides.

---

### `POST /api/approve`

**Purpose**: Execute the full automation pipeline after human review.

**Input**:
```json
{
  "matterId": 14525933,
  "clientFirstName": "Guillermo",
  "clientLastName": "Reyes",
  "clientEmail": "talent.legal-engineer.hackathon.automation-email@swans.co",
  "clientGender": "M",
  "accidentDate": "07/11/2022",
  "accidentLocation": "NORTHERN BLVD & 95TH ST, Queens",
  "defendantName": "Lionel Francois",
  "registrationPlate": "DYY7657",
  "noInjured": 0,
  "officerNotes": "V1 was traveling westbound on Northern Blvd...",
  "statuteDate": "2030-07-11"
}
```

**Pipeline (5 steps)**:

| Step | Action | Clio Endpoint | Can Fail? |
|------|--------|--------------|-----------|
| 1 | Update 8 custom fields on Matter | `PATCH /api/v4/matters/{id}` | Yes — logs error, continues |
| 2 | Generate retainer agreement | `POST /api/v4/document_automations` | Yes — continues without PDF |
| 3 | Create SOL calendar entry | `POST /api/v4/calendar_entries` | Yes — continues |
| 4 | Download generated retainer PDF | `GET /document_versions/{id}/download` | Yes — email sends without attachment |
| 5 | Send personalized email to client | Resend API | Yes — logs error |

**Output**:
```json
{
  "success": true,
  "steps": [
    { "step": "Update custom fields", "status": "done" },
    { "step": "Generate retainer", "status": "done" },
    { "step": "Create calendar entry", "status": "done" },
    { "step": "Download retainer PDF", "status": "done" },
    { "step": "Send email", "status": "done" }
  ],
  "summary": {
    "matter": 14525933,
    "client": "Guillermo Reyes",
    "email": "talent.legal-engineer.hackathon.automation-email@swans.co",
    "statuteDate": "2030-07-11"
  }
}
```

---

### `GET /api/reports`

**Purpose**: List saved reports or fetch a single report with its PDF.

**List mode** (`GET /api/reports`):
Returns the 50 most recent reports with metadata (filename, status, provider, extraction time).

**Detail mode** (`GET /api/reports?id=<uuid>`):
Returns full extraction JSON + a signed URL to the stored PDF (1-hour expiry).

---

## 6. Library Modules

### `lib/clio.ts` — Clio API Client

All Clio Manage API v4 interactions. Uses OAuth Bearer token from environment.

**Functions**:

| Function | Clio Endpoint | Purpose |
|----------|--------------|---------|
| `getOpenMatters()` | `GET /matters?status=open` | List all open Matters with client info |
| `getMatter(id)` | `GET /matters/{id}` | Fetch single Matter |
| `updateMatterCustomFields(id, fields)` | `PATCH /matters/{id}` | Push 8 custom fields (smart merge) |
| `getContact(id)` | `GET /contacts/{id}` | Fetch Contact with email addresses |
| `generateRetainer(matterId, filename)` | `POST /document_automations` | Trigger retainer generation from template |
| `getMatterDocuments(matterId)` | `GET /documents?matter_id=X` | List documents on a Matter |
| `downloadDocument(docId)` | `GET /document_versions/{id}/download` | Download PDF as Buffer |
| `createCalendarEntry(matterId, name, date)` | `POST /calendar_entries` | Create SOL deadline (all-day event) |

**Smart merge for custom fields**: The `updateMatterCustomFields` function first GETs existing custom field values on the Matter, builds a map of `custom_field_id → existing_value_id`, then merges these IDs into the PATCH payload. This prevents the "already exists" error when updating fields that were already populated.

---

### `lib/providers/types.ts` — AI Provider Interface & Extraction Prompt

Defines the shared interface and the single extraction prompt used by both AI providers.

**`AIProvider` interface**:
```typescript
interface AIProvider {
  extractFromPdf(pdfBase64: string): Promise<ExtractionResult>;
  draftParagraph(input: DraftInput): Promise<string>;
}
```

**`ExtractionResult`** — 32+ fields extracted from the police report:
- Accident metadata: date, time, number of vehicles, injured, killed
- Location: road, intersecting street, borough
- Vehicle 1: driver name, sex, DOB, address, plate, vehicle info, insurance code, flags
- Vehicle 2: same structure (may be pedestrian/bicyclist)
- Officer notes: free-text narrative
- All persons involved: array of {name, age, sex}
- Confidence scores: 0-100 for 9 key fields
- Debug field: `header_raw` for verifying Box D/E/F readings

**Extraction prompt**: Detailed description of MV-104AN form layout (Box A-F for header stats, vehicle section with plate/state/ins_code positions) with mandatory DOUBLE-CHECK step for numeric fields.

---

### `lib/providers/anthropic.ts` — Claude Implementation

Uses `claude-sonnet-4-20250514` with `type: "document"` for native PDF support.

- `extractFromPdf()`: Sends PDF as base64 document + extraction prompt
- `draftParagraph()`: Sends draft prompt, returns plain text paragraph

---

### `lib/providers/openai.ts` — GPT-4o Implementation

Uses OpenAI Responses API with file upload for PDF processing.

- `extractFromPdf()`: Uploads PDF as file, sends via Responses API with `input_file`, parses output, cleans up uploaded file
- `draftParagraph()`: Uses Chat Completions API

---

### `lib/ai.ts` — Provider Router

Reads `AI_PROVIDER_OPENAI` and `AI_PROVIDER_ANTHROPIC` env flags to determine which provider to use. Defaults to Anthropic if neither is set.

---

### `lib/email.ts` — Email Drafting & Sending

1. Calls active AI provider to draft a personalized paragraph based on officer notes
2. Builds HTML email template with:
   - Greeting with client first name
   - Reference to accident date
   - AI-drafted paragraph (3-4 sentences, warm and empathetic tone)
   - Retainer agreement explanation
   - Seasonal Calendly booking link
   - Attorney sign-off
3. Sends via Resend API with retainer PDF attachment (base64)

---

### `lib/calendly.ts` — Seasonal Calendly Links

Returns office link (March-August) or virtual link (September-February) based on accident month.

---

### `lib/supabase.ts` — Supabase Client

Creates a Supabase client using the service role key (bypasses RLS). Exports table and bucket name constants:
- `TABLES.INTAKE_REPORTS` = `"60001_intake_reports"`
- `TABLES.AUDIT_LOG` = `"60002_audit_log"`
- `BUCKETS.INTAKE_PDFS` = `"60001-intake-pdfs"`

---

### `lib/extraction.ts` — Extraction Wrapper

Thin wrapper that calls `getAI().extractFromPdf(base64)`. Exists to provide a clean import path.

---

## 7. Dashboard UI

**File**: `app/dashboard/page.tsx` (~950 lines, single client component)

### Five Phases

The dashboard progresses through 5 phases:

| Phase | UI State | User Action |
|-------|---------|-------------|
| `upload` | File input (drag-drop), saved reports sidebar | Upload a PDF |
| `extracting` | Loading spinner, "Extracting from PDF..." | Wait |
| `review` | Full editable form with all extracted fields | Edit fields, click Approve |
| `processing` | Pipeline steps with live status indicators | Wait |
| `success` | Checkmark, summary, "View saved reports" link | Done |

### Review Phase Layout

The review form is organized in sections matching the MV-104AN form:

1. **Accident Details** — Date (always shown), Number Injured (always shown), plus 4 toggleable fields (Day of Week, Time, No. Vehicles, No. Killed)
2. **Client Information** — First/Last name, gender, plate, state, vehicle year/make, type, insurance code, address
3. **Defendant Information** — First/Last name, vehicle info, flags (Vehicle/Bicyclist/Pedestrian/Other Pedestrian)
4. **Location & Description** — Road, intersection, borough, officer notes
5. **Clio Matter** — Auto-matched matter name, matter ID, client email
6. **Approve Button** — "Approve & Push to Clio" (disabled if no Matter matched)

### Special Features

- **Confidence badges**: Color-coded scores (green 90%+, yellow 70-89%, red <70%) next to each field
- **QA Audit Mode**: Per-field checkboxes for manual verification tracking
- **Defendant Flags**: Visual checkbox buttons for Vehicle/Bicyclist/Pedestrian/Other Pedestrian
- **Saved Reports Sidebar**: Lists recent uploads, click to reload extraction
- **Auto-populated fields**: All state variables filled from AI extraction + Clio match

---

## 8. AI Extraction

### What Gets Extracted

The AI reads the MV-104AN form and returns a structured JSON with:

**Accident Header** (6 fields from Row 2):
- Accident Date (Box A) — MM/DD/YYYY
- Day of Week (Box B)
- Military Time (Box C) — HH:MM
- Number of Vehicles (Box D)
- Number Injured (Box E)
- Number Killed (Box F)

**Vehicle 1** (17 fields from left half of Row 3-4):
- Driver name (first + last), sex, date of birth
- Address, city, state, zip
- Plate number (letters+digits only, no state prefix)
- Plate state (2-letter code, separate from plate)
- Vehicle year, make, type
- Insurance company code (3-5 digit number)
- Flags: is_pedestrian, is_bicyclist, is_other_pedestrian

**Vehicle 2** (17 fields from right half — same structure)

**Location** (3 fields):
- Road name, intersecting street, borough

**Narrative**: Officer's accident description (free text)

**All Persons Involved**: Array of {name, age, sex}

**Confidence Scores** (9 fields): 0-100 for key fields

### Prompt Engineering

The extraction prompt includes:
- **Physical form layout**: Describes exact positions of fields on the MV-104AN form
- **Box labeling**: A-F for header row, explicit left-to-right ordering
- **Critical warnings**: Box D/E/F are separate columns, don't read across
- **Plate number rules**: Don't include state code in plate number
- **Insurance code**: Last box in the vehicle info row
- **Mandatory DOUBLE-CHECK**: AI must write its Box D/E/F readings into `header_raw` for verification
- **Pedestrian/bicyclist handling**: Check checkboxes, leave vehicle fields empty

---

## 9. Clio Integration

### Authentication

OAuth 2.0 Bearer token. Token is stored in `CLIO_ACCESS_TOKEN` env var. All API calls go through `clioFetch()` which adds the Authorization header.

### Base URL

- EU account: `https://eu.app.clio.com`
- US account: `https://app.clio.com`

Set via `CLIO_BASE_URL` env var.

### Custom Fields (8 fields pushed to each Matter)

| Field | Type | Env Variable | Value Example |
|-------|------|-------------|---------------|
| Accident Date | Date | `CLIO_FIELD_ACCIDENT_DATE` | `2022-07-11` |
| Accident Location | Text Line | `CLIO_FIELD_ACCIDENT_LOCATION` | `NORTHERN BLVD & 95TH ST, Queens` |
| Defendant Name | Text Line | `CLIO_FIELD_DEFENDANT_NAME` | `Lionel Francois` |
| Client Gender | Picklist | `CLIO_FIELD_CLIENT_GENDER` | `Male` or `Female` |
| Registration Plate | Text Line | `CLIO_FIELD_REGISTRATION_PLATE` | `DYY7657` |
| Number Injured | Numeric | `CLIO_FIELD_NUMBER_INJURED` | `0` |
| Accident Description | Text Area | `CLIO_FIELD_ACCIDENT_DESCRIPTION` | Officer narrative text |
| Statute of Limitations Date | Date | `CLIO_FIELD_STATUTE_DATE` | `2030-07-11` |

### Retainer Generation

Uses Clio's Document Automation feature:
- `POST /api/v4/document_automations` with template ID
- Template has merge fields like `{Client Name}`, `{Defendant Name}`
- Clio generates the PDF from the template + Matter data
- App downloads the generated PDF for email attachment

### Calendar Entry

Creates an all-day event on the Statute of Limitations date:
- Summary: `"Statute of Limitations - {Client Name}"`
- Date: accident date + 8 years (configurable via `STATUTE_YEARS`)
- Calendar owner: attorney's calendar (by ID)

### Important Clio API Gotchas

1. Custom fields use `"custom_field": {"id": X}` — NOT `"custom_field_id": X`
2. Document automation requires `"formats": ["pdf"]` (array, not string)
3. Calendar owner ID is the CALENDAR ID, not the User ID
4. Contact email endpoint returns IDs only, not email strings (workaround: hardcoded email)
5. When updating existing custom field values, you must include the existing value's `id` — otherwise Clio returns a 422 "already exists" error

---

## 10. Email System

### Email Template (sent to client via Resend)

```
Subject: Retainer Agreement for Your Review – Richards & Law

Hello {Client First Name},

I hope you're doing well. I wanted to follow up regarding your
car accident on {Formatted Date}. I know dealing with the aftermath
of a crash is stressful, and I want to make sure we move things
forward as smoothly as possible for you.

{AI-drafted paragraph based on officer notes — 3-4 sentences,
warm, empathetic, written as if attorney reviewed the report}

Attached is your Retainer Agreement, which sets the foundation
for our partnership...

When you're ready, you can book an appointment with us:
{Seasonal Calendly Link}

Andrew Richards

Attachment: Retainer_Agreement_{LastName}.pdf
```

### Seasonal Calendly Logic

| Months | Type | Link |
|--------|------|------|
| March - August | In-office | `CALENDLY_OFFICE` |
| September - February | Virtual | `CALENDLY_VIRTUAL` |

---

## 11. Database (Supabase)

### Tables

**`60001_intake_reports`** — One row per uploaded police report.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid (PK) | Auto-generated |
| `created_at` | timestamptz | Upload timestamp |
| `updated_at` | timestamptz | Auto-updated on change |
| `filename` | text | Original PDF filename |
| `file_size_bytes` | integer | PDF size |
| `file_path` | text | Path in Supabase Storage |
| `extracted_json` | jsonb | Full AI extraction result |
| `ai_provider` | text | `"openai"` or `"anthropic"` |
| `extraction_ms` | integer | Extraction duration (ms) |
| `matter_id` | integer | Matched Clio Matter ID |
| `matter_name` | text | e.g. "Reyes v Francois" |
| `client_name` | text | Matched client name |
| `contact_id` | integer | Clio Contact ID |
| `status` | text | `draft` / `reviewing` / `approved` / `error` / `partial` |
| `step_fields` | text | Custom fields step status |
| `step_retainer` | text | Retainer step status |
| `step_calendar` | text | Calendar step status |
| `step_email` | text | Email step status |
| `approved_at` | timestamptz | When approved |
| `approved_by` | text | Who approved |
| `error_message` | text | Last error |
| `clio_document_id` | integer | Generated retainer doc ID |
| `clio_calendar_id` | integer | Created calendar entry ID |
| `email_id` | text | Resend email ID |

**`60002_audit_log`** — One row per pipeline action.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid (PK) | Auto-generated |
| `created_at` | timestamptz | Action timestamp |
| `report_id` | uuid (FK) | Links to intake_reports |
| `action` | text | `uploaded` / `extracted` / `matched` / `fields_updated` / `retainer_generated` / `calendar_created` / `email_sent` / `retry` / `error` |
| `detail` | jsonb | Action-specific data |
| `success` | boolean | Did the action succeed? |
| `error_message` | text | Error details |
| `duration_ms` | integer | How long the action took |

### Storage

**Bucket**: `60001-intake-pdfs`

Files stored with timestamp prefix: `2026-03-01T10-30-00-000Z_filename.pdf`

### RLS

Row Level Security is enabled on both tables with permissive policies (service role has full access). App uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS.

---

## 12. Environment Variables

### Full Variable Reference (30 variables)

```bash
# ──────────────────────────────────────
# Clio API (6)
# ──────────────────────────────────────
CLIO_BASE_URL=https://app.clio.com       # EU: https://eu.app.clio.com
CLIO_CLIENT_ID=                           # From Clio app registration
CLIO_CLIENT_SECRET=                       # From Clio app registration
CLIO_ACCESS_TOKEN=                        # OAuth token
CLIO_CALENDAR_ID=                         # Attorney's calendar ID
CLIO_TEMPLATE_ID=                         # Retainer template ID

# ──────────────────────────────────────
# Clio Custom Field IDs (8)
# ──────────────────────────────────────
CLIO_FIELD_ACCIDENT_DATE=                 # Date type
CLIO_FIELD_ACCIDENT_LOCATION=             # Text Line type
CLIO_FIELD_DEFENDANT_NAME=                # Text Line type
CLIO_FIELD_CLIENT_GENDER=                 # Picklist type (Male/Female)
CLIO_FIELD_REGISTRATION_PLATE=            # Text Line type
CLIO_FIELD_NUMBER_INJURED=                # Numeric type
CLIO_FIELD_ACCIDENT_DESCRIPTION=          # Text Area type
CLIO_FIELD_STATUTE_DATE=                  # Date type

# ──────────────────────────────────────
# AI Provider (4)
# ──────────────────────────────────────
AI_PROVIDER_ANTHROPIC=true                # Set to "true" to use Claude
AI_PROVIDER_OPENAI=false                  # Set to "true" to use GPT-4o
ANTHROPIC_API_KEY=                        # Claude API key
OPENAI_API_KEY=                           # OpenAI API key

# ──────────────────────────────────────
# Supabase (2)
# ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=                 # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=                # Service role key (bypasses RLS)

# ──────────────────────────────────────
# Email (1)
# ──────────────────────────────────────
RESEND_API_KEY=                           # Resend.com API key

# ──────────────────────────────────────
# App Config (5)
# ──────────────────────────────────────
LAW_FIRM_NAME=Richards & Law              # Firm name
ATTORNEY_NAME=Andrew Richards             # Attorney name for emails
STATUTE_YEARS=8                           # Years to add for SOL date
CALENDLY_OFFICE=https://calendly.com/...  # In-office booking link
CALENDLY_VIRTUAL=https://calendly.com/... # Virtual booking link
HACKATHON_EMAIL=talent.legal-engineer...  # Fallback email address
```

---

## 13. Setup Guide

### Prerequisites

- Node.js 18+
- A Clio Manage account (US for submission)
- An Anthropic API key (or OpenAI key)
- A Resend.com account
- A Supabase project

### Step-by-Step

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd lawyerdemo
   npm install
   ```

2. **Create `.env.local`** from `.env.example`
   ```bash
   cp .env.example .env.local
   ```

3. **Set up Clio**
   - Register app in Clio (Settings → API → Applications)
   - Set redirect URI to `http://localhost:3000/api/auth/callback`
   - Get OAuth token (authorize → exchange code)
   - Create 8 custom fields (Settings → Custom Fields → on Matter)
   - Upload retainer template (Documents → Document Templates)
   - Create 5 test Matters with Contacts
   - Get calendar ID and custom field IDs via API

4. **Set up Supabase**
   - Create project at supabase.com
   - Run migration SQL from `supabase/migrations/20260301_001_create_intake_tables.sql`
   - Create storage bucket `60001-intake-pdfs`

5. **Fill `.env.local`** with all values

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open** `http://localhost:3000` (redirects to `/dashboard`)

---

## 14. Test Cases

### 5 Police Report PDFs

| # | Report | Client | Vehicle | Gender | Type | Key Test |
|---|--------|--------|---------|--------|------|----------|
| 1 | Guillermo Reyes v Lionel Francois | V1 (Reyes) | Car vs Car | M | Standard | Demo case |
| 2 | Darshame Noel v Andrew Freese | V1 (Noel) | Car vs Car | **F** | Pronoun test | she/her |
| 3 | Fausto Castillo v Tenzin Dorjee | **V2** (Castillo) | Car vs **Pedestrian** | M | Client is V2 | No plate |
| 4 | John Grillo v Yoojin Kim | **V2** (Grillo) | Car vs **Bicyclist** | M | Client is V2 | Same last name |
| 5 | Mardochee Vincent v Shawn Trent | V1 (Vincent) | **School Bus** vs SUV | **F** | Commercial vehicle | she/her |

### What to Verify Per Case

- [ ] Correct client identified (V1 vs V2)
- [ ] Correct gender (M/F) extracted
- [ ] Correct pronoun handling (she/her for Noel, Vincent)
- [ ] Plate number extracted cleanly (no state prefix)
- [ ] Insurance code extracted (3-5 digits)
- [ ] No. Injured correct (0 for most, 1 for Castillo)
- [ ] Pedestrian/bicyclist flags set correctly
- [ ] Clio Match finds correct Matter
- [ ] All 8 custom fields pushed to Clio
- [ ] Retainer generated in Clio
- [ ] Calendar entry created (accident date + 8 years)
- [ ] Email sent with correct Calendly link

---

## 15. Known Issues & Workarounds

| # | Issue | Root Cause | Workaround | Status |
|---|-------|-----------|------------|--------|
| 1 | Contact email not returned | Clio API nested field syntax doesn't return email strings | Use `HACKATHON_EMAIL` env var | Active workaround |
| 2 | PDF download sometimes empty | `/document_versions/{id}/download` timing-sensitive | 3-second delay before download attempt; email sends without attachment if fails | Active workaround |
| 3 | Custom field "already exists" error | Clio rejects PATCH if field value exists without ID | `updateMatterCustomFields` now GETs existing values first, merges IDs | **Fixed** |
| 4 | No. Injured OCR misread | AI confused adjacent numeric fields in header | Prompt rewritten with Box A-F labeling + DOUBLE-CHECK step | **Fixed** |
| 5 | Plate number includes state | AI merged state code with plate | Prompt explicitly separates plate_number from plate_state | **Fixed** |
| 6 | Insurance code not extracted | Prompt was too vague about ins_code position | Described as "LAST box in the row" with examples | **Fixed** |
| 7 | Resend API key not configured | Not yet obtained | Email step fails gracefully; pipeline continues | Pending |

---

## 16. Deployment

### Vercel

1. Connect GitHub repo to Vercel
2. Set Framework Preset to "Next.js"
3. Import all 30 environment variables
4. Deploy

### Build Command

```bash
npm run build
```

### Important Notes

- All API routes are serverless functions on Vercel
- Clio API calls are made server-side (tokens never exposed to browser)
- PDF uploads are processed in-memory (base64), not stored on Vercel disk
- Supabase handles persistent storage (DB + files)
