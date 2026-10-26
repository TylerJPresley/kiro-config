# The project contract

Intent: agents are project-neutral; the project supplies its facts in its own files and agents never guess them.
Applies: at the start of work in any project, and when a needed fact is missing.

- Kiro loads this global steering plus the project's `AGENTS.md`, `.kiro/steering` and `.kiro/skills` from the directory it was started in.
- What each project file is for, and which one wins, is in `project-files`.
- A project changes an agent with `<project>/.kiro/agents/<name>.json` (same name overrides the global one).
- Only project facts go in the project; a rule that holds in any project belongs in global steering.
- If a fact you need about the project is missing from its files, say so and ask once.

Prevents: guessed commands, project facts leaking into global rules, global rules duplicated per project.
