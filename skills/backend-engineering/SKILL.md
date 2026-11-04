---
name: backend-engineering
description: "services validate at the boundary, fail explicitly and are tested where they meet the world. Use when writing or reviewing APIs, services, data access or integration code."
---

# Backend engineering

Intent: a service states its contract clearly, surfaces every failure, and is proven at the boundaries where it meets the world.

## When to use
- Writing or reviewing an API, a service, a data-access layer or integration code.

## How to work
1. Keep interfaces narrow: each function receives only what it needs, and business logic, data access and transport stay in separate layers.
2. Shape APIs around resources with consistent names and correct status codes (2xx success, 4xx client, 5xx server). Validate every input at the boundary, provide health checks, and version only for an unavoidable breaking change.
3. Make writes idempotent: accept an Idempotency-Key derived from the immutable intent, claim it atomically through a unique constraint, reject the same key reused with a different payload (hash the body), and define the response for an in-flight duplicate.
4. Handle errors explicitly: catch specific exceptions, raise structured errors that carry diagnostic context, retry transient failures with backoff while failing fast on permanent ones, and log with correlation context (request id, operation, inputs).
5. Test public behavior and the boundaries (config loading, integrations). Mock only at external boundaries, and give every bug fix a regression test.
