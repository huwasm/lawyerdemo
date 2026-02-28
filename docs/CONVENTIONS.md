# Documentation Conventions

## Folder Structure

```
docs/
├── CONVENTIONS.md       — This file (naming rules, templates)
├── _handover/           — Session handovers between devs/LLMs
├── setup/               — Dev setup (Next.js, env vars, npm, DB)
├── deploy/              — Vercel deployment, CI/CD
├── clio/                — Clio account setup + API reference
└── dashboard/           — UI flow, components, decisions
```

## File Naming

All documentation files follow this pattern:

```
{description}.md
```

Rules:
- **snake_case** — always lowercase, underscores for spaces
- **Descriptive** — name says what's inside (`oauth_setup.md` not `setup2.md`)
- **No dates in filenames** — dates live in the frontmatter
- **README.md** — every folder gets one as the index/entry point
- **No numbering prefixes** — ordering is handled by the README index

Examples:
- `docs/clio/oauth_setup.md`
- `docs/clio/custom_fields.md`
- `docs/clio/api_endpoints.md`
- `docs/setup/environment_variables.md`
- `docs/deploy/vercel_config.md`
- `docs/_handover/2026-02-28_initial_build.md`

Exception: `_handover/` files use date prefix `YYYY-MM-DD_{description}.md` for chronological ordering.

## Frontmatter

Every `.md` file starts with this metadata block:

```markdown
---
title: Human-Readable Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: draft | active | outdated
author: name or llm-session-id
tags: [tag1, tag2]
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Clear, descriptive title |
| `created` | Yes | Date file was first written |
| `updated` | Yes | Date of last meaningful change |
| `status` | Yes | `draft` (WIP), `active` (current), `outdated` (needs review) |
| `author` | Yes | Who wrote it (`user`, `claude`, `claude+user`) |
| `tags` | No | For cross-referencing (`api`, `setup`, `clio`, `vercel`) |

## README.md Structure

Each folder's README follows this template:

```markdown
---
title: {Folder Name} Documentation
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active
author: claude+user
---

# {Folder Name}

One-line description of what this folder covers.

## Documents

| File | Description | Status |
|------|-------------|--------|
| [filename.md](filename.md) | What it covers | active |

## Quick Reference

Key facts, links, or commands relevant to this topic.
```

## Writing Rules

1. **Start with the "why"** — before the "how"
2. **Include gotchas** — things that wasted time, API quirks, non-obvious behavior
3. **Code blocks with context** — always say what language and where to run it
4. **Link, don't duplicate** — if info exists elsewhere, link to it
5. **Update `updated` date** — every time you meaningfully edit a doc
6. **Mark outdated** — if you discover a doc is wrong, change status to `outdated` immediately
