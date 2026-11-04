---
name: triage
description: "sort incoming problems and requests into ordered, labelled work, so the next thing to do is clear and nothing is lost. Use when a backlog, an inbox or a batch of reports needs to become ordered work."
---

# Triage

Intent: each incoming problem or request becomes one labelled item in an ordered list, so the next thing to work on is clear and nothing is dropped.

## When to use
- A backlog, an inbox or a batch of reports needs to become ordered work.
- New problems and requests arrive faster than they are handled.

## How to work
1. Make one item per distinct problem or request. Merge duplicates into the first item and link the rest to it.
2. Give each item a short title that states the gap: what exists and what is intended.
3. Apply one type label and one priority label from `references/labels.md`. A security report takes the highest priority.
4. Order the list by priority, then by the smallest item that unblocks the most other work.
5. Route each item to the role that owns it (see the `agent-roles` skill) and record the next step on the item.
6. Reproduce a bug report with a fast command before it is scheduled, so the item carries evidence (see the `diagnosing-bugs` skill).

## References
- `references/labels.md`
