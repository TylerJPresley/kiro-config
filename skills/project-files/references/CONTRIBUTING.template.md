# Contributing to <name>

Thank you for helping. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities as in [SECURITY.md](SECURITY.md).

## Proposing a change

- Large change: open an issue first and agree on the approach.
- Small change (a typo, a wording fix): open a pull request directly.
- Maintainers triage new issues <within N days, or delete this line>; a first review takes <N days, or delete this line>.
- The pull request template, [.github/pull_request_template.md](.github/pull_request_template.md), is the checklist for people and agents; complete it.

## Git

Branch model: <gitflow, or trunk only>
Release branch: <main>
Integration branch: <develop, or none>
Engineer branch: <dev/<engineer>, or none when trunk only>

- Commits: conventional types (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`). One coherent change per commit. Each commit builds and passes the checks that cover it; a bug fix carries its regression test. A pushed commit is corrected with a new commit.
- Workflow: <gitflow: main holds releases, develop integration, each engineer a branch cut from develop, each plan a feature branch squash-merged back; or this project's variant>. Only the maintainer commits to main or develop or creates a tag.

## Standards

- Testing: <what must be tested, coverage target if any>. Exact setup, test and lint commands: [AGENTS.md](AGENTS.md).
- Dependencies: <license policy, how to add one>
- Style: <language, formatter, lint>
- Changelog: <when and how an entry is added>

## AI-assisted contributions

<AI-assisted pull requests are accepted.> Disclose AI assistance in the pull request. A human verifies generated work before it is submitted. Agents follow [AGENTS.md](AGENTS.md).

## Licensing

<inbound and outbound terms>
<CLA or DCO: the signing step and a link, or delete this line when the project uses neither>
