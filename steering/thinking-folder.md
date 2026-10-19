# The thinking folder (`_internal/`)

Intent: one common place for agent and project working notes; nothing scattered or mistaken for product, spec or user docs.
Applies: whenever an agent records a decision, a result, a script or a scratch file.

Not authority. Never use `/tmp` or the repo root for working files.
- State: `handoff.md` (state, decisions), `next-steps.md` (ordered, actionable plan for the next session — ALWAYS kept current), `process-rules.md`, `gaps.md` (live open list), `mission.md`, `progress.md` (dated ledger; summarise, do not grow forever).
- `research/` (one file per question), `audits/` ("as of" date + sources), `proposals/` (for the owner to apply), `build/` (briefs/results, gitignored).
- `backups/` — copies of files edited OUTSIDE the repo; never inside a directory a tool auto-loads.
- `tools/` — reusable scripts; look here first, add reusable ones with a README line. `scratch/` — throwaway files (gitignored), cleaned with `tools/scratch-clean.sh`.

`lessons.md` — recurring patterns (mistakes, wasted effort, corrections). Record a pattern the SECOND time you see it, bump it each recurrence, and at 3 promote it to the cheapest durable form: script > skill > steering line > AGENTS.md (project nuance only). Use `node ~/.kiro/scripts/lessons.mjs`.

Keep `progress.md`, `handoff.md`, `gaps.md` and `next-steps.md` current. Update `next-steps.md` at the end of every working session and after any significant step: a cold start must succeed from `handoff.md` + `next-steps.md` alone.

Prevents: lost decisions, scattered scratch files, stray repo files, re-written helpers.
