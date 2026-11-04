# EARS and Given/When/Then

Two forms keep a plan's criteria testable: EARS for standing rules, Given/When/Then for behavior scenarios.

## EARS (standing rules)
A standing rule holds for every run. Write it in one of the EARS shapes:
- Ubiquitous: THE SYSTEM SHALL <result>.
- Event-driven: WHEN <trigger>, THE SYSTEM SHALL <result>.
- State-driven: WHILE <state>, THE SYSTEM SHALL <result>.
- Optional-feature: WHERE <feature is present>, THE SYSTEM SHALL <result>.
- Unwanted-behavior: IF <condition>, THEN THE SYSTEM SHALL <result>.

Each rule names one trigger or state and one result, so a single check confirms it.

Examples:
- WHEN a criterion command exits non-zero, THE SYSTEM SHALL report that criterion as failed.
- WHILE the target equals the source, THE SYSTEM SHALL exit 2 and write nothing.
- IF a local source has no sha256, THEN THE SYSTEM SHALL report NO-HASH.

## Given/When/Then (behavior scenarios)
A behavior scenario names one concrete path through the feature:
- Given <the starting state>,
- When <the trigger happens>,
- Then <the observable result>.

Examples:
- Given a plan that names every touched test, When test-diff runs with that plan, Then it exits 0.
- Given a research entry with a bad date, When the index check runs, Then it prints BAD-DATE and exits 1.

## Choosing between them
- Use EARS for a rule that must hold on every run (a limit, an invariant, an exit code).
- Use Given/When/Then for a named example that walks one path end to end.
- Pair each criterion with a runnable check so the plan stays mechanically verifiable.
