---
name: product-strategy
description: "ship small, learn from real use, keep the code and the message consistent. Use when scoping work, refactoring, wrapping integrations or writing user-facing communication."
---

# Product strategy

- Done is better than perfect: ship an MVP and iterate on real data. Leave code cleaner than you found it, in small verifiable increments that preserve behavior.
- Wrap third-party APIs in local adapters; use circuit breakers and retries on every third-party connection.
- Documentation as code: READMEs, decision rationale, API docs, setup and usage guides for every module. Follow Conventional Commits.
- Communicate in simple, direct language written for the specific reader (developer, operator or user). Keep one visual and verbal identity.

Prevents: big-bang releases, vendor lock-in through scattered calls, docs nobody can use.
