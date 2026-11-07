---
name: planning
description: "turn an approved outcome into a plan a feature stands on: pinned decisions, runnable criteria, and seams that each leave the project working. Use when defining a feature, writing a plan, or dividing work into steps for specialists to build."
---

# Planning

Intent: a plan turns one feature's outcome into pinned decisions, runnable criteria and seams, so the feature stands on its own and any specialist can build it.

## When to use
- Defining a feature, once the Architect has drafted the blueprint change and the owner has approved it.
- Dividing a feature into steps for specialists to build in parallel.

## How to work
A plan carries one feature. Write it for the agents and scripts that use it: terse, structured, affirmative in direction, plain in its limits (see framing steering). Give it five parts:
1. **Blueprint change** — reference the section of the blueprint the Architect drafted and the owner approved. The plan follows it; it never restates or re-decides it.
2. **Pinned decisions** — one line each, each with the reason it was chosen. A decision that is the owner's is marked so and carried to him through a normal reply.
3. **Criteria** — the acceptance criteria, each with a runnable check (a command that exits 0 when the criterion holds). Write a behavior scenario as Given/When/Then and a standing rule as EARS ("WHEN [trigger], THE SYSTEM SHALL [result]"); see `references/ears-gwt.md`.
4. **Seams** — the steps, divided at seams that each leave the project working. List each step's files and its dependencies on other steps. A plan that introduces the project's first tests also creates `gate.mjs`; a plan that changes how the project is tested updates it, written by the Implementer and judged by the Reviewer.
5. **Existing tests changed** — the tests this feature modifies, each with the reason, so a reviewer sees which existing behavior moved.
6. Start from `references/plan-template.md`; model a worked plan on `examples/plan-example.md`, whose criteria live in `examples/plan-example.criteria`.

## References
- `references/plan-template.md`
- `references/ears-gwt.md`
- `examples/plan-example.md`
- `examples/plan-example.criteria`
