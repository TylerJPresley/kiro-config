# Kiro CLI config (`~/.kiro`)

A shared, personal configuration for the [Kiro](https://kiro.dev) CLI. It is the contents of one developer's global `~/.kiro` directory, published so others can see how a real setup is organized and borrow from it. It bundles steering (always-on rules), agents (a Director plus specialists), skills (on-demand playbooks), and scripts (deterministic helpers). It's for Kiro users who want a worked example of steering, multi-agent delegation, and permission boundaries to optimize their own experience.

This repo is the global config itself, not a project built with Kiro. There is intentionally **no `AGENTS.md`** here — that file belongs in a project repo to supply project facts (gate commands, blueprints). The config in this repo stays project-neutral.

## Warning

This config runs with the training wheels off. `settings/cli.json` sets `chat.disableTrustAllConfirmation: true`, which removes the confirmation Kiro CLI normally shows before trusting every tool. Review that file and decide for yourself before you copy this setup.

## The model: Director routes, specialists do, scripts verify

Work flows through one loop. The Director holds the goal, routes each step to the right specialist by capability, and decides done from script evidence. Each specialist has a narrow role, a usual write zone, and hard deny rules: the Architect owns blueprints; the Planner designs before anyone builds; the Implementer builds code; the Reviewer checks independent of the builder; the Researcher looks up facts with sources; the Documenter keeps the README and docs true. Scripts verify and enumerate; models decide and design.

The loop stays small: small work (one or two files, no design decision, nothing depending on it) is just done and checked by one script. Larger work is planned first by the Planner, then built by the Implementer, then verified by the Reviewer independent of the builder (so the agent that produced the work never verifies it). If a step fails, fix the weakest point and re-check only that. If the same approach fails twice, change approach and say so. When a feature closes, the Director routes the real-environment check, the changelog update, and the tag.

Work is spec-driven: the blueprint defines what is built, and the code follows it. The Architect runs discovery with the owner to fill the blanks in a blueprint before building starts. Plans are divided at seams that each leave the project working (each seam is a commit). Features and plans track changes to the blueprints. Build progress lives in `_internal/` (the thinking folder) and the handoff, which new sessions read to resume with zero context.

## Rules always loaded

Steering files are always-on rules Kiro reads every session. They fit into a few topics: how work flows (plan-and-verify, features, specs, definition-of-done, quality-testing); how agents think and communicate (confidence-and-conflicts, decision-rights, concise, framing, discovery); safety and security (fix-forward, security); how projects work (project-contract, project-files, git-standards); and how sessions work (session-tracking, thinking-folder, script-first).

Counts: `ls steering | wc -l` returns 18 steering files. Steering files are short; the lint checks they do not repeat 60+ character lines across files. Each file has an Intent/Applies header.

The always-on files stay short so that anything countable or checkable is done by a program, giving the same answer every time. The model's own judgment is still probabilistic, so the config limits where that judgment is trusted and requires evidence for claims.

**Mechanically enforced** (a script or permission rule fails if it is broken):
- `scripts/steering-lint.mjs` no longer caps per-file size; it prints the total size of the always-on set (bytes, and tokens estimated as bytes ÷ 4) for information, and the total is not capped.
- Skill descriptions are capped at 320 characters. They are the only part of a skill that is always loaded; the body loads on demand.
- The lint fails when a line of 60+ characters appears verbatim in two steering files. It does not catch a rule that has been reworded.
- `lessons.mjs` and `steering-lint.mjs` run with no model: same input, same output.
- Each agent's JSON pins its write and shell permissions.

**Behavioral rules** (guidance the model follows; nothing checks compliance):
- `concise.md`: lead with the answer, no preamble, bullets over prose.
- `script-first.md`: countable or checkable work goes to a script, and models are kept for judgment and design.
- `confidence-and-conflicts.md`: classify each turn as a directive, a question, or an illustration (a comparison, analogy, example, or suggestion). Only a directive changes files. A user's claim is evidence to check, not a fact to build on.
- `definition-of-done.md`: run the command, read the output, then make the claim. Every report states what was *not* verified.
- `plan-and-verify.md`: every task stays on one loop so work is planned, checked against the plan, and stopped on evidence.

**Example.** A draft of this README stated 14 steering files and 18 skills. `ls | wc -l` returned 13 and 17, and the README was corrected to the command output. A model error was caught by a deterministic check.

**Not measured:** total tokens per task (subagents, briefs, and reviews add cost beyond the always-on context), and how reliably the model follows the behavioral rules. Windows and macOS behavior is not verified; POSIX shell and Node built-ins only.

## How Kiro loads this

Kiro composes its context from two layers:

| Layer | Location | What it provides |
|-------|----------|------------------|
| Global | `~/.kiro` (this repo) | Steering, agents, skills, scripts, settings — applied in every session |
| Project | the directory Kiro is started in | That project's `AGENTS.md`, `.kiro/steering/`, and `.kiro/skills/` |

Global steering is always loaded. Skills load as short descriptions always; their full bodies load on demand by name. When you start Kiro inside a project, Kiro additionally loads that project's `AGENTS.md`, `.kiro/steering`, and `.kiro/skills`. Project rules add to or override the global ones; global rules stay project-neutral so nothing project-specific leaks across repos.

## Repository layout

```
~/.kiro/
├── gate.mjs          project gate (a criterion of each plan)
├── steering/         always-on rules (Intent/Applies), loaded every session
├── agents/           agent definitions (Director + specialists) as JSON
├── skills/           on-demand playbooks, one SKILL.md per skill directory
├── scripts/          helper scripts (Node .mjs), run manually
├── hooks/            global SessionStart hook (`handoff-start.json`) and its helper script
└── settings/         local CLI/app state (mostly gitignored)
```

| Directory | Purpose |
|-----------|---------|
| `steering/` | Markdown rules that are always in context; each is small and follows an Intent / Applies shape. |
| `agents/`   | JSON agent definitions, including tool allow-lists and write/shell permission boundaries. |
| `skills/`   | Playbooks loaded on demand by name; each lives in its own folder as `SKILL.md`. |
| `scripts/`  | Deterministic Node helpers (lessons tracker, steering linter) run with `node`. |
| `hooks/`    | Global SessionStart hook (`handoff-start.json`) and its helper script; installed by `install.mjs` (CLI V3 only). |
| `settings/` | Local CLI and UI state; secret/stateful files here are gitignored. |

**Gitignored (not committed):** Session and build state — `sessions/`, `session-index/`, `logs/`, `_internal/`. Local app state — `settings/feed_state.json`, `settings/survey_state.json`, `settings/*.lock`. Secrets and credentials — `settings/mcp.json`, `**/mcp.json`, `.env`, `*.env`, `*token*`, `*credential*`, `*.key`, `*.pem`, `*.p12`, `*.pfx`, `*.jks`, `id_rsa*`, `id_ed25519*`, `id_ecdsa*`, `id_dsa*`, `.netrc`, `credentials.json`, `.aws/`, `.ssh/`, `.gnupg/`. OS and temporary files — `.DS_Store`, `**/.DS_Store`, `backups/`, `*.bak`. These are local, non-portable, or sensitive.

## Steering

Steering files are always-on rules Kiro reads every session. Each states its **Intent** (the goal), **Applies** (when it's in force), and limits plainly, each kept short. The steering files:

| File | Intent (one line) |
|------|-------------------|
| `plan-and-verify.md` | Every task stays on one loop so work is planned, checked against the plan, and stopped on evidence. |
| `features.md` | Work is organized into self-standing features, each carried by one plan with a clear outcome. |
| `definition-of-done.md` | No completion claim without evidence that the result meets the plan. |
| `quality-testing.md` | Tests prove behavior; failures are investigated, not patched around. |
| `confidence-and-conflicts.md` | Stop guessing on real unknowns, stop burning cycles on small ones; surface real conflicts. |
| `specs.md` | Work is spec-driven, so the blueprint defines what is built and the code follows it. |
| `project-contract.md` | Agents stay project-neutral; the project supplies its own facts in its own files. |
| `project-files.md` | Each concern has one home, so a rule lives in one place and stays consistent. |
| `git-standards.md` | Small, tested, readable history in every project; each commit stands on its own. |
| `session-tracking.md` | The handoff carries state, so a new session resumes where the last one stopped with zero context. |
| `thinking-folder.md` | Working files live in one place, `_internal/`, so a later session reuses them instead of paying to recreate them. |
| `script-first.md` | Mechanical work is done by deterministic scripts; models are spent on judgment. |
| `concise.md` | Replies read clearly on the first pass, leading with the answer in plain, complete sentences. |
| `discovery.md` | Before building anything non-trivial, the blanks in the blueprint are filled with the owner's intent. |
| `decision-rights.md` | The owner decides what matters to him, and the agent decides the rest and reports it. |
| `framing.md` | Every rule, spec and document states direction by what we want and states limits plainly. |
| `fix-forward.md` | Existing work and shared systems are preserved by correcting forward. |
| `security.md` | Every agent works secure by default, with least privilege and a check at each trust boundary. |

All 18 directories in `steering/` are listed above; check with `ls steering/`. The set evolves.

## Agents

The agent model is a **Director** that holds the goal and routes work, plus **specialized agents** that each own one capability. The Director verifies; it does not implement. Each specialist has a narrow role and a tool allow-list.

`ls agents | wc -l` returns 8 agents: architect, director, documenter, implementer, planner, researcher, reviewer, security-reviewer.

| Agent | Role | Writes |
|-------|------|--------|
| `director` | Team lead: holds the goal, routes work to the right specialist by capability, verifies by script evidence. Pushes completed features through `scripts/push.mjs`. Does not implement. | `_internal/handoff.md`, `_internal/decisions.md`, `_internal/lessons.md` |
| `architect` | Owns blueprints (vision, architecture, components, specification via strata-bp) and runs discovery with the owner to fill blanks. Writes blueprint markdown only. | `blueprint.md`, `*-blueprint.md` |
| `planner` | Designs: turns outcomes into plans with pinned decisions, criteria, and seams. Re-plans after a step fails twice. | `_internal/plans/**`, `_internal/proposals/**` |
| `implementer` | Builds to spec, tests first, runs the project gate, commits at each seam and tags to close features. | Source, tests, commits and feature/release tags; denied: `blueprint.md`, `AGENTS.md`, README/CONTRIBUTING/CHANGELOG/LICENSE/`docs/`, `.kiro/**`, `.github/**`, `.git/**` and secrets |
| `reviewer` | Independent check on finished work. Judges against plan and blueprints in fresh context; runs real-environment checks when needed. Writes verdict files. | `_internal/plans/<slug>.review.md` (verdict: PASS or FAIL, then findings) |
| `security-reviewer` | Audits dependencies and code for security and licenses in fresh context, read-only. Judges only what the audit script flags. | `_internal/plans/<slug>.security.md` (risk report: PASS, FAIL or ESCALATE) |
| `researcher` | Investigates assigned questions with sources; network-enabled; reports gaps when sources are missing. | `_internal/research/**` (in research-cache format) |
| `documenter` | Maintains README, CONTRIBUTING, LICENSE, CHANGELOG, `docs/`, and AGENTS.md (only when directed). Keeps them true to what was built. | Markdown docs only (not blueprints); AGENTS.md only on direction |

**Permission boundary.** Each agent's JSON pins `permissions.rules` (fs_write, fs_read and shell), as glob patterns where deny wins over allow. The Director holds a broad ceiling (fs_write `**`, shell `*`, web access) with standing denies (secrets, `.git`, `sudo`, delete hazards), so delegated work runs without `--trust-all-tools`. Every shell agent carries the same short deny list (about 60 patterns): raw `git push`, `git reset --hard`, `git clean`, `sudo`, delete hazards and secrets; it holds only real limits, so ordinary words in commands do not trip it. Read-only git commands (show, rev-parse, rev-list, branch listing, tag listing, remote -v) are allowed for every agent. The Director pushes completed features through `scripts/push.mjs`, once when a plan is complete, from a clean tree to origin on the current branch and never forced; a `gate.mjs` is one of the plan's criteria. Other agents never push. The owner may also push by hand. Releases, publish and deploy wait for the owner. A specialist's allow list marks its usual zone, and hard limits are deny rules — an allow list alone does not stop a write. Agents require Kiro CLI V3; the engine is selected by `chat.agentEngine: v3` with `chat.enableAutoAgentUpgrade: false` in `settings/cli.json`. Every agent denies writing and reading secrets — `.env`, `*.pem`, `*.key`, `*.p12/pfx/jks`, `id_rsa*`/`id_ed25519*`, `credentials.json`, `.aws/`, `.ssh/`, `.gnupg/` — and denies destructive operations (`sudo`, `git reset --hard`, `git clean -f`) and delete of absolute, `..`, `~`, `$` and `.git` paths. Delete follows write scope: every agent may delete under `_internal/scratch` and `_internal/backups`; each agent may remove files in its own write scope; the Implementer may remove any project path, except the paths its write scope denies, which ask; the Documenter may remove `*.md` files (blueprints ask). The Implementer also runs `node gate.mjs`, `node --test`, `node scripts/*` (not `push.mjs`) and basic file and git commands (`mkdir`, `mv`, `cp`, `ls`, `git mv`, `git rm`, `git switch`); the Reviewer also runs `verify-plan.mjs`. The Documenter writes any `.md` file; only the Architect writes `blueprint.md` and `*-blueprint.md`, at any depth. The Director archives closed plans. Only the Reviewer writes verdict files (`*.review.md`); the Implementer, Documenter and Planner are denied.

## Skills

Skills are playbooks loaded on demand by name (not always-on). Each is a `SKILL.md` with a short `description`. `ls skills | wc -l` returns 34 skills:

| Skill | Purpose (one line) |
|-------|--------------------|
| `agent-roles` | Every agent knows what it may change, and a different agent verifies its work. |
| `analysis-requirements` | Requirements come from evidence and trace to behavior. |
| `architecture-design` | Boundaries and decisions are explicit, sized to the problem and justified. |
| `backend-engineering` | Services validate at the boundary, fail explicitly and are tested where they meet the world. |
| `briefing` | Template for briefs to specialists: pinned decisions, reply budget, tests first, and honest report of what remains. |
| `cloud-ops` | Infrastructure is code, changes are small and reversible, and secrets stay out of code. |
| `constraint-driven-development` | Encode a project's quality bar once as a written, mechanically-checkable contract. |
| `context-engineering` | Manage the session's context for quality as well as size, and know when a fresh session pays off. |
| `data-engineering` | Data has one authoritative form, a model before a store, and safe access. |
| `diagnosing-bugs` | Reproduce the failure with a fast command, find the root cause, then fix it. |
| `discovery` | Find the blanks in a blueprint and fill them with the owner's intent, asking in rounds. |
| `efficient-workflow` | Keep the number of requests low by batching reads, searches and scripts. |
| `grilling` | Stress-test a plan or design by working its open branches round by round. |
| `orchestration` | The Director drives work to a verified result with the least cost and time. |
| `planning` | Turn an approved outcome into a plan a feature stands on: pinned decisions, criteria, and seams. |
| `portable-summary` | A summary that lets work move to another session, person or tool. |
| `product-strategy` | Ship small, learn from real use, keep the code and the message consistent. |
| `project-audit` | Cheap check of a new dependency and release-prep audit of dependencies and code risks. |
| `project-files` | Starter README, CONTRIBUTING and AGENTS files for a project that lacks them. |
| `real-environment-verification` | Verify what changed in a real environment without touching the owner's own configuration. |
| `reliability-engineering` | Reliability is a measured target, and failures are learned from. |
| `research-cache` | How to store and reuse research so a later session references it without redoing the work. |
| `retro` | After a session, propose improvements to the agent setup. |
| `security-review` | Standing checklist for reviewing a change for security. |
| `security-trust` | Secure by default, least privilege, defense in depth. |
| `strata-bp` | Structure documentation as four zoom layers (Vision, Architecture, Components, Specification). |
| `systems-engineering` | Command-line and system software behaves predictably in pipelines, shells and operating environments. |
| `systems-thinking` | Map a change's purpose, boundary, connections, loops, second-order effects and predicted touches before making it. |
| `teach` | A teaching workspace that builds long-term retention through desirable difficulty and retrieval practice. |
| `to-questionnaire` | Turn a blocking question into a questionnaire for the person who knows. |
| `triage` | Sort incoming problems and requests into ordered, labelled work. |
| `wait-what` | Re-explain one message in plain words. |
| `web-engineering` | Web work is fast, accessible and discoverable by default. |
| `writing-for-agents` | Write any document an agent reads so it guides execution at the lowest cost. |

All 34 directories in `skills/` are listed above; check with `ls skills/`. The set evolves.

## Scripts

Deterministic Node helpers (require Node 18+). Run them from within the project you're working in, since they resolve paths against the current directory.

`ls scripts/*.mjs | grep -v '\.test\.mjs' | wc -l` returns 14 helper scripts. The project gate (`gate.mjs`) lives at the repo root; it is one of the plan's criteria.

| Script | What it does | Run |
|--------|--------------|-----|
| `hook-helper.mjs` | Runs hook actions: `handoff` adds `_internal/handoff.md` (first 6000 chars) to session context; `lint` mode runs the strata-bp linter on blueprint files (exists and is tested but no hook uses it). | `node ~/.kiro/scripts/hook-helper.mjs <handoff or lint>` |
| `lessons.mjs` | Tracks recurring patterns in `<cwd>/_internal/lessons.md`. `add` records a pattern or bumps its count, `promote` marks it promoted, `list [ready]` shows all (or only patterns seen ≥ 3 times, ready to promote). No model needed. | `node ~/.kiro/scripts/lessons.mjs add <id> "<pattern>" "<evidence>"`<br>`node ~/.kiro/scripts/lessons.mjs list ready` |
| `steering-lint.mjs` | Lints the global steering and skills: each steering file has `Intent:`/`Applies:` lines (file size is not capped, only the total is printed); each skill has valid frontmatter whose `name` matches its directory and a `description` under the length cap; flags rules duplicated across files. | `node ~/.kiro/scripts/steering-lint.mjs`<br>`node ~/.kiro/scripts/steering-lint.mjs --also path/to/project/.kiro` |
| `audit.mjs` | Gathers a project's dependency and security facts for the release audit (CVEs, license compliance, secrets check). | `node ~/.kiro/scripts/audit.mjs` |
| `verify-plan.mjs` | Runs a plan's acceptance criteria and prints a short summary, with the full output in a log. | `node ~/.kiro/scripts/verify-plan.mjs <plan-slug>` |
| `test-diff.mjs` | Lists the existing tests a change touched, so the Reviewer can compare them with what the plan named. | `node ~/.kiro/scripts/test-diff.mjs [--from HEAD~N] [--to HEAD]` |
| `progress.mjs` | Keeps the handoff, the short note a new session starts from. | `node ~/.kiro/scripts/progress.mjs` |
| `ctx.mjs` | Reports how full the session's context is. | `node ~/.kiro/scripts/ctx.mjs` |
| `research-index.mjs` | Keeps the research cache's index current and checks that each entry has its origin and date. | `node ~/.kiro/scripts/research-index.mjs` |
| `sync-skill.mjs` | Copies a skill from its source repo into `~/.kiro/skills` and detects drift. | `node ~/.kiro/scripts/sync-skill.mjs <skill> <source-url>` |
| `kiro-usage.mjs` | Shows where tokens and credits go in a session. | `node ~/.kiro/scripts/kiro-usage.mjs` |
| `push.mjs` | Pushes a completed plan to origin from a clean tree. Only origin, current branch and named tags, no force or delete. | `node ~/.kiro/scripts/push.mjs [--dry-run] [--tag NAME]` |
| `install.mjs` | Puts this config on a machine and checks it. | `node ~/.kiro/scripts/install.mjs` |
| `usage-breakdown.mjs` | Shows what fills a session's context. | `node ~/.kiro/scripts/usage-breakdown.mjs` |

## Install / use

This is one person's working config — **review it before adopting any of it**, and copy only the parts that fit how you work.

To try the whole thing:

```bash
# Back up any existing config first
mv ~/.kiro ~/.kiro.bak 2>/dev/null

# Clone this repo into place
git clone git@github.com:TylerJPresley/kiro-config.git ~/.kiro
# — or symlink a checkout elsewhere —
git clone git@github.com:TylerJPresley/kiro-config.git ~/kiro-config && ln -s ~/kiro-config ~/.kiro
```

Caveats:

- **Secrets are gitignored**, so a fresh clone has no `settings/mcp.json`, no `.env`, no keys. Supply your own locally; they won't be committed.
- **`settings/` and `sessions/` are local.** Your CLI state, session history, and logs are machine-specific and stay out of the repo.
- **Agents target Kiro CLI V3.** The agents require V3 and V2 must not be used. Commits removed the legacy `toolsSettings` and `allowedTools` keys; V2 agents would have no restrictions.
- **Agents assume a project `AGENTS.md`** for project facts (gate command). Without one, agents will say so and ask rather than guess.
- Steering and skills apply to *every* Kiro session once installed globally — adopt them deliberately.

## A living setup

This config evolves. Steering is trimmed and merged as rules prove out, skills and agents are added or sharpened, and recurring lessons get promoted into the cheapest durable form (script → skill → steering line). Expect the file and skill counts above to drift — check the directories for the current state.
