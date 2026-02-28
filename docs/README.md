---
title: Documentation Index
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Richards & Law — Project Documentation

Automation tool for the Swans Applied AI Hackathon. Reads police report PDFs using AI, extracts structured data, pushes it into Clio Manage (legal CRM), generates a retainer agreement, calendars a statute of limitations deadline, and emails the client.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your API keys and Clio credentials
npm run dev
# Open http://localhost:3000
```

## Documentation Map

| Folder | Purpose | Key File |
|--------|---------|----------|
| [setup/](setup/) | Local development setup, env vars, prerequisites | `README.md` |
| [deploy/](deploy/) | Vercel deployment, framework config, env vars | `README.md` |
| [clio/](clio/) | Clio Manage API reference, account setup, gotchas | `README.md` |
| [dashboard/](dashboard/) | UI flow, components, form fields, confidence scoring | `README.md` |
| [design-mockup/](design-mockup/) | 14 HTML mockups (mobile, desktop, admin) | `README.md` |
| [_handover/](_handover/) | Session handover notes for context continuity | Latest `.md` file |

## Root Documentation

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project instructions — setup checklist, rules, testing guide |
| `CLAUDE_CODE_BRIEFING.md` | Complete technical spec — API calls, extraction prompt, edge cases (445 lines) |
| `ANALYSIS.md` | Problem analysis — 5 test cases, police report comparison, business context |
| `.env.example` | All environment variables with descriptions |

## Architecture Overview

```
Police Report (PDF/Photo)
        │
        ▼
  ┌─────────────┐      ┌──────────────────┐
  │ /api/extract │─────▶│ AI Provider      │
  │ (FormData)   │      │ Anthropic/OpenAI │
  └─────────────┘      └──────────────────┘
        │                       │
        ▼                       ▼
  Extracted JSON ◄──── Claude Vision / GPT-4o
        │
        ▼
  ┌─────────────┐      ┌──────────────────┐
  │ /api/match  │─────▶│ Clio Manage API  │
  │ (names)     │      │ GET /matters     │
  └─────────────┘      └──────────────────┘
        │
        ▼
  Matched Matter + Client
        │
        ▼
  ┌─────────────┐      ┌──────────────────┐
  │ /api/approve│─────▶│ 5-step pipeline: │
  │ (all data)  │      │ 1. Custom fields │
  └─────────────┘      │ 2. Retainer doc  │
                       │ 3. SOL calendar  │
                       │ 4. Download PDF  │
                       │ 5. Email client  │
                       └──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| AI Extraction | Claude Vision (Anthropic) or GPT-4o (OpenAI) |
| Legal CRM | Clio Manage API v4 (OAuth 2.0, REST) |
| Email | Resend (transactional, PDF attachment) |
| Deployment | Vercel |

## Test Cases (5 Police Reports)

| # | Case | Client | Challenge |
|---|------|--------|-----------|
| 1 | Reyes v Francois | V1, Male | Standard car-v-car (demo case) |
| 2 | Noel v Freese | V1, Female | Pronoun switching (she/her) |
| 3 | Castillo v Dorjee | **V2**, Male, Pedestrian | Client NOT Vehicle 1, injured=1 |
| 4 | Grillo v Kim | **V2**, Male, Bicyclist | Client NOT Vehicle 1, no plate |
| 5 | Vincent v Trent | V1, Female | School bus, pronoun switching |

## Design Mockups Summary

**14 HTML mockups** ready for review — open in browser:

- **Intake Dashboard**: 5 responsive designs (mobile + desktop+tablet each)
  - 001 Tab-Based, 002 Stacked, 003 Card Flow, 004 Split Scroll, 005 Floating Preview
- **Admin Analytics**: 2 designs (mobile + desktop each)
  - 001 KPI Dashboard (cards + charts), 002 Activity Timeline (chronological feed)

See [design-mockup/README.md](design-mockup/) for full inventory.

## Current Status

**MVP built and first extraction tested.** Waiting on:
1. Design choice (intake 001-005, admin 001-002)
2. US Clio account setup + custom field IDs
3. All 5 test reports validated end-to-end

See [_handover/2026-02-28_initial_build.md](_handover/2026-02-28_initial_build.md) for detailed status.

## Conventions

- Documentation follows [CONVENTIONS.md](CONVENTIONS.md) — YAML frontmatter, snake_case filenames
- Handover discipline: update `_handover/` after every significant work unit
- Claude Code commands available: `/donotcode`, `/let`, `/newdoc`
