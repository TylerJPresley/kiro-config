# Session tracking

Intent: any session resumes from zero context without writing into the project.
Applies: at the start and end of every session and after each finished work item.

- Start: run `node ~/.kiro/scripts/progress.mjs show` (creates the tracker if missing) and follow its Cold start section.
- After each work item and before stopping: `progress.mjs log "<what changed, evidence>"`; refresh State, Open items or Decisions pending with `progress.mjs set <Section>` (body on stdin).
- The tracker is `.kiro/progress.md` in the directory Kiro started from. Never use tracked project files for tracking.

Prevents: lost state between sessions, process notes committed into the repo.
