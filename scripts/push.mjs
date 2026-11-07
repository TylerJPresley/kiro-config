#!/usr/bin/env node
// Push a completed plan to origin: the current branch and any named tags, never forced.
// usage: node ~/.kiro/scripts/push.mjs [--dry-run] [--tag NAME ...]
// It refuses only on bad arguments, a bad or missing tag, no repository or origin, a detached
// HEAD, a dirty tree (untracked files that are not ignored count), or a failed git push.
// A diverged origin or a moved tag is refused by git itself and reported as [push].
// A gate.mjs in the repo is neither read nor run; the plan's criteria cover it.
// Exit codes: 0 pushed, dry-run complete, or nothing to push; 1 refused on repository state,
// a missing tag or a failed push; 2 refused on arguments or a tag name.
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
const tags = [];
const bad = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--dry-run") dryRun = true;
  else if (argv[i] === "--tag" && i + 1 < argv.length) tags.push(argv[++i]);
  else bad.push(argv[i]);
}
if (bad.length) {
  refuse(2, "args", "only --dry-run and --tag NAME are accepted");
}

// --- repository, branch, origin, clean tree --------------------------------
const top = git(["rev-parse", "--show-toplevel"]);
if (!top.ok) refuse(1, "origin", "not inside a git repository");
process.chdir(top.out);
const branch = git(["symbolic-ref", "--quiet", "--short", "HEAD"]);
if (!branch.ok || !branch.out) refuse(1, "branch", "HEAD is detached; check out a branch first");
if (!git(["remote", "get-url", "origin"]).ok) refuse(1, "origin", "no origin remote is configured");
if (git(["status", "--porcelain", "--untracked-files=normal"]).out) {
  refuse(1, "dirty", "the working tree has uncommitted or untracked changes");
}

// --- tags: names first, then presence; skip a tag already on origin at the same commit ---
for (const name of tags) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)) refuse(2, "tag-name", `tag name ${JSON.stringify(name)} is not allowed`);
}
const newTags = [];
for (const name of tags) {
  const local = git(["rev-parse", "--quiet", "--verify", `refs/tags/${name}^{commit}`]);
  if (!local.ok) refuse(1, "tag", `tag ${name} does not exist locally`);
  const remote = git(["ls-remote", "origin", `refs/tags/${name}^{commit}`, `refs/tags/${name}`]);
  const onOrigin = remote.out.split("\n").some((l) => l.split(/\s+/)[0] === local.out);
  if (!onOrigin && !newTags.includes(name)) newTags.push(name);
}

// --- what to push -----------------------------------------------------------
const range = git(["rev-list", "HEAD", "--not", "--remotes=origin"]).out.split("\n").filter(Boolean);
const refspecs = [];
if (range.length > 0) refspecs.push(`refs/heads/${branch.out}:refs/heads/${branch.out}`);
for (const name of newTags) refspecs.push(`refs/tags/${name}:refs/tags/${name}`);
if (refspecs.length === 0) finish(0, "push: nothing to push");

const counts = `${branch.out} (${range.length} commits, ${newTags.length} tags) (log: ${LOG})`;
if (dryRun) finish(0, `push: dry-run ok, would push ${counts}`);

// --- push (no force flag, origin only) ---------------------------------------
const pushed = git(["push", "origin", ...refspecs], {
  timeout: 120000,
  env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
});
logLines.push(pushed.all);
if (!pushed.ok) refuse(1, "push", "git push failed; see the log");
finish(0, `push: ok ${counts}`);
