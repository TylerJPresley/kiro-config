# Git standards (defaults)

Intent: small, tested, readable history in every project.
Applies: whenever committing, branching or pushing. The project's `CONTRIBUTING.md` overrides these where it speaks.

- Use the branching model `CONTRIBUTING.md` states; without one, commit to the default branch.
- Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`); add the spec section when one applies.
- One logical change per commit, small enough that a reader sees what happened from the message and the diff. Never mix a refactor, a removal, a new limit and a bug fix.
- Every commit is tested: build and the affected tests pass before it is made; a bug fix carries its regression test in the same commit. Commit after each verified chunk, not once at the end.
- Push in logical chunks after the full test run passes, and only when the user asks. No force pushes, no amending pushed commits.

Prevents: bundled commits, untested commits, surprise pushes.
