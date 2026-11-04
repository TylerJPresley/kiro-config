---
name: analysis-requirements
description: "requirements come from evidence and trace to behavior. Use when gathering, writing or reviewing requirements, or reconstructing what existing code already does."
---

# Analysis and requirements

Intent: every requirement rests on evidence and traces to a behavior a test can check.

## When to use
- Gathering, writing or reviewing requirements for a feature.
- Reverse-engineering what existing code already does before changing it.

## How to work
1. Derive each requirement from user intent or a validated pattern; say what the system achieves before how it is built.
2. Trace a line from business goal to user story to acceptance criteria; give every requirement a unique id (REQ-1, REQ-ARCH-1) and record its rationale when it is non-obvious.
3. Write standing rules in EARS form ("WHEN [trigger], THE SYSTEM SHALL [result]") and behavior scenarios as Given/When/Then.
4. State technical, regulatory and environmental constraints explicitly.
5. Validate each requirement against evidence: push a fuzzy term until it has a testable definition, stress-test it against a concrete scenario, and read the actual code and behavior rather than the stated intent.
6. For existing code: reconstruct intent from naming, comments and tests; record the behavior as it actually runs, bugs included; identify the bounded contexts and data flows first; then state the gap between what exists and what is intended.
