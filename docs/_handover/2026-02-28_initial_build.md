---
title: Handover — Initial Build
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Handover — Initial Build

## Summary

Built the complete Next.js application from scratch. Dashboard UI, Claude Vision extraction, Clio API client, auto-matching, approval pipeline, and email sending — all wired up. Vercel deployment configured and building.

## Completed

- [x] Project initialization (package.json, Next.js 14, Tailwind, TypeScript)
- [x] Clio API client (`lib/clio.ts`) — matters, custom fields, documents, calendar, contacts
- [x] Claude Vision extraction (`lib/extraction.ts`) — PDF to structured JSON
- [x] AI email drafting + Resend sending (`lib/email.ts`)
- [x] Seasonal Calendly logic (`lib/calendly.ts`)
- [x] Extract API route (`/api/extract`) — upload PDF → Claude Vision → JSON
- [x] Match API route (`/api/match`) — auto-match extracted names to Clio Matters
- [x] Approve API route (`/api/approve`) — full pipeline (custom fields → retainer → calendar → email)
- [x] Dashboard UI (`app/page.tsx`) — upload, review, approve, processing, success screens
- [x] Vercel deployment — framework preset fixed to Next.js, build passing
- [x] Claude Code commands (`/donotcode`, `/let`, `/newdoc`)
- [x] Documentation structure (`docs/` with CONVENTIONS.md, setup, deploy, clio, dashboard, _handover, design-mockup)
- [x] Moved `dashboard-demo.html` to `docs/design-mockup/dashboard/`
- [x] Dual AI provider system — Anthropic + OpenAI switchable via env flags
  - `lib/providers/types.ts` — shared interface, prompt, JSON parser
  - `lib/providers/anthropic.ts` — Claude Sonnet provider
  - `lib/providers/openai.ts` — GPT-4o provider
  - `lib/ai.ts` — router reads `AI_PROVIDER_ANTHROPIC` / `AI_PROVIDER_OPENAI` from env
  - `extraction.ts` and `email.ts` refactored to use provider router
- [x] First extraction test — Mardochee Vincent PDF extracted successfully via Anthropic

## In Progress

- [ ] Fill `.env.local` with real API keys (Clio US, Anthropic, Resend)
- [ ] Set Vercel environment variables

## Blocked / Issues

- **Clio contact email** — `GET /contacts/{id}?fields=email_addresses` returns IDs not address strings. Nested field syntax failed. Hardcoded hackathon email as workaround.
- **PDF download from Clio** — `GET /document_versions/{VERSION_ID}/download` untested. May return binary or redirect. Email sends even if download fails (empty attachment).
- **Next.js version** — 14.2.21 has a security vulnerability warning. Non-blocking but should upgrade.

## Key Files Changed

- `package.json` — created (Next.js 14, Anthropic SDK, Resend)
- `app/page.tsx` — full dashboard UI (~500 lines)
- `app/api/extract/route.ts` — Claude Vision extraction endpoint
- `app/api/match/route.ts` — Clio Matter auto-matching
- `app/api/approve/route.ts` — full approval pipeline
- `lib/clio.ts` — Clio API client with all proven endpoints
- `lib/extraction.ts` — Claude Vision prompt + JSON parser
- `lib/email.ts` — AI-drafted email + Resend sender
- `lib/calendly.ts` — seasonal link logic

## Next Steps

1. Set up US Clio account (VPN if in EU)
2. Create custom fields in Clio and get field IDs
3. Upload retainer template to Clio and get template ID
4. Fill `.env.local` with all real values
5. Test with Guillermo Reyes police report (demo case)
6. Test all 5 police reports
7. Set Vercel env vars and verify production deployment
8. Record 15-min video walkthrough

## Notes

- Client is NOT always Vehicle 1 — the match logic handles this by comparing ALL extracted names against Clio Matter client names
- Resend free tier only sends to verified emails — may need custom domain for hackathon email
- AI provider switch: set `AI_PROVIDER_ANTHROPIC=true` or `AI_PROVIDER_OPENAI=true` in `.env.local`. Default is Anthropic if neither is set.
- Vincent extraction showed Number Injured = 2, but ANALYSIS.md says 0 — needs verification against actual PDF. May need prompt tuning.
