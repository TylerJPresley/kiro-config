---
name: grilling
description: "adversarially stress-test a plan or design before building, by working a decision-tree frontier round by round until no open branches remain. Use before building anything non-trivial, when a plan or design needs validation, or when requirements feel fuzzy."
---

# Grilling (stress-test the plan before building)

Intent: find hidden assumptions and contradictions in a plan or design by interrogating it, not by trusting it.

## The frontier
- Work the **frontier**, not everything at once: ask only questions whose prerequisites are already settled. An unanswered upstream choice hides the real downstream questions.
- **Round-based:** each round resolves the open branches, then the answers reveal the next layer of branches. Repeat.
- Done only when the frontier is empty (no open branches) and shared understanding is explicit — not when you run out of easy questions.

## Rules of engagement
- Spawn sub-agents for facts (code, docs, behavior); never guess an answer you can look up.
- Surface every choice to the user; make no decision for them. Present options with a recommended default (see concise steering).
- Treat a stated requirement as a claim to challenge: push a fuzzy term until it has a testable definition; name the contradiction when two answers collide.

## Hand-off
- Output feeds the Plan step and the `systems-thinking` map: settled decisions become pinned assumptions, open risks become things to verify.
- Distinct from `systems-thinking`: that **maps** what a change connects to; grilling **finds** the assumptions and contradictions the map would otherwise inherit.

Prevents: building on unexamined assumptions, plans that collapse mid-build, decisions made for the user by omission.
