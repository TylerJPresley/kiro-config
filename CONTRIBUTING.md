# Contributing to this repo

This repo is **trunk only** on `main`. There is no develop branch, no engineer branches, and no feature branches. Commits go directly on `main`.

- Each checklist item in a plan is one commit.
- Commits need no review.
- Push through `node scripts/push.mjs --integrate` from a clean tree.
- Never force, never delete, no tags (tags are the owner's function).
- Tests via `TMPDIR=/dev/shm/x node gate.mjs`.

For the global git baseline, see `steering/git-standards.md`. Steering and agent changes require the owner's approval of the wording.
