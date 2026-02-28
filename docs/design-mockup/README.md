---
title: Design Mockups
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Design Mockups

Visual HTML prototypes for the Richards & Law intake dashboard and admin analytics. All mockups are self-contained HTML files — open directly in a browser to preview.

## Folder Structure

| Folder | Contents | Count |
|--------|----------|-------|
| [mobile/](mobile/) | Intake dashboard — 5 mobile designs (iPhone 393x852) | 5 files |
| [desktop/](desktop/) | Intake dashboard — 5 desktop+tablet designs (1280x800 + 768x1024) | 5 files |
| [admin/](admin/) | Admin analytics — 2 designs x 2 form factors | 4 files |
| [dashboard/](dashboard/) | Original desktop intake reference mockup | 1 file |

## Intake Dashboard Designs (5 concepts)

Each concept has a mobile and desktop+tablet variant. Pick a number (001-005) to implement.

| # | Concept | Mobile | Desktop+Tablet |
|---|---------|--------|----------------|
| 001 | **Tab-Based** — Bottom tabs switch "Report" / "Form" | `mobile-mockup-tab-switcher_001.html` | `desktop-mockup-tab-switcher_001.html` |
| 002 | **Stacked** — Collapsible thumbnail + scrolling form | `mobile-mockup-stacked_002.html` | `desktop-mockup-stacked_002.html` |
| 003 | **Card Flow** — Wizard with step cards + progress dots | `mobile-mockup-card-flow_003.html` | `desktop-mockup-card-flow_003.html` |
| 004 | **Split Scroll** — Photo pinned at 40%, form scrolls under | `mobile-mockup-split-scroll_004.html` | `desktop-mockup-split-scroll_004.html` |
| 005 | **Floating Preview** — Full-screen form + FAB to view report | `mobile-mockup-floating-preview_005.html` | `desktop-mockup-floating-preview_005.html` |

Each mockup shows all 5 workflow screens: Upload, Extracting, Review, Processing, Success.

## Admin Dashboard Designs (2 concepts)

| # | Concept | Desktop | Mobile |
|---|---------|---------|--------|
| 001 | **KPI Dashboard** — Cards, bar/donut charts, conversion funnel, SOL timeline | `admin-desktop-kpi-dashboard_001.html` | `admin-mobile-kpi-dashboard_001.html` |
| 002 | **Activity Timeline** — Chronological feed, event dots, day/week grouping | `admin-desktop-timeline_002.html` | `admin-mobile-timeline_002.html` |

Both admin designs include day/week/month period switching.

## Design System

All mockups use Clio brand colors:

| Token | Value | Usage |
|-------|-------|-------|
| `--clio-blue` | `#0070E0` | Primary actions, links |
| `--clio-blue-dark` | `#005BBB` | Hover states |
| `--clio-blue-light` | `#E8F2FC` | AI-filled field backgrounds |
| `--clio-text` | `#333333` | Body text |
| `--clio-text-light` | `#666666` | Labels, secondary text |
| `--clio-bg` | `#F5F7FA` | Page background |
| `--clio-border` | `#D1D9E0` | Borders, dividers |
| `--clio-success` | `#0D9B4A` | Completed states |
| `--clio-warning` | `#E67E22` | Pending, medium confidence |
| `--clio-error` | `#D63031` | Errors, low confidence |

## How to Preview

```bash
# Open any mockup directly in your browser:
open docs/design-mockup/mobile/mobile-mockup-tab-switcher_001.html
open docs/design-mockup/desktop/desktop-mockup-tab-switcher_001.html
open docs/design-mockup/admin/admin-desktop-kpi-dashboard_001.html
```

These are static reference files — they are NOT part of the app build.
