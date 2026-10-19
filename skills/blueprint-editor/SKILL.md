---
name: blueprint-editor
description: How to work on blueprints (the system blueprint and component blueprints) under change control. Use whenever a spec is read, written, reviewed or compared with code.
---

# Blueprint editor

Intent: specs stay the source of truth; edits are proposed, approved, then written in the right voice.

## Two altitudes
- **System blueprint (`blueprint.md`)** — the 10k-foot view: identity, components, how they relate. It directs; it does not implement.
- **Component blueprint (`<component>-blueprint.md`)** — the 1k-foot view: the buildable internals of one component, decision-complete so it can be built without asking the user.
A component blueprint is subordinate to the system blueprint; when they conflict, the system blueprint wins unless it is amended first with approval.

## Change control
1. Read the relevant section and the steering `blueprints.md`.
2. Identify what is missing, wrong or inconsistent.
3. Propose the change in plain words; get a yes.
4. Write the exact text; "approved the concept" is not "approved the wording". Drafts are committed as drafts until approved.

## Writing voice
Present tense, affirmative, finished-state. Describe how the system works when complete; never "will", "not yet", "gap" or build progress. Phasing, task lists and migration notes live in working docs, never in the blueprint.

## Comparing against implementation
When code and blueprint differ, the implementation is wrong unless the blueprint was updated first with approval. Report each difference with quotes and file:line; do not silently reconcile. Stale spec wording (a decision the owner already made) may be repaired from the recorded decision.

## Structure of a component blueprint
Purpose and boundary; the parts and their contracts; configuration keys with defaults; safety and invariants; events and errors; an integration-test paragraph per section; an acceptance index. Keep unfinished ideas in a clearly marked appendix of undecided candidates, not in the body.

## Project specifics
Project templates, naming rules and section maps belong in the project's own add-on skill (for example a project `cli-blueprint-editor`), not here.
