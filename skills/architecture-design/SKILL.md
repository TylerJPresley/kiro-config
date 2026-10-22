---
name: architecture-design
description: "boundaries and decisions are explicit, sized to the problem, and justified. Use when choosing structure, module boundaries, state ownership or service splits."
---

# Architecture and design

- A module boundary is right when files are cohesive inside, loosely coupled across, implementable without another module's internals, and parallelizable without file conflicts. Prefer fewer, larger modules for small projects.
- Monolith first. Add service boundaries only for independent deployment, separate scaling or team isolation.
- Define where each piece of state lives (memory, file, database); ambiguous ownership causes integration failures.
- Hyrum's Law: with enough consumers, every observable behavior becomes a de facto contract regardless of what is documented. Design interfaces to be hard to misuse, and treat observable behavior — not just the spec — as the real commitment.
- Flag external dependencies that need credentials or network access.
- Record each decision as: the decision (one sentence), **Why** (the constraint or tradeoff), **Consequence** (what it makes harder or impossible).

Prevents: premature services, unclear state ownership, decisions nobody can justify later.
