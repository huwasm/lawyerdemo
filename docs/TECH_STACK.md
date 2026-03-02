# Tech Stack & Architecture — Smart Intake by Richards & Law

## Overview

Smart Intake is a legal automation tool that reads police report PDFs using AI, extracts structured data, pushes it into Clio Manage (legal CRM), generates retainer agreements, sets calendar deadlines, and emails clients. One-button workflow after human verification.

**Live URL:** https://lawyerdemo.vercel.app/dashboard

---

## Architecture Diagram

```
                        +------------------+
                        |   Police Report  |
                        |   (MV-104AN PDF) |
                        +--------+---------+
                                 |
                                 v
+-------------------+   +-------+--------+   +------------------+
|  Supabase Storage |<--| Next.js App    |-->| AI Provider      |
|  (PDF bucket)     |   | (App Router)   |   | Claude / GPT-4o  |
+-------------------+   +--+----+----+---+   +------------------+
                            |    |    |
              +-------------+    |    +-------------+
              v                  v                  v
     +--------+------+  +-------+-------+  +-------+--------+
     | Clio Manage   |  | Resend Email  |  | Supabase DB    |
     | (REST API v4) |  | (SMTP API)    |  | (intake_reports |
     | - Custom flds |  | - HTML email  |  |  + audit_log)  |
     | - Retainer    |  | - PDF attach  |  +----------------+
     | - Calendar    |  +---------------+
     +--------------+
```

---

## Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.2.21 | Full-stack React framework (App Router) |
| **React** | 18.3.1 | Frontend UI components |
| **TypeScript** | 5.6.0 | Type safety across the codebase |
| **Tailwind CSS** | 3.4.17 | Utility-first styling with custom Clio theme |
| **Vercel** | — | Deployment platform (auto-deploy on push) |

---

## AI Provider System (Pluggable)

The system supports two AI providers via environment variables. Only one is active at a time.

### Anthropic Claude (Default)

| Detail | Value |
|---|---|
| SDK | `@anthropic-ai/sdk` v0.39.0 |
| Model | `claude-sonnet-4-20250514` |
| PDF Input | Native document type (base64) via Vision API |
| Email Draft | Text generation (personalized paragraphs) |

### OpenAI GPT-4o (Alternative)

| Detail | Value |
|---|---|
| SDK | `openai` v6.25.0 |
| Model | `gpt-4o` |
| PDF Input | Files API upload, then responses API |
| Email Draft | Chat completions |

**Selection:** Set `AI_PROVIDER_ANTHROPIC=true` or `AI_PROVIDER_OPENAI=true` in `.env`

---

## Database — Supabase

| Detail | Value |
|---|---|
| SDK | `@supabase/supabase-js` v2.98.0 |
| Auth | Service role key (server-side, bypasses RLS) |
| Tables | `intake_reports` + `audit_log` |
| Storage | `intake-pdfs` bucket for uploaded PDFs |

### Table: intake_reports
Stores each police report extraction with full pipeline state:
- Upload metadata (filename, size, storage path)
- Extracted JSON (JSONB from AI)
- Clio match (matter ID, contact ID, names)
- Pipeline status: `draft` | `reviewing` | `approved` | `error`
- Step tracking: fields, retainer, calendar, email (each `pending` | `success` | `error`)
- Timestamps: created, updated, approved

### Table: audit_log
Immutable action log linked to reports:
- Actions: uploaded, extracted, matched, fields_updated, retainer_generated, calendar_created, email_sent, retry, error
- Includes duration_ms, success flag, error details

---

## Clio Manage Integration

| Detail | Value |
|---|---|
| API | Clio REST API v4 |
| Auth | OAuth 2.0 Bearer Token |
| Base URL | `https://app.clio.com` (US) |
| File | `lib/clio.ts` |

### API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /api/v4/matters` | Fetch open matters for name matching |
| `PATCH /api/v4/matters/{id}` | Update custom fields with extracted data |
| `GET /api/v4/contacts/{id}` | Fetch client email address |
| `POST /api/v4/document_automations` | Generate retainer agreement from template |
| `GET /api/v4/documents/{id}/download` | Download generated retainer PDF |
| `POST /api/v4/calendar_entries` | Create statute of limitations deadline |

### Custom Fields (8 configured)
Accident Date, Accident Location, Defendant Name, Client Gender, Pronoun Possessive (his/her), Pronoun Subject (he/she), Registration Plate, Number Injured, Accident Description, Statute of Limitations Date

