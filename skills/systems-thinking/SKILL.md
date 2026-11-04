---
name: systems-thinking
description: "map a change's purpose, boundary, connections, loops, second-order effects and predicted touches before making it. Use at the Plan step of a new subsystem, a security, permissions or data change, a multi-file or multi-agent change, and when a fix keeps failing."
---

# Systems thinking (the Plan step)

Intent: see what a change connects to before making it, then learn from what the map missed.

## When to use
- At the Plan step of a new subsystem, or a change that touches security, permissions, data, several files or several agents.
- When a fix keeps failing and the cause is still unknown.

## How to work
1. Write the map (about ten lines; every line cites evidence as file:line, command output, or says "unknown"):
   - **Purpose:** what changes, and the measure that shows it worked.
   - **Boundary:** in scope, out of scope, who owns the edge.
   - **Connections:** callers, consumers, tests, docs, config, permissions, and every other place that holds the same fact. Enumerate with tools (references, import graph, grep).
   - **Loops:** what reinforces or balances it (the gate, reviews, retries, lessons).
   - **Delays:** what shows up only later (builds, caches, resumed sessions, long runs).
   - **Second-order effects:** what else moves, and who relies on today's behavior.
   - **Leverage point:** the smallest change at the right place. A rule, a goal or an information flow does more than effort inside the existing structure.
   - **Predicted touches:** the files and areas you expect to change.
2. Ask the questions that catch the usual misses: Who calls this? What else holds this fact? What runs at the same time? What does this fix move elsewhere? Does what we measure reward the right thing?
3. After the work, compare the predicted touches with the real change (`git diff --name-only`). Name each surprise as a missed connection; when one recurs, record it in lessons.md.
4. Size the map to the change: one line for a small local change, the full map kept short in the brief for anything larger. Reviewers receive the map and check it against the diff.
