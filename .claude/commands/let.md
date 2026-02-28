# /let - Get Up to Speed on a Handover

## Purpose

Get the LLM up to date with a handover document or task context. This is a **read-only briefing** - no coding, just understanding and clarifying questions.

## Usage

```
/let
```
(Uses currently open file or asks user for path)

```
/let path/to/handover.md
```
(Reads specific handover file)

```
/let THO-006
```
(Finds latest handover for task ID)

---

## Workflow

### Step 1: Locate the Handover

1. **If file path provided**: Read that file directly
2. **If task ID provided** (e.g., `THO-006`): Search for handover in:
   - `docs/apps/*/_handover/` folders (glob for task ID)
   - Database via `get_task_handover('THO-006')` if no file found
3. **If nothing provided**: Check if user has a file open in IDE, or ask

### Step 2: Read and Understand

1. **Read the handover document** completely
2. **Parse key sections**:
   - Summary/what was done
   - Remaining tasks/what's next
   - Files touched
   - Issues found/blockers
   - Testing requirements

### Step 3: Confirm Understanding

Respond with a brief summary:

```
I'm up to date on [TASK-ID].

**Summary**: [1-2 sentence summary of what the task is about]

**Current Status**: [Where things stand - what's done, what's left]

**Key Files**: [List 3-5 most important files]

**Open Items**: [Remaining work or issues]

Do you have any questions or should I clarify anything?
```

### Step 4: Handle Questions

If anything is unclear:
- Ask clarifying questions
- Request additional context if needed
- Suggest reading specific files for more detail

---

## Critical Rules

1. **NO CODING** - This command is read-only. Do not write, edit, or create any files.
2. **NO JUMPING AHEAD** - Do not start implementing anything. Just understand.
3. **ASK if unclear** - If the handover is ambiguous, ask the user.
4. **Be concise** - Summarize, don't repeat the entire document back.
5. **Identify gaps** - If critical info is missing, point it out.

---

## Example Output

```
I'm up to date on THO-006.

**Summary**: Unified labels & content tables - migrated from 11 fragmented
tables to 4 polymorphic tables (labels, content_labels, notes, footnotes).

**Current Status**:
- Phase 2 complete - all 27 files migrated
- Build passes
- Ready for testing

**Key Files**:
- 20700_labels, 20701_content_labels, 20702_content_notes, 20703_content_footnotes
- features/theo/hooks/useLabels.ts, useNotes.ts, useFootnotes.ts

**Open Items**:
1. Run automated tests
2. Manual testing checklist (9 areas)
3. Issues found: missing icons, video fetch, footnote jump-to-text

**Questions I have**:
- None - the handover is comprehensive

Ready when you are. What would you like to do next?
```

---

## When NOT to Use

- If user wants to start coding immediately (use `/handover` to read then proceed)
- If creating a new handover (use `/handover` to create)
- If marking tasks done (use `/taskdone`)
