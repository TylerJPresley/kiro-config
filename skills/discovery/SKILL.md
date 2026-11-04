---
name: discovery
description: "Find the blanks in a blueprint and fill them with the owner's intent, asking in rounds until no open questions remain. Use before building anything non-trivial, when a plan or design needs its direction settled, and when requirements are still open."
---

# Discovery

Intent: a blueprint whose blanks are filled with the owner's intent, so building starts from a shared, complete understanding.

## When to use
- Before building anything non-trivial, to find the open questions a blueprint leaves.
- When a plan or design depends on direction the owner has not yet given.
- When a requirement is still loose and needs a testable meaning.

## How to work
1. Work the frontier: ask only the questions whose prerequisites are already settled. Settle the upstream choice first, and it reveals the real downstream questions.
2. Ask in rounds. Put every open question of a round in one block, each with a recommended answer, flat within the round. `references/round-template.md` holds the format.
3. Look up facts yourself; ask the owner for intent and direction. The owner supplies a detail only when he chooses to.
4. Treat a stated requirement as a claim to examine: push a loose term until it has a testable definition, and name the contradiction when two answers collide.
5. Answer a question that can only be settled by reacting to something with a throwaway the owner reacts to, then continue the next round from the reaction. `examples/round-example.md` shows a round and its follow-up.
6. Write each answer into the strata-bp documents as a draft, and the owner approves the wording.
7. End when no open questions remain and the owner confirms the shared understanding. Building starts after that.

## References
- `references/round-template.md`
- `examples/round-example.md`
