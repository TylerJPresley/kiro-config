import { test, after } from "node:test";
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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

const here = path.dirname(new URL(import.meta.url).pathname);
const SCRIPT = path.join(here, "test-diff.mjs");

function run(args, cwd) {
  try {
    const out = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8", cwd });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || "") + (e.stderr || "") };
  }
}

function git(dir, ...args) {
  execFileSync("git", args, { cwd: dir, stdio: "pipe" });
}

function repo() {
  const d = mk("tdiff-");
  git(d, "init", "-q");
  git(d, "config", "user.email", "t@t.t");
  git(d, "config", "user.name", "t");
  git(d, "config", "commit.gpgsign", "false");
  return d;
}

function write(dir, rel, body) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
}

function commit(dir, msg) {
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", msg);
}

test("lists modified test", () => {
  const d = repo();
  write(d, "tests/a.test.js", "1\n");
  commit(d, "init");
  write(d, "tests/a.test.js", "1\n2\n");
  const r = run(["--base", "HEAD"], d);
  assert.strictEqual(r.code, 0);
  assert.match(r.out, /^M tests\/a\.test\.js \+1 -0$/m);
  assert.match(r.out, /test-diff: touched=1 new=0/);
});

test("lists deleted test", () => {
  const d = repo();
  write(d, "tests/a.test.js", "1\n2\n");
  commit(d, "init");
  fs.rmSync(path.join(d, "tests/a.test.js"));
  const r = run(["--base", "HEAD"], d);
  assert.match(r.out, /^D tests\/a\.test\.js \+0 -2$/m);
  assert.match(r.out, /touched=1 new=0/);
});

test("lists renamed test", () => {
  const d = repo();
  write(d, "tests/a.test.js", "x\ny\nz\n");
  commit(d, "init");
  git(d, "mv", "tests/a.test.js", "tests/b.test.js");
  const r = run(["--base", "HEAD"], d);
  assert.match(r.out, /^R tests\/a\.test\.js -> tests\/b\.test\.js \+0 -0$/m);
  assert.match(r.out, /touched=1 new=0/);
});

test("counts new test without listing", () => {
  const d = repo();
  write(d, "tests/a.test.js", "1\n");
  commit(d, "init");
  write(d, "tests/added.test.js", "new\n");
  const r = run(["--base", "HEAD"], d);
  assert.doesNotMatch(r.out, /added\.test\.js/);
  assert.match(r.out, /touched=0 new=1/);
});

test("ignores non-test files", () => {
  const d = repo();
  write(d, "src/a.js", "1\n");
  commit(d, "init");
  write(d, "src/a.js", "1\n2\n");
  const r = run(["--base", "HEAD"], d);
  assert.doesNotMatch(r.out, /^M /m);
  assert.match(r.out, /touched=0 new=0/);
});

test("plan names all touched tests", () => {
  const d = repo();
  write(d, "tests/a.test.js", "1\n");
  commit(d, "init");
  write(d, "tests/a.test.js", "1\n2\n");
  const plan = path.join(d, "plan.md");
  fs.writeFileSync(plan, "## Existing tests changed\n- tests/a.test.js :: covers the new branch\n");
  const r = run(["--base", "HEAD", "--plan", plan], d);
  assert.strictEqual(r.code, 0, r.out);
  assert.doesNotMatch(r.out, /UNNAMED|NOREASON/);
});

test("UNNAMED when plan omits a touched test", () => {
  const d = repo();
  write(d, "tests/a.test.js", "1\n");
  commit(d, "init");
  write(d, "tests/a.test.js", "1\n2\n");
  const plan = path.join(d, "plan.md");
  fs.writeFileSync(plan, "## Existing tests changed\n");
  const r = run(["--base", "HEAD", "--plan", plan], d);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /UNNAMED tests\/a\.test\.js/);
});

test("NOREASON when plan line has no reason", () => {
  const d = repo();
  write(d, "tests/a.test.js", "1\n");
  commit(d, "init");
  write(d, "tests/a.test.js", "1\n2\n");
  const plan = path.join(d, "plan.md");
  fs.writeFileSync(plan, "## Existing tests changed\n- tests/a.test.js ::\n");
  const r = run(["--base", "HEAD", "--plan", plan], d);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /NOREASON tests\/a\.test\.js/);
});

test("UNTOUCHED warning", () => {
  const d = repo();
  write(d, "tests/a.test.js", "1\n");
  commit(d, "init");
  write(d, "tests/a.test.js", "1\n2\n");
  const plan = path.join(d, "plan.md");
  fs.writeFileSync(plan, "## Existing tests changed\n- tests/a.test.js :: reason\n- tests/ghost.test.js :: never changed\n");
  const r = run(["--base", "HEAD", "--plan", plan], d);
  assert.strictEqual(r.code, 0, r.out);
  assert.match(r.out, /UNTOUCHED tests\/ghost\.test\.js/);
});

test("exit 2 outside a git repo", () => {
  const d = mk("tdiff-nogit-");
  const r = run(["--base", "HEAD"], d);
  assert.strictEqual(r.code, 2);
});

test("no changes", () => {
  const d = repo();
  write(d, "tests/a.test.js", "1\n");
  commit(d, "init");
  const r = run(["--base", "HEAD"], d);
  assert.strictEqual(r.code, 0);
  assert.match(r.out, /touched=0 new=0/);
});

test("path with spaces", () => {
  const d = repo();
  write(d, "tests/a b.test.js", "1\n");
  commit(d, "init");
  write(d, "tests/a b.test.js", "1\n2\n");
  const r = run(["--base", "HEAD"], d);
  assert.match(r.out, /^M tests\/a b\.test\.js \+1 -0$/m);
  assert.match(r.out, /touched=1 new=0/);
});
