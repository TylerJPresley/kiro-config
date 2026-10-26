# Project files

Intent: each concern has one home, so a rule lives in one place and cannot drift.
Applies: when starting work in a project, and before committing, testing, adding a dependency or documenting.

- `README.md`: what the project is and how to use it.
- `CONTRIBUTING.md`: how to change it. The project's standards for git, tests, dependencies and style. Read it before committing, testing or adding a dependency.
- `AGENTS.md`: orientation for any agent. What the project is, its layout, how to build and verify, where the specs live, protected and reference-only paths. Context only; it never sets standards. It carries one line sending a reader to `CONTRIBUTING.md`.
- `LICENSE`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`, `docs/`: one concern each, as usual.
- Precedence for standards: global steering sets the defaults, `CONTRIBUTING.md` overrides them where it speaks. `AGENTS.md` adds context only.
- Never restate a rule in a second file. When the owner states or changes a rule for how the project is changed (commits, tests, dependencies, style), write it in `CONTRIBUTING.md` and nowhere else.
- A missing file: say so and offer the starter from the `project-files` skill. Write nothing without a yes.

Prevents: rules copied into several files that then disagree, standards buried in orientation, guessing a project's conventions.
