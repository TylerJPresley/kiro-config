# Kiro CLI config (`~/.kiro`)

A shared, personal configuration for the [Kiro](https://kiro.dev) CLI. It is the contents of one developer's global `~/.kiro` directory, published so others can see how a real setup is organized and borrow from it. It bundles four things that shape how Kiro behaves: **steering** (always-on rules), **agents** (an orchestrator plus specialized subagents), **skills** (on-demand playbooks), and **helper scripts**. It's for Kiro users who want a worked example of steering, multi-agent delegation, and permission boundaries to optimize their own experience.

This repo is the global config itself, not a project built with Kiro. There is intentionally **no `AGENTS.md`** here — that file belongs in a *project* repo to supply project facts (gate commands, spec files, protected paths). The config in this repo stays project-neutral.

## Warning

This config runs with the training wheels off. `settings/cli.json` sets `chat.disableTrustAllConfirmation: true`, which removes the confirmation Kiro CLI normally shows before trusting every tool. Review that file and decide for yourself before you copy this setup.

> "I run with the training wheels off. We do it right the first time."

## The idea behind it

The whole config is built around two habits: **drive work through one orchestration loop**, and **think in systems before touching anything non-trivial**. Everything else — the agent roster, the steering rules, the skills, the scripts — exists to make those two habits cheap and hard to skip.

### The orchestration loop

One agent, the **orchestrator**, holds the goal and never implements. It runs every task on a single loop — **Plan → Execute → Verify → Iterate/Stop** — sized to the task: a trivial request gets a one-line plan, a subsystem gets the full treatment. The loop is shrunk, never skipped.

- **Plan.** State what is asked and what "done" looks like. Read the real code and docs first; never assume a feature is absent. Reuse what exists instead of building a parallel path.
- **Execute.** Delegate by *capability*, not by name: code goes to the implementer, specs to the blueprint agent, docs to the documenter, unknown facts to the researcher (with sources required). Independent work runs in parallel; stages chain only when one needs another's output. Every brief carries pinned decisions, a hard time limit, a reply budget, "tests first," and "report what is NOT done."
- **Verify.** Depth matches risk (see `verification-tiers`). **The agent that produced the work never verifies it** — reviewers read the spec and the code in fresh context, not the implementer's report. Re-verify only what changed; no re-running whole suites "to feel safe."
- **Iterate/Stop.** If verification fails, fix the weakest point and re-check only that. If the same approach fails twice, diagnose the root cause and change approach — never loop silently.

This is why the agents have narrow roles and locked-down write scopes: the loop only works if work can be delegated to a specialist, graded by someone else, and trusted to stay inside its boundary.

### Thinking in systems

Before any non-trivial change, the Plan step produces a short **system map** (the `systems-thinking` skill) — about ten lines, every line citing evidence (`file:line`, command output, or an explicit "unknown"):

- **Purpose** — what changes and the measure that shows it worked.
- **Boundary** — in scope, out of scope, who owns the edge.
- **Connections** — every caller, consumer, test, doc, config, and permission that holds the same fact, enumerated with tools, not memory.
- **Loops & delays** — what reinforces or balances the change, and what won't show up until later (builds, caches, resumed sessions).
- **Second-order effects** — what else moves, who relies on today's behavior.
- **Leverage point** — the smallest change at the right place; a rule or an information flow beats brute effort inside the existing structure.
- **Predicted touches** — the files you expect to change.

After the work, predicted touches are compared against the real `git diff`. Each surprise is a connection the map missed; a miss that recurs gets recorded as a lesson and promoted into a durable rule. The map turns "I changed a file" into "I understood what the change was connected to."

### The philosophy, inferred

Read end to end, the setup encodes a consistent point of view:

- **Judgment is the scarce resource; spend it deliberately.** Mechanical work (counting, linting, enumerating) goes to deterministic scripts. Models are spent on decisions and design, not on work a program can do in seconds.
- **Evidence over confidence.** Nothing is "done" on a feeling. Claims carry fresh evidence — a command, a test, a diff — and what was *not* verified is stated plainly.
- **Separation of powers.** The planner doesn't implement, the implementer doesn't grade its own work, and each agent writes only inside a scope that denies secrets and shared state. Correctness comes from structure, not good intentions.
- **The smallest correct change.** Prefer the simplest solution that fits the real target: fix root causes, reuse what exists, resist over-engineering and defensive code that isn't needed yet.
- **Specs lead, code follows.** Blueprints are the source of truth; code that drifts from the spec is a defect, not a choice.
- **Protect what already exists.** Destructive or irreversible actions stop and ask first; the default is to fix forward, not roll back.
- **The system learns.** Recurring mistakes are recorded the second time they appear and, by the third, promoted to the cheapest durable form — a script, a skill, or a steering line — so the config gets sharper with use.

In short: a small, auditable set of rules that make the *good* path the *easy* path, so an agent produces work that is planned, delegated, verified, and reversible — by default rather than by reminder.

### Concise, checked by script

The always-on files are kept short, and a script checks each file's size. Anything countable or checkable is done by a program, so it gives the same answer every time. The model's own judgment is still probabilistic, so the config limits where that judgment is trusted and requires evidence for claims.

**Mechanically enforced** (a script or permission rule fails if it is broken):
- `scripts/steering-lint.mjs` caps each always-on steering file at 2,200 bytes and exits non-zero if one is over. It also prints the total size of the set (bytes, and tokens estimated as bytes ÷ 4) for information; the total is not capped.
- Skill descriptions are capped at 320 characters. They are the only part of a skill that is always loaded; the body loads on demand.
- The lint fails when a line of 60+ characters appears verbatim in two steering files. It does not catch a rule that has been reworded.
- `lessons.mjs` and `steering-lint.mjs` run with no model: same input, same output.
- Each agent's JSON pins its write and shell permissions.

**Behavioral rules** (guidance the model follows; nothing checks compliance):
- `concise.md`: lead with the answer, no preamble, bullets over prose.
- `script-first.md`: countable or checkable work goes to a script, and models are kept for judgment and design.
- `confidence-and-conflicts.md`: classify each turn as a directive, a question, or an illustration (a comparison, analogy, example, or suggestion). Only a directive changes files. A user's claim is evidence to check, not a fact to build on.
- `definition-of-done.md`: run the command, read the output, then make the claim. Every report states what was *not* verified.
- `verification-tiers.md`: Tier 2+ work (new subsystem, permissions, security, data) gets an independent review. Tier 1 gets targeted tests plus one gate run. Re-verify only what changed.
- `agent-roles` (skill): the agent that produced the work does not verify it.

**Example.** A draft of this README stated 14 steering files and 18 skills. `ls | wc -l` returned 13 and 17, and the README was corrected to the command output. A model error was caught by a deterministic check.

**Not measured:** total tokens per task (subagents, briefs, and reviews add cost beyond the always-on context), and how reliably the model follows the behavioral rules.

## How Kiro loads this

Kiro composes its context from two layers:

| Layer | Location | What it provides |
|-------|----------|------------------|
| Global | `~/.kiro` (this repo) | Steering, agents, skills, scripts, settings — applied in every session |
| Project | the directory Kiro is started in | That project's `AGENTS.md`, `.kiro/steering/`, and `.kiro/skills/` |

Global steering and skills are always loaded. When you start Kiro inside a project, Kiro additionally loads that project's `AGENTS.md`, `.kiro/steering`, and `.kiro/skills`. Project rules add to or override the global ones; global rules stay project-neutral so nothing project-specific leaks across repos.

## Repository layout

```
~/.kiro/
├── steering/     always-on rules (Intent/Applies/Prevents), loaded every session
├── agents/       agent definitions (orchestrator + specialized subagents) as JSON
├── skills/       on-demand playbooks, one SKILL.md per skill directory
├── scripts/      helper scripts (Node .mjs), run manually
└── settings/     local CLI/app state (mostly gitignored)
```

| Directory | Purpose |
|-----------|---------|
| `steering/` | Markdown rules that are always in context; each is small and follows an Intent / Applies / Prevents shape. |
| `agents/`   | JSON agent definitions, including tool allow-lists and write/shell permission boundaries. |
| `skills/`   | Playbooks loaded on demand by name; each lives in its own folder as `SKILL.md`. |
| `scripts/`  | Deterministic Node helpers (lessons tracker, steering linter) run with `node`. |
| `settings/` | Local CLI and UI state; secret/stateful files here are gitignored. |

**Gitignored (not committed):** `sessions/`, `session-index/`, `logs/`, `backups/`, and secret or local-state files — `settings/mcp.json` (and any `**/mcp.json`), `settings/feed_state.json`, `settings/survey_state.json`, plus `.env`, `*.env`, `*token*`, `*credential*`, `*.key`, `*.pem`, `.DS_Store`, and `*.bak`. These are local, non-portable, or sensitive, so they stay out of the public repo.

## Steering

Steering files are always-on rules Kiro reads every session. Each states its **Intent** (the goal), **Applies** (when it's in force), and **Prevents** (the failure it heads off), each kept short. The steering files:

| File | Intent (one line) |
|------|-------------------|
| `plan-execute-verify.md` | Keep every task on one Plan → Execute → Verify → Iterate/Stop loop, sized to the task. |
| `definition-of-done.md` | No completion claim without evidence that the result meets the plan. |
| `verification-tiers.md` | Match verification depth to risk, so effort isn't wasted and risk isn't missed. |
| `quality-testing.md` | Tests prove behavior; failures are investigated, not patched around. |
| `solution-standards.md` | The simplest correct solution that fits the real target. |
| `confidence-and-conflicts.md` | Stop guessing on real unknowns, stop burning cycles on small ones; surface real conflicts. |
| `destructive-actions.md` | Protect existing work and shared systems from irreversible changes. |
| `blueprints.md` | Specs are first-class and the source of truth; code follows them, never the reverse. |
| `project-contract.md` | Agents stay project-neutral; the project supplies its own facts in its own files. |
| `project-files.md` | Each concern has one home (README, CONTRIBUTING, AGENTS), so a rule lives in one place and cannot drift. |
| `git-standards.md` | Small, tested, readable history in every project; the project's CONTRIBUTING.md overrides these defaults. |
| `session-tracking.md` | Any session resumes from zero context without writing into the project. |
| `thinking-folder.md` | One common place (`_internal/`) for agent and project working notes. |
| `script-first.md` | Mechanical work is done by deterministic scripts; models are spent on judgment. |
| `workflow-patterns.md` | Efficient, non-stalling tool use (read before write, diagnose before retry). |
| `concise.md` | Short, decision-useful replies. |

> The steering `.md` files are listed above (`systems-thinking` lives as a skill, not steering). Check with `ls steering/`; the set evolves.

## Agents

The agent model is an **orchestrator** that plans with you and delegates to **specialized subagents**. The orchestrator holds the goal and verifies; it does not implement. Each subagent has a narrow role and a tool allow-list.

| Agent | Role |
|-------|------|
| `orchestrator` | Team lead: holds the goal, plans with the user, delegates to the subagents below, verifies against the plan, iterates. Does not implement. |
| `researcher` | Looks things up and reports with sources; network-enabled; never guesses. |
| `blueprint` | Authors and maintains blueprint specs only (`blueprint.md`, `*-blueprint.md`); never touches code. |
| `implementer` | Writes code to spec, runs the project gate locally; cannot spawn subagents or review its own work. |
| `reviewer` | Read-only quality/correctness review in fresh context; returns PASS or FAIL-with-specifics. |
| `security-reviewer` | Read-only security and dependency-license audit in fresh context; writes nothing. |
| `documenter` | Updates markdown docs (README, FEATURES, PLUGINS, CHANGELOG, `docs/`) to match what was built; not blueprints. |

`agent_config.json.example` is a template only — it is **not** loaded (it lacks the `.json` extension that Kiro loads).

**Permission boundary.** Each agent's JSON pins `allowedPaths`/`deniedPaths` for writes and allow/deny lists for shell:

- The orchestrator writes only under `_internal/**` (working notes, handoff, backups, scratch).
- The researcher writes only under `_internal/research/**`; the blueprint agent writes only blueprint markdown; the documenter writes only docs; the implementer writes source but is denied `blueprint.md`, `AGENTS.md`, `.kiro/**`, `_internal/**`, and more.
- Every agent denies writing and reading secret paths — `.env`, `*.pem`, `*.key`, `*.p12/pfx/jks`, `id_rsa*`/`id_ed25519*`, `credentials.json`, `.aws/`, `.ssh/`, `.gnupg/` — and denies destructive shell (`sudo`, `rm -r`, `git push`/`reset --hard`/`clean`, reads of secret files).

## Skills

Skills are playbooks loaded on demand by name (not always-on). Each is a `SKILL.md` with a short `description`. There are **17** skills:

| Skill | Purpose (one line) |
|-------|--------------------|
| `agent-roles` | Every agent knows what it may change, and the agent that produced work never verifies it. |
| `analysis-requirements` | Requirements come from evidence and trace to behavior, so nothing is built on assumption. |
| `architecture-design` | Boundaries and decisions are explicit, sized to the problem, and justified. |
| `backend-engineering` | Services fail explicitly, validate at the boundary, and are tested where they meet the world. |
| `blueprint-editor` | How to work on blueprints under change control. |
| `cloud-ops` | Infrastructure is code, changes are small and reversible, and secrets never live in code. |
| `data-engineering` | Data has one authoritative form, a model before a store, and safe access. |
| `orchestration` | The orchestrator drives work to a verified result with the least cost and time. |
| `orchestrator-brief` | Template for briefs to implementer, reviewer, and verifier agents. |
| `project-files` | Starter README.md, CONTRIBUTING.md and AGENTS.md for a project that lacks them. |
| `product-strategy` | Ship small, learn from real use, keep the code and the message consistent. |
| `real-environment-verification` | How to verify a built product in a real environment without touching the user's own config. |
| `reliability-engineering` | Reliability is a measured target, not an absolute, and failures are learned from. |
| `security-review-brief` | Standing checklist for security-reviewing a change (read-only, time-boxed). |
| `security-trust` | Secure by default, least privilege, defense in depth. |
| `systems-engineering` | CLI/system software behaves predictably in pipelines, shells, and operating environments. |
| `systems-thinking` | Plan with a system map before changing anything non-trivial. |
| `web-engineering` | Web work is fast, accessible, and discoverable by default. |

> All 17 directories in `skills/` are listed above; list them with `ls skills/`. The set evolves.

## Scripts

Deterministic Node helpers (require Node 18+). Run them from within the project you're working in, since they resolve paths against the current directory.

| Script | What it does | Run |
|--------|--------------|-----|
| `lessons.mjs` | Tracks recurring patterns in `<cwd>/_internal/lessons.md`. `add` records a pattern or bumps its count, `promote` marks it promoted, `list [ready]` shows all (or only patterns seen ≥ 3 times, ready to promote). No model needed. | `node ~/.kiro/scripts/lessons.mjs add <id> "<pattern>" "<evidence>"`<br>`node ~/.kiro/scripts/lessons.mjs list ready` |
| `steering-lint.mjs` | Lints the global steering and skills: each steering file has `Intent:`/`Applies:` lines and stays under the per-file size cap; each skill has valid frontmatter whose `name` matches its directory and a `description` under the length cap; flags rules duplicated across files. | `node ~/.kiro/scripts/steering-lint.mjs`<br>`node ~/.kiro/scripts/steering-lint.mjs --also path/to/project/.kiro` |

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
- **Agents assume a project `AGENTS.md`** for project facts (gate command, protected paths). Without one, agents will say so and ask rather than guess.
- Steering and skills apply to *every* Kiro session once installed globally — adopt them deliberately.

## A living setup

This config evolves. Steering is trimmed and merged as rules prove out, skills and agents are added or sharpened, and recurring lessons get promoted into the cheapest durable form (script → skill → steering line). Expect the file and skill counts above to drift — check the directories for the current state.
