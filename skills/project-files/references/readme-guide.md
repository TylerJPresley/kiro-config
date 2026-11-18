# README.md guide

For people: onboarding, elevator pitch, quick usage. Friendly, plain tone. Detail is linked out. Shared Markdown rules: `SKILL.md`.

Sources: standard-readme https://raw.githubusercontent.com/richardlitt/standard-readme/master/spec.md (also https://github.com/RichardLitt/standard-readme/blob/main/spec.md); agents.md https://agents.md/ ("README.md files are for humans: quick starts, project descriptions, and contribution guidelines"); owner notes (owner-supplied search summaries; cited links inside are the summary's own). Fetched 2026-11-14.

## Order
Title, agents line, Badges (optional, minimal), Short Description, Table of Contents, Background, Install, Usage, Contributing, License. Other optional sections (Banner, Long Description, Security, Extra Sections, API, Maintainers, Thanks) keep their place in the spec's order.

## Rules
- The agents line sits right after the title: `**AI agents:** start with [AGENTS.md](AGENTS.md) for commands, project map and rules.` (owner notes: link README to AGENTS.md). It is the one deviation from the standard-readme order.
- Sections appear in the spec's order and use its titles (standard-readme).
- Short Description is a clear value proposition, under 120 characters, and does not start with `> ` (standard-readme; owner notes: value proposition in the first lines).
- Badges: few, directly under the title block; only ones a reader acts on, such as build status and license (owner notes: minimal badges at the top).
- Table of Contents is required, optional under 100 lines (standard-readme).
- Install is the exact commands and versions. Usage opens with a reproducible, copy-paste quickstart in a code block (standard-readme; owner notes).
- Add a screenshot or GIF when the project has visual output or a terminal flow worth showing (owner notes; see "Not adopted" in `SKILL.md`).
- Scope: say what the project is and why; link `docs/` for the API reference, and point to one `API.md` when a generator makes it (standard-readme; owner notes).
- Contributing links to `CONTRIBUTING.md` when there is one (standard-readme; owner notes).
- License is the last section and names the license (standard-readme; owner notes).
- No broken links (standard-readme). Check every relative link resolves.
- Build, test and lint commands for contributors live in `AGENTS.md`; the README holds install and usage only (setup's choice).
