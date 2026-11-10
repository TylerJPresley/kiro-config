# Contributing to <name>

## Getting started

<clone, install, build, test: the exact commands>

## Standards

- Commits: conventional types (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`). One coherent change per commit, small enough to read at a glance. Each commit builds and passes the checks that cover it; a bug fix carries its regression test in the same commit. A pushed commit is corrected with a new commit.
- Git workflow: <gitflow: main holds releases, develop integration, each engineer has a branch cut from develop and each plan a feature branch cut from it and squash-merged back; or this project's variant>. Nobody but the maintainer commits to main or develop or creates a tag.
- Testing: <what must be tested, coverage target if any>. The gate is `gate.mjs` when the project has one, and a change to how the project is tested changes it.
- Dependencies: <the license policy, how to add one>
- Style: <language, formatter, lint>

## Licensing

<inbound and outbound terms>