### Retainer Templates (2)
- **Bodily Injury** (Template #9131206) — when `noInjured > 0`
- **Property Damage** (Template #9131221) — when `noInjured === 0`

---

## Email — Resend

| Detail | Value |
|---|---|
| SDK | `resend` v4.1.2 |
| From | `Andrew Richards <Andrew.Richards@theowhoami.com>` |
| File | `lib/email.ts` |

### Email Content
1. AI-drafted personalized paragraph (context-aware)
2. Retainer agreement explanation
3. Calendly booking link (office or virtual based on month)
4. Attorney signature block
5. PDF attachment (retainer agreement)

### Calendly Logic
- **March - August** (spring/summer) — In-office consultation link
- **September - February** (fall/winter) — Virtual consultation link
- Uses `reportReviewedDate` month (fallback: accident date month)

---

## Pipeline Flow

### Step-by-Step Process

```
1. UPLOAD        User drops MV-104AN PDF into dashboard
                 → PDF stored in Supabase Storage
                 → Sent to AI for extraction (4-30 seconds)

2. EXTRACT       AI reads every field from the police report
                 → Returns structured JSON with confidence scores
                 → Saved to Supabase intake_reports table

3. MATCH         Client name auto-matched against Clio open matters
                 → Handles V1 or V2 as client (incl. pedestrian/bicyclist)
                 → Populates defendant from the other vehicle

4. REVIEW        Human reviews all extracted fields
                 → All fields are editable
                 → Nothing proceeds without human approval

5. APPROVE       One-click triggers 5 automated steps:
                 a) Update Clio custom fields
                 b) Generate retainer (template-based, injured vs property)
                 c) Create calendar entry (accident date + 8 years)
                 d) Download retainer PDF (with retry logic)
                 e) Send email to client via Resend
```

### Error Handling
- Non-fatal step failures don't block the pipeline
- If PDF download fails after 3 retries, email sends without attachment
- All steps logged to audit_log with duration and error details

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/extract` | POST | Upload PDF, AI extraction, store in Supabase |
| `/api/match` | POST | Match extracted names against Clio matters |
| `/api/approve` | POST | Execute 5-step approval pipeline |
| `/api/reports` | GET | List saved reports from Supabase |

---

## Frontend Pages

| Route | Purpose |
|---|---|
| `/dashboard` | Main intake dashboard (upload, review, approve) |
| `/dashboard/infoandrew` | 3-step info page (welcome, workflow, integrations) |

### Dashboard States
1. **Upload** — Blue gradient left panel with drop zone + empty fields on right
2. **Extracting** — Blue progress bar with spinner animation
3. **Review** — PDF viewer left, editable fields right, approve button
4. **Processing** — Step-by-step progress display
5. **Success** — Completion confirmation

---

## Dependencies

### Runtime
| Package | Version | Purpose |
|---|---|---|
| `next` | 14.2.21 | Framework |
| `react` / `react-dom` | ^18.3.1 | UI |
| `@anthropic-ai/sdk` | ^0.39.0 | Claude AI extraction |
| `openai` | ^6.25.0 | GPT-4o AI extraction |
| `@supabase/supabase-js` | ^2.98.0 | Database & storage |
| `resend` | ^4.1.2 | Transactional email |

### Dev
| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^5.6.0 | Type safety |
| `tailwindcss` | ^3.4.17 | Styling |
| `postcss` | ^8.4.49 | CSS pipeline |
| `autoprefixer` | ^10.4.20 | Browser compat |

---

## Environment Variables

### Clio
```
CLIO_BASE_URL, CLIO_CLIENT_ID, CLIO_CLIENT_SECRET, CLIO_ACCESS_TOKEN
CLIO_CALENDAR_ID, CLIO_TEMPLATE_ID, CLIO_TEMPLATE_ID_INJURED, CLIO_TEMPLATE_ID_PROPERTY
CLIO_FIELD_ACCIDENT_DATE, CLIO_FIELD_ACCIDENT_LOCATION, CLIO_FIELD_DEFENDANT_NAME
CLIO_FIELD_CLIENT_GENDER, CLIO_FIELD_REGISTRATION_PLATE, CLIO_FIELD_NUMBER_INJURED
CLIO_FIELD_ACCIDENT_DESCRIPTION, CLIO_FIELD_STATUTE_DATE
```

### AI Providers
```
AI_PROVIDER_ANTHROPIC, AI_PROVIDER_OPENAI
ANTHROPIC_API_KEY, OPENAI_API_KEY
```

### Email & Scheduling
```
RESEND_API_KEY, RESEND_FROM_EMAIL
CALENDLY_OFFICE, CALENDLY_VIRTUAL
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

### App Defaults
```
LAW_FIRM_NAME, ATTORNEY_NAME, STATUTE_YEARS, HACKATHON_EMAIL
```

---

## Key Files

| File | Purpose |
|---|---|
| `app/dashboard/page.tsx` | Main dashboard UI (~1300 lines) |
| `app/dashboard/infoandrew/page.tsx` | Info/onboarding page |
| `app/api/extract/route.ts` | PDF upload + AI extraction endpoint |
| `app/api/match/route.ts` | Clio matter auto-matching |
| `app/api/approve/route.ts` | 5-step approval pipeline |
| `lib/clio.ts` | Clio API client (all endpoints) |
| `lib/email.ts` | Email builder + Resend sender |
| `lib/ai.ts` | AI provider selector |
| `lib/providers/anthropic.ts` | Claude implementation |
| `lib/providers/openai.ts` | GPT-4o implementation |
| `lib/providers/types.ts` | Extraction prompt + interfaces |
| `lib/supabase.ts` | Supabase client setup |
| `lib/calendly.ts` | Calendly link selection |

---

## Security

- **OAuth 2.0** — Clio API uses rotatable bearer tokens
- **Service Role Key** — Supabase backend uses elevated privileges
- **No User Auth** — Single-user demo (Andrew Richards)
- **Env Vars** — All secrets in environment variables, not in code
- **Non-fatal Failures** — Pipeline continues on step failure, logs everything

---

## Running Locally

```bash
git clone <repo>
cd lawyerdemo
npm install
cp .env.example .env
# Fill in all values (see Setup Checklist in CLAUDE.md)
npm run dev
# Open http://localhost:3000/dashboard
```

## Deploying

```bash
npx vercel --prod
# Or push to main branch for auto-deploy
```
