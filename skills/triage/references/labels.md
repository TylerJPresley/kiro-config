# Triage labels

Each item carries one type label and one priority label.

## Type

- `bug`: behavior differs from what the blueprint or the docs state.
- `feature`: new behavior a user sees.
- `task`: internal work with no user-visible change (refactor, tooling, dependency).
- `docs`: a repo document is missing or out of date.
- `question`: a decision or a fact is needed before work can start.

## Priority

- `p0`: a security report, data loss, or a broken release. Handle first.
- `p1`: a user is blocked and has no workaround.
- `p2`: a user is affected and has a workaround.
- `p3`: wanted, with no one blocked.

## Order

Order the list by priority, highest first. Within a priority, put the smallest item that unblocks the most other work first.
