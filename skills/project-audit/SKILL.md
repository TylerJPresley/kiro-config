---
name: project-audit
description: "A cheap check of a new dependency (license, advisories, install scripts, pinning) and a release-prep audit of dependencies and common code risks, where a script gathers facts and the model judges only flagged items. Use at release prep and before adopting a dependency."
---

# Project audit

Intent: a near-zero-model-cost audit where a deterministic script gathers the facts and the reviewer spends tokens only on the items the script flagged, so a risky dependency or code pattern is caught before a project is called done.

## When to use
- Release preparation, run once before a project is called done.
- On demand before adopting a new dependency.
- Keep it out of the per-change gate: the advisory check reaches the network and is flaky.

## How to work
1. Run `timeout 300 node ~/.kiro/scripts/audit.mjs` first. The script gathers the facts; it reads files, runs the ecosystem's advisory tool once, and writes only under `_internal/scratch/audit/`.
2. The script detects the ecosystem, runs the six checks (licenses, advisories, install-scripts, unpinned, secrets, code-patterns), and prints a header, one line per check, a ranked `top:` list, a `decisions` count, a `licenses-dev info` line and one `NEEDS-DECISION` line per open decision. The detection table, the license scope and classes, and the output contract live in `references/ecosystems.md`.
3. A check with its tool or data missing prints `NOT RUN` with an install hint, and the exit code is `0` all ok, `1` any finding or an open decision, `2` nothing found but something `NOT RUN`, `3` script error.
4. The reviewer judges only the flagged items, opening each `file:line` hit to confirm, and reports PASS, FAIL or ESCALATE ranked by severity. A high or critical finding may draw ESCALATE.
5. The reviewer keeps PASS off the table while any `NEEDS-DECISION` is open: it lists each one with options and a recommendation for the owner. A recorded policy line in the project's `AGENTS.md` is a decision, so a finding it covers is settled, and the review never relabels a finding the owner already decided.

## References
- `references/ecosystems.md`
