---
title: Project Setup
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Setup

Everything needed to run the project locally.

## Documents

| File | Description | Status |
|------|-------------|--------|
| README.md | This file — setup overview | active |

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with Clio brand colors
- **Anthropic SDK** — Claude Vision (PDF extraction) + Claude (email drafting)
- **Resend** — transactional email
- **Clio Manage API v4** — legal CRM (OAuth 2.0, REST)
- **Vercel** — deployment

## Quick Start

```bash
git clone <repo-url>
cd lawyerdemo
npm install
cp .env.example .env.local    # fill in your keys
npm run dev                    # http://localhost:3000
```

## Project Structure

```
├── app/
│   ├── layout.tsx              — Root layout
│   ├── globals.css             — Tailwind + Clio brand styles
│   ├── page.tsx                — Main dashboard (upload → review → approve)
│   └── api/
│       ├── extract/route.ts    — Claude Vision PDF extraction
│       ├── match/route.ts      — Auto-match client to Clio Matter
│       └── approve/route.ts    — Full pipeline (Clio + calendar + email)
├── lib/
│   ├── clio.ts                 — Clio API client (all endpoints)
│   ├── extraction.ts           — Claude Vision prompt + JSON parser
│   ├── email.ts                — AI-drafted email + Resend sender
│   └── calendly.ts             — Seasonal Calendly link logic
├── docs/                       — Documentation (you are here)
├── sample-data/                — Test police reports + retainer template
└── .claude/                    — Claude Code commands + launch config
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.

| Variable | Source | Notes |
|----------|--------|-------|
| `CLIO_BASE_URL` | Clio account | `https://app.clio.com` (US) or `https://eu.app.clio.com` (EU) |
| `CLIO_ACCESS_TOKEN` | OAuth flow | See [clio/README.md](../clio/README.md) |
| `CLIO_CLIENT_ID` | Clio app settings | Registered app in Clio |
| `CLIO_CLIENT_SECRET` | Clio app settings | Registered app in Clio |
| `CLIO_CALENDAR_ID` | `GET /api/v4/calendars` | Calendar ID, NOT User ID |
| `CLIO_TEMPLATE_ID` | `GET /api/v4/document_templates` | Retainer template ID |
| `CLIO_FIELD_*` | `GET /api/v4/custom_fields` | 8 custom field IDs |
| `ANTHROPIC_API_KEY` | Anthropic console | For Claude Vision + text |
| `RESEND_API_KEY` | resend.com | For sending emails |
| `LAW_FIRM_NAME` | Hardcoded | `Richards & Law` |
| `ATTORNEY_NAME` | Hardcoded | `Andrew Richards` |
| `STATUTE_YEARS` | Hardcoded | `8` |
| `CALENDLY_OFFICE` | Given | Mar-Aug in-office link |
| `CALENDLY_VIRTUAL` | Given | Sep-Feb virtual link |
| `HACKATHON_EMAIL` | Given | `talent.legal-engineer.hackathon.automation-email@swans.co` |

## Prerequisites

- Node.js 18+
- npm
- Anthropic API key
- Resend API key
- Clio Manage account (US for submission, EU for testing)

## Gotchas

- The `.env.local` file is gitignored — you must create it locally
- Resend free tier only sends to verified email addresses — verify the hackathon email or use a custom domain
- The Anthropic SDK reads `ANTHROPIC_API_KEY` from env automatically — no need to pass it explicitly
