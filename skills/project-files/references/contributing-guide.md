# CONTRIBUTING.md guide

For people: etiquette, governance, pull request workflow. Welcoming and explanatory, with short imperative rules. Shared Markdown rules: `SKILL.md`.

Sources: GitHub docs https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors; owner notes (owner-supplied search summaries; cited links inside are the summary's own); agents.md https://agents.md/ (PR instructions are a recommended AGENTS.md section).

## Location
- Root, `docs/` or `.github/`, so GitHub links it from new issues and pull requests (GitHub docs; owner notes).

## Contents
- Contribution lifecycle: issue first for a major feature or a change to the rules, direct pull request for a typo or small fix; how issues are triaged (owner notes).
- Git and pull request conventions: branch naming, Conventional Commits types, the project's git facts (branch model, release and integration branches, engineer-branch pattern), and the PR checklist. The `project-files` skill asks for missing git facts and writes them here (owner notes).
- Review expectations, such as how long a first review takes, when the project has a stated timeline (owner notes; optional).
- Governance and legal links: `CODE_OF_CONDUCT.md`, `SECURITY.md`, and a CLA or DCO line when the project uses one; omit the line when it uses neither (owner notes).
- AI disclosure policy: state whether AI-assisted pull requests are accepted; this setup's default is yes, with disclosure in the pull request and a human who verifies the generated work (owner notes).
- Rules that bind people and agents alike (git, changelog, dependencies, style) are stated here once.
- Link to `AGENTS.md` for exact setup, test and lint commands; never copy them (owner notes: single source of truth by cross-linking).

## Pull request template
`.github/pull_request_template.md` is the checklist shared by people and agents (owner notes; GitHub docs https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository). It holds, as headings or task items:
- what changed
- the guide, spec or blueprint section it touches
- how to verify
- the project's checks passed (the gate or test command from `AGENTS.md`)
- tests added or updated
- AI assistance disclosed, and a human verified it
- links in issue and pull request templates are absolute URLs, because a PR body does not resolve paths relative to `.github/`
- a link to `CONTRIBUTING.md`

## Related
- Review-bot instructions live in `AGENTS.md` under `## PR review guidelines`, not here (see `references/agents-guide.md`).
