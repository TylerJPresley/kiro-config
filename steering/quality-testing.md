# Quality and testing

Intent: tests prove behavior; a failure is investigated to its root cause.
Applies: when writing tests, fixing a bug, or debugging.

- Tests come first: a failing test, derived from the plan's criteria, exists before the code.
- A test must mean something. It proves a behavior, and it can fail. Seeing it fail first is the proof; a test that passes before the change proves nothing.
- No test exists just to pass: every assertion can fail, no test checks a mock, and a failing test is never weakened or skipped to get green.
- An existing test is a contract. When it fails, the code is wrong unless the plan says the behavior it asserts has changed. Changing, deleting or skipping an existing test to get green is a failure.
- A plan names every existing test it changes and why, tied to the blueprint change. The `test-diff` script lists the changed tests, and the Reviewer reads its output.
- A bug fix carries a regression test, written first.
- A test drives the real path it claims to cover. It mocks only at external boundaries and prefers fixtures and in-memory fakes.
- Many unit tests, fewer integration tests, minimal end-to-end tests.
- A failing test is investigated. The root cause is found before any fix; the `diagnosing-bugs` skill holds the method.
- Small work updates the existing test when the behavior it asserts changed, using the existing scaffolding.
