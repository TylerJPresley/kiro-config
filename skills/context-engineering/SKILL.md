---
name: context-engineering
description: "manage the agent's context across a session for output quality (signal-to-noise), not just token count. Use during long or multi-stage sessions, before a large run, or when context fills past ~40-75%."
---

# Context engineering

Intent: keep the context high-signal so output quality holds; token count is a proxy, not the goal.

## Priority (highest first)
1. Rules / steering
2. Specs
3. Relevant code
4. The current error
5. Conversation history

When space is tight, the lowest-priority material goes first.

## Timing
- Trim at about 75% full, not at 100%. Do not wait for forced compaction to decide what matters.

## Placement (lost-in-the-middle)
- Models recall the start and the end best; the middle is weakest.
- Put stable rules and specs at the **start**; put the **active** task material last, closest to the generation point.

## What to cut, what to protect
- Cut first: failed attempts, stale file dumps, resolved errors.
- Protect: the current error, the active constraint, the pinned decision.
- Compress (summarize to the decision and evidence) before dropping outright.

See `ctx.mjs` for the budget measurement and the session-tracking steering for cross-session state; this skill is the judgment layer over both, not a copy of them.

Prevents: forced compaction losing the active task, high-signal rules buried mid-context, token-count tuning that ignores quality.
