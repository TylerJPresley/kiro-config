import { test, after } from "node:test";
import assert from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Every temp directory a test makes is removed when the file finishes (tmp-hygiene.test.mjs guards this).
const madeDirs = [];
function mk(prefix) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  madeDirs.push(d);
  return d;
}
after(() => {
  const root = path.resolve(os.tmpdir()) + path.sep;
  for (const d of madeDirs) if (path.resolve(d).startsWith(root)) fs.rmSync(d, { recursive: true, force: true });
});

// The script under test. PUSH_SCRIPT selects a copy (used by the mutation checks);
// the default is the sibling push.mjs resolved from this file's own location.
const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = process.env.PUSH_SCRIPT || path.join(here, "push.mjs");

// Every test runs in a scratch directory under os.tmpdir(): a working clone and a
// bare origin in the same temp directory. HOME/USERPROFILE point at the scratch dir,
// the global and system git config are disabled, and author/committer are fixed, so a
// run never touches the real origin or this repository's git configuration.
function git(dir, ...args) {
  return execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
}

function makeScratch() {
  const dir = mk("push-test-");
  const env = {
    PATH: process.env.PATH,
    HOME: dir,
    USERPROFILE: dir,
    GIT_CONFIG_GLOBAL: os.devNull,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_NAME: "t",
    GIT_AUTHOR_EMAIL: "t@t",
    GIT_COMMITTER_NAME: "t",
    GIT_COMMITTER_EMAIL: "t@t",
    GIT_TERMINAL_PROMPT: "0",
  };
  return { dir, env };
}

// Build a working repo "w" with a bare origin "r" in the same temp dir. Returns paths.
function setup({ gate, ignore = "_internal/\n", seedOrigin = true } = {}) {
  const s = makeScratch();
  const w = path.join(s.dir, "w");
  const origin = path.join(s.dir, "r");
  fs.mkdirSync(w, { recursive: true });
  const g = (...a) => execFileSync("git", a, { cwd: w, env: s.env, encoding: "utf8" }).trim();
  g("init", "-q", "-b", "main");
  fs.writeFileSync(path.join(w, ".gitignore"), ignore);
  if (gate !== undefined) fs.writeFileSync(path.join(w, "gate.mjs"), gate);
  g("add", "--all");
  g("commit", "-q", "-m", "chore: init");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", origin], { env: s.env });
  g("remote", "add", "origin", origin);
  // Seed origin with the init commit so the root commit is never in a push range,
  // unless the scenario wants a brand-new branch (seedOrigin: false).
  if (seedOrigin) g("push", "-q", "origin", "main");
  return { ...s, w, origin, g };
}

function headOf(w, env) {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: w, env, encoding: "utf8" }).trim();
}

