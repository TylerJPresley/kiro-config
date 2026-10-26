---
name: project-files
description: "starter versions of README.md, CONTRIBUTING.md and AGENTS.md for a project that lacks them. Use when one of these files is missing and the owner agrees to create it."
---

# Project file starters

Offer a starter only when the file is missing and the owner says yes. Fill every bracket from the project (read `package.json`, the build scripts, the existing docs); ask once about anything you cannot find. Keep each file short.

## README.md
```
# <name>
<one line: what it is and who it is for>
## Requirements
## Install and run
## License
```

## CONTRIBUTING.md
```
# Contributing to <name>
## Getting started
<clone, install, build, test: the exact commands>
## Standards
- Commits: conventional (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). One logical change per commit, small enough to read at a glance. Every commit builds and passes the affected tests; a bug fix carries its regression test. Push in logical chunks after the full test run passes. No force pushes, no amending pushed commits.
- Testing: <what must be tested, coverage target if any>
- Dependencies: <license policy, how to add one>
- Style: <language, formatter, lint>
## Licensing
<inbound and outbound terms>
```

## AGENTS.md
```
# <name>
<one line: what it is>
## Layout
<top-level folders and what each holds>
## Build and verify
<the commands, including the full gate>
## Specification
<where the specs live and who changes them>
## Protected paths
<files and folders an agent must not change>

Follow `CONTRIBUTING.md` for this project's standards.
```
