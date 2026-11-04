---
name: briefing
description: "the template for a brief to a specialist: pinned decisions, a reply budget, tests first, and an honest report of what remains. Use whenever the Director delegates work."
---

# Briefing

Intent: a brief a specialist can execute without guessing, stalling or over-reporting. Standing rules (timeouts, no background processes, no commits, protected paths, reporting what is NOT done) live in the agent prompts, so a brief names only what this task adds.

## When to use
- The Director delegates a piece of work to any specialist.
- A step needs its own pinned decisions, tests and reply budget.

## How to work
1. **Context** — project, HEAD, what is uncommitted and whose it is, and whether other agents work in parallel.
2. **System map (planned work)** — from the `systems-thinking` skill: what the change touches, what must keep working, the predicted files.
3. **Read first** — spec sections and files with exact line ranges to reference, not paste; the agent reads each once. Name the independent reads to batch in one call, since each call resends the whole history.
4. **Pinned decisions** — numbered, from the plan. "If the code contradicts one, finish the rest and report a CONFLICT."
5. **Tests** — a failing test first for a bug; the acceptance tests; the real path (model to tool to effect). Name a template test that already drives the real path, and require a mutation result: break the production code, show the new test fail, restore it. The Director rejects a test that only asserts on literals it builds itself, by reading the test.
6. **Gate** — the project's gate script (named in `AGENTS.md`): targeted tests for a step, one full run at the end.
7. **Reply budget** — "reply in N lines or fewer": files changed, each item done or NOT done, tests added, what remains.
8. A verifier brief adds: use a scratch environment, cap real-model turns, clean up, and finish with `git status`.
