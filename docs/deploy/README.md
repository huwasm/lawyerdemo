---
title: Deployment
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Deploy

Vercel deployment configuration and troubleshooting.

## Documents

| File | Description | Status |
|------|-------------|--------|
| README.md | This file — deployment overview | active |

## Vercel Project

- **Project:** lawyerdemo
- **URL:** lawyerdemo-rk4t2wmou-huwasm-projects.vercel.app
- **Framework:** Next.js
- **Build command:** `npm run build` (default)
- **Output directory:** Next.js default (do NOT override)
- **Install command:** `npm install` (default)

## Setup Steps (Done)

1. Created Vercel project linked to GitHub repo `huwasm/lawyerdemo`
2. Initial deploy failed — Framework Preset was set to "Other" instead of "Next.js"
3. Fixed: Settings → Build and Deployment → Framework Preset → **Next.js**
4. Redeployed — build passes

## Environment Variables

Must be set in Vercel dashboard: Settings → Environment Variables.

Add all variables from `.env.example`:

```
CLIO_BASE_URL=https://app.clio.com
CLIO_ACCESS_TOKEN=...
CLIO_CLIENT_ID=...
CLIO_CLIENT_SECRET=...
CLIO_CALENDAR_ID=...
CLIO_TEMPLATE_ID=...
CLIO_FIELD_ACCIDENT_DATE=...
CLIO_FIELD_ACCIDENT_LOCATION=...
CLIO_FIELD_DEFENDANT_NAME=...
CLIO_FIELD_CLIENT_GENDER=...
CLIO_FIELD_REGISTRATION_PLATE=...
CLIO_FIELD_NUMBER_INJURED=...
CLIO_FIELD_ACCIDENT_DESCRIPTION=...
CLIO_FIELD_STATUTE_DATE=...
ANTHROPIC_API_KEY=...
RESEND_API_KEY=...
LAW_FIRM_NAME=Richards & Law
ATTORNEY_NAME=Andrew Richards
STATUTE_YEARS=8
CALENDLY_OFFICE=https://calendly.com/d/cmh3-gfv-v7j/consultation-with-andrew-richards-esq
CALENDLY_VIRTUAL=https://calendly.com/d/cmgz-pmz-w2s/consultation-with-andrew-richards-esq
HACKATHON_EMAIL=talent.legal-engineer.hackathon.automation-email@swans.co
```

## Gotchas

- **Framework Preset must be Next.js** — if set to "Other", Vercel looks for a `public/` output directory which doesn't exist
- **Next.js 14.2.21 has a security vulnerability warning** — non-blocking, but consider upgrading for production
- **Environment variables are not shared between preview and production** — set them for all environments or specify per-environment
- **Redeploy needed after changing env vars** — Vercel doesn't auto-redeploy when you update environment variables

## Deploying Updates

Push to `main` → Vercel auto-deploys. No manual steps needed.

```bash
git add <files>
git commit -m "description"
git push origin main
```
