---
name: constraint-driven-development
description: "encode a project's quality bar once as a written, mechanically-checkable contract so quality holds without anyone remembering it. Use when setting up a project's quality gates, or reviewing a change for silent quality change."
---

# Constraint-driven development

Intent: the quality bar is written down once, as concrete thresholds a program checks, so it holds on every change.

## When to use
- Setting up a project's quality gates.
- Reviewing a change to confirm the quality bar held.

## How to work
1. Keep a `CONSTRAINTS.md` at the project root (or under `.kiro`) covering the dimensions that matter: types, lint, coverage, security, performance, accessibility, architecture.
2. Give each dimension a concrete threshold a program can check, such as "coverage at least 82%", rather than an aspiration.
3. Record today's actual value as the floor and keep it as the floor; raise it deliberately. Each of these is a failure: a new suppression, a stubbed or skipped test, a deleted test, a silenced or disabled check.
4. At review, watch the diff for the bar itself moving: a changed threshold, a newly silenced check, an added suppression, unfinished work slipped in under the line.
5. Prefer a mechanical check (a `check:*` script, a lint rule, a test) over a review agent for anything a program decides (see the `script-first.md` steering). Spend the reviewer on the judgment a script cannot make.
