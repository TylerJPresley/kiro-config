---
name: analysis-requirements
description: "requirements come from evidence and trace to behavior, so nothing is built on assumption. Use when gathering, writing or reviewing requirements, or reverse-engineering existing behavior."
---

# Analysis and requirements

- Derive requirements from user intent or validated patterns; prioritize what the system achieves over how it is built.
- Trace business goal → user story → acceptance criteria; give every requirement a unique id (REQ-1, REQ-ARCH-1) and its rationale when non-obvious.
- Write requirements in EARS form ("WHEN [trigger], THE SYSTEM SHALL [result]") and acceptance criteria as Given/When/Then.
- State technical, regulatory and environmental constraints explicitly.
- Validate requirements adversarially: challenge fuzzy terms until they have a testable definition, stress-test each against concrete scenarios, and cross-reference the actual code and behavior rather than accepting stated intent at face value.
- Legacy code: reconstruct intent from naming, comments and tests; characterize actual behavior (bugs included) before proposing changes; identify bounded contexts and data flows first; state the gap between current and desired state.

Prevents: untraceable requirements, solutions without stated goals, changes to legacy behavior nobody recorded.
