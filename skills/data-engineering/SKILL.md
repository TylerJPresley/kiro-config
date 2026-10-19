---
name: data-engineering
description: "data has one authoritative form, a model before a store, and safe access. Use when designing schemas, storage, migrations or data access."
---

# Data engineering

- Model entities and relationships before choosing storage; every piece of data has one authoritative representation; ACID for core transactional state.
- Schemas designed for extension, changed through automated migrations; data access behind repositories with connection pooling.
- Storage fits the job: PostgreSQL for transactions, Redis for caching, NoSQL for document scale.
- Validate at the model, service and database levels.
- No raw SQL: use an ORM or query builder. Prefer soft deletes (`is_deleted`) for core entities. Track `created_at`, `updated_at`, `created_by`.

Prevents: duplicated sources of truth, unsafe queries, irreversible deletes, untracked schema changes.
