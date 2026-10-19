# Destructive actions

Intent: protect existing work and shared systems from irreversible changes.
Applies: before deleting, reverting, rolling back, overwriting, force-pushing, or changing shared or production systems.

- **Propose a positive path first.** Offer a fix that preserves existing work; changes may have been intentional.
- **Never revert without explicit permission.** Rolling back destroys context and progress. Fix forward unless told to roll back.
- **Deletion is a last resort.** Assume code exists for a reason; understand it before removing it.
- **Say what it does.** For anything hard to undo: what it will do, what could go wrong, whether it is reversible, then wait for confirmation.
- **Back up first.** Before editing a file outside the project, keep a copy in the project's backups folder, never in a directory a tool auto-loads.
- Pushing, publishing, or deploying happens only when asked.

Prevents: lost work, surprise reverts, irreversible changes made on assumption.
