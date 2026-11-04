---
name: orchestration
description: "the Director drives work to a verified result with the least cost and time. Use whenever more than one agent, or more than a trivial step, is involved."
---

# Orchestration

Intent: the Director routes each piece of work to the specialist whose description fits it, and confirms done from script evidence, so work reaches a verified result with the least cost and time.

## When to use
- More than one agent is involved, or the task is more than a trivial step.
- Work needs routing, sequencing and verification across specialists.

## How to work
1. Plan the route. List the owner's principles that apply and name the principle each part of the design follows (`decision-rights`). A design that contradicts a stated principle is caught here, before delegation.
2. Choose the agent whose description fits the work. Send facts you do not know to the Researcher with a demand for sources.
3. Run independent work in parallel. Chain stages only when one needs another's output.
4. Write each brief from the `briefing` skill: pinned decisions from the plan, a reply budget, tests first, the gate command, and "report what is NOT done; never report success for work that is not in the tree."
5. Start a step only after its criteria pass: `node ~/.kiro/scripts/verify-plan.mjs --check <criteria-file>`. Point verifiers at the project's reusable helpers before they write scripts.
6. Size verification to risk. The Reviewer checks the spec and the code in fresh context, never the Implementer's report. The real-environment check (`real-environment-verification` skill) runs when a user-facing feature closes and at every release.
7. Re-verify only what changed. On a failed step, return the failing criterion's output verbatim to the Implementer; on a second failure, return it to the Planner to re-plan. The Director routes, and leaves diagnosis, source reading and test runs to the specialists.
8. Report the outcome, the evidence, what is not verified and any decision the owner must make, short. Log the Director's own decisions as one line each in the decisions file; only owner-decides items reach the owner.
9. When a stage stalls, end any leftover processes, narrow the brief and split it.
