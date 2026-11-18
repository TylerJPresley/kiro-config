# Project files

Intent: each concern has one home, so a rule lives in one place and stays consistent.
Applies: when starting work in a project, and before committing, testing, adding a dependency or documenting.

- The blueprints hold the project's direction. `README.md` says what the project is and how to use it.
- `CONTRIBUTING.md` holds the human workflow and governance and the rules that bind every contributor, human or agent: how to propose a change, git workflow, tests, dependencies, style and the pull request checklist. Agents read it before committing, testing or adding a dependency.
- `AGENTS.md` holds the agent execution rules: commands with flags, stack, project map, conventions and boundaries (Always, Ask first, Never). It follows the industry standard, links to `CONTRIBUTING.md` for shared rules, and neither file copies the other. Agents read it and leave it alone unless directed.
- `LICENSE`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md` and `docs/` hold one concern each.
- When the owner states a rule for how the project is changed, it is written in `CONTRIBUTING.md` and nowhere else, unless it is an agent execution rule, which goes in `AGENTS.md`.
- At the start of work in a git repo, a git fact that neither `AGENTS.md` nor `CONTRIBUTING.md` states is asked of the owner in one round of at most three questions, each with a default, and written to the Git section of `CONTRIBUTING.md` after the owner's yes. The `project-files` skill holds the method.
- A missing file is named, and a starter is offered from the `project-files` skill. Nothing is written without a yes.
