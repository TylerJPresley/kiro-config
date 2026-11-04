---
name: systems-engineering
description: "command-line and system software behaves predictably in pipelines, shells and operating environments. Use when building CLIs, daemons, packaging or anything with signals and resources."
---

# Systems engineering

Intent: command-line and system software behaves the same in a pipeline, a shell and an operating environment as it does run by hand.

## When to use
- Building a CLI, a daemon, a package, or anything that handles signals and resources.

## How to work
1. Design the CLI for composition: send results to `stdout` and errors and status to `stderr`, handle SIGINT and SIGTERM gracefully, and work with pipes, redirection and environment-based config.
2. Make help discoverable: a top-level `--help` in a grouped layout with workflow examples, placeholders in angle brackets (`<name>`, `<path>`) rather than hardcoded values, and commands ordered by workflow rather than alphabetically.
3. Distribute predictably: follow SemVer strictly and ship native OS packages with correct dependency metadata.
4. Manage resources deliberately: control file descriptors, signals and memory, keep a long-running process free of heap fragmentation, and pool connections for repeated I/O.
