---
title: Clio Manage — Setup & API Reference
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Clio

Everything about Clio Manage — account setup, API endpoints, custom fields, and gotchas.

## Documents

| File | Description | Status |
|------|-------------|--------|
| README.md | This file — Clio overview and API reference | active |

## What is Clio Manage

Cloud-based legal practice management software. Stores cases (Matters), clients (Contacts), documents, billing, and calendars. Has a REST API (v4) with OAuth 2.0 authentication.

## Account Setup

### 1. Create US Clio Account

- Go to https://www.clio.com and sign up for a free trial
- If in EU, use a VPN (US server) to get the US version
- Set up firm as "Richards & Law" with attorney "Andrew Richards"

### 2. Register API App

- Settings → API → Applications → Register new app
- Redirect URI: `http://localhost:3000/api/auth/callback` (or Vercel URL)
- Save Client ID and Client Secret → `.env.local`

### 3. Get OAuth Token

```
https://app.clio.com/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI
```

Authorize → redirected with `?code=XXXXX` → exchange for token:

```bash
curl -X POST https://app.clio.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=ID&client_secret=SECRET&redirect_uri=URI&code=CODE"
```

### 4. Create Custom Fields

Settings → Custom Fields → Add on Matters:

| Field Name | Clio Type | Used For |
|---|---|---|
| Accident Date | date | Retainer + statute calc |
| Accident Location | text_line | Retainer |
| Defendant Name | text_line | Retainer |
| Client Gender | picklist (Male/Female) | Pronouns (his/her) |
| Registration Plate | text_line | Retainer |
| Number Injured | numeric | Conditional paragraph |
| Accident Description | text_area | Email personalization |
| Statute of Limitations Date | date | Calendar entry |

Get field IDs:

```bash
curl "https://app.clio.com/api/v4/custom_fields?fields=id,name" \
  -H "Authorization: Bearer TOKEN"
```

### 5. Upload Retainer Template

- Documents → Document Templates → Upload `Retainer Agreement - Richards & Law [Hackathon].docx`
- Convert `[bracket]` merge fields to Clio's `{curly bracket}` format using Clio Draft Word add-in

### 6. Create Test Matters

| Matter | Contact | Email |
|---|---|---|
| Reyes v Francois | Guillermo Reyes | talent.legal-engineer.hackathon.automation-email@swans.co |
| Noel v Freese | Darshame Noel | (same) |
| Castillo v Dorjee | Fausto Castillo | (same) |
| Grillo v Kim | John Grillo | (same) |
| Vincent v Trent | Mardochee Vincent | (same) |

### 7. Get Calendar ID

```bash
curl "https://app.clio.com/api/v4/calendars?fields=id,name,type" \
  -H "Authorization: Bearer TOKEN"
```

Use Calendar ID (NOT User ID) for `CLIO_CALENDAR_ID`.

## API Reference

Base URL: `https://app.clio.com` (US) or `https://eu.app.clio.com` (EU)

### Get Open Matters (for client matching)

```bash
GET /api/v4/matters?fields=id,client,status&status=open
```

### Update Custom Fields on Matter

```bash
PATCH /api/v4/matters/{MATTER_ID}
{
  "data": {
    "custom_field_values": [
      {"custom_field": {"id": FIELD_ID}, "value": "the value"}
    ]
  }
}
```

### Generate Retainer (Document Automation)

```bash
POST /api/v4/document_automations
{
  "data": {
    "document_template": {"id": TEMPLATE_ID},
    "matter": {"id": MATTER_ID},
    "filename": "Retainer_Agreement_ClientName",
    "formats": ["pdf"]
  }
}
```

### Create Calendar Entry

```bash
POST /api/v4/calendar_entries
{
  "data": {
    "summary": "Statute of Limitations - Client Name",
    "all_day": true,
    "start_at": "2034-02-27T09:00:00+00:00",
    "end_at": "2034-02-27T17:00:00+00:00",
    "calendar_owner": {"id": CALENDAR_ID},
    "matter": {"id": MATTER_ID}
  }
}
```

### Download Document

```bash
GET /api/v4/documents/{DOC_ID}?fields=id,name,latest_document_version
# → get version_id
GET /api/v4/document_versions/{VERSION_ID}/download
```

### Get Contact Email

```bash
GET /api/v4/contacts/{CONTACT_ID}?fields=id,name,email_addresses
# Known issue: returns email IDs but not address string
# Workaround: hardcode hackathon email for now
```

## API Gotchas

| Gotcha | Detail |
|--------|--------|
| OAuth token exchange | MUST use `application/x-www-form-urlencoded`, NOT JSON |
| Custom fields format | Nested `{"custom_field":{"id":X}}` NOT flat `"custom_field_id":X` |
| Document automation | `formats` must be array `["pdf"]`, not string |
| Calendar owner | Uses Calendar ID from `/calendars`, NOT User ID |
| Template field name | Field is `filename`, NOT `name` |
| Calendar entry name | Field is `summary`, NOT `name` |
| Contact email | Returns IDs not addresses — nested syntax failed |
| PDF download | Untested — may return binary or redirect |

## EU Test Account

For development before US account is ready:

```
Base URL: https://eu.app.clio.com
App ID: 4100
Client ID: gAB5MWWemVFYpBqt5Mf2WRpPdxDVegujAcp2q0oC
Client Secret: 8EcCDxt37YFwhqukLFwUem3fI6B3TIrqzxxgjHlj
Token: 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT
Matter ID: 14525933
Contact ID: 22674092
Calendar ID: 437603
Template ID: 359618
```
