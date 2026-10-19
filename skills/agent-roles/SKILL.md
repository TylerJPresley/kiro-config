---
name: agent-roles
description: "every agent knows what it may change, and the agent that produced work never verifies it. Use whenever work is delegated, an agent's output is judged, or an agent is added."
---

# Agent roles and write scopes

One global agent set (`~/.kiro/agents/`) serves every project and is project-neutral; the project supplies its facts through `AGENTS.md` (see project-contract).

## Working directory
- The CWD Kiro started in is the project root. Use relative paths; do not write outside it unless the user names the file (back it up first).
- Write scopes are CWD-relative globs. Every writer denies `..` segments and secrets (`.env`, `*.pem`, `*.key`), and (except the orchestrator and researcher) the thinking folder.

## Roles
| Agent | Writes | Notes |
|---|---|---|
| orchestrator | thinking folder (`_internal/**`) | Only agent that spawns subagents. Plans, delegates, verifies. Does not implement. |
| researcher | `_internal/research/**` | Network read-only. Cites source + date. Never guesses. |
| blueprint | `blueprint.md`, `*-blueprint.md` | Change control: propose, confirm, write. |
| implementer | workspace, minus protected paths | Protected: specs, `AGENTS.md`, thinking folder, `.git/`, `.kiro/`, `.github/`, `node_modules/`, reference-only dirs. |
| reviewer | nothing | Fresh context. PASS or FAIL ranked by severity, against the spec. |
| security-reviewer | nothing | Fresh context. Tool output over memory for vulnerabilities and licenses. |
| documenter | `README.md`, `FEATURES.md`, `PLUGINS.md`, `CHANGELOG.md`, `docs/**` | Never specs or source. |

## Rules
- The agent that produced work never verifies it.
- Specs are written only by the blueprint agent; code only by the implementer; docs only by the documenter.
- Agents are chosen by their description (the `subagent` tool shows it), not by name; this table documents scopes only.

## Adding an agent
1. Create `~/.kiro/agents/<name>.json` with a precise description ("Use for …. Writes only …") and the narrowest write scope.
2. Add it to the orchestrator's `availableAgents` (and `trustedAgents` if it is read-only).
3. Add one row above. Nothing else changes: the orchestrator prompt is capability-based.

Prevents: self-graded work, scope creep, a prompt that must be edited for every new agent.
