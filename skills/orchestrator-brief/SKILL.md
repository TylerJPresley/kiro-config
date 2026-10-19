---
name: orchestrator-brief
description: Template for briefs to implementer, reviewer and verifier agents: pinned decisions, hard time limits, reply budget, tests first, honest reporting. Use whenever delegating work.
---

# Brief template

Intent: a brief an agent can execute without guessing, stalling or over-reporting.

1. **Context** — project, current state (HEAD, what is uncommitted and whose it is), and "no other agents work in parallel — you own this".
2. **Hard rules** — wrap every shell command in `timeout` (tests longer); no background processes (kill what you start); never touch files outside the stated scope; do not commit unless asked; stop and report at ~15 minutes per step.
3. **System map (Tier 2+)** — from the `systems-thinking` skill: what the work touches, what must not break, predicted files. Reviewers receive it and report any change outside it.
4. **Read first** — the spec sections; the spec is the requirement.
5. **Pinned decisions** — numbered. "If the code contradicts one, finish the rest and report a CONFLICT; do not choose."
6. **Tests** — bugs get a failing test first; list the acceptance tests; keep coverage floors.
7. **Gate** — the exact command; read the exit code of the test step.
8. **Helpers** — point to the project's reusable scripts and scratch folder (project-contract) before the agent writes its own.
9. **Reply budget** — "reply in ≤ N lines": files changed, each item done / NOT done, tests added, what remains, gate result. Never report success for work that is not in the tree.

Verifier briefs add: use a scratch environment, cap real-model turns, clean up, finish with `git status`.
