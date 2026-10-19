---
name: systems-thinking
description: "Plan with a system map before changing anything non-trivial: purpose, boundary, connections, loops and delays, second-order effects, leverage point, predicted touches. Use at the Plan step of Tier 2+ work (new subsystem, security/permissions/data, multi-file or multi-agent change) and when a fix keeps failing."
---

# Systems thinking (the Plan step for Tier 2+)

Intent: see what a change connects to before making it, and learn from what the map missed.

## The map (about 10 lines; every line cites evidence: file:line, command output, or says "unknown")
- **Purpose:** what changes, and the measure that shows it worked.
- **Boundary:** in scope, out of scope, who owns the edge.
- **Connections:** callers, consumers, tests, docs, config, permissions, and every other place that holds the same fact. Enumerate with tools (references, import graph, grep), not memory.
- **Loops:** what reinforces or balances it (gate, reviews, retries, lessons).
- **Delays:** what will not show until later (builds, caches, resumed sessions, long runs).
- **Second-order effects:** what else moves; who relies on today's behavior.
- **Leverage point:** the smallest change at the right place. A rule, goal or information flow beats effort inside the existing structure.
- **Predicted touches:** the files and areas you expect to change.

## Questions that catch the usual misses
- Who calls this? (built but never wired)
- What else holds this fact? (duplicated rules go stale)
- What runs at the same time? (races, ordering)
- What does this fix move elsewhere? (fixes that fail, shifting the burden, drifting goals)
- Does what we measure reward the right thing?

## After the work: predict, then verify
Compare predicted touches with the real change (`git diff --name-only`). Each surprise is a missed connection: state what the map missed. If it recurs, record it in `lessons.md`.

## Size
Tier 1: skip, or one line. Tier 2+: the full map, kept short, in the brief. Reviewers receive the map and check it against the diff.
