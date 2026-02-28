# /newdoc — Create a New Documentation File

## Purpose

Create a standardized documentation file following project conventions. Read `docs/CONVENTIONS.md` first.

## Usage

```
/newdoc folder/filename description
```

Examples:
- `/newdoc clio/oauth_troubleshooting OAuth token issues and fixes`
- `/newdoc setup/supabase_setup Supabase database setup guide`
- `/newdoc _handover/2026-03-01_clio_testing Clio API testing session`

## Arguments

- `$0` — path relative to `docs/` (e.g., `clio/oauth_troubleshooting`)
- Remaining `$ARGUMENTS` — description for the title

## Workflow

1. Read `docs/CONVENTIONS.md` to confirm naming rules
2. Validate the target folder exists in `docs/`
3. Create the file at `docs/{$0}.md` with frontmatter:

```markdown
---
title: {Description from arguments}
created: {today's date YYYY-MM-DD}
updated: {today's date YYYY-MM-DD}
status: draft
author: claude+user
tags: [{folder-name}]
---

# {Title}

{Write content based on context or ask user what to include}
```

4. Update the folder's `README.md` — add new file to the Documents table
5. Confirm creation to user

## Rules

- **Follow CONVENTIONS.md exactly** — snake_case filenames, proper frontmatter
- **Always update the README** — add the new doc to the Documents table
- **Handover files** use date prefix: `YYYY-MM-DD_{description}.md`
- **Set status to `draft`** unless user says it's complete
- **Ask before writing** if no description is given — don't generate placeholder content
