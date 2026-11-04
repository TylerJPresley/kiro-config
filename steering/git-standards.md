# Git standards

Intent: a small, tested, readable history, where each commit stands on its own.
Applies: whenever an agent commits, branches or pushes.

- Commit at each logical seam: the point where a person reading the history would want a boundary. Each commit is one coherent change that can be understood on its own.
- Each commit builds and passes the checks that cover it. A bug fix carries its regression test in the same commit.
- Each agent commits its own work at each seam the plan defines, so the Architect commits blueprint changes and the Documenter commits repo documents, after each verified chunk, so the history follows the work as it happens. Pushing happens only when the owner asks.
- A blueprint change and the code that realizes it are separate commits, in order, so the spec and its implementation can each be read alone.
- Messages use conventional types (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`), say what changed and why, and name the blueprint section when one applies.
- Branching follows `CONTRIBUTING.md`; without one, work goes on the default branch.
- Push in logical chunks after the full run passes, at the owner's request. A pushed commit is corrected with a new commit.
