# Project files

Intent: each concern has one home, so a rule lives in one place and stays consistent.
Applies: when starting work in a project, and before committing, testing, adding a dependency or documenting.

- Each concern has one home, so a rule lives in one place and stays consistent.
- The blueprints hold the project's direction. `README.md` says what the project is and how to use it.
- `CONTRIBUTING.md` says how to change the project: git, tests, dependencies and style. Agents read it before committing, testing or adding a dependency.
- `AGENTS.md` orients an agent working in the directory: layout, how to build and check, protected paths. It follows the industry standard. It is context only, it sends the reader to `CONTRIBUTING.md` for standards, and agents read it and leave it alone unless directed; when directed, the Documenter writes it.
- `LICENSE`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md` and `docs/` hold one concern each.
- When the owner states a rule for how the project is changed, it is written in `CONTRIBUTING.md` and nowhere else.
- A missing file is named, and a starter is offered from the `project-files` skill. Nothing is written without a yes.
