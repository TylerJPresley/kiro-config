---
name: security-trust
description: "secure by default, least privilege, defense in depth. Use whenever code handles input, identity, secrets, personal data or network boundaries."
---

# Security and trust

- Privacy by design: collect the minimum data the feature needs; mask PII in logs and non-production environments; keep immutable audit trails for sensitive access.
- Least privilege everywhere; never rely on the perimeter alone.
- Validate all external input against schemas. Enforce rate limiting, CORS and secure headers (HSTS, CSP).
- Authenticate with JWT (RS256), OAuth2 or OIDC; enforce MFA where appropriate. AES-256 for PII at rest, TLS 1.3 in transit.

Prevents: leaked data, excessive access, unvalidated input reaching trusted code.
