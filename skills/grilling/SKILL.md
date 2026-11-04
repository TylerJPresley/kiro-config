---
name: grilling
description: "stress-test a plan or design by working its open branches round by round until none remain. Use before building anything non-trivial, when a plan or design needs validation, or when requirements feel fuzzy."
---

# Grilling (stress-test the plan before building)

Intent: surface the hidden assumptions and contradictions in a plan or design by interrogating it until the frontier is empty.

## When to use
- Before building anything non-trivial.
- When a plan or design needs validation, or the requirements feel fuzzy.

## How to work
1. Work the frontier: ask only the questions whose prerequisites are already settled, because an unanswered upstream choice hides the real downstream questions.
2. Go round by round: each round resolves the open branches, and the answers reveal the next layer of branches. Repeat.
3. Finish only when the frontier is empty (no open branches) and the shared understanding is explicit; running out of easy questions is not the end.
4. Spawn sub-agents for facts (code, docs, behavior); look up any answer that can be looked up.
5. Surface every choice to the owner and present options with a recommended default (see concise steering); the owner makes the decision.
6. Treat a stated requirement as a claim to test: push a fuzzy term until it has a testable definition, and name the contradiction when two answers collide.
7. Hand the output to the Plan step and the systems-thinking map: settled decisions become pinned assumptions, open risks become things to verify. Grilling finds the assumptions and contradictions; the map traces what the change connects to.
