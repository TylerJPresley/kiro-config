---
name: real-environment-verification
description: "verify what changed in a real environment (scratch setup, loopback fakes, pty driver, capped real-model turns) without touching the owner's own configuration. Use when a user-visible feature closes and at each release."
---

# Real-environment verification

Intent: the shipped artifact is proven to work the way a user runs it, because a test that calls internal APIs can pass while the product is broken.

## When to use
- A feature that changes what a user sees closes.
- A release is being prepared.

## How to work
1. Create a scratch environment in the project's scratch folder (see the `thinking-folder.md` steering), with its own HOME and config directory. Leave the owner's real configuration untouched. Copy only what is needed, such as the model entry, and no secrets.
2. Use the project's helpers first (its tools README): fake model server, capture server, hostile fixtures, pty driver. Add reusable ones there rather than rebuilding them.
3. Keep real services to a handful of real-model turns, and send everything else through a loopback fake, since real services cost time and money.
4. Drive an interactive program through a pseudo-terminal (python3 `pty`; name the script something other than `pty.py`), strip ANSI for assertions, and cap the runtime.
5. Listen on 127.0.0.1 with port 0 for receivers and servers; write captures into the scratch folder through a variable you confirm is set.
6. Record a scenario table (PASS, FAIL, BLOCKED) with up to ten lines of evidence each; for each FAIL give the exact steps, expected against actual, and the likely code location.
7. Clean up: wrap every command in `timeout`, end everything you start, run the project's scratch-clean helper, and finish with `git status --short`.
