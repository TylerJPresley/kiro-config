# The thinking folder

Intent: working files live in one place, `_internal/`, so a later session reuses them instead of paying to recreate them.
Applies: whenever an agent records a decision, result, plan, research note, tool or scratch file.

- Working files, including `handoff.md`, live in one place, `_internal/`, never in `/tmp` or the repo root. `_internal/` stays out of the shipped product. The test for what stays: a future session would have to pay again to recreate it.
- A project without `_internal/` gets one, kept out of version control, and the handoff goes there.
- Kept: `research/` (sources and findings kept so later sessions reference them without redoing the work; the `research-cache` skill holds the format), `plans/` (each plan tracks a change to the blueprints, with its `*.review.md` and `*.security.md` verdicts beside it, open while the work runs and then moved to `plans/archive/`), a `decisions.md` file (one dated line per decision, with the reason; the handoff points to it), `lessons.md`, reusable `tools/`, and `proposals/` waiting for the owner.
- Temporary, cleared when done: `scratch/` files, build output and `backups/`.
- A repeated mistake is recorded by the Director with the `lessons` script. On the third sighting the Planner proposes promoting it to the cheapest durable form (a script, then a skill, then a steering line), and the owner approves.
