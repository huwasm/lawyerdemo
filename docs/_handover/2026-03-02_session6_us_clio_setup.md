---
title: Handover — Session 6 — US Clio Setup + Retainer Template + Conditional Fix
created: 2026-03-02
updated: 2026-03-02
status: active
author: claude+user
---

# Handover — Session 6 — US Clio Setup + Retainer Template + Conditional Fix

## Summary

Completed the full US Clio account setup (Phase 13). Created retainer template vCar2.0 with proper Word MERGEFIELD codes for all merge fields including pronouns. Ran the first successful US pipeline on the Reyes case — all 5 steps green, 13 seconds. Then fixed the conditional paragraph issue by creating two v3.0 template variants (injured + property). Code now selects the correct template based on `noInjured` value. Reyes property-only PDF verified — only one paragraph, no instruction text.

---

## Pipeline Result — US — Reyes Case — ALL 5 STEPS PASSED

```
Matter:   #1769243911 (Reyes v Francois)
Client:   Guillermo Reyes
Email:    hwasmer1@gmail.com
Duration: 13,198ms (~13 seconds)
```

| Step | Action | Status | Detail |
|------|--------|--------|--------|
| 1 | Update custom fields | **DONE** | 10 fields (8 original + 2 pronouns) |
| 2 | Generate retainer | **DONE** | Template #9131176 (vCar2.0) |
| 3 | Create calendar entry | **DONE** | SOL date 2026-12-06 on calendar #8709871 |
| 4 | Download retainer PDF | **DONE** | 92,892 bytes from S3 via EU workaround endpoint |
| 5 | Send email | **DONE** | Resend ID `4419f289-3216-4192-9a0c-2bfbdf39b32a` → hwasmer1@gmail.com |

### Retainer PDF Verification (Reyes)

All merge fields populated correctly:
- Client Name: Guillermo Reyes
- Accident Date: December 6, 2018 (verbose format)
- Defendant: LIONEL FRANCOIS
- Pronouns: "his" (×5 possessive), "he" (×1 subject) — all correct for male client
- Location: Flatbush Avenue, Plaza Street East, Kings
- Registration Plate: R29823070066942
- Statute Date: December 6, 2026 (verbose format)
- Signatures: Guillermo Reyes / Andrew Richards

---

## Completed

### US Clio Account (Phase 13)
- [x] US Clio account created — firm "Richards & Law", attorney "Andrew Richards"
- [x] App registered — App ID 27041, redirect URI `http://127.0.0.1:3000/callback`
- [x] OAuth token — `27041-41luonkV9P56h6y6Ues54Yk4Zxx3nXUlkZ` (Contacts Write enabled)
- [x] 10 custom fields created (8 original + 2 pronoun fields)
- [x] 5 contacts created — all with email `hwasmer1@gmail.com` (testing)
- [x] 5 matters created — Reyes v Francois, Noel v Freese, Castillo v Dorjee, Grillo v Kim, Vincent v Trent
- [x] Calendar ID obtained — 8709871
- [x] `.env.local` + `.env.us` updated with all US values

