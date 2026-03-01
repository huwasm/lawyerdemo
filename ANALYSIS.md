# Hackathon Problem Analysis — Full Report
**Date:** 2026-03-01
**Version:** 3.1 — Updated extraction fields (ins_code, is_other_pedestrian, full field mapping)

---

## SUMMARY

**What:** Build an automation that reads police report PDFs, extracts accident data using AI, pushes it into Clio Manage (legal software), generates a retainer agreement, calendars a deadline, and emails the client — all triggered by one button press after human verification.

**Core flow:** Upload PDF → AI extracts fields → auto-match client to existing Clio Matter by First+Last name → team verifies → approve → Clio updated + retainer generated + calendar entry + email sent. Done.

**Key discoveries:**
- `POST /document_automations` is an undocumented Clio API endpoint that triggers document generation — this was the hardest problem, now solved
- Client is NOT always Vehicle 1 in police reports (2 of 5 test cases have client as Vehicle 2)
- Police report is neutral — client identity comes from the pre-existing Clio Matter, matched by name
- The PDF filename is meaningless — could be anything. The file could be a photo, a bad scan, or a court filing
- 5 fields needed by the retainer/email are NOT in the police report (law firm name, attorney name, statute date, client email, Calendly link)
- 2 API calls still untested: PDF download from Clio, contact email address string retrieval

**Tech stack:** Next.js 14 (React + Tailwind) → Vercel. Dual AI (Claude Vision / GPT-4o) for OCR. Clio API v4. Supabase (DB + Storage). Resend for email.

---

## Why This Has Value (It's Not Rocket Science — That's The Point)

You're right — this isn't rocket science. The individual pieces are simple: an API call here, an AI extraction there, a form, an email. Someone who understands Clio could wire this up in a day or two.

**So why do law firms pay for this?**

Because **lawyers don't have that someone.** Think of it like farming equipment — a combine harvester isn't complicated technology. It's gears, blades, and a motor. But most farmers don't build their own combines. They buy them because:

1. **Time cost is enormous.** A paralegal at Andrew's firm earns $25-40/hour. Manual intake for one case takes 30-60 minutes (read PDF, type into Clio, generate retainer, write email, calendar deadline). At 20 new cases/month, that's 10-20 hours of paralegal time — $250-800/month in labor, plus the errors. Our automation does it in 30 seconds.

2. **Speed wins clients.** Personal injury is competitive. The first firm to respond with a professional retainer often gets the case. If Andrew's automation sends a polished email with the retainer attached within minutes of receiving the police report, while competitors take 2-3 days, Andrew wins the client. In personal injury, one case can be worth $10,000-100,000+ in fees.

3. **The Clio API knowledge is rare.** We discovered undocumented endpoints (`/document_automations`). The calendar entry requires Calendar ID not User ID — that took us hours of debugging. The OAuth token exchange must be form-urlencoded not JSON. These "small" gotchas stop most people cold. The knowledge barrier is the moat, not the code complexity.

4. **Integration is the hard part.** Each piece is simple alone. The value is connecting them: AI extraction → Clio custom fields → document automation → calendar → email with attachment → seasonal Calendly logic. Most law firms can't even get one API integration working, let alone chain 6 together.

5. **It scales.** Once built, this handles 5 cases/day or 50 — same cost. The paralegal can verify cases from their phone during lunch instead of sitting at a desk for hours.

**Bottom line:** The value isn't in the code's complexity. It's in the integration knowledge, the time saved, and the competitive speed advantage. Like selling a combine harvester to a farmer who's been picking wheat by hand — the machine isn't complicated, but it changes their business.

---

## What Is Clio Manage?

Think of Clio Manage as the **combine harvester of law firms** — it's the one machine that handles almost everything on the farm. It's a cloud-based practice management software where law firms store all their case info, client contacts, documents, billing, and calendars in one place.

Key concepts in Clio (in farming terms):

| Clio Term | Farming Analogy | What It Actually Is |
|---|---|---|
| **Matter** | A specific crop/field you're working | A legal case — holds all info about one case |
| **Contact** | A customer/supplier in your address book | A person (client, defendant, witness, etc.) |
| **Custom Fields** | Extra columns in your harvest log | Extra data fields you add to a Matter (e.g., "Accident Location") |
| **Document Automation** | Your seed drill template that auto-fills row spacing | Clio's built-in feature: you upload a Word doc with `{merge fields}` and Clio fills them from the Matter/Contact data |
| **Merge Fields** | The placeholders on seed bags that get filled per batch | Placeholders like `{Client Name}` in curly brackets — Clio replaces them with real data |
| **Calendar Entry** | Your planting/harvest schedule | Deadlines, appointments, court dates tied to a Matter |
| **Responsible Attorney** | The farm manager assigned to that field | The lawyer in charge of a specific case |
| **Clio Draft** | The precision planter attachment | Clio's advanced document automation with conditional logic (if/then), compound conditions, and pronoun switching |
| **OAuth 2.0** | The gate key to enter the farm | How external apps authenticate to talk to Clio's API |

