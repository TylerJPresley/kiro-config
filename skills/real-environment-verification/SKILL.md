---
name: real-environment-verification
description: How to verify a built product in a real environment (scratch environment, loopback fakes, pty driver, capped real-model turns) without touching the user's own configuration. Use for milestone verification of what changed.
---

# Real-environment verification

Intent: prove the shipped artifact works the way a user would run it, because tests that call internal APIs can pass while the product is broken.

1. **Scratch environment** — create it in the project's scratch folder (thinking-folder), with its own HOME and config directory. Never touch the user's real configuration. Copy only what is needed (for example the model entry, no secrets).
2. **Use the project's helpers first** (project-contract / its tools README): fake model server, capture server, hostile fixtures, pty driver. Add reusable ones there; do not rebuild them.
3. **Real services cost time and money** — use a handful of real-model turns at most; send everything else through a loopback fake.
4. **Interactive programs** — drive them through a pseudo-terminal (python3 `pty`; never name your script `pty.py`), strip ANSI for assertions, cap the runtime.
5. **Receivers and servers** — listen on 127.0.0.1 with port 0; write captures into the scratch folder via a variable that you check is set.
6. **Scenario table** — PASS / FAIL / BLOCKED with ≤ 10 lines of evidence each; for each FAIL: exact steps, expected vs actual, likely code location.
7. **Clean up** — wrap every command in `timeout`, kill everything you start, run the project's scratch-clean helper, and finish with `git status --short`.
