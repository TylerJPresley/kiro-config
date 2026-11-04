---
name: context-engineering
description: "manage the session's context for quality as well as size, and know when a fresh session pays off. Use during long or multi-stage sessions, before a large run, or when the context is filling up."
---

# Context engineering

Intent: keep the context high-signal so output quality holds, and hand off to a fresh session before a forced reset loses the active task.

## When to use
- A session runs long or spans several stages.
- Before a large run that will read or generate a lot.
- When `ctx.mjs` reports the context filling toward its limit.

## How to work
1. Order material by priority, highest first: rules and steering, specs, relevant code, the current error, then conversation history. When space is tight, the lowest priority goes first.
2. Place stable rules and specs at the start and the active task material last, closest to the generation point, because a model recalls the start and the end best.
3. Trim early, at about 75 percent full, rather than waiting for a forced compaction to decide what matters.
4. Cut failed attempts, stale file dumps and resolved errors first. Keep the current error, the active constraint and the pinned decision. Compress to the decision and its evidence before dropping anything outright.
5. Read `ctx.mjs` once per work item and act on its label: below 25 percent proceed; at 25 percent or more finish the item in hand, keep replies minimal, and tell the owner a reset pays off now; at 30 percent or more start no new work item and write the handoff so a fresh session resumes.
6. Keep cross-session state in the handoff so a reset costs nothing; the `session-tracking.md` steering holds the handoff rules.
