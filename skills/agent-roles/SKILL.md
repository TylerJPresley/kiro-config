---
name: agent-roles
description: "every agent knows what it may change, and a different agent verifies its work. Use whenever work is delegated, an agent's output is judged, or an agent is added."
---

# Agent roles and write scopes

Intent: one global agent set serves every project, each agent is defined by the paths it may change, and a different agent always verifies the work. The authoritative write scope for each role lives in its agent file `agents/<name>.json` (its `permissions.rules` and the Writes line of its prompt); the lines below summarise it and point to that file.

## When to use
- The Director delegates work or judges an agent's output.
- An agent is added or its scope changes.

## How to work
1. Match the work to a role by its one-line summary; the agent file holds the exact scope.
   - Director (director.json) — writes the handoff, the decisions file and the lessons; routes work and confirms done from script evidence; the only agent that spawns subagents.
   - Planner (planner.json) — writes plans and proposals under `_internal/plans/` and `_internal/proposals/`; the only designer; pins decisions, edge cases and criteria, and re-plans after a step fails twice.
   - Researcher (researcher.json) — writes the research cache under `_internal/research/`; reads sources on the network and cites source and date.
   - Architect (architect.json) — writes the blueprint files blueprint.md and *-blueprint.md, at any depth, as drafts the owner approves; sets direction and runs discovery.
   - Implementer (implementer.json) — writes source and tests across the workspace, minus the protected paths listed in its file; tests first; tags a feature when the plan or the owner asks.
   - Reviewer (reviewer.json) — writes a verdict file `_internal/plans/*.review.md`, first line PASS or FAIL, then findings by severity, judged against the spec in fresh context.
   - Security reviewer (security-reviewer.json) — writes a risk report `_internal/plans/*.security.md` from the audit script's facts; judges only flagged items.
   - Documenter (documenter.json) — writes the repo documents (any `.md` file, including `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md` and `docs/`) and `AGENTS.md` when the owner directs it.
2. Keep the separation: the Architect writes specs, the Implementer writes code, the Documenter writes repo documents, and the agent that produced work never verifies it.
3. Choose an agent by its description, which the `subagent` tool shows, not by name; this list documents scopes.

## Adding an agent
1. Create its agent file with a precise description ("Use for …. Writes only …") and the narrowest write scope.
2. Add a `subagent` rule for it in the Director's permissions: allow, without a prompt. The Director only routes, so the specialists' own permissions and the push deny carry the limits.
3. Add one line above. The Director prompt stays capability-based, so nothing else changes.
