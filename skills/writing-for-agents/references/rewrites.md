# Rewrites: before and after

Each pair shows a line as first written and as rewritten for an agent. The rewrite frames direction by what we want, states limits plainly, and drops what earns nothing.

## Frame by the goal, not by the bad outcome

Before:

> This avoids broken builds and prevents wasted reviewer time.

After:

> Each commit builds and passes the checks that cover it.

The rewrite names the intended state. The reason a line exists is the goal it protects, not the harm it lists.

## State a limit plainly

Before:

> Try not to push unless it seems appropriate.

After:

> Push only when the owner asks.

A limit is `never`, `must not`, or `only`. A softened limit stops guiding.

## Problem as a gap, fix toward the intended state

Before:

> The docs are a mess and nobody trusts them.

After:

> The README describes an older interface than the code ships. Update the README to match the current interface.

The problem is the gap between what exists and what is intended; the fix moves toward the intended state.

## Prune a no-op line

Before:

> It is generally considered a good practice, where possible and when it makes sense, to write tests.

After:

> A failing test, derived from the plan's criteria, exists before the code.

Delete a line whose removal changes no behavior. Keep the one that an agent acts on.

## Lead with a known concept

Before:

> Make sure independent reads and searches are grouped so you are not sending them one after another across separate turns.

After:

> Send independent reads in one request.

A compact, pretraining-known phrase carries the concept; the long gloss adds cost without adding direction.

## Point to detail instead of inlining it

Before:

> [the full output contract pasted inline, forty lines]

After:

> The output contract is in `references/ecosystems.md`.

A pointer keeps the always-loaded document small and loads the detail only when the task needs it.
