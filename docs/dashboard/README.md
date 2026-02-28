---
title: Dashboard UI
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Dashboard

UI flow, components, and design decisions for the intake dashboard.

## Documents

| File | Description | Status |
|------|-------------|--------|
| README.md | This file — dashboard overview | active |

## Design Reference

- Original mockup: `docs/design-mockup/dashboard/dashboard-demo.html`
- Responsive mockups: 5 designs in `docs/design-mockup/mobile/` and `docs/design-mockup/desktop/`
- Admin mockups: 2 designs in `docs/design-mockup/admin/`
- Clio brand colors: `#0070E0` (blue), `#333333` (dark), `#FFFFFF` (white)

## User Flow

```
[1] Upload     → Drop or click to upload police report PDF
[2] Extracting → Loading state while Claude Vision processes
[3] Review     → All fields shown, editable, with confidence scores
                  Auto-matched to Clio Matter by client name
                  Multiple matches → picker shown
                  Zero matches → warning
[4] Approve    → Processing overlay with 5 steps animating
[5] Success    → Summary of what was done, "Process Next" button
```

## Layout

Two-panel split screen:

| Left (45%) | Right (55%) |
|---|---|
| Upload zone → PDF preview | Status bar → Form fields → Approve button |

## Form Sections

1. **Client Information** — First name, last name, gender, plate, address
2. **Accident Details** — Date, number injured, location, officer notes
3. **Defendant** — Name, vehicle
4. **Clio Matter** — Linked matter (auto-matched), statute of limitations
5. **Email Settings** — Send-to address, Calendly link (auto-selected)

## Components

All built inline in `app/page.tsx` (single-file for simplicity):

| Component | Purpose |
|---|---|
| `Section` | Form section with title and border |
| `Field` | Label + confidence badge + input |
| `confidenceBadge()` | Color-coded confidence score (green/yellow/red) |

## Confidence Scores

| Score | Level | Color |
|---|---|---|
| 90-100% | High | Green (`clio-success`) |
| 70-89% | Medium | Orange (`clio-warning`) |
| Below 70% | Low | Red (`clio-error`) |

## Processing Steps

When "Approve" is clicked, overlay shows 5 steps:

1. Updating Matter custom fields
2. Generating retainer agreement
3. Creating calendar entry (SOL)
4. Downloading retainer PDF
5. Sending email to client

All steps fire via single `POST /api/approve` call — the step animation is visual feedback.

## Key Decisions

- **Single page app** — no routing needed, all states managed via `phase` state variable
- **No component files** — everything in `page.tsx` to avoid premature abstraction
- **Editable fields** — team can correct AI extraction errors before approving
- **PDF viewer** — left panel shows the actual uploaded PDF via embedded `<iframe>` with blob URL (memory-safe cleanup on reset)
- **Responsive designs ready** — 5 mobile/desktop/tablet mockups created, waiting for design choice before implementation
