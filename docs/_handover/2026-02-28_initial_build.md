---
title: Handover — Initial Build
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Handover — Initial Build (Feb 28, 2026)

## Summary

Built the complete Next.js 14 application from scratch in a single session. The app automates personal injury intake for Richards & Law: upload a police report PDF, AI extracts structured data, auto-matches to a Clio Matter, generates retainer agreement, sets SOL calendar deadline, and emails the client. Dual AI provider system (Anthropic + OpenAI), Vercel deployment, and 14 design mockups covering intake dashboard (mobile/desktop/tablet) and admin analytics.

---

## Completed

### Core Application
- [x] Project initialization — Next.js 14, TypeScript, Tailwind CSS, package.json
- [x] Dashboard UI (`app/page.tsx`, ~730 lines) — 5 phases: upload, extracting, review, processing, success
- [x] PDF viewer in left panel — embedded `<iframe>` with blob URL, memory-safe cleanup on reset
- [x] Extract API (`/api/extract`) — accepts PDF upload, converts to base64, delegates to AI provider
- [x] Match API (`/api/match`) — fetches open Clio Matters, fuzzy-matches extracted names to client
- [x] Approve API (`/api/approve`) — full pipeline: update custom fields, generate retainer, create calendar, download PDF, send email

### Clio Integration
- [x] Clio API client (`lib/clio.ts`) — OAuth, REST, all proven endpoints:
  - `GET /matters` — open matters with client info
  - `PATCH /matters/{id}` — update custom fields
  - `POST /document_automations` — generate retainer from template
  - `GET /matters/{id}/documents` — list matter documents
  - `GET /document_versions/{id}/download` — download PDF
  - `POST /calendar_entries` — create SOL deadline
  - `GET /contacts/{id}` — get client contact

### AI Provider System
- [x] Dual provider architecture — switchable via env flags
  - `lib/providers/types.ts` — shared `AIProvider` interface, extraction prompt, JSON parser
  - `lib/providers/anthropic.ts` — Claude Sonnet (`claude-sonnet-4-20250514`), `type: "document"` for PDFs
  - `lib/providers/openai.ts` — GPT-4o, Responses API with file upload for PDFs
  - `lib/ai.ts` — router reads `AI_PROVIDER_ANTHROPIC` / `AI_PROVIDER_OPENAI` from env
  - `lib/extraction.ts` — thin wrapper delegating to active provider
  - `lib/email.ts` — uses active provider for email paragraph drafting
- [x] OpenAI TypeScript fix — `client.responses.create` with `input_file`, `any` cast for response parsing, `files.delete` (not `del`)

### Email & Calendar
- [x] AI-drafted email (`lib/email.ts`) — personalized paragraph via active AI provider + Resend for sending
- [x] Seasonal Calendly logic (`lib/calendly.ts`) — months 3-8 = office link, else virtual link
- [x] Calendar entry creation — SOL = accident date + 8 years

### Deployment
- [x] Vercel project connected — Framework Preset fixed to "Next.js" (was "Other")
- [x] Build passing — `npm run build` succeeds, all routes compiled

### Documentation & Tooling
- [x] Claude Code commands: `/donotcode`, `/let`, `/newdoc`
- [x] Documentation structure with CONVENTIONS.md, folder READMEs
- [x] `.env.example` with all 20+ environment variables documented
- [x] `.claude/launch.json` for dev server (port 3000)

### Design Mockups (14 HTML files)
- [x] **Intake Mobile** (5 designs, `docs/design-mockup/mobile/`):
  1. `_001` Tab-Based — bottom tab bar switches "Report" / "Form"
  2. `_002` Stacked — collapsible thumbnail at top, scrolling form below
  3. `_003` Card Flow — wizard cards + progress dots
  4. `_004` Split Scroll — photo pinned at top 40%, form scrolls underneath
  5. `_005` Floating Preview — full-screen form + floating "View Report" FAB
- [x] **Intake Desktop+Tablet** (5 designs, `docs/design-mockup/desktop/`):
  1. `_001` Side-by-side panels + document view tabs
  2. `_002` Persistent split with zoom toolbar
  3. `_003` Horizontal stepper + document viewer
  4. `_004` Pinned left panel + scrolling right form
  5. `_005` Full-width form + slide-in drawer
