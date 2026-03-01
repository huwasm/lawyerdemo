---
title: Handover Notes
created: 2026-02-28
updated: 2026-03-01
status: active
author: claude+user
---

# Handovers

Session handover notes for continuity between developers and LLM sessions.

## Documents

| File | Description | Status |
|------|-------------|--------|
| README.md | This file — handover conventions | active |
| [2026-02-28_initial_build.md](2026-02-28_initial_build.md) | Full build session — MVP, dual AI providers, 14 design mockups, comprehensive handover | active |
| [2026-03-01_dashboard_ui_refinement.md](2026-03-01_dashboard_ui_refinement.md) | Dashboard UI restructure, defendant flags, field-mapping CSV, new extraction fields, docs update | active |
| [2026-03-01_full_handover.md](2026-03-01_full_handover.md) | **Full project handover** — complete state of all code, bugs fixed, what's left, how to run, quick reference | active |

## Naming Convention

Handover files use date prefix for chronological ordering:

```
YYYY-MM-DD_{description}.md
```

Example: `2026-02-28_initial_build.md`

## Template

Use this structure for every handover:

```markdown
---
title: Handover — {Description}
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active
author: {who}
---

# Handover — {Description}

## Summary
What was done in this session (2-3 sentences).

## Completed
- [x] Task 1
- [x] Task 2

## In Progress
- [ ] Task (what's left)

## Blocked / Issues
- Issue description + what was tried

## Key Files Changed
- `path/to/file` — what changed

## Next Steps
1. What to do next
2. Priority order

## Notes
Anything non-obvious that the next person needs to know.
```
