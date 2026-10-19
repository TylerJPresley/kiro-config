# Blueprints

Intent: specs are first-class and the source of truth; code follows them, never the reverse.
Applies: before any design, implementation or review work, and whenever a spec is read, written or compared with code.

- Read the relevant blueprint first. Never ignore or bypass it; work that contradicts it is a defect, not a choice.
- Two altitudes: the system blueprint (10k-foot: identity, components, relations) and component blueprints (1k-foot: decision-complete internals). The system blueprint wins unless amended first with approval.
- Changes need explicit user approval: read the section, propose, confirm, then write the exact approved wording. Approving the concept is not approving the wording.
- Voice: the finished system, present tense, affirmative. No "will", "not yet", "gap" or build progress; phasing and tasks live in working docs.
- Detail, templates and comparison rules: load the `blueprint-editor` skill.

Prevents: code that drifts from the spec, unapproved spec edits, build-progress narrative inside specs.
