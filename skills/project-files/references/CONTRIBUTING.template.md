# Contributing to <name>

## Getting started

<clone, install, build, test: the exact commands>

## Standards

- Commits: conventional types (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`). One coherent change per commit, small enough to read at a glance. Each commit builds and passes the checks that cover it; a bug fix carries its regression test in the same commit. When a plan is complete it is pushed once through `scripts/push.mjs`; otherwise push in logical chunks after the full run passes. A pushed commit is corrected with a new commit.
- Testing: <what must be tested, coverage target if any>. The gate is `gate.mjs` when the project has one, and a change to how the project is tested changes it.
- Dependencies: <the license policy, how to add one>
- Style: <language, formatter, lint>

## Licensing

<inbound and outbound terms>
