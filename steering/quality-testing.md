# Quality and testing

Intent: tests prove behavior; failures are investigated, not patched around.
Applies: when writing tests, fixing bugs, or debugging.

## Test first
- Write a failing test before implementing functional logic. Every bug fix gets a regression test.
- Broad base of unit tests, fewer integration tests, minimal end-to-end.

## Debug systematically
Build a tight feedback loop first: one command that reproduces the failure fast, before forming any hypothesis.
No fix without root-cause investigation: reproduce and observe; identify the failing assumption; hypothesize; implement and verify. Same arguments give the same failure, so diagnose before retrying.

## Structure and mocks
- Use Given/When/Then to mirror acceptance criteria.
- Mock only at external boundaries. Use deterministic fixtures and in-memory fakes over complex mock setups.
- A test must drive the real path it claims to cover.

Prevents: untested fixes, guess-and-patch debugging, tests that pass without proving anything.
