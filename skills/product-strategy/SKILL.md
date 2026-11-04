---
name: product-strategy
description: "ship small, learn from real use, keep the code and the message consistent. Use when scoping work, refactoring, wrapping integrations or writing user-facing communication."
---

# Product strategy

Intent: ship a small increment, learn from real use, and keep the code and the message saying the same thing.

## When to use
- Scoping work, refactoring, wrapping a third-party integration.
- Writing communication a user, operator or developer reads.

## How to work
1. Ship an MVP and iterate on real data; leave the code cleaner than you found it in small, verifiable increments that preserve behavior.
2. Wrap a third-party API in a local adapter, and put a circuit breaker and retries on every third-party connection.
3. Keep documentation as code: a README, decision rationale, API docs, and setup and usage guides for every module. Follow Conventional Commits.
4. Write for the specific reader (developer, operator or user) in simple, direct language, and keep one visual and verbal identity.
