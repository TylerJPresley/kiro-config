---
name: security-review
description: "The standing checklist for reviewing a change for security: find real, exploitable problems fast and report them ranked with a repro. Use when a change touches permissions, secrets, input handling, networking or data."
---

# Security review

Intent: a security review finds real, exploitable problems quickly and reports each one ranked with a concrete repro, so a risk is fixed before it ships.

## When to use
- A change touches permissions, secrets, input handling, networking or data.
- A reviewer is briefed to audit a change for security.

## How to work
1. Entry points: trace every path that runs a tool, command, write or fetch, and confirm each passes the single gate (background workers, resume, plugins, out-of-band approvals).
2. Authorization: look for a way an ask or a deny becomes an allow through rule ordering, wildcards against exact rules, batched or bulk approvals, or a grant that outlives its purpose.
3. Untrusted state: require an integrity check before trusting anything stored in a user-controlled or cloned location (caches, sessions, indexes, registries).
4. Untrusted text: strip control and bidi characters from file names, tool results, model output, descriptions and names before they reach a trusted channel or a terminal.
5. Secrets: mask them before logs, events and exports; keep configs holding environment-variable names only; check raw stores for permissions.
6. Network: check SSRF (private and metadata addresses), redirects, DNS rebinding, proxy variables, and keep project-controlled endpoints visible.
7. Files and processes: confirm path containment, symlink and TOCTOU handling, argument injection, and hooks or config that execute code in untrusted repositories.
8. Resource limits: require caps on size, depth, count and time, and fail closed on error.
9. Dependencies: confirm a permissive license, no known advisory and no install script; run the `project-audit` skill for the facts.
10. Report ranked findings (severity, file:line, input or steps, fix) and a VERDICT. A decision the owner already made is not a defect. Keep the review read-only, time-boxed to 20-30 minutes, with scratch work in the scratch folder only.
