---
name: data-engineering
description: "data has one authoritative form, a model before a store, and safe access. Use when designing schemas, storage, migrations or data access."
---

# Data engineering

Intent: every piece of data has one authoritative form, modeled before it is stored and reached through a safe path.

## When to use
- Designing a schema, choosing storage, writing a migration, or building data access.

## How to work
1. Model entities and relationships before choosing storage, give every piece of data one authoritative representation, and keep core transactional state under ACID guarantees.
2. Design schemas for extension and change them through automated migrations, placing data access behind repositories with connection pooling.
3. Fit storage to the job: PostgreSQL for transactions, Redis for caching, a NoSQL store for document scale.
4. Validate at the model, the service and the database levels.
5. Reach data through an ORM or query builder rather than raw SQL, prefer a soft delete (`is_deleted`) for core entities, and track `created_at`, `updated_at` and `created_by`.
