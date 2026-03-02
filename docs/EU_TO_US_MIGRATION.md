---
title: EU to US Clio Migration Checklist
created: 2026-03-02
status: active
author: claude+user
---

# EU to US Clio Migration

One-stop guide. Follow top to bottom. No code files need changing — everything is env vars except one potential code revert (see Step 6).

---

## Step 1: Create US Clio Account

1. Use VPN (US server) — without it you'll get redirected to `clio.com/uk/`
2. Go to https://www.clio.com → sign up for free trial
3. Set firm name: **Richards & Law**, attorney: **Andrew Richards**

---

## Step 2: Register App in US Clio

1. Settings → API → Applications → Register a new app
2. Set redirect URI: `http://localhost:3001/callback` (or your Vercel URL + `/callback`)
3. **Permissions needed**: Matters (R/W), Contacts (R), Documents (R/W), Calendars (R/W)
4. Save:
   - `CLIO_CLIENT_ID` → new value
   - `CLIO_CLIENT_SECRET` → new value

---

## Step 3: OAuth — Get Access Token

```bash
# 1. Open in browser:
https://app.clio.com/oauth/authorize?response_type=code&client_id=YOUR_NEW_CLIENT_ID&redirect_uri=http://localhost:3001/callback

# 2. Authorize → redirected to callback with ?code=XXXXX

# 3. Exchange code for token:
curl -X POST https://app.clio.com/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=THE_CODE_FROM_STEP_2" \
  -d "client_id=YOUR_NEW_CLIENT_ID" \
  -d "client_secret=YOUR_NEW_CLIENT_SECRET" \
  -d "redirect_uri=http://localhost:3001/callback"
```

Save: `CLIO_ACCESS_TOKEN` → the access_token from the response

---

## Step 4: Create Custom Fields in US Clio

Settings → Custom Fields → Add on **Matters**:

| Field Name | Type | Env Var |
|---|---|---|
| Accident Date | Date | `CLIO_FIELD_ACCIDENT_DATE` |
| Accident Location | Text Line | `CLIO_FIELD_ACCIDENT_LOCATION` |
| Defendant Name | Text Line | `CLIO_FIELD_DEFENDANT_NAME` |
| Client Gender | Picklist (Male / Female) | `CLIO_FIELD_CLIENT_GENDER` |
| Registration Plate | Text Line | `CLIO_FIELD_REGISTRATION_PLATE` |
| Number Injured | Numeric | `CLIO_FIELD_NUMBER_INJURED` |
| Accident Description | Text Area | `CLIO_FIELD_ACCIDENT_DESCRIPTION` |
| Statute of Limitations Date | Date | `CLIO_FIELD_STATUTE_DATE` |

Get all IDs:
```bash
curl "https://app.clio.com/api/v4/custom_fields?fields=id,name" \
  -H "Authorization: Bearer YOUR_US_TOKEN"
```

---

## Step 5: Upload Retainer Template

1. Documents → Document Templates → Upload `Retainer Agreement - Richards & Law [Hackathon].docx`
2. Convert merge fields using Clio Draft Word add-in (`[brackets]` → `{curly}`)
3. Get template ID:

```bash
curl "https://app.clio.com/api/v4/document_templates?fields=id,name" \
  -H "Authorization: Bearer YOUR_US_TOKEN"
```

Save: `CLIO_TEMPLATE_ID` → new value

---

## Step 5b: Get Calendar ID

```bash
curl "https://app.clio.com/api/v4/calendars?fields=id,name,type" \
  -H "Authorization: Bearer YOUR_US_TOKEN"
```

Save: `CLIO_CALENDAR_ID` → Andrew Richards' calendar ID (NOT User ID!)

---

## Step 5c: Create Test Matters + Contacts

Create these 5 matters in US Clio (assign Andrew Richards as responsible attorney):

| Matter Name | First | Last | Email |
|---|---|---|---|
| Reyes v Francois | Guillermo | Reyes | talent.legal-engineer.hackathon.automation-email@swans.co |
| Noel v Freese | Darshame | Noel | talent.legal-engineer.hackathon.automation-email@swans.co |
| Castillo v Dorjee | Fausto | Castillo | talent.legal-engineer.hackathon.automation-email@swans.co |
| Grillo v Kim | John | Grillo | talent.legal-engineer.hackathon.automation-email@swans.co |
| Vincent v Trent | Mardochee | Vincent | talent.legal-engineer.hackathon.automation-email@swans.co |

---

## Step 6: Test Download Endpoint (IMPORTANT)

The EU instance does **NOT** support the standard download endpoint:
```
GET /api/v4/document_versions/{versionId}/download  → 404 on EU
```

Our code currently uses the EU workaround:
```
GET /api/v4/documents/{documentId}/download.json  → 303 → S3 (works on EU)
```

**Test if US supports the standard endpoint:**
```bash
# First, find a document version ID:
curl "https://app.clio.com/api/v4/documents?fields=id,name,latest_document_version&matter_id=YOUR_MATTER_ID" \
  -H "Authorization: Bearer YOUR_US_TOKEN"

# Then test the standard download:
curl -v "https://app.clio.com/api/v4/document_versions/VERSION_ID/download" \
  -H "Authorization: Bearer YOUR_US_TOKEN"
```

