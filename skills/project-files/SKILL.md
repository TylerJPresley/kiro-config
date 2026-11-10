---
name: project-files
description: "starter README.md, CONTRIBUTING.md and AGENTS.md for a project that lacks one, and asks the owner for missing git facts. Use when one of these files is missing and the owner agrees to create it."
---

# Project file starters

Intent: a project that lacks a core file gets a short, true starter, so each concern has one home from the first commit.

## When to use
- A project is missing `README.md`, `CONTRIBUTING.md` or `AGENTS.md`, and the owner agrees to create it.
- You are setting up a new project or filling a gap an agent found.

## How to work
1. Name the missing file and offer the starter. Write it only after the owner says yes.
2. Fill every bracket from the project: read `package.json`, the build scripts and the existing docs for the real values. Ask once about a value you cannot find.
3. Keep each file short and put each concern in its one home: what it is in `README.md`, how to change it in `CONTRIBUTING.md`, orientation in `AGENTS.md`. State a rule for changing the project in `CONTRIBUTING.md` and nowhere else.
4. The `AGENTS.md` starter carries a `Licenses allowed:` line that the `audit` script reads for the license allow-list; set it to the project's accepted SPDX ids.
5. Copy a starter from `references/`: `references/README.template.md`, `references/CONTRIBUTING.template.md`, `references/AGENTS.template.md`.
6. When the project has checks to run, add `gate.mjs` at its root from `references/gate.template.mjs` and fill in the real checks; never leave the starter unfilled. A project with no checks has no `gate.mjs`.
7. Git facts: when a git repo's AGENTS.md has no `## Git` section and CONTRIBUTING.md does not state the branch model, run one grilling round (see the grilling skill) of at most three questions, each with a default: (a) branch model, gitflow* or trunk only; (b) release and integration branch names, main and develop; (c) engineer-branch pattern, dev/<engineer> with the engineer from git config user.name. Write the answers to the Git section of AGENTS.md after the owner's yes; a mutation rule goes to CONTRIBUTING.md.

## References
- `references/README.template.md`
- `references/CONTRIBUTING.template.md`
- `references/AGENTS.template.md`
- `references/gate.template.mjs`
- `references/protected.template.json`
