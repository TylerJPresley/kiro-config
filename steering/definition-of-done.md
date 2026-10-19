# Definition of done

Intent: no completion claim without evidence that the result meets the plan.
Applies: before saying a task is done, fixed, passing or complete.

- Run the command, read the output, then make the claim. "Should work" is not evidence.
- Report: what was done; each criterion met, with its evidence (command output, test result, diff); what was NOT verified.
- A bug fix carries a regression test written first. A feature is done only when a test drives the real path (input → tool → effect), not just the API.
- Never report success for work that is not in the tree. Say what remains.
- Claim completion only after writes are validated. A read-only turn that changed nothing explains why nothing needed changing.
- Docs stay current: a change to behavior, commands, configuration or public API updates the docs that exist. Documentation that contradicts the code is a bug.

Prevents: unverified "done", partial work presented as complete, drifted docs.
