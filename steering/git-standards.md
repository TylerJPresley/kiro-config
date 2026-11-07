# Git standards

Intent: a small, tested, readable history, where each commit stands on its own.
Applies: whenever an agent commits, branches or pushes.

- Commit at each logical seam: the point where a person reading the history would want a boundary. Each commit is one coherent change that can be understood on its own.
- Each commit builds and passes the checks that cover it. A bug fix carries its regression test in the same commit.
- Work is committed at each seam the plan defines, after each verified chunk, so the history follows the work as it happens. Files are staged by name.
- A blueprint change and the code that realizes it are separate commits, in order, so the spec and its implementation can each be read alone.
- Messages use conventional types (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`), say what changed and why, and name the blueprint section when one applies.
- Branching follows `CONTRIBUTING.md`; without one, work goes on the default branch.
- Each checklist item in a plan is one commit, and commits need no review. When the plan is complete, with every item done and its criteria passing, the Director pushes once through `scripts/push.mjs`, from a clean tree to origin on the current branch, never forced. When a project has a `gate.mjs`, it is one of the plan's criteria. The owner may also push by hand. A pushed commit is corrected with a new commit.
- A plan that introduces a project's first tests also creates its `gate.mjs`, and a plan that changes how a project is tested updates it. The gate is written by the builder and must pass an independent review, which flags any loosening for the owner to approve: a removed check, a narrowed command, an unconditional exit 0 in a project that had checks, and the deletion of `gate.mjs`. A strengthening is logged in `_internal/decisions.md`.
