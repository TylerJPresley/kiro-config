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
const SCRIPT = path.join(here, "steering-lint.mjs");

function run(args) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8" });
    return { code: 0, out: stdout };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || "") + (e.stderr || "") };
  }
}

function tmp() {
  return mk("slint-");
}

function steeringFile(dir, name, body) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), body);
}

function skill(dir, name, desc, body = "# S\n") {
  const d = path.join(dir, name);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(
    path.join(d, "SKILL.md"),
    `---\nname: ${name}\ndescription: "${desc}"\n---\n\n${body}`
  );
}

const VALID_STEERING = "# T\n\nIntent: x\nApplies: y\n\n- rule one\n";

test("rejects Prevents line", () => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "a.md", "# T\n\nIntent: x\nApplies: y\n\nPrevents: z\n");
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /Prevents/);
});

test("requires Intent and Applies", () => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "a.md", "# T\n\n- rule\n");
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /Intent/);
  assert.match(r.out, /Applies/);
});

test("rejects description over 320", () => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "a.md", VALID_STEERING);
  skill(path.join(d, "skills"), "a", "x".repeat(321));
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /320/);
});

test("rejects name not equal to directory", () => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "a.md", VALID_STEERING);
  const sd = path.join(d, "skills", "a");
  fs.mkdirSync(sd, { recursive: true });
  fs.writeFileSync(path.join(sd, "SKILL.md"), `---\nname: b\ndescription: "does a thing. Use when a."\n---\n\n# A\n`);
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /name/);
});

test("rejects skill directory without SKILL.md", () => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "a.md", VALID_STEERING);
  fs.mkdirSync(path.join(d, "skills", "empty"), { recursive: true });
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /SKILL\.md/);
});

test("flags duplicated rule across steering files", () => {
  const d = tmp();
  const dup = "- this exact rule line is long enough to trip the sixty character duplicate check here\n";
  steeringFile(path.join(d, "steering"), "a.md", "# A\n\nIntent: x\nApplies: y\n\n" + dup);
  steeringFile(path.join(d, "steering"), "b.md", "# B\n\nIntent: x\nApplies: y\n\n" + dup);
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /duplicat/i);
});

test("accepts a valid set", () => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "a.md", VALID_STEERING);
  skill(path.join(d, "skills"), "a", "does a thing. Use when a.");
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.strictEqual(r.code, 0);
});

test("prints total size", () => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "a.md", VALID_STEERING);
  skill(path.join(d, "skills"), "a", "does a thing. Use when a.");
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.match(r.out, /bytes/);
  assert.match(r.out, /tokens/);
});

const warnRun = (body) => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "a.md", body);
  return run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
};

test("warns about role names with line numbers, exit 0, OK line intact", () => {
  const r = warnRun("# T\n\nIntent: x\nApplies: y\n\nThe Director decides.\nplain\nThe Security reviewer and Reviewer check.\n");
  assert.strictEqual(r.code, 0);
  assert.match(r.out, /steering lint OK/);
  assert.match(r.out, /steering lint WARN: a\.md: 2 line\(s\) name a role \(L6, L8\)/);
  assert.ok(r.out.indexOf("steering lint OK") < r.out.indexOf("steering lint WARN"));
});

test("no warning for Architecture, lowercase director or a backticked path", () => {
  const r = warnRun("# T\n\nIntent: x\nApplies: y\n\nArchitecture holds. The director agent, see `agents/director.json`.\n");
  assert.strictEqual(r.code, 0);
  assert.doesNotMatch(r.out, /WARN/);
});

// The owner-approved sentence in git-standards.md names the Director, so that one file is exempt.
const withoutExempt = (out) => out.split("\n").filter((l) => /WARN/.test(l) && !/WARN: git-standards\.md:/.test(l));

test("exemption hides a WARN for git-standards.md only, not for another file", () => {
  const d = tmp();
  steeringFile(path.join(d, "steering"), "git-standards.md", "# T\n\nIntent: x\nApplies: y\n\nThe Director pushes.\n");
  steeringFile(path.join(d, "steering"), "other.md", "# T\n\nIntent: x\nApplies: y\n\nThe Director pushes.\n");
  const r = run(["--steering-dir", path.join(d, "steering"), "--skills-dir", path.join(d, "skills")]);
  assert.match(r.out, /WARN: git-standards\.md:/);
  const left = withoutExempt(r.out);
  assert.strictEqual(left.length, 1);
  assert.match(left[0], /WARN: other\.md:/);
});

test("real steering folder produces no role-name warning (git-standards.md exempt)", () => {
  const r = run(["--steering-dir", path.join(here, "..", "steering"), "--skills-dir", path.join(here, "..", "skills")]);
  assert.deepStrictEqual(withoutExempt(r.out), []);
});