### Retainer Template
- [x] vCar1.0 — initial template with plain-text `<<...>>` tags (pronouns didn't work)
- [x] vCar2.0 — generated with python-docx using proper Word MERGEFIELD codes (pronouns work)
- [x] Template ID: **9131176** (vCar2.0, single template with both paragraphs)
- [x] All merge fields verified working in generated PDF

### Conditional Paragraphs Fix (Two-Template Approach)
- [x] vCar3.0_injured — only bodily injury paragraph, no instruction text
- [x] vCar3.0_property — only property damage paragraph, no instruction text
- [x] Both generated with python-docx from vCar2.0 base
- [x] Uploaded to Clio: **injured=#9131206**, **property=#9131221**
- [x] `lib/clio.ts` — `generateRetainer()` now accepts optional `templateId` parameter
- [x] `approve/route.ts` — selects template by `noInjured > 0` (injured) vs `noInjured == 0` (property)
- [x] `.env.local` — added `CLIO_TEMPLATE_ID_INJURED=9131206` and `CLIO_TEMPLATE_ID_PROPERTY=9131221`
- [x] Verified: Reyes (noInjured=0) → property template → PDF has only property paragraph ✅

### Pronoun Fix
- [x] Created 2 new Clio custom fields: Client Pronoun Possessive (17830516), Client Pronoun Subject (17830531)
- [x] `approve/route.ts` writes "his"/"her" and "he"/"she" based on `clientGender`
- [x] Template vCar2.0 uses correct fields: `ClientPronounPossessive` (×5) and `ClientPronounSubject` (×1)
- [x] Verified in PDF: all pronouns appear correctly

### Bug Fixes
- [x] **Stale document download** — `docs.find()` was picking the oldest retainer instead of the newest. Fixed by sorting documents by ID descending before `.find()`.

### Other
- [x] Favicon created — `app/icon.svg` (R&L navy/gold design)
- [x] `app/layout.tsx` updated with favicon metadata
- [x] US pipeline 5/5 passed on Reyes case

---

## Conditional Paragraphs — RESOLVED ✅

**Problem:** vCar2.0 had both injured and not-injured paragraphs with `{Include this Paragraph if...}` instruction text. Clio doesn't process conditionals — both appeared in every PDF.

**Solution:** Two-template approach (most bulletproof). Code selects template at runtime:
- `noInjured > 0` → **injured template** (#9131206) — bodily injury paragraph only
- `noInjured == 0` → **property template** (#9131221) — property damage paragraph only

**Verified:** Reyes (noInjured=0) generates PDF with only the property paragraph. No instruction text visible.

---

## Template Evolution

| Version | Template ID | What Changed |
|---|---|---|
| Original | — | `[square bracket]` placeholders, not uploaded to Clio |
| vCar1.0 | 9131146 | Plain text `<<...>>` tags, wrong pronoun field names (ClientGender, Subject) |
| vCar2.0 | 9131176 | Proper Word MERGEFIELD codes, correct pronoun fields, all working (but both conditional paragraphs) |
| **vCar3.0_injured** | **9131206** | **Only bodily injury paragraph, no instruction text** |
| **vCar3.0_property** | **9131221** | **Only property damage paragraph, no instruction text** |

Template files in `docs/temp/`:
- `Retainer Agreement - Richards & Law [Hackathon].docx` — original with `[brackets]`
- `Retainer_Agreement_Richards_and_Law_Hackathon_vCar1.0.docx` — first attempt
- `Retainer_Agreement_Richards_and_Law_Hackathon_vCar2.0.docx` — single template (superseded)
- `Retainer_Agreement_Richards_and_Law_Hackathon_vCar3.0_injured.docx` — **current, injured cases**
- `Retainer_Agreement_Richards_and_Law_Hackathon_vCar3.0_property.docx` — **current, property cases**

---

## Current .env.local State (US)

```
CLIO_BASE_URL=https://app.clio.com
CLIO_CLIENT_ID=C8zXuxBxVx98hmtb9kaRYmUaM9YP6BCYURDU6jwq
CLIO_CLIENT_SECRET=70N6Qj1fjDw9TinvT9PlHqWltzYrOyw8blcvTt3B
CLIO_ACCESS_TOKEN=27041-41luonkV9P56h6y6Ues54Yk4Zxx3nXUlkZ
CLIO_CALENDAR_ID=8709871
CLIO_TEMPLATE_ID=9131176
CLIO_TEMPLATE_ID_INJURED=9131206
CLIO_TEMPLATE_ID_PROPERTY=9131221
CLIO_FIELD_ACCIDENT_DATE=17830291
CLIO_FIELD_ACCIDENT_LOCATION=17830306
CLIO_FIELD_DEFENDANT_NAME=17830321
CLIO_FIELD_CLIENT_GENDER=17830336
CLIO_FIELD_REGISTRATION_PLATE=17830351
CLIO_FIELD_NUMBER_INJURED=17830366
CLIO_FIELD_ACCIDENT_DESCRIPTION=17830381
CLIO_FIELD_STATUTE_DATE=17830396
CLIO_FIELD_PRONOUN_POSSESSIVE=17830516
CLIO_FIELD_PRONOUN_SUBJECT=17830531
```

## US Clio Resources

| Resource | ID |
|---|---|
| App ID | 27041 |
| OAuth Token | 27041-41luonkV9P56h6y6Ues54Yk4Zxx3nXUlkZ |
| Calendar (Andrew Richards) | 8709871 |
| Template (vCar2.0, fallback) | 9131176 |
| Template (vCar3.0 injured) | 9131206 |
| Template (vCar3.0 property) | 9131221 |
| Contact: Guillermo Reyes | 2353636591 |
| Contact: Darshame Noel | 2353636606 |
| Contact: Fausto Castillo | 2353636621 |
| Contact: John Grillo | 2353636636 |
| Contact: Mardochee Vincent | 2353636651 |
| Matter: Reyes v Francois | 1769243911 |

## Key Files Changed

| File | Change |
|---|---|
| `.env.local` | US values, template IDs (injured/property), pronoun field IDs |
| `.env.us` | Backup of US .env.local (synced with all current values) |
| `lib/clio.ts` | `generateRetainer()` accepts optional `templateId` parameter |
| `app/api/approve/route.ts` | Pronoun fields + document sort fix + template selection by `noInjured` |
| `app/icon.svg` | **NEW** — Favicon (R&L navy/gold) |
| `app/layout.tsx` | Added favicon metadata |
| `docs/temp/..._vCar2.0.docx` | Retainer template with proper Word MERGEFIELD codes (superseded) |
| `docs/temp/..._vCar3.0_injured.docx` | **NEW** — Retainer template for injured cases |
| `docs/temp/..._vCar3.0_property.docx` | **NEW** — Retainer template for property-only cases |

---

## Next Steps

1. ~~**Fix conditional paragraphs**~~ — ✅ DONE (two-template approach)
2. **Test remaining 4 PDFs** — Noel (she/her, noInjured=0→property), Castillo (pedestrian, noInjured=1→injured), Grillo (bicyclist), Vincent (she/her)
3. **Deploy to Vercel** — Update env vars with US values + new template IDs
4. **Change contact emails** — Switch to `talent.legal-engineer...@swans.co` (requires verified Resend domain)
5. **Record demo video** — 15-min walkthrough
6. **Submit** — 3 emails

---

## Notes

- **Port**: Dev server on port 3000
- **Redirect URI**: `http://127.0.0.1:3000/callback` (not localhost)
- **Resend free tier**: Only sends to `hwasmer1@gmail.com`. Need verified domain for hackathon email.
- **EU config**: `.env.eu` backup exists. Switch: `cp .env.eu .env.local`
- **Download endpoint**: EU workaround (`/documents/{id}/download.json`) also works on US Clio
- **Registration plate on Reyes**: `R29823070066942` may be report number not plate — check extraction
- **Template generation**: vCar2.0 was built with python-docx inserting proper `w:fldChar`/`w:instrText` MERGEFIELD elements, not plain text `<<...>>`