**If US returns 303 (redirect to S3):** The standard endpoint works on US! But our EU workaround will also work — no code change needed.

**If US also returns 404:** Our EU workaround already handles this — no change needed.

**Bottom line: The current code should work on both EU and US.** The workaround endpoint (`/documents/{id}/download.json`) is a valid Clio API endpoint, not a hack.

Code location: `lib/clio.ts` → `downloadDocument()` function (search for `EU-WORKAROUND`)

---

## Step 7: Update `.env.local`

Replace ALL these values. The **left column** is what to change, **right** is where the new value comes from:

```env
# ── CLIO API ──────────────────────────────────────────
CLIO_BASE_URL=https://app.clio.com              # ← was eu.app.clio.com
CLIO_CLIENT_ID=<from Step 2>                     # ← new app registration
CLIO_CLIENT_SECRET=<from Step 2>                 # ← new app registration
CLIO_ACCESS_TOKEN=<from Step 3>                  # ← new OAuth token
CLIO_CALENDAR_ID=<from Step 5b>                  # ← new calendar ID
CLIO_TEMPLATE_ID=<from Step 5>                   # ← new template ID

# ── CLIO CUSTOM FIELD IDs ────────────────────────────
CLIO_FIELD_ACCIDENT_DATE=<from Step 4>
CLIO_FIELD_ACCIDENT_LOCATION=<from Step 4>
CLIO_FIELD_DEFENDANT_NAME=<from Step 4>
CLIO_FIELD_CLIENT_GENDER=<from Step 4>
CLIO_FIELD_REGISTRATION_PLATE=<from Step 4>
CLIO_FIELD_NUMBER_INJURED=<from Step 4>
CLIO_FIELD_ACCIDENT_DESCRIPTION=<from Step 4>
CLIO_FIELD_STATUTE_DATE=<from Step 4>
```

**Do NOT change** (these are not Clio-specific):
```env
OPENAI_API_KEY=...          # same
ANTHROPIC_API_KEY=...       # same
RESEND_API_KEY=...          # same
LAW_FIRM_NAME=...           # same
ATTORNEY_NAME=...           # same
STATUTE_YEARS=...           # same
CALENDLY_OFFICE=...         # same
CALENDLY_VIRTUAL=...        # same
HACKATHON_EMAIL=...         # same
NEXT_PUBLIC_SUPABASE_*=...  # same
```

---

## Step 8: Update `.env.vercel` (for deployment)

Same changes as Step 7 but in `.env.vercel`. Then redeploy:
```bash
vercel env pull  # or manually update on Vercel dashboard
vercel --prod
```

---

## Step 9: Verify End-to-End

1. `npm run dev`
2. Upload a police report PDF (start with Reyes — the demo case)
3. Check extraction works (Steps 1-3 should pass immediately)
4. Check retainer download (Step 4 — this is what was broken on EU)
5. Check email sending (Step 5 — verify Resend API key works)
6. Test all 5 PDFs

---

## Quick Reference: EU vs US Values

| Env Var | EU Value (current) | US Value (fill in) |
|---|---|---|
| `CLIO_BASE_URL` | `https://eu.app.clio.com` | `https://app.clio.com` |
| `CLIO_CLIENT_ID` | `gAB5MWWemVFYpBqt5Mf2WRpPdxDVegujAcp2q0oC` | |
| `CLIO_CLIENT_SECRET` | `8EcCDxt37YFwhqukLFwUem3fI6B3TIrqzxxgjHlj` | |
| `CLIO_ACCESS_TOKEN` | `4100-zGWhnZQiQAaQFaWD2a72qKeEWRYI3h0tkpA` | |
| `CLIO_CALENDAR_ID` | `437603` | |
| `CLIO_TEMPLATE_ID` | `359618` | |
| `CLIO_FIELD_ACCIDENT_DATE` | `482348` | |
| `CLIO_FIELD_ACCIDENT_LOCATION` | `482369` | |
| `CLIO_FIELD_DEFENDANT_NAME` | `483293` | |
| `CLIO_FIELD_CLIENT_GENDER` | `483299` | |
| `CLIO_FIELD_REGISTRATION_PLATE` | `483302` | |
| `CLIO_FIELD_NUMBER_INJURED` | `483296` | |
| `CLIO_FIELD_ACCIDENT_DESCRIPTION` | `483305` | |
| `CLIO_FIELD_STATUTE_DATE` | `483308` | |

---

## Files That Reference EU (for awareness only — no changes needed)

These files mention `eu.app.clio.com` in docs/comments. They do NOT need changing for the app to work — they're just documentation:

- `CLAUDE.md` — setup instructions (EU test account section)
- `CLAUDE_CODE_BRIEFING.md` — technical spec
- `ANALYSIS.md` — problem analysis
- `PROJECT_STATUS.md` — status tracker
- `DOCUMENTATION.md` — full docs
- `docs/clio/README.md` — Clio API reference
- `docs/setup/README.md` — setup guide
- `docs/deploy/README.md` — deploy guide
- `docs/_handover/*.md` — session handover notes

**Zero code files reference `eu.app.clio.com` directly** — it's all driven by the `CLIO_BASE_URL` env var.
