# Project files

Intent: each concern has one home, so a rule lives in one place and stays consistent.
Applies: when starting work in a project, and before committing, testing, adding a dependency or documenting.

- The blueprints hold the project's direction. `README.md` says what the project is and how to use it.
- `CONTRIBUTING.md` holds the rules for changing the project, binding every contributor, human or agent: git workflow, tests, dependencies and style. Agents read it before committing, testing or adding a dependency. Where it differs from `AGENTS.md`, it wins.
- `AGENTS.md` orients an agent working in the directory: layout, how to build and check, protected paths and the project's git facts (branch model, base and integration branches, engineer-branch pattern). It follows the industry standard. It points to `CONTRIBUTING.md` for the rules and never copies them, and agents read it and leave it alone unless directed.
- `LICENSE`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md` and `docs/` hold one concern each.
- When the owner states a rule for how the project is changed, it is written in `CONTRIBUTING.md` and nowhere else.
- At the start of work in a git repo, a git fact that neither `AGENTS.md` nor `CONTRIBUTING.md` states is asked of the owner in one round of at most three questions, each with a default, and written to the Git section of `AGENTS.md` after the owner's yes. The `project-files` skill holds the method.
- A missing file is named, and a starter is offered from the `project-files` skill. Nothing is written without a yes.
