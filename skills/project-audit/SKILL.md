---
name: project-audit
description: "cheap release-prep audit of library choices (license, advisories, install scripts, pinning) and common code security issues — a script gathers facts, the model judges only flagged items. Use at release prep, and on demand before adopting a dependency. NOT per change, NOT in the gate."
---

# Project audit

Intent: a near-zero-model-cost release-prep audit. A deterministic script gathers the facts; the reviewer model spends tokens only judging the items the script flagged.
Applies: release preparation, and on demand before adopting a new dependency. NOT on every change, and NOT in the gate (the advisory check hits the network and is flaky).

## The script (`<project>/.kiro/scripts/audit.sh`)
An implementer generates it for the project type; it is untracked (added to `.git/info/exclude`) and regenerated when missing or when a new manifest type appears. Read-only except `_internal/scratch/audit/`.

Detection table (manifest -> tools):
- `package.json` -> npm: `npm audit` + lockfile/`node_modules` licenses.
- `pyproject.toml` / `requirements.txt` -> `pip-audit` + `pip-licenses`.
- `Cargo.toml` -> `cargo audit` + `cargo-deny`.
- `go.mod` -> `govulncheck` + `go-licenses`.
- `pom.xml` / `build.gradle` -> OWASP dependency-check.
A missing tool is reported `NOT RUN` with an install hint — never `ok`.

Rules:
- The licence allow-list comes from the project's `AGENTS.md`.
- Secrets are reported by `file:line` and pattern NAME only — never the matched value.
- Code-pattern hits are heuristics (false positives expected), for human judgement.

### License scope and classes
Only the reject rule's scope from `AGENTS.md` is classified. Two scopes:
- **SHIPPED** — `dependencies`, `peerDependencies`, and anything bundled into a published artifact (a dev dep bundled into a shipped artifact counts as shipped). Classified against the policy.
- **DEV-ONLY** — devDependencies and their transitives, never distributed. Info only: written to `licenses-dev.txt` and summarised in one `licenses-dev info <n> <top-3>` line; no effect on the exit code.

Each SHIPPED package falls in one of three classes:
- **allowed** — on the allow-list (SPDX `OR` picks the best branch, `AND` the worst leaf; allow-list includes `MIT-0`).
- **rejected** — a copyleft/weak-copyleft id (`GPL-* AGPL-* LGPL-* MPL-* EPL-* CDDL-* EUPL-* OSL-* CPAL-* SSPL-* BUSL-* CC-BY-SA-* CC-BY-NC-*`). A **finding**: critical if prod runtime, high otherwise.
- **unclassified** — missing, `UNLICENSED`, `SEE LICENSE`, custom, or any id on neither list. Reported `NEEDS-DECISION` with the license id, package count and scope; counts as a finding for the exit code.

A **bundler** in a workspace build script (`esbuild|vite build|webpack|rollup|tsup|parcel`) makes the dev/shipped label unreliable; it is flagged `NEEDS-DECISION bundler-detected <pkg>`.

An owner's decision on a `NEEDS-DECISION` becomes a recorded policy line in the project's `AGENTS.md` — asked **once**, not per audit. Once recorded it is a decision, not a defect.

## Output contract (statuses, <=30 lines, detail in `_internal/scratch/audit/`)
```
audit <project> <date> ecosystem=<eco>
<check> <status> <count> <detail-file>     # one line per check
top:
<severity> <check> <target> <note>          # <=10 lines, ranked critical>high>known>medium>low
```
- Checks: `licenses advisories install-scripts unpinned secrets code-patterns`.
- Status is `ok` | `findings` | `NOT RUN`. Full per-finding detail lives in `_internal/scratch/audit/<check>.txt`.
- After the checks: a `decisions <N>` line (open `NEEDS-DECISION` count), a `licenses-dev info …` line, and one `NEEDS-DECISION bundler-detected <pkg>` line per bundler hit.
- Exit codes: `0` all ok | `1` any findings (a `NEEDS-DECISION` counts) | `2` no findings but something NOT RUN | `3` script error.

## The reviewer
Runs `timeout 300 .kiro/scripts/audit.sh` first. Judges ONLY the flagged items, opening each `file:line` hit to confirm — never re-scanning the whole tree. Returns PASS or FAIL ranked by severity, and may answer ESCALATE for a high/critical finding. If the script is missing, returns NEEDS-SCRIPT naming the project type (the orchestrator builds it per this skill).
- It may **not** return PASS while any `NEEDS-DECISION` is open: it lists each one with options and a recommendation in CONFLICT format for the orchestrator to relay to the owner.
- A policy line in `AGENTS.md` is a decision, not a defect. Never label a finding `known` unless `AGENTS.md` or the README says so.

Prevents: expensive model-driven scans, network flakiness in the gate, secrets echoed into logs.
