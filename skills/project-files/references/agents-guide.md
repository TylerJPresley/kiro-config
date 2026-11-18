# AGENTS.md guide

For agents: autonomous execution, local verification, guardrails. Imperative, deterministic, token-efficient, no fluff. Shared Markdown rules: `SKILL.md`.

Sources: agents.md https://agents.md/ and https://github.com/agentsmd/agents.md (a README for agents; plain Markdown, any headings); GitHub blog https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/ (2,500+ repositories); owner notes (owner-supplied search summaries; cited links inside are the summary's own).

## Order
1. One line on what the project is, then a link back to the README: `Overview for people: [README.md](README.md).` (owner notes: link README to AGENTS.md and back).
2. Commands first, with flags: build, full tests, single test, lint (GitHub blog: "put relevant executable commands in an early section", "include flags and options"; owner notes).
3. Pre-flight: imperatives such as "Run the tests and lint before every commit" (owner notes).
4. Stack with versions and key paths: "React 18 with TypeScript, Vite, and Tailwind CSS", not "React project" (GitHub blog; owner notes).
5. Map: top-level folders and what each holds (agents.md; GitHub blog).
6. Conventions: naming and style with one short code example; one snippet beats three paragraphs (GitHub blog).
7. Boundaries in three tiers, written as three headings or labeled lines: Always, Ask first, Never. "Never commit secrets" is the most common helpful constraint (GitHub blog; owner notes).
8. `## PR review guidelines`: what a review bot flags and ignores (owner notes; agents.md lists PR instructions as a recommended section).
9. Link to `CONTRIBUTING.md` for git workflow and rules that bind people too.

The GitHub blog's top tier covers commands, testing, project structure, code style, git workflow and boundaries; each has a place above (git workflow by link).

## PR review guidelines
Keep the section short and checkable.
- Flag: a failing or missing check, a changed or deleted test assertion, a new dependency, a secret, a change outside the stated scope, a guide or spec that disagrees with the code, missing AI disclosure in the pull request.
- Ignore: formatting the linter handles, wording preferences, generated files, and anything the Never tier already blocks at commit time.
- Fill the lists from the project's own checks; every flag names a thing a reviewer can see in the diff.

## Rules
- Nested `AGENTS.md` files are allowed; the nearest file wins (agents.md).
- Commands live here once; `README.md` and `CONTRIBUTING.md` link to them (owner notes; the sources are silent on repeating).
- Mistake-driven rules: when an agent repeats a mistake, add one Never or Ask first line that names the exact action, with the owner's direction (owner notes; not stated in the agents.md or GitHub blog sources). Remove a line the agents stopped needing.
- Keep the `Licenses allowed:` line the `audit` script reads, and the protected paths (setup's choice).
- Agents leave the file unchanged unless directed (setup's choice).
