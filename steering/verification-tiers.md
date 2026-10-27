# Verification tiers (cost and time)

Intent: depth of verification matches risk, so effort is not wasted and risk is not missed.
Applies: when deciding how much to test, review or re-run.

## Size the change first
Before delegating, state the tier and the reason in one line; pick the LOWEST tier that fits. Impact, not line count, decides: what does it touch (behaviour, spec, public type, permissions, security, secrets, data), how many files and packages, who depends on it. Escalate when a trigger appears mid-work (a spec section, a public type, more files than predicted); never lower a tier on a guess.

- **Tier 0, cosmetic:** a colour, glyph, spacing, wording or constant; no behaviour, spec or security effect; 1-2 files. Brief of 3-5 lines. Edit and update the existing test only (no new mock scaffolding); run only the affected test file. One gate run for a batch of Tier 0 changes; commit the batch. No review.
- **Tier 1, small or local change:** implement, run targeted tests, then ONE full gate run. No separate review.
- **Tier 2, new subsystem, or anything touching permissions, security, secrets, data, the public API or several packages:** ONE independent review (correctness and security in parallel), time-boxed to 20-30 minutes.
- **Tier 3, milestone:** real-environment verification of what CHANGED only, with a cap on real-model turns.
- Visual or layout changes at any tier: show a mockup and get a yes before building.
- One fresh-clone run per pushed batch, not per change.
- Never repeat the whole suite 3-4 times "to be sure". Re-run only to investigate a failure.
- After a fix, re-verify only the fixed items, not the whole area.

Prevents: ceremony on trivial changes, hours-long verification loops, under-checked risky work.
