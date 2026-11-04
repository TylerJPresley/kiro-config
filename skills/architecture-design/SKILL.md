---
name: architecture-design
description: "boundaries and decisions are explicit, sized to the problem and justified. Use when choosing structure, module boundaries, state ownership or service splits."
---

# Architecture and design

Intent: boundaries are drawn where they hold, sized to the problem, and every decision records why it was made.

## When to use
- Choosing structure, module boundaries, state ownership or service splits.
- Reviewing a proposed structure against the problem it serves.

## How to work
1. Draw a module boundary where files are cohesive inside, loosely coupled across, implementable without another module's internals, and parallelizable without file conflicts. For a small project, prefer fewer, larger modules.
2. Start with a monolith; add a service boundary only for independent deployment, separate scaling or team isolation.
3. Define where each piece of state lives (memory, file, database); one owner per piece keeps integration predictable.
4. Treat every observable behavior as a de facto contract once it has enough consumers (Hyrum's Law): design an interface to be hard to misuse, and treat observed behavior as the real commitment alongside the spec.
5. Name the external dependencies that need credentials or network access.
6. Record each decision as the decision (one sentence), **Why** (the constraint or tradeoff), and **Consequence** (what it makes harder or forecloses).
