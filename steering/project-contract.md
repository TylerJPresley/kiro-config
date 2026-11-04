# Project contract

Intent: agents stay project-neutral, and each project supplies its own facts in its own files.
Applies: whenever an agent works in a project and needs a project fact.

- Agents are project-neutral. Their rules hold in any project, and project facts stay in the project.
- A project supplies its facts in its own files: direction in the blueprints, orientation in `AGENTS.md`, and how to change the project in `CONTRIBUTING.md`.
- A project extends the global setup with its own `.kiro/` steering, skills and agents. A project agent with the same name replaces the global one.
- Global rules are the defaults. Where a project's own files speak, they win, except for security rules, which follow the next rule.
- A project may tighten the global security rules. Loosening one needs the owner's approval and is never the default.
- A rule that holds in every project moves into global steering. A project fact stays in the project.
- A missing fact is asked for once and then recorded in the right project file.