function originTip(origin, env, ref = "refs/heads/main") {
  const r = spawnSync("git", ["--git-dir", origin, "rev-parse", "-q", "--verify", ref], { env, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

// Run the script in w; return { code, out } where out is combined stdout+stderr.
function run(w, env, args = [], extraEnv = {}) {
  const r = spawnSync("node", [SCRIPT, ...args], {
    cwd: w,
    env: { ...env, ...extraEnv },
    encoding: "utf8",
  });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

// Add and commit a file, return the new HEAD sha.
function commitFile(ctx, rel, body, msg) {
  const p = path.join(ctx.w, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
  ctx.g("add", "--", rel);
  ctx.g("commit", "-q", "-m", msg);
  return headOf(ctx.w, ctx.env);
}

const PASS_GATE = "process.exit(0)\n";
const FAIL_GATE = "process.exit(1)\n";

// Guard: the origin must sit under the temp dir, compared by realpath.
function assertScratchOrigin(ctx) {
  const url = ctx.g("remote", "get-url", "origin");
  assert.ok(fs.realpathSync(url).startsWith(fs.realpathSync(os.tmpdir())), "origin is not under the temp dir");
}

// ---------------------------------------------------------------------------
// [args]
// ---------------------------------------------------------------------------
for (const [label, bad, kind] of [
  ["force", "--force", "force"],
  ["f", "-f", "force"],
  ["force-with-lease", "--force-with-lease", "force"],
  ["delete", "--delete", "delete"],
  ["d", "-d", "delete"],
  ["mirror", "--mirror", "force"],
  ["remote", "--remote", "remote"],
  ["positional", "main", "unknown"],
  ["unknown", "--nope", "unknown"],
]) {
  test(`[args] rejects ${label}`, () => {
    const ctx = setup({ gate: PASS_GATE });
    assertScratchOrigin(ctx);
    const extra = bad === "--remote" ? [bad, "upstream"] : [bad];
    const r = run(ctx.w, ctx.env, extra);
    assert.equal(r.code, 2, r.out);
    assert.match(r.out, /\[args\]/);
  });
}

test("[args] accepts --dry-run and --tag", () => {
  const ctx = setup({ gate: PASS_GATE });
  const head = commitFile(ctx, "a.txt", "a\n", "docs: a");
  ctx.g("tag", "v1");
  const r = run(ctx.w, ctx.env, ["--dry-run", "--tag", "v1"]);
  assert.equal(r.code, 0, r.out);
});

// ---------------------------------------------------------------------------
// [origin] [branch]
// ---------------------------------------------------------------------------
test("[origin] missing origin refuses", () => {
  const ctx = setup({ gate: PASS_GATE });
  ctx.g("remote", "remove", "origin");
  const r = run(ctx.w, ctx.env, ["--dry-run"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\[origin\]/);
});

test("[branch] detached HEAD refuses", () => {
  const ctx = setup({ gate: PASS_GATE });
  const head = headOf(ctx.w, ctx.env);
  ctx.g("checkout", "-q", head);
  const r = run(ctx.w, ctx.env, ["--dry-run"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\[branch\]/);
});

// ---------------------------------------------------------------------------
// [dirty]
// ---------------------------------------------------------------------------
test("[dirty] tracked change refuses", () => {
  const ctx = setup({ gate: PASS_GATE });
  commitFile(ctx, "a.txt", "a\n", "docs: a");
  fs.writeFileSync(path.join(ctx.w, "a.txt"), "b\n");
  const r = run(ctx.w, ctx.env, ["--dry-run"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\[dirty\]/);
});

test("[dirty] non-ignored untracked file refuses", () => {
  const ctx = setup({ gate: PASS_GATE });
  fs.writeFileSync(path.join(ctx.w, "new.txt"), "x\n");
  const r = run(ctx.w, ctx.env, ["--dry-run"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\[dirty\]/);
});

test("[dirty] an ignored file does not count", () => {
  const ctx = setup({ gate: PASS_GATE });
  const head = commitFile(ctx, "a.txt", "a\n", "docs: a");
  fs.mkdirSync(path.join(ctx.w, "_internal"), { recursive: true });
  fs.writeFileSync(path.join(ctx.w, "_internal", "junk"), "x\n");
  const r = run(ctx.w, ctx.env, ["--dry-run"]);
  assert.equal(r.code, 0, r.out);
});


// ---------------------------------------------------------------------------
// [push] git itself refuses a diverged origin; the script never forces
// ---------------------------------------------------------------------------
test("[push] a diverged origin refuses and stays unchanged", () => {
  const ctx = setup({ gate: PASS_GATE });
  commitFile(ctx, "a.txt", "a\n", "docs: a");
  let r = run(ctx.w, ctx.env, []);
  assert.equal(r.code, 0, r.out);
  const other = path.join(ctx.dir, "other");
  execFileSync("git", ["clone", "-q", ctx.origin, other], { env: ctx.env });
  const og = (...a) => execFileSync("git", a, { cwd: other, env: ctx.env, encoding: "utf8" });
  fs.writeFileSync(path.join(other, "z.txt"), "z\n");
  og("add", "--all");
  og("commit", "-q", "-m", "docs: z");
  og("push", "-q", "origin", "main");
  const moved = originTip(ctx.origin, ctx.env);
  commitFile(ctx, "b.txt", "b\n", "docs: b");
  r = run(ctx.w, ctx.env, []);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\[push\]/);
  assert.equal(originTip(ctx.origin, ctx.env), moved);
});

// ---------------------------------------------------------------------------
// no review, no gate, tags only
// ---------------------------------------------------------------------------
test("[no-review] a feat commit with no verdict pushes", () => {
  const ctx = setup();
  const head = commitFile(ctx, "a.txt", "a\n", "feat: a");
  const r = run(ctx.w, ctx.env, []);
  assert.equal(r.code, 0, r.out);
  assert.equal(originTip(ctx.origin, ctx.env), head);
  assert.match(r.out, /^push: ok main \(1 commits, 0 tags\)/);
});

test("[no-gate-run] a gate.mjs that would fail is not run and the push lands", () => {
  const marker = "gate-ran.txt";
  const gate = `import { writeFileSync } from 'node:fs';\nwriteFileSync('${marker}', 'x');\nprocess.exit(1)\n`;
  const ctx = setup({ gate });
  const head = commitFile(ctx, "a.txt", "a\n", "feat: a");
  const r = run(ctx.w, ctx.env, []);
  assert.equal(r.code, 0, r.out);
  assert.equal(originTip(ctx.origin, ctx.env), head);
  assert.ok(!fs.existsSync(path.join(ctx.w, marker)), "the gate ran");
});

test("[tag-only] tags-only push lands", () => {
  const ctx = setup();
  ctx.g("tag", "v1");
  const r = run(ctx.w, ctx.env, ["--tag", "v1"]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /\(0 commits, 1 tags\)/);
  assert.ok(originTip(ctx.origin, ctx.env, "refs/tags/v1"), "tag not on origin");
});

// ---------------------------------------------------------------------------
// [tag-name] [tag]
// ---------------------------------------------------------------------------
for (const bad of [":v1", "+v1", "-x", "a b", ".hidden"]) {
  test(`[tag-name] rejects ${JSON.stringify(bad)}`, () => {
    const ctx = setup({ gate: PASS_GATE });
    const head = commitFile(ctx, "a.txt", "a\n", "docs: a");
    const r = run(ctx.w, ctx.env, ["--dry-run", "--tag", bad]);
    assert.equal(r.code, 2, r.out);
    assert.match(r.out, /\[tag-name\]/);
  });
}

test("[tag] a missing tag refuses", () => {
  const ctx = setup({ gate: PASS_GATE });
  commitFile(ctx, "a.txt", "a\n", "docs: a");
  const r = run(ctx.w, ctx.env, ["--dry-run", "--tag", "nope"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\[tag\]/);
});

test("tag push lands on origin", () => {
  const ctx = setup({ gate: PASS_GATE });
  commitFile(ctx, "a.txt", "a\n", "docs: a");
  ctx.g("tag", "v1");
  const r = run(ctx.w, ctx.env, ["--tag", "v1"]);
  assert.equal(r.code, 0, r.out);
  assert.ok(originTip(ctx.origin, ctx.env, "refs/tags/v1"), "tag not on origin");
});

// ---------------------------------------------------------------------------
// nothing to push, happy path, determinism
// ---------------------------------------------------------------------------
test("nothing to push exits 0", () => {
  const ctx = setup({ gate: PASS_GATE });
  const r = run(ctx.w, ctx.env, []);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /nothing to push/);
});

test("a new branch with no remote tip pushes", () => {
  const ctx = setup({ gate: PASS_GATE, seedOrigin: false });
  const head = commitFile(ctx, "a.txt", "a\n", "docs: a");
  assert.equal(originTip(ctx.origin, ctx.env), null);
  const r = run(ctx.w, ctx.env, []);
  assert.equal(r.code, 0, r.out);
  assert.equal(originTip(ctx.origin, ctx.env), head);
});

test("a second dry run prints identical stdout", () => {
  const ctx = setup({ gate: PASS_GATE });
  commitFile(ctx, "a.txt", "a\n", "docs: a");
  const r1 = spawnSync("node", [SCRIPT, "--dry-run"], { cwd: ctx.w, env: ctx.env, encoding: "utf8" });
  const r2 = spawnSync("node", [SCRIPT, "--dry-run"], { cwd: ctx.w, env: ctx.env, encoding: "utf8" });
  assert.equal(r1.stdout, r2.stdout);
  assert.match(r1.stdout, /dry-run ok/);
});

test("dry-run pushes nothing", () => {
  const ctx = setup({ gate: PASS_GATE });
  const head = commitFile(ctx, "a.txt", "a\n", "docs: a");
  const r = run(ctx.w, ctx.env, ["--dry-run"]);
  assert.equal(r.code, 0, r.out);
  assert.notEqual(originTip(ctx.origin, ctx.env), head);
});

test("stdout is at most 12 lines and git output is only in the log", () => {
  const ctx = setup({ gate: PASS_GATE });
  commitFile(ctx, "a.txt", "a\n", "docs: a");
  const r = run(ctx.w, ctx.env, []);
  assert.equal(r.code, 0, r.out);
  const stdoutLines = r.out.split("\n").filter((l) => l.length > 0);
  assert.ok(stdoutLines.length <= 12, `stdout had ${stdoutLines.length} lines`);
  assert.ok(!/main -> main/.test(r.out), "git output leaked to stdout");
  const log = fs.readFileSync(path.join(ctx.w, "_internal", "scratch", "push.log"), "utf8");
  assert.match(log, /main -> main/);
});

test("a second bare remote named upstream stays untouched", () => {
  const ctx = setup({ gate: PASS_GATE });
  const upstream = path.join(ctx.dir, "upstream");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", upstream], { env: ctx.env });
  ctx.g("remote", "add", "upstream", upstream);
  const head = commitFile(ctx, "a.txt", "a\n", "docs: a");
  const r = run(ctx.w, ctx.env, []);
  assert.equal(r.code, 0, r.out);
  assert.equal(originTip(ctx.origin, ctx.env), head);
  assert.equal(originTip(upstream, ctx.env), null);
});
