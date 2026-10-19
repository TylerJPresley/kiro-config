# Plan → Execute → Verify → Iterate/Stop

Intent: keep every task on one loop, so work is planned, checked against the plan, and stopped on evidence rather than feeling.
Applies: every task. Size the loop to the task; a trivial request gets a one-line plan. Shrink it, never skip it.

1. **Plan** — State what is asked and what "done" looks like (acceptance criteria). Read the relevant code and docs first; never assume a feature is absent, verify. Trace what the change touches (Tier 2+: load the `systems-thinking` skill). Reuse what exists instead of creating a parallel path.
2. **Execute** — Do the work fully, as planned.
3. **Verify** — Check the result against the plan item by item, with fresh evidence (see definition-of-done). Where subagents exist, the agent that did the work never verifies it.
4. **Iterate/Stop** — If verification fails, fix the weakest point and re-verify only that. If the same approach fails twice, diagnose the root cause and change approach, and say so. Never loop silently.

Prevents: unplanned work, "should work" claims, silent retry loops.