### How Clio Works Under the Hood

**API:** Clio has a full REST API (v4). Authentication is OAuth 2.0 (Authorization Code flow). You can create/update Matters, Contacts, Custom Fields, Calendar entries, and Documents — all via API.

**Document Automation:** You upload a Word template (.docx) with merge fields in `{curly brackets}`. Clio fills them from Matter + Contact data. The template is built using a **Microsoft Word add-in** called "Clio Draft Template Builder."

**Conditional logic in templates:**
- **Triggered conditions:** IF a field has a certain value, THEN include text
- **Compound conditions:** IF Field A = X AND Field B exists
- Pronouns (his/her) can be auto-switched based on a field value

**Document automation via API:** `POST /document_automations` — undocumented but working. Proven on EU test account.

---

## The Problem In Plain English

Andrew Richards runs a personal injury law firm in New York. When a potential client contacts them after a car accident, a paralegal creates a basic Matter in Clio. Then the client sends a police report PDF. Right now, paralegals have to manually read the PDF, type every detail into Clio by hand, generate a retainer agreement, and send the client an email. This is too slow — clients leave before the firm can respond.

---

## The Automation Pipeline (Corrected Flow)

### The Simple Version
Upload a police report PDF into a dashboard. AI extracts all the fields. System auto-matches to the right client in Clio. Team verifies, presses one button. Everything else is automatic.

### How Client Identification Works

**The police report is NEUTRAL** — it just says Vehicle 1 and Vehicle 2. It doesn't know or care who will hire a lawyer.

**The Clio Matter already knows who the client is.** The paralegal created it with a Contact attached: First Name, Last Name, and Email. We don't care HOW the Matter was created — phone call, email, walk-in, carrier pigeon.

**Matching logic:**
1. AI extracts ALL names from the police report (all drivers, pedestrians, cyclists)
2. API calls `GET /matters?fields=id,client` to get all Matters with client names
3. System matches client First+Last name from Clio against extracted names
4. **1 match** → proceed automatically (client identified, defendant = the other party)
5. **Multiple matches** (e.g., 4 "Fausto Castillo" Matters) → dashboard shows picker, team selects
6. **Zero matches** → dashboard shows warning + search field as fallback

**This means:** The system automatically knows who is the client and who is the defendant, even when the client is a pedestrian (Vehicle 2) or bicyclist. No dropdown needed in the happy path.

### What the Client Email Field Is

The Contact on the Matter already has the email (First Name, Last Name, Email are required fields per the challenge). For the hackathon, all emails go to: `talent.legal-engineer.hackathon.automation-email@swans.co`.

The dashboard should show the email field (pulled from Clio Contact) so the team can verify it's correct before sending.

### Input Channel Doesn't Matter

The police report could arrive via email, WhatsApp, fax, or USB stick. We don't build intake-channel integration. The team member just uploads the file to the dashboard. If it came via WhatsApp, they save it and upload. The dashboard is channel-agnostic.

### Flow Diagram
```
[1] Team member uploads police report PDF to dashboard
       |
       v
[2] AI (Claude Vision) extracts all fields → structured JSON
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
```

### What Lives in Clio After the Pipeline Runs
- Filled custom fields on the Matter
- Generated retainer PDF in the Matter's documents
- Statute of Limitations calendar entry on the attorney's calendar

**Email is NOT sent through Clio** — our automation sends it (Resend/SendGrid).

