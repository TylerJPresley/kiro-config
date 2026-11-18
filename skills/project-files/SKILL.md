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
3. Keep each file short and put each concern in its one home, cross-linked and never copied: `README.md` is for people (what it is, install, usage); `CONTRIBUTING.md` is for people (human workflow and governance, rules that bind every contributor); `AGENTS.md` is for agents (commands, stack, map, conventions, boundaries). Commands live in `AGENTS.md` once. A rule for changing the project goes in `CONTRIBUTING.md`, unless it is an agent execution rule, which goes in `AGENTS.md`.
4. Apply the shared Markdown rules below to all three files. Load the guide before writing or revising a file: `references/readme-guide.md` for `README.md`, `references/contributing-guide.md` for `CONTRIBUTING.md`, `references/agents-guide.md` for `AGENTS.md`.
5. The `AGENTS.md` starter carries a `Licenses allowed:` line that the `audit` script reads for the license allow-list; set it to the project's accepted SPDX ids.
6. Copy a starter from `references/`: `references/README.template.md`, `references/CONTRIBUTING.template.md`, `references/AGENTS.template.md`.
7. When the project has checks to run, add `gate.mjs` at its root from `references/gate.template.mjs` and fill in the real checks; never leave the starter unfilled. A project with no checks has no `gate.mjs`.
8. Git facts: when a git repo's CONTRIBUTING.md has no `## Git` section and does not state the branch model, run one grilling round (see the grilling skill) of at most three questions, each with a default: (a) branch model, gitflow* or trunk only; (b) release and integration branch names, main and develop; (c) engineer-branch pattern, dev/<engineer> with the engineer from git config user.name. The branch model and PR flow are human workflow: write the answers to the Git section of CONTRIBUTING.md after the owner's yes. A `## Git` section found in AGENTS.md moves to CONTRIBUTING.md after the owner's yes.

## Shared Markdown rules
Sources: owner notes (owner-supplied search summaries; the cited links inside are the summary's own). The agents.md and GitHub blog sources do not state them; they are this setup's rules.
- Structure comes from headings. Bold and italics carry no structure. The one bold element is the agents line at the top of `README.md`.
- Backticks wrap only real identifiers, paths and commands.
- Each instruction is self-contained: exact relative path, full command with flags.
- `README.md` links to `AGENTS.md` (the agents line) and `AGENTS.md` links back to `README.md`. Both link to `CONTRIBUTING.md`.
- Each fact has one home. Setup and lint commands live in `AGENTS.md`; `README.md` and `CONTRIBUTING.md` link to them and never copy them.
- The pull request template, `.github/pull_request_template.md`, is the checklist shared by people and agents (see `references/contributing-guide.md`).

## Not adopted
Each item below came from the owner notes or a source and is left out on purpose.
- Emoji and bold tier markers for Always, Ask first, Never (GitHub blog example): they conflict with the shared rule that headings carry structure. Plain words are used.
- `.github/copilot-instructions.md` for review bots (owner notes): it is Copilot-specific. A `## PR review guidelines` section in `AGENTS.md` serves every tool.
- The upper-case file name `PULL_REQUEST_TEMPLATE.md` (owner notes): GitHub accepts either case, so the project's existing name is kept.
- Screenshots and GIFs in every README (owner notes): required only when the project has visual output or a terminal flow worth showing; otherwise a code block is the demo.
- standard-readme section order for the agents line: the agents line is the one deliberate deviation, placed right after the title.

## References
- `references/readme-guide.md`
- `references/contributing-guide.md`
- `references/agents-guide.md`
- `references/README.template.md`
- `references/CONTRIBUTING.template.md`
- `references/AGENTS.template.md`
- `references/gate.template.mjs`
- `references/protected.template.json`
