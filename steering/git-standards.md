# Git standards

Intent: a small, tested, readable history, where each commit stands on its own.
Applies: whenever an agent commits, branches, merges or pushes.

- Commit at each logical seam: the point where a person reading the history would want a boundary. Each commit is one coherent change that can be understood on its own.
- Each commit builds and passes the checks that cover it. A bug fix carries its regression test in the same commit.
- Work is committed at each seam the plan defines, after each verified chunk, so the history follows the work as it happens. Files are staged by name.
- A blueprint change and the code that realizes it are separate commits, in order, so the spec and its implementation can each be read alone.
- Messages use conventional types (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`), say what changed and why, and name the blueprint section when one applies.
- The baseline workflow is gitflow. A project's `CONTRIBUTING.md`, then its `AGENTS.md`, may override any part of it, for example "trunk only, no develop". The project's file wins, and security rules are never overridden.
- `main` holds releases and `develop` holds integration. An agent commits to them only on the owner's explicit command. Releases, hotfixes and every tag are the owner's, and an agent never creates a tag.
- Each engineer working with an agent has the branch `dev/<engineer>`, cut from `develop` (from `main` when there is no `develop`). `<engineer>` is `git config user.name` in lowercase, with each run of characters outside `a-z`, `0-9`, `.`, `_` and `-` replaced by one `-`, unless `AGENTS.md` sets another pattern.
- At the start of work in a git repo, an agent reads the git facts in `AGENTS.md` and `CONTRIBUTING.md`. When it is on `main`, `develop` or another engineer's branch, it switches to its own engineer branch, creating it first when absent. A dirty tree is the owner's to resolve.
- One plan is one feature on one branch, `feature/<plan-slug>`, cut from the engineer branch and kept local. Each checklist item in a plan is one commit on it, and commits need no review. One plan is active per engineer branch at a time.
- When the plan is complete, with every item done and its criteria passing (and the independent check passed where plan-and-verify requires one), the feature branch is squash-merged into the engineer branch as one commit. The plan's outcome is the message and the checklist items are the body. The feature branch is then deleted with `git branch -D`.
- The engineer branch is pushed once through `scripts/push.mjs`, from a clean tree, never forced. It is merged into `develop` as a normal merge, not a squash, by the owner or by an agent on the owner's explicit command, which also pushes `develop`. The owner may also push by hand.
- Small work (a pure reword that changes no rule, permission or limit) is committed directly on the engineer branch with no plan or review, and pushed when the owner asks.
- A pushed commit is corrected with a new commit. Unpushed history is rewritten only when the owner asks.
- When a project has a `gate.mjs`, it is one of the plan's criteria.
- A plan that introduces a project's first tests also creates its `gate.mjs`, and a plan that changes how a project is tested updates it. The gate is written by the builder and must pass an independent review, which flags any loosening for the owner to approve: a removed check, a narrowed command, an unconditional exit 0 in a project that had checks, and the deletion of `gate.mjs`. A strengthening is logged in `_internal/decisions.md`.
