# Workflow patterns

Intent: efficient, non-stalling tool use.
Applies: while working with files, commands and long contexts.

## Tool order
- Read a file before writing it; never assume its contents. For large files read only the relevant section and paginate.
- Use targeted edits for existing files, full writes for new ones.
- Run tests or the build after writes to validate before moving on.

## Stalls
- Reading the same file twice without writing means you are stalling: decide and act.
- A failed tool call: diagnose the error before retrying. Same arguments, same failure.

## Context budget
Prefer small focused reads over whole large files. Read what you need, then stop.

Prevents: blind edits, retry loops, wasted context.
