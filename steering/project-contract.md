# Project contract

Intent: agents stay project-neutral, and each project supplies its own facts in its own files.
Applies: whenever an agent works in a project and needs a project fact.

- A project extends the global setup with its own `.kiro/` steering, skills and agents. A project agent with the same name replaces the global one.
- Global rules are the defaults. Where a project's own files speak, they win, except for security rules, which follow the next rule.
- A project may tighten the global security rules. Loosening one needs the owner's approval and is never the default.
- A rule that holds in every project moves into global steering. A project fact stays in the project.
