# The project contract

Intent: agents are project-neutral; the project supplies its facts in one place and agents never guess them.
Applies: at the start of work in any project, and when a needed fact is missing.

- Kiro loads this global steering plus the project's `AGENTS.md`, `.kiro/steering` and `.kiro/skills` from the directory it was started in.
- `AGENTS.md` provides: the gate commands, the spec hierarchy and protected files, architecture rules, reference-only directories, dependency and license policy, git rules. If one is missing, say so and ask once.
- A project changes an agent with `<project>/.kiro/agents/<name>.json` (same name overrides the global one).
- Only project facts go in the project; a rule that holds in any project belongs in global steering. Deviations and additions live in `AGENTS.md`, never as copies of global text.

Prevents: guessed commands, project facts leaking into global rules, global rules duplicated per project.
