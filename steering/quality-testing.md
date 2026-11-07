# Quality and testing

Intent: tests prove behavior; a failure is investigated to its root cause.
Applies: when writing tests, fixing a bug, or debugging.

- No test exists just to pass: every assertion can fail, no test checks a mock, and a failing test is never weakened or skipped to get green.
- An existing test is a contract. When it fails, the code is wrong unless the plan says the behavior it asserts has changed. Changing, deleting or skipping an existing test to get green is a failure.
- A plan names every existing test it changes and why, tied to the blueprint change. The `test-diff` script lists the changed tests, and whoever verifies the work reads its output.
