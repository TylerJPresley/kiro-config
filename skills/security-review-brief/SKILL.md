---
name: security-review-brief
description: Standing checklist for security-reviewing a change (read-only, time-boxed). Use when briefing the security-reviewer or when a change touches permissions, secrets, input handling, networking or data.
---

# Security review checklist

Intent: find real, exploitable problems quickly; report them ranked with a concrete repro.

- **Entry points:** every path that runs a tool, command, write or fetch — does each pass the single gate? (background workers, resume, plugins, out-of-band approvals.)
- **Authorization:** can an ask or deny become an allow? Rule ordering, wildcards vs exact rules, batched or bulk approvals, grants that outlive their purpose.
- **Untrusted state:** anything stored in a user-controlled or cloned location (caches, sessions, indexes, registries) must carry an integrity check before it is trusted.
- **Untrusted text:** file names, tool results, model output, descriptions and names reaching a trusted channel or a terminal — strip control and bidi characters.
- **Secrets:** masked before logs, events, exports; configs hold names of environment variables, never values; check raw stores for permissions.
- **Network:** SSRF (private and metadata addresses), redirects, DNS rebinding, proxy variables, endpoints controlled by project config (must be visible).
- **Files and processes:** path containment, symlinks, TOCTOU, argument injection, hooks and config that execute code in untrusted repositories.
- **Resource limits:** caps on size, depth, count and time; fail closed on errors.
- **Dependencies:** license (permissive only), known advisories, install scripts.

Report: ranked findings (severity, file:line, input/steps, fix) and a VERDICT. Decisions the owner already made are not defects. Time-box 20–30 minutes; read-only; scratch work only in the scratch folder.
