#!/usr/bin/env node
// Push a completed plan's branch to origin: the current branch only, never forced, no tags.
// usage: node ~/.kiro/scripts/push.mjs [--dry-run] [--integrate]
// It refuses only on bad arguments, no repository or origin, a detached HEAD, a protected
// branch (main, master, develop) without --integrate, a dirty tree (untracked files that are
// not ignored count), or a failed git push. A diverged origin is refused by git itself and
// reported as [push]. A gate.mjs in the repo is neither read nor run; the plan's criteria cover it.
// Exit codes: 0 pushed, dry-run complete, or nothing to push; 1 refused on repository state
// or a failed push; 2 refused on arguments.
// Stdout is at most 12 lines. The full log is in _internal/scratch/push.log.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const LOG = path.join("_internal", "scratch", "push.log");
const logLines = [];

// Print the one-line result, write the log (best effort), and exit.
function finish(code, line) {
  console.log(line);
  logLines.push(line);
  try {
    fs.mkdirSync(path.dirname(LOG), { recursive: true });
    fs.writeFileSync(LOG, logLines.join("\n") + "\n");
  } catch {
    // the log is best-effort
  }
  process.exit(code);
}

function refuse(code, id, reason) {
  finish(code, `push: REFUSED [${id}] ${reason} (log: ${LOG})`);
}

function git(args, extra = {}) {
  const r = spawnSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...extra });
  return { ok: r.status === 0, out: (r.stdout || "").trim(), all: (r.stdout || "") + (r.stderr || "") };
}

// --- arguments ------------------------------------------------------------
let dryRun = false;
let integrate = false;
const PROTECTED = ["main", "master", "develop"];
const bad = [];
for (const a of process.argv.slice(2)) {
  if (a === "--dry-run") dryRun = true;
  else if (a === "--integrate") integrate = true;
  else bad.push(a);
}
if (bad.length) {
  refuse(2, "args", "only --dry-run and --integrate are accepted");
}

// --- repository, branch, origin, clean tree --------------------------------
const top = git(["rev-parse", "--show-toplevel"]);
if (!top.ok) refuse(1, "origin", "not inside a git repository");
process.chdir(top.out);
const branch = git(["symbolic-ref", "--quiet", "--short", "HEAD"]);
if (!branch.ok || !branch.out) refuse(1, "branch", "HEAD is detached; check out a branch first");
if (PROTECTED.includes(branch.out) && !integrate) refuse(1, "protected", `${branch.out} is protected; --integrate is the owner's command`);
if (!git(["remote", "get-url", "origin"]).ok) refuse(1, "origin", "no origin remote is configured");
if (git(["status", "--porcelain", "--untracked-files=normal"]).out) {
  refuse(1, "dirty", "the working tree has uncommitted or untracked changes");
}

// --- what to push -----------------------------------------------------------
const range = git(["rev-list", "HEAD", "--not", "--remotes=origin"]).out.split("\n").filter(Boolean);
if (range.length === 0) finish(0, "push: nothing to push");

const counts = `${branch.out} (${range.length} commits) (log: ${LOG})`;
if (dryRun) finish(0, `push: dry-run ok, would push ${counts}`);

// --- push (no force flag, origin only) ---------------------------------------
const pushed = git(["push", "origin", `refs/heads/${branch.out}:refs/heads/${branch.out}`], {
  timeout: 120000,
  env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
});
logLines.push(pushed.all);
if (!pushed.ok) refuse(1, "push", "git push failed; see the log");
finish(0, `push: ok ${counts}`);
