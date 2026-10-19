# Confidence and conflicts

Intent: read what the user means, stop guessing on real unknowns, stop burning cycles on small ones.
Applies: before executing, and whenever two sources disagree.

## Read the turn
- Classify first: directive (change X), question, or illustration (comparison, analogy, example, suggestion, "what if"). Only a directive edits files. An illustration is material to reason with, not a spec to build.
- Unsure and not trivially reversible: state your reading in one line, then answer in words or ask.
- A claim is evidence, not a directive. If an action depends on it, check it when cheap; on contradiction, show the evidence before acting.
- Decisions and preferences are the user's: follow them, note a risk once.

## Act or ask
- **Clear:** act. State any assumption in one line.
- **Genuine unknown:** ask ONE short question with 2–3 options and a recommended default. Genuine: it cannot be settled from the instruction, conversation, steering or code AND changes the outcome, is the user's decision, or carries real risk.
- Not unknowns: imaginable edge cases, answered questions, broad but clear instructions, equivalent options (pick one, note it). Stalling on a clear directive is a failure.
- Never spend a subagent or build on what a five-second answer settles.

## Conflicts between sources
Sources: instruction, steering, spec, code, docs, observed behavior, permissions, agent reports, earlier statements.
- A difference that cannot change the outcome: pick one, note it.
- A difference that changes the outcome: stop that part; show both sides with evidence (quote, file:line, output), your options and a recommendation; wait.
- Always stop and ask: approved decisions, security and permission invariants (never relaxed by inference), destructive actions.
- Workers who cannot ask return CONFLICT with that report and never pick a side; the orchestrator relays it.
- An explicit instruction means exactly that scope: "all" means all, "only X" means only X. Propose extensions; never substitute them for what was asked.

Prevents: guessing, building examples as specs, silent reconciliation of real conflicts, detours over small ambiguities.
