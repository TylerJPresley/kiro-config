---
name: writing-for-agents
description: "Write any document an agent reads so it guides execution at the lowest cost: direction framed by what we want, limits stated plainly, and every line earning its place. Use when writing or revising a skill, steering file, agent prompt, spec, plan or AGENTS.md."
---

# Writing for agents

Intent: a document that steers an agent correctly on the first read while costing the fewest tokens, by framing direction affirmatively and cutting every line that changes nothing.

## When to use
- Writing or revising a skill, steering file, agent prompt, spec, plan, ticket or `AGENTS.md`.
- Reviewing a document that an agent loads, for framing and for cost.

## How to work
1. Frame direction by what we want and why it works. State the intended state and the move toward it. A choice is carried by its goal, never by a list of what is bad. `framing.md` holds the rule.
2. State a boundary plainly as a limit: never, must not, only. A softened limit stops being a limit.
3. State a problem as the gap between what exists and what is intended, and point the fix at the intended state.
4. Spend the two budgets deliberately: context load (the cost of a line that is always in memory) and the reader's attention (one agent reading in order). A line that earns neither is removed.
5. Prune: drop a line whose removal changes no behavior, fold duplication into one place, and remove settled-but-stale text and sprawl.
6. Lead with words a model already knows, so a compact term carries a whole concept. Reach for pointers (link detail instead of inlining it), hierarchy, runnable criteria, and leading words before adding length.
7. Write for the agent and the script that use the document: terse, structured, and ordered so the first read is enough. `references/rewrites.md` holds before-and-after pairs.

## References
- `references/rewrites.md`
