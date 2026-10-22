# The thinking folder (`_internal/`)

Intent: one common place for agent and project working notes; nothing scattered or mistaken for product, spec or user docs.
Applies: whenever an agent records a decision, a result, a script or a scratch file.

Not authority. Never use `/tmp` or the repo root for working files.
- Project notes: `handoff.md` (state, decisions), `process-rules.md`, `gaps.md` (open list), `mission.md`. Session state is NOT kept here (session-tracking steering).
- `research/` (one file per question), `audits/` ("as of" date + sources), `proposals/` (for the owner to apply), `build/` (briefs/results, gitignored).
- `backups/` — copies of files edited outside the repo; never in an auto-loaded directory.
- `tools/` — reusable scripts (look here first; add a README line). `scratch/` — throwaway files (gitignored).
- Scripts Kiro generates for a project (derived from its type, e.g. the audit script) live in `<project>/.kiro/scripts/` and stay untracked; `_internal/` holds the project's own documents, notes and tools.

`lessons.md` — recurring patterns: record a pattern the SECOND time you see it, bump it each recurrence, promote it at 3 (script > skill > steering line > AGENTS.md) via `node ~/.kiro/scripts/lessons.mjs`.


Prevents: lost decisions, scattered scratch files, stray repo files, re-written helpers.
