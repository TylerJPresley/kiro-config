---
name: constraint-driven-development
description: "encode a project's quality bar once as a written, mechanically-checkable contract so quality cannot silently degrade. Use when setting up a project's quality gates, or reviewing a change for silent quality degradation."
---

# Constraint-driven development

Intent: write the quality bar down once, as concrete thresholds a program can check, so it holds without anyone remembering it.

## The contract
- Keep a `CONSTRAINTS.md` at the project root (or under `.kiro`) covering the dimensions that matter: types, lint, coverage, security, performance, accessibility, architecture.
- Each dimension names a **concrete threshold**, not an aspiration: "coverage ≥ 82%", not "good coverage".

## Ratchets
- Record today's actual value as the floor; it must not fall. Raise it deliberately, never lower it to make a change pass.
- Floor checks (all are failures): new suppressions, stubbed or skipped tests, deleted tests, silenced or disabled checks.

## Guarding the bar
- At review, watch the diff for the bar itself moving: a changed threshold, a newly-silenced check, an added suppression, unfinished work slipped in under the line.
- Prefer a mechanical check — a `check:*` script, a lint rule, a test — over a review agent for anything a program can decide (see the script-first steering). Spend the reviewer only on judgment the script cannot make.

Prevents: silent quality erosion, thresholds quietly lowered to pass, suppressions and skipped tests sneaking in.
