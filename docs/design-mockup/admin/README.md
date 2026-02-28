---
title: Admin Dashboard Mockups
created: 2026-02-28
updated: 2026-02-28
status: active
author: claude+user
---

# Admin Dashboard Mockups

Analytics dashboard for the attorney (Andrew Richards). Shows daily/weekly/monthly intake activity — cases received, retainers sent, emails delivered, SOL deadlines set.

## Designs

| # | Concept | Description |
|---|---------|-------------|
| 001 | **KPI Dashboard** | Big number cards, bar charts, donut chart, conversion funnel, SOL deadline timeline |
| 002 | **Activity Timeline** | Chronological event feed (like GitHub/Linear), day/week grouping, sidebar summary |

## Files

| File | Design | Form Factor | Screens |
|------|--------|-------------|---------|
| `admin-desktop-kpi-dashboard_001.html` | KPI | Desktop (1280x800) | 3: Daily, Weekly, Monthly |
| `admin-mobile-kpi-dashboard_001.html` | KPI | Mobile (393x852) | 3: Daily, Weekly, Monthly |
| `admin-desktop-timeline_002.html` | Timeline | Desktop (1280x800) | 2: Daily, Weekly |
| `admin-mobile-timeline_002.html` | Timeline | Mobile (393x852) | 3: Daily, Weekly, Monthly |

## What the Admin Sees

### Incoming
- New cases received (police reports processed)
- Matters matched in Clio
- AI extraction confidence scores

### Outgoing
- Retainer agreements generated and stored
- Client emails sent (with attachments)
- SOL calendar deadlines created

### Analytics
- Case volume trends (daily/weekly/monthly bars)
- Conversion funnel (uploaded → extracted → matched → retainer sent)
- Status breakdown (completed / pending / failed)
- Upcoming SOL deadlines with urgency color coding

## How to Preview

Open any HTML file directly in a browser. Each file is self-contained with inline CSS.
