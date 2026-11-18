# <name>

<one line: what it is>

Overview for people: [README.md](README.md).

## Commands

- Build: `<command with flags>`
- Test (all): `<command with flags>`
- Test (single): `<command with flags>`
- Lint: `<command with flags>`
- Gate: `node gate.mjs` (only when the project has `gate.mjs`)

Pre-flight: run <the test and lint commands above> before every commit.

## Stack

<language, runtime and framework with versions, and key dependencies>

## Map

<top-level folders and what each holds; where the blueprints live and who changes them>

## Conventions

<naming, structure, one short code example>

## Boundaries

- Always: <e.g. run the gate before finishing>
- Ask first: <e.g. adding a dependency, changing a public interface>
- Never: <e.g. commit secrets, edit protected paths: list them>

## PR review guidelines

- Flag: <failing or missing checks, changed test assertions, new dependencies, secrets, out-of-scope changes, docs that disagree with code, missing AI disclosure>
- Ignore: <formatting the linter handles, wording preferences, generated files>

Licenses allowed: MIT, Apache-2.0, BSD-3-Clause, ISC

Git, changelog, dependencies and review rules: [CONTRIBUTING.md](CONTRIBUTING.md).
