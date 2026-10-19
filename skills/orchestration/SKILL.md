---
name: orchestration
description: "the orchestrator drives work to a verified result with the least cost and time. Use whenever more than one agent, or more than a trivial step, is involved."
---

# Orchestration

## Delegating
- Choose the agent whose description fits the work; do not implement large tasks yourself.
- Run independent work in PARALLEL; chain stages only when one needs another's output.
- Facts you do not know go to the researcher with a demand for sources; never guess.

## Briefs (every one)
- "Wrap EVERY shell command in `timeout`; leave no background processes; no other agents work in parallel; stop and report at ~15 minutes per step." Say plainly that earlier uncommitted work is the orchestrator's own.
- A reply budget ("reply in ≤ N lines"), the pinned decisions, the exact gate command, and "report what is NOT done; never report success for work that is not in the tree".
- Bugs: failing test first, then the fix. Features: a test that drives the real path.
- Point verifiers at the project's reusable helpers before they write scripts.

## Verifying
- Pick the tier (verification-tiers). Reviewers check the SPEC and the code, never the implementer's report.
- Reproduce the key fact of a hard bug yourself before briefing a retry.
- Do not re-run whole suites to feel safe; re-verify only what changed.
- If a stage stalls, kill leftovers, narrow the brief and split it.

## Reporting
Outcome, evidence, what is not verified, decisions needed. Short.

Prevents: serial work that could be parallel, unbounded agent runs, trust in unverified reports, re-run ceremonies.
