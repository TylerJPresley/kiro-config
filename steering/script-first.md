# Script first

Intent: mechanical work is done by deterministic scripts; models are spent on judgment.
Applies: whenever a task is counting, listing, searching, comparing, validating, converting or checking something a program can decide.

- Before doing it by hand or with an agent, look in the project's tools folder (thinking-folder) for an existing script.
- Otherwise write the smallest script, run it, and save it there with a README line if it will be needed again.
- Prefer a mechanical guard (a `check:*` script, a lint rule, a test) over a review agent for any rule a program can check.
- Models decide, summarize and design; scripts verify, enumerate and transform. Report script output, not a re-description of it.

Prevents: tokens and hours spent on work a script does in seconds; checks that depend on someone remembering.
