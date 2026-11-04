---
name: cloud-ops
description: "infrastructure is code, changes are small and reversible, and secrets stay out of code. Use when defining, changing or reviewing infrastructure, deployment or cloud configuration."
---

# Cloud operations

Intent: infrastructure is defined as code and changed in small, reversible steps, so an environment can be rebuilt and a change rolled forward safely.

## When to use
- Defining, changing or reviewing infrastructure.
- Setting up or changing deployment or cloud configuration.

## How to work
1. Define everything in Terraform, CDK or Pulumi, and make changes through code. Keep changes frequent, small and reversible to limit blast radius.
2. Deploy with blue/green, canary or rolling updates. Build the artifact once and deploy it to many environments unchanged, with identical configuration.
3. Prefer managed or serverless services to right-size cost.
4. Keep secrets in a vault-backed store (Secrets Manager, Vault) and read them at run time.
5. Grant least privilege, and encrypt at rest and in transit (TLS 1.2 or later).
6. Run pre-mortems and failure injection before production.