- [x] **Admin Dashboard** (2 designs x 2 form factors, `docs/design-mockup/admin/`):
  1. KPI Dashboard — cards, charts, funnel, SOL timeline (desktop + mobile)
  2. Activity Timeline — chronological feed, event dots, day/week grouping (desktop + mobile)

### Testing
- [x] First extraction test — Mardochee Vincent PDF via Anthropic (successful)
  - Note: Number Injured returned 2, ANALYSIS.md expects 0 — needs prompt tuning

---

## In Progress

- [ ] **Pick intake design** — user to review 5 mobile + 5 desktop mockups (001-005)
- [ ] **Pick admin design** — user to review 2 admin designs (001 or 002)
- [ ] **Mobile implementation** — plan approved (`.claude/plans/abstract-fluttering-meteor.md`)
- [ ] Test OpenAI extraction with a police report PDF
- [ ] Fill `.env.local` with real US Clio credentials
- [ ] Set Vercel environment variables

---

## Blocked / Issues

| Issue | Detail | Workaround |
|-------|--------|------------|
| Clio contact email | `GET /contacts/{id}?fields=email_addresses` returns IDs not strings | Hardcoded hackathon email |
| PDF download | `GET /document_versions/{id}/download` untested | Email sends even if download fails |
| Next.js vulnerability | 14.2.21 security warning | Non-blocking, upgrade later |
| Number Injured | Vincent case returned 2, expected 0 | Needs prompt tuning |

---

## Architecture — File Map

```
lawyerdemo/
├── app/
│   ├── layout.tsx              Root layout (metadata)
│   ├── globals.css             Tailwind + Clio brand colors
│   ├── page.tsx                Dashboard UI (all 5 phases)
│   └── api/
│       ├── extract/route.ts    PDF upload → AI extraction
│       ├── match/route.ts      Extracted names → Clio Matter match
│       └── approve/route.ts    Full pipeline (Clio + retainer + calendar + email)
├── lib/
│   ├── clio.ts                 Clio API v4 client
│   ├── extraction.ts           Thin wrapper → ai.ts → provider
│   ├── email.ts                AI-drafted email + Resend
│   ├── calendly.ts             Seasonal Calendly link
│   ├── ai.ts                   Provider router (env flags)
│   └── providers/
│       ├── types.ts            AIProvider interface, prompts, parser
│       ├── anthropic.ts        Claude Sonnet implementation
│       └── openai.ts           GPT-4o implementation
├── docs/                       Project documentation
├── sample-data/                5 test police report PDFs
├── CLAUDE.md                   Project instructions
├── CLAUDE_CODE_BRIEFING.md     Technical spec (445 lines)
├── ANALYSIS.md                 Problem analysis + test cases
└── .env.example                All env vars documented
```

---

## Key Decisions

1. **Single-page dashboard** — all UI in `app/page.tsx`, no component files
2. **Dual AI providers** — Anthropic (default) + OpenAI, switchable via env flags
3. **Client identification** — NOT always Vehicle 1; match logic compares all extracted names against Clio
4. **Email via Resend** — NOT through Clio
5. **Retainer via Clio** — `POST /document_automations`, NOT generated locally
6. **EU test account** — development uses EU Clio (App ID 4100); US account needed for submission
7. **Blob URL for PDF viewer** — created on upload, revoked on reset

---

## Next Steps (Priority Order)

1. Pick designs — review mockups in browser, choose intake (001-005) + admin (001/002)
2. Implement responsive layout + camera capture + image support
3. Set up US Clio account (VPN if in EU)
4. Create 8 custom fields in Clio and get field IDs
5. Upload retainer template (convert brackets to Clio curly format)
6. Create 5 test Matters with contacts and assigned attorney
7. Fill `.env.local` with all real values
8. Test all 5 police reports (correct client ID, pronouns, conditional paragraphs)
9. Set Vercel env vars and verify production
10. Record 15-min video walkthrough

---

## Notes

- AI provider switch: `AI_PROVIDER_ANTHROPIC=true` or `AI_PROVIDER_OPENAI=true` in `.env.local`
- Resend free tier only sends to verified emails
- Guillermo Reyes = demo case for Email #3 submission
- 2 of 5 clients are Vehicle 2: Castillo (pedestrian), Grillo (bicyclist)
- Noel and Vincent are female — test pronoun switching (she/her)
- Castillo has `no_injured=1` — triggers bodily injury paragraph (others = property damage)
