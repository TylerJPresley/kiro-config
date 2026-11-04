---
name: security-trust
description: "Secure by default, least privilege, defense in depth. Use whenever code handles input, identity, secrets, personal data or a network boundary, and before offensive or dual-use work."
---

# Security and trust

Intent: a system protects data and access by default, so a trusted path only ever runs on validated input with the least privilege it needs.

## When to use
- Code handles external input, identity, secrets, personal data or a network boundary.
- A new dependency is about to be adopted.
- The work is offensive or dual-use (exploitation, scanning, credential testing).

## How to work
1. Collect the minimum data the feature needs; mask PII in logs and non-production environments; keep an immutable audit trail for sensitive access.
2. Grant the least privilege at every layer; treat the perimeter as one defense among several.
3. Validate all external input against a schema; enforce rate limiting, CORS and secure headers (HSTS, CSP).
4. Authenticate with JWT (RS256), OAuth2 or OIDC, and require MFA where it fits; keep AES-256 for PII at rest and TLS 1.3 in transit.
5. Before adopting a new dependency, run the `project-audit` skill to check its license, known advisories, install scripts and pinning.
6. Offensive or dual-use work starts once the owner confirms the target is his own or inside an authorized scope. Defensive, educational and CTF work proceeds.
