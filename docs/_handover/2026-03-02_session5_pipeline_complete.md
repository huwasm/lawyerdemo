---
title: Handover — Session 5 — Full Pipeline Working (EU)
created: 2026-03-02
updated: 2026-03-02
status: active
author: claude+user
---

# Handover — Session 5 — Full Pipeline Complete on EU

## Summary

Fixed the two remaining broken steps (PDF download + email sending) and achieved a **full 5/5 pipeline pass** on the EU Clio instance. Also created the EU-to-US migration guide. The app is fully functional on EU — ready to switch to US for final submission.

---

## Pipeline Result — ALL 5 STEPS PASSED

```
Matter:   #14537825 (Castillo v Dorjee)
Client:   FAUSTO CASTILLO
Email:    hwasmer1@gmail.com
Duration: 9,932ms (~10 seconds)
```

| Step | Action | Status | Detail |
|------|--------|--------|--------|
| 1 | Update custom fields | **DONE** | 8 fields updated on Matter #14537825 |
| 2 | Generate retainer | **DONE** | Template #359618 → `Retainer_Agreement_CASTILLO.pdf` |
| 3 | Create calendar entry | **DONE** | SOL date 2030-11-16 on calendar #437603 |
| 4 | Download retainer PDF | **DONE** | 135,158 bytes from S3 via EU workaround endpoint |
| 5 | Send email | **DONE** | Resend ID `a9f3e8e7-3a4d-4aac-a4a2-6175481b2a96` → hwasmer1@gmail.com |

---

## What Was Fixed This Session

### Fix 1: PDF Download (Step 4) — was returning 404

**Root cause:** EU Clio does NOT support the standard endpoint:
```
GET /api/v4/document_versions/{versionId}/download  → 404 on EU (always)
```

**Fix:** Switched to alternative endpoint that works on EU:
```
GET /api/v4/documents/{documentId}/download.json  → 303 redirect → S3 presigned URL
```

**Code change:** `lib/clio.ts` → `downloadDocument()` function
- Uses `redirect: 'manual'` to catch the 303
- Strips Authorization header before following to S3 (avoids dual-auth conflict)
- Marked with `EU-WORKAROUND` comment block

**How it was discovered:**
- Tested all 3 document version IDs with both old and new OAuth tokens — all 404
- Re-authorized OAuth with Documents R/W scope — still 404
- User researched Clio API docs and found the alternative `/documents/{id}/download.json` endpoint
- Curl test confirmed: 303 → S3 → 135KB valid PDF

### Fix 2: Email Sending (Step 5) — was returning 401, then 403

**Issue 1 (401):** Old Resend API key `re_gj55WNM8_...` was invalid/revoked.
**Fix:** User generated new key `re_6qt6Pu4n_...` at resend.com/api-keys.

**Issue 2 (403):** Resend free tier with `onboarding@resend.dev` sender can only send to the account owner's email.
**Fix:** Changed `HACKATHON_EMAIL` from `huwas003@gmail.com` to `hwasmer1@gmail.com` (the Resend account email).

---

## Key Files Changed

| File | Change |
|------|--------|
| `lib/clio.ts` | Rewrote `downloadDocument()` — EU workaround endpoint + manual redirect handling. Added EU-CONFIG comment block at top. |
| `.env.local` | Updated `RESEND_API_KEY` (new key), `HACKATHON_EMAIL` → `hwasmer1@gmail.com` |
| `docs/EU_TO_US_MIGRATION.md` | **NEW** — Complete 9-step migration checklist for switching from EU to US Clio |
| `docs/_handover/README.md` | Added link to migration doc |

---

## Current .env.local State (EU — Working)

```
CLIO_BASE_URL=https://eu.app.clio.com
CLIO_ACCESS_TOKEN=4100-zGWhnZQiQAaQFaWD2a72qKeEWRYI3h0tkpA
CLIO_CALENDAR_ID=437603
CLIO_TEMPLATE_ID=359618
CLIO_FIELD_ACCIDENT_DATE=482348
CLIO_FIELD_ACCIDENT_LOCATION=482369
CLIO_FIELD_DEFENDANT_NAME=483293
CLIO_FIELD_CLIENT_GENDER=483299
CLIO_FIELD_REGISTRATION_PLATE=483302
CLIO_FIELD_NUMBER_INJURED=483296
CLIO_FIELD_ACCIDENT_DESCRIPTION=483305
CLIO_FIELD_STATUTE_DATE=483308
RESEND_API_KEY=re_6qt6Pu4n_P5wWyCCAefPLijBZscLaakzQ
HACKATHON_EMAIL=hwasmer1@gmail.com
```

---

## Known Limitations

1. **Resend free tier:** Can only send to `hwasmer1@gmail.com`. For hackathon demo email to `talent.legal-engineer...@swans.co`, need a verified domain on Resend OR use the hackathon-provided email if it matches the Resend account.
2. **Multiple retainer copies:** Each pipeline run creates a new retainer document in Clio. The Castillo matter now has 5 copies. Consider adding dedup logic or just clean up manually.
3. **Download picks first match:** `downloadDocument()` picks the first document matching the name filter. This is fine since all copies are identical.

---

## What Still Needs to Happen

### Immediate: US Clio Switch
See `docs/EU_TO_US_MIGRATION.md` for the complete step-by-step checklist. Summary:

1. Create US Clio account (VPN to US, sign up at clio.com)
2. Register app → get Client ID + Secret
3. OAuth flow → get Access Token
4. Create 8 custom fields → note IDs
5. Upload retainer template → note Template ID
6. Get Calendar ID
7. Create 5 test matters + contacts
8. Update `.env.local` (14 env vars)
9. Test the download endpoint (may work differently on US)
10. Run full pipeline on US

### Then: Test All 5 PDFs
Upload each police report and verify:
- Reyes v Francois (demo case for Email #3)
- Noel v Freese (she/her pronouns)
- Castillo v Dorjee (V2 pedestrian, injured=1)
- Grillo v Kim (V2 bicyclist)
- Vincent v Trent (she/her pronouns)

### Then: Deploy to Vercel
- Update Vercel env vars with US values
- Deploy: `vercel --prod`
- Test from production URL

---

## Architecture Quick Reference

```
Police Report PDF
       │
       ▼
  /api/extract  ──→ Claude/GPT Vision ──→ Extracted JSON
       │
       ▼
  /api/match    ──→ Clio API ──→ Matched Matter + Contact
       │
       ▼
  /api/approve  ──→ 5-Step Pipeline:
       │              1. PATCH /matters/{id}          (custom fields)
       │              2. POST /document_automations   (retainer)
       │              3. POST /calendar_entries        (SOL deadline)
       │              4. GET /documents/{id}/download  (PDF binary)
       │              5. Resend API                    (email + PDF)
       ▼
  Email arrives with retainer PDF attached
```
