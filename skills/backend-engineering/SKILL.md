---
name: backend-engineering
description: "services fail explicitly, validate at the boundary, and are tested where they meet the world. Use when writing or reviewing APIs, services, data access or integration code."
---

# Backend engineering

- Narrow interfaces (functions receive only what they need); separate business logic, data access and transport.
- APIs: resource-based endpoints, consistent names, correct status codes (2xx success, 4xx client, 5xx server), validate all input at the boundary, version only for unavoidable breaking changes, provide health checks.
- Idempotency: for write endpoints, accept an Idempotency-Key derived from immutable intent (not per-attempt); claim it atomically via a unique constraint; reject the same key reused with a different payload (hash the body); define the in-flight-duplicate response.
- Errors: catch specific exceptions, never bare catch-all; structured errors with diagnostic context; retry transient failures with backoff and fail fast on permanent ones; log with correlation context (request id, operation, inputs).
- Tests: public behavior and boundaries (config loading, integrations); mock at external boundaries only; every bug fix carries a regression test.

Prevents: silent failures, leaky layers, tests coupled to internals.
