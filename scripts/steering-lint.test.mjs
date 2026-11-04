import { test } from "node:test";
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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
  return fs.mkdtempSync(path.join(os.tmpdir(), "slint-"));
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