### Tech Decision: Simple Next.js App
- **Frontend:** One-page React app (Next.js) with Tailwind — upload + form + approve button
- **Backend:** Next.js API routes calling Claude Vision + Clio API
- **Deploy:** Vercel (one-click)
- **Not a PWA** — no offline/installable features needed (app needs internet for Clio anyway)
- **Clio color scheme** (#0070E0 blue, #333 dark, white) for professional look

---

## Critical Data to Extract From Police Reports

### All 5 Reports Compared

All 5 are NYC MV-104AN format, but they vary significantly:

| Field | Guillermo Reyes | Darshame Noel | Fausto Castillo | John Grillo | Mardochee Vincent |
|---|---|---|---|---|---|
| Date | 12/6/2018 | 2/15/2019 | 11/16/2022 | 7/16/2020 | 3/31/2022 |
| No. Injured | 0 | 0 | 1 | 0 | 0 |
| No. Vehicles | 2 | 2 | 1 | 1 | 2 |
| V1 Driver | REYES, GUILLERMO | NOEL, DARSHAME | DORJEE, CHIMIE | KIM, CHE H | VINCENT, MARDOCHEE |
| V1 Sex | M | **F** | M | M | **F** |
| V1 Plate | XCGY85 NJ | DYY7657 NY | T698783C NY | AZ2874 NY | 20065SH NY |
| V2 Driver | FRANCOIS, LIONEL | FREESE, FRANCIS E | CASTILLO, FAUSTO | GRILLO, JOHN | TRENT, RONALD J |
| V2 Type | Vehicle | Vehicle | **Pedestrian** | **Bicyclist** | Vehicle |
| Borough | Kings | Queens | New York | New York | Kings |
| Location | Flatbush Ave & Plaza St East | Long Island Expy & Woodhaven Blvd | West 105 St & Central Park West | West 24 St & 12 Ave | 211 Crown St & Rogers Ave |

### ⚠️ BIG FINDING: Client is NOT Always Vehicle 1

In 2 of the 5 reports, the **client (plaintiff) is Vehicle 2**, not Vehicle 1:
- **Castillo**: Client is CASTILLO, FAUSTO — listed as Vehicle 2 (pedestrian hit by Vehicle 1)
- **Grillo**: Client is GRILLO, JOHN — listed as Vehicle 2 (bicyclist hit by Vehicle 1)

This is solved by the auto-match logic: the Clio Matter's client name is compared against ALL extracted names to determine who is client and who is defendant.

### ⚠️ Not Always Car vs Car

- **Castillo**: Vehicle vs **Pedestrian** (no Vehicle 2 plate/vehicle info)
- **Grillo**: Vehicle vs **Bicyclist** (Vehicle 2 = "BIKE", no plate)
- **Vincent**: **School bus** (Y&M Transit Corp) vs SUV — commercial vehicle
- **Reyes**: **Box truck** (B and F Transport Ltd) vs Van — commercial vehicle

**Implication:** Registration plate may be empty for pedestrian/cyclist clients. The retainer template field `[Registration Plate Number of the Client's Car]` needs a fallback (e.g., "N/A" or skip).

### ⚠️ Test Data vs Real Life

Our 5 test PDFs are court filings from NYSCEF (New York State Courts Electronic Filing). They have headers like "FILED: NEW YORK COUNTY CLERK 10/02/2025" — this is NOT what the client sends. In real life, the client sends the raw police report (MV-104AN form) — no court header, possibly a phone photo, bad scan, or renamed file. The filename tells us nothing about the client.

### Fields Extracted FROM the Police Report (AI reads these)

| Field | Where on MV-104AN | Used In | Notes |
|---|---|---|---|
| All Driver Names | Box 2 — Driver Name V1 + V2 | Client/Defendant matching | AI extracts ALL names, system matches to Clio |
| Date of Accident | Box 1 — Month/Day/Year | Retainer + Email + Statute calc | Always present |
| Time of Accident | Box 1 — Time | Display only | HH:MM format |
| No. Vehicles | Box 1 — "No. Vehicles" | Display only | Usually 1 or 2 |
| No. Injured | Box 1 — "No. Injured" | Retainer conditional logic | 0 = property only, >0 = bodily injury paragraph |
| No. Killed | Box 1 — "No. Killed" | Display only | Usually 0 |
| Accident Location | Box 28/29 — Road + intersection + borough | Retainer | Combine road + intersection + borough |
| Client's Reg. Plate | Box 4/5 — Plate Number | Retainer | Empty if client is pedestrian/cyclist |
| Client Gender (Sex) | Box 3 — Sex field | Retainer (his/her, he/she) | M or F |
| Insurance Code | Box — Ins. Code | Display only | Company code (e.g. "0042") |
| Officer's Notes | Box 30 — Accident Description | Email narrative | Free text, always present |
| Client Address | Box 2/4 — Address, City, State, Zip | Clio Contact | Street, City, State, Zip |
| Client Vehicle Info | Box 4/5 — Year, Make, Type | Context | May be "BIKE" or empty for pedestrian |
| Defendant Vehicle Info | Box 4/5 — other party | Context | May be empty |
| Defendant Address | Box 2/4 — other party | Clio Contact | Always present |
| Vehicle/Bicyclist/Pedestrian flags | Checkboxes at top of V1/V2 | Display + logic | `is_pedestrian`, `is_bicyclist`, `is_other_pedestrian` per vehicle |
| Date of Birth | Box 3 — Date of Birth | Display only | Per driver |

**Full field mapping:** See `docs/field-mapping.csv` for all 32 fields with Clio mapping, JSON paths, and pipeline usage.

### Fields NOT in the Police Report (come from elsewhere)

| Required Field | Source | Notes |
|---|---|---|
| **Law Firm Name** | Hardcoded | "Richards & Law" |
| **Attorney Name** | Hardcoded | "Andrew Richards" |
| **Statute of Limitations Date** | Calculated | Accident date + 8 years |
| **Client Email** | Clio Contact | Already on the Contact attached to the Matter |
| **Calendly Link** | Seasonal logic | Mar-Aug → office link / Sep-Feb → virtual link |

---

## Conditional Logic in Retainer Agreement

The retainer template has merge fields in `[square brackets]` and two conditional paragraphs:

**Merge fields (from police report):**
- `[Client Name]` — from matched client
- `[Law Firm Name]` — hardcoded "Richards & Law"
- `[Date of Accident]` — from report
- `[Defendant Name]` — the other party
- `[his/her]` and `[he/she]` — from client's Sex field (M→his/he, F→her/she)
- `[Accident Location]` — from report
- `[Registration Plate Number of the Client's Car]` — from report (or "N/A")
- `[Statute of Limitations Date]` — calculated
- `[Name of Client]` — signature line
- `[Name of Attorney]` — hardcoded "Andrew Richards"

**Conditional paragraphs:**
1. **IF** No. Injured > 0 → include bodily injury claims paragraph
2. **IF** No. Injured = 0 → include property damage only paragraph

**Pronoun logic:** `[his/her]` and `[he/she]` appear 7+ times throughout the document. Clio Draft handles this via text adjustment features tied to a custom field value.

---

## Files We Have

| File | Purpose |
|---|---|
| Challenge Brief PDF | The rules and instructions |
| Retainer Agreement (docx + pdf) | Template with `[merge field]` placeholders + Andrew's notes |
| Example of Expected Outputs (docx + pdf) | Shows the 3 submission emails |
| 5 Police Report PDFs | Test data from NYC (all MV-104AN, from NYSCEF court filings) |
| Calendly links note | Summer/Spring and Winter/Autumn booking URLs |

---

## Police Reports: Format Research

- Every US state has its **own** police report format (50+ variants)
- **New York** uses form **MV-104AN** (NYC) and **MV-104A** (rest of state)
- For the hackathon: only need MV-104AN (all 5 test reports)
- For a real product: configurable parser per state, separate "extraction logic" from "state template"

---

## Proven API Calls — Complete Reference

All tested on EU dummy account (`eu.app.clio.com`). For US: swap to `app.clio.com`.

### Authentication
```bash
# MUST use form-urlencoded, NOT JSON
curl -X POST https://eu.app.clio.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=ID&client_secret=SECRET&redirect_uri=URI&code=CODE"
```

### Update custom fields on a Matter
```bash
curl -X PATCH "/api/v4/matters/{MATTER_ID}" \
  -d '{"data":{"custom_field_values":[
    {"custom_field":{"id":FIELD_ID},"value":"the value"}
  ]}}'
# Must use "custom_field":{"id":X} NOT "custom_field_id":X
```

### Generate retainer from template ✅
```bash
curl -X POST "/api/v4/document_automations" \
  -d '{"data":{
    "document_template":{"id":TEMPLATE_ID},
    "matter":{"id":MATTER_ID},
    "filename":"Retainer_Agreement_ClientName",
    "formats":["pdf"]
  }}'
```

### List documents on a Matter
```bash
curl "/api/v4/documents?fields=id,name&matter_id=MATTER_ID"
```

### Get client from Matter
```bash
curl "/api/v4/matters/{MATTER_ID}?fields=id,client"
# Returns: {"data":{"id":...,"client":{"id":CONTACT_ID,"name":"..."}}}
```

### List all Matters with clients (for auto-matching)
```bash
curl "/api/v4/matters?fields=id,client,status&status=open"
# Loop through, match client name to extracted names from PDF
```

### List calendars (get Calendar ID)
```bash
curl "/api/v4/calendars?fields=id,name,type"
# calendar_owner needs CALENDAR ID, not User ID!
```

### Create calendar entry (Statute of Limitations)
```bash
curl -X POST "/api/v4/calendar_entries" \
  -d '{"data":{
    "summary":"Statute of Limitations - ClientName",
    "all_day":true,
    "start_at":"2034-02-27T09:00:00+00:00",
    "end_at":"2034-02-27T17:00:00+00:00",
    "calendar_owner":{"id":CALENDAR_ID},
    "matter":{"id":MATTER_ID}
  }}'
```

### Get document version info (for download)
```bash
curl "/api/v4/documents/{DOC_ID}?fields=id,name,latest_document_version"
# Returns version ID. NEXT: try GET /document_versions/{VERSION_ID}/download
```

### Get contact email (PARTIALLY WORKING)
```bash
curl "/api/v4/contacts/{CONTACT_ID}?fields=id,name,email_addresses"
# Returns email IDs but NOT the address string
# Nested field syntax failed. TODO: fix field syntax tomorrow
```

### Key Gotchas
1. Token exchange MUST use `application/x-www-form-urlencoded`, not JSON
2. Custom fields: nested `"custom_field":{"id":X}` not flat `"custom_field_id":X`
3. Document automation requires `formats:["pdf"]` (array, not string)
4. Calendar owner = Calendar ID (from `/calendars`), NOT User ID
5. Document template field is `filename`, not `name`
6. `users` and `who_am_i` endpoints need special permissions — use `/calendars` instead
7. EU and US APIs identical — only base URL differs

---

## Still To Test (2 items)

| Test | What to try | Why needed |
|---|---|---|
| **PDF download** | `GET /document_versions/{VERSION_ID}/download` | Need to attach retainer to email |
| **Contact email string** | Different nested field syntax for email_addresses | Need the actual email address, not just ID |

---

## Custom Fields Needed in Clio

8 custom fields on Matters (Defendant Name = First + Last combined = 1 field, but 2 CSV rows):

| Field Name | Clio Type | Env Var | Used For |
|---|---|---|---|
| Accident Date | date | `CLIO_FIELD_ACCIDENT_DATE` | Retainer + Statute calc |
| Accident Location | text_line | `CLIO_FIELD_ACCIDENT_LOCATION` | Retainer |
| Defendant Name | text_line | `CLIO_FIELD_DEFENDANT_NAME` | Retainer (First + Last combined) |
| Client Gender | picklist (Male/Female) | `CLIO_FIELD_CLIENT_GENDER` | Retainer pronoun logic (his/her) |
| Registration Plate | text_line | `CLIO_FIELD_REGISTRATION_PLATE` | Retainer |
| Number Injured | numeric | `CLIO_FIELD_NUMBER_INJURED` | Retainer conditional logic |
| Accident Description | text_area | `CLIO_FIELD_ACCIDENT_DESCRIPTION` | Email personalization |
| Statute of Limitations Date | date | `CLIO_FIELD_STATUTE_DATE` | Calendar entry (derived: accident + 8 years) |

---

## Deliverables (3 Emails)

1. **Email #1 to "Andrew"** — professional email with video/visuals showing what you built
2. **Email #2 to Swans** — technical submission: video walkthrough, code files, link to working app
3. **Email #3 from automation** — auto-generated email to client (Guillermo Reyes case) with retainer attached + Calendly link. Sent to: `talent.legal-engineer.hackathon.automation-email@swans.co`

---

## EU Test Account Reference

| Item | Value |
|---|---|
| Base URL | `eu.app.clio.com` |
| App ID | 4100 |
| Client ID | gAB5MWWemVFYpBqt5Mf2WRpPdxDVegujAcp2q0oC |
| Client Secret | 8EcCDxt37YFwhqukLFwUem3fI6B3TIrqzxxgjHlj |
| Current Token | 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT |
| Matter ID | 14525933 (ClientDragOne) |
| Contact ID | 22674092 (TestDragOne ClientDragOne) |
| Calendar ID | 437603 (Eric Wang's UserCalendar) |
| User/Attorney ID | 420341 (limited access) |
| Document Template ID | 359618 |
| Generated Doc IDs | 775938050 (Retainer_Agreement_Test.pdf) |
| Calendar Entry ID | 15242765 |

---

*Status: Analysis complete. App built, dual AI providers working, Supabase persistence added. 2 minor API tests remaining (PDF download + email address string). Full field mapping in `docs/field-mapping.csv`. All critical patterns proven. Testing pipeline phases 3-10 next.*
