# Verification tiers (cost and time)

Intent: depth of verification matches risk, so effort is not wasted and risk is not missed.
Applies: when deciding how much to test, review or re-run.

- **Tier 1, small or local change:** implement, run targeted tests, then ONE full gate run. No separate review.
- **Tier 2, new subsystem, or anything touching permissions, security, secrets or data handling:** ONE independent review (correctness and security in parallel), time-boxed to 20–30 minutes.
- **Tier 3, milestone:** real-environment verification of what CHANGED only, with a cap on real-model turns.
- One fresh-clone run per pushed batch, not per change.
- Never repeat the whole suite 3–4 times "to be sure". Re-run only to investigate a failure.
- After a fix, re-verify only the fixed items, not the whole area.

Prevents: ceremony on trivial changes, hours-long verification loops, under-checked risky work.
