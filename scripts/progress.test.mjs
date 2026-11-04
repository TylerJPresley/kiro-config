import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

const tool = path.join(path.dirname(new URL(import.meta.url).pathname), "progress.mjs");
const mkproj = () => fs.mkdtempSync(path.join(os.tmpdir(), "progress-"));
const run = (proj, args, input) =>
  spawnSync("node", [tool, "--project", proj, ...args], { encoding: "utf8", input });
const file = (proj) => path.join(proj, "_internal", "handoff.md");

test("creates handoff in _internal", () => {
  const p = mkproj();
  const r = run(p, ["show"]);
  assert.equal(r.status, 0);
  assert.ok(fs.existsSync(file(p)), "handoff.md exists under _internal");
  assert.doesNotMatch(r.stdout, /\.kiro\/progress\.md/);
  for (const s of ["## Goal", "## State", "## Next step", "## Decisions pending", "## Pointers", "## Log"])
    assert.match(fs.readFileSync(file(p), "utf8"), new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  fs.rmSync(p, { recursive: true, force: true });
});

test("show trims log", () => {
  const p = mkproj();
  run(p, ["show"]);
  for (let i = 1; i <= 8; i++) run(p, ["log", `line ${i}`]);
  const out = run(p, ["show"]).stdout;
  assert.match(out, /line 8/);
  assert.doesNotMatch(out, /line 3\b/);
  assert.match(out, /earlier Log lines hidden/);
  const full = run(p, ["show", "--full"]).stdout;
  assert.match(full, /line 1\b/);
  assert.match(full, /line 8/);
  fs.rmSync(p, { recursive: true, force: true });
});

test("log appends", () => {
  const p = mkproj();
  run(p, ["show"]);
  const r = run(p, ["log", "did a thing"]);
  assert.equal(r.status, 0);
  assert.match(fs.readFileSync(file(p), "utf8"), /did a thing/);
  fs.rmSync(p, { recursive: true, force: true });
});

test("set replaces a section", () => {
  const p = mkproj();
  run(p, ["show"]);
  const r = run(p, ["set", "State"], "working on step three");
  assert.equal(r.status, 0);
  const t = fs.readFileSync(file(p), "utf8");
  assert.match(t, /## State\nworking on step three/);
  fs.rmSync(p, { recursive: true, force: true });
});

test("set rejects unknown section", () => {
  const p = mkproj();
  run(p, ["show"]);
  const r = run(p, ["set", "Log"], "no");
  assert.equal(r.status, 2);
  const r2 = run(p, ["set", "Nonexistent"], "no");
  assert.equal(r2.status, 2);
  fs.rmSync(p, { recursive: true, force: true });
});

test("adds _internal to git exclude", () => {
  const p = mkproj();
  assert.equal(spawnSync("git", ["init", "-q", p]).status, 0);
  run(p, ["show"]);
  const exclude = fs.readFileSync(path.join(p, ".git", "info", "exclude"), "utf8");
  assert.match(exclude, /^\/_internal\/$/m);
  assert.equal(spawnSync("git", ["-C", p, "check-ignore", "-q", "_internal"]).status, 0);
  fs.rmSync(p, { recursive: true, force: true });
});

test("keeps already ignored _internal untouched", () => {
  const p = mkproj();
  assert.equal(spawnSync("git", ["init", "-q", p]).status, 0);
  fs.writeFileSync(path.join(p, ".gitignore"), "/_internal/\n");
  run(p, ["show"]);
  const ex = path.join(p, ".git", "info", "exclude");
  const before = fs.existsSync(ex) ? fs.readFileSync(ex, "utf8") : "";
  assert.doesNotMatch(before, /_internal/);
  fs.rmSync(p, { recursive: true, force: true });
});
