---
name: orchestrator-brief
description: Template for briefs to implementer, reviewer and verifier agents: task-specific pins, reply budget, tests first, honest reporting. Use whenever delegating work.
---

# Brief template (about 25 lines)

Intent: a brief an agent can execute without guessing, stalling or over-reporting. Standing rules (timeouts, no background processes, no commits, protected paths, reporting what is NOT done) live in the agent prompts: do not repeat them.

1. **Context** — project, HEAD, what is uncommitted and whose it is, "no other agents work in parallel unless stated".
2. **System map (Tier 2+)** — from the `systems-thinking` skill: touches, must not break, predicted files.
3. **Read first** — spec sections and files with EXACT line ranges (reference, do not paste); the agent reads each once and does not re-read in slices. Say which independent reads to batch in one call (every call re-sends the whole history).
4. **Pinned decisions** — numbered; "if the code contradicts one, finish the rest and report a CONFLICT".
5. **Tests** — failing test first for bugs; the acceptance tests; the real path (model -> tool -> effect).
6. **Gate** — `_internal/tools/gate.sh` (project helper) or the project's gate; targeted tests for steps, one full run at the end.
7. **Reply budget** — "reply in <= N lines": files changed, each item done / NOT done, tests added, what remains.

Verifier briefs add: use a scratch environment, cap real-model turns, clean up, finish with `git status`.
