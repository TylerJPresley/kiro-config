# Workflow patterns

Intent: efficient, non-stalling tool use.
Applies: while working with files, commands and long contexts.

- Read a file before changing it. For a large file, read the relevant section.
- Use targeted edits on existing files and full writes for new ones.
- After writing, run the build or the check that covers the change.
- Decide and act once you have read enough. Reading the same file again without a change is a stall.
- When a call fails, read the error and change something before retrying. The same call gives the same failure.
