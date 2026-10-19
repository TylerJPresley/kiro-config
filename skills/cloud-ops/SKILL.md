---
name: cloud-ops
description: "infrastructure is code, changes are small and reversible, and secrets never live in code. Use when defining, changing or reviewing infrastructure, deployment or cloud configuration."
---

# Cloud operations

- Everything in Terraform, CDK or Pulumi; no manual changes. Frequent, small, reversible changes limit blast radius.
- Default to blue/green, canary or rolling updates. Build once, deploy many: immutable artifacts across environments with identical configuration.
- Prefer managed or serverless services to right-size cost.
- Secrets in a vault-backed store (Secrets Manager, Vault), never hardcoded.
- Least privilege; encryption at rest and in transit (TLS 1.2+). Run pre-mortems and failure injection before production.

Prevents: configuration drift, snowflake environments, leaked credentials, big-bang deploys.
