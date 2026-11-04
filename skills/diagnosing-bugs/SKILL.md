---
name: diagnosing-bugs
description: "reproduce the failure with a fast command, find the root cause, then fix it. Use when a test fails, a bug is reported, or behavior differs from what the spec describes."
---

# Diagnosing bugs

Intent: a bug is fixed at its cause, and a regression test keeps it fixed.

## When to use
- A test fails, a bug is reported, or observed behavior differs from the spec.
- Before changing code to make a failure go away.

## How to work
1. Build a fast feedback loop first: one command that reproduces the failure quickly, saved so it runs the same way each time.
2. Minimize the reproduction to the smallest input, path and state that still shows the failure.
3. Observe what actually happens. Read the real output, the real state and the real inputs; keep what the code does separate from what it is expected to do.
4. Name the failing assumption: the one place where the actual state and the expected state first diverge.
5. Form one hypothesis about the cause and test it. Instrument the suspected point so the next run either confirms or refutes the hypothesis.
6. Fix the cause the hypothesis names. The same inputs give the same failure, so a change that does not address the named assumption is a guess.
7. Write a regression test that fails before the fix and passes after it, driving the real path the bug lived on.
8. Re-run the reproduction command and the regression test to confirm the fix, then run the affected tests.

## References
- `references/feedback-loops.md`
