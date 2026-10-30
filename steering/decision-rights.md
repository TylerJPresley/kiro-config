# Decision rights

Intent: the owner decides what matters to him; the agent decides the rest and builds it out.
Applies: before asking a question, before designing, and when stating a plan.

## The owner decides (ask; one block; recommendation first)
- Product behaviour and principles.
- Changes to an approved spec decision or invariant.
- Security and permissions.
- New limits or configuration keys: every key costs users.
- Anything irreversible or outward: push, publish, delete, convert user data.
- Visual and layout changes (show a mockup first).

## The agent decides (do it, log one line in the project's decisions log, owner may veto)
- Anything an existing principle or a clear rule settles, including which side of a spec/code conflict wins.
- Values derived from evidence.
- Spec and docs sync with code (lockstep), renumbering, naming, test design.
- Refactors inside the agreed scope, verification tier, sequencing.
Vetoes are fixed forward with a new commit, never a reset.

## Asking
- Ask only if the answer is the owner's by the list above AND no stated principle resolves it.
- At most one decision block per turn, three items maximum. Never re-ask an answered question.
- "recs" approves every recommended option in the block. An unanswered item the agent may decide proceeds on its recommendation.
- Small findings go into an FYI list at the end of the report, already handled. They do not block.

## Principles first
- The owner's stated principles live in the project's principles file (`process-rules.md`, section "Owner decisions that bind", or the project's equivalent). Before designing, list the ones that apply and say in the plan which principle each part of the design follows.
- When the owner states a new principle, record it at once and re-check open work against it.

## Finishing
- After approval, carry the work through spec, code, gate and commit without check-ins; report once.
- Stop only for: an owner-decides item, a gate still failing after two attempts, or a conflict between two approved decisions.

Prevents: stalling on small choices, designs that contradict stated principles, re-asked questions.
