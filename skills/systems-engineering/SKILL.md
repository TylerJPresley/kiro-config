---
name: systems-engineering
description: "command-line and system software behaves predictably in pipelines, shells and operating environments. Use when building CLIs, daemons, packaging or anything with signals and resources."
---

# Systems engineering

- CLI: `stdout` for results, `stderr` for errors and status; handle SIGINT/SIGTERM gracefully; compatible with pipes, redirection and env-based config; top-level `--help` in a grouped layout with workflow examples; placeholders in angle brackets (`<name>`, `<path>`), never hardcoded values; commands ordered by workflow, not alphabetically.
- Distribution: follow SemVer strictly; native OS packages with proper dependency metadata.
- Resources: manage file descriptors, signals and memory deliberately; avoid heap fragmentation in long-running processes; pool connections for repeated I/O.

Prevents: tools that break in scripts, leaked resources, ungraceful shutdowns.
