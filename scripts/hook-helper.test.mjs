import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

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
const tool = path.join(here, "hook-helper.mjs");

const tmp = () => mk("hook-");
const run = (mode, input, cwd) => {
  const r = spawnSync("node", [tool, mode], { input, cwd, encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
const put = (dir, rel, text) => {
  const f = path.join(dir, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
  return f;
};
// CLEAN is the skill's own bundled example, which lints with no warning; FLAGGED is a stack missing its Structure layer.
const CLEAN = fs.readFileSync(path.join(here, "..", "skills", "strata-blueprints", "references", "strata-blueprints-example.md"), "utf8");
const FLAGGED = "## Layer 1: Vision\nScope: x\n";
const post = (dir, tool_input) => JSON.stringify({ hook_event_name: "PostToolUse", cwd: dir, tool_name: "fs_write", tool_input });

test("handoff prints header and content", () => {
  const d = tmp();
  put(d, "_internal/handoff.md", "CANARY-7731\n");
  const r = run("handoff", JSON.stringify({ cwd: d }), "/");
  assert.equal(r.code, 0);
  assert.match(r.out, /handoff/i);
  assert.match(r.out, /CANARY-7731/);
  assert.doesNotMatch(r.out, /truncated/);
});

test("handoff missing prints nothing, exit 0", () => {
  const d = tmp();
  const r = run("handoff", JSON.stringify({ cwd: d }), "/");
  assert.equal(r.code, 0);
  assert.equal(r.out, "");
});

test("handoff over 6000 chars is cut with a truncated line", () => {
  const d = tmp();
  put(d, "_internal/handoff.md", "a".repeat(6000) + "ZZZEND");
  const r = run("handoff", JSON.stringify({ cwd: d }), "/");
  assert.equal(r.code, 0);
  assert.match(r.out, /truncated, read the file/);
  assert.doesNotMatch(r.out, /ZZZEND/);
  assert.ok(r.out.includes("a".repeat(6000)));
});

test("handoff with bad or empty STDIN falls back to process cwd", () => {
  const d = tmp();
  put(d, "_internal/handoff.md", "FROM-PROCESS-CWD");
  for (const input of ["not json{", ""]) {
    const r = run("handoff", input, d);
    assert.equal(r.code, 0);
    assert.match(r.out, /FROM-PROCESS-CWD/);
  }
});

test("lint clean blueprint.md exits 0", () => {
  const d = tmp();
  put(d, "blueprint.md", CLEAN);
  const r = run("lint", post(d, { path: "blueprint.md" }), "/");
  assert.equal(r.code, 0);
});

test("lint flagged blueprint.md exits 1 with output on stdout and stderr", () => {
  const d = tmp();
  put(d, "blueprint.md", FLAGGED);
  const r = run("lint", post(d, { path: "blueprint.md" }), "/");
  assert.equal(r.code, 1);
  assert.match(r.err, /layer-heading/);
  assert.match(r.out, /layer-heading/);
});

test("lint matches names ending -blueprint.md and tool_input.file_path", () => {
  const d = tmp();
  const f = put(d, "docs/app-blueprint.md", FLAGGED);
  const r = run("lint", post(d, { file_path: f }), "/");
  assert.equal(r.code, 1);
});

test("lint ignores notes.md silently", () => {
  const d = tmp();
  put(d, "notes.md", FLAGGED);
  const r = run("lint", post(d, { path: "notes.md" }), "/");
  assert.equal(r.code, 0);
  assert.equal(r.out + r.err, "");
});

test("lint of an sbp- file lints its whole folder", () => {
  const d = tmp();
  const ex = path.join(here, "..", "skills", "strata-blueprints", "references", "strata-blueprints-example-todo-app");
  for (const n of fs.readdirSync(ex)) if (n.startsWith("sbp-")) put(d, "stack/" + n, fs.readFileSync(path.join(ex, n), "utf8"));
  assert.equal(run("lint", post(d, { path: "stack/sbp-vision.md" }), "/").code, 0);
  put(d, "stack/sbp-structure.md", "## Layer 1: Vision\nScope: x\n");
  assert.equal(run("lint", post(d, { path: "stack/sbp-vision.md" }), "/").code, 1);
});

test("lint on a missing blueprint exits 0", () => {
  const d = tmp();
  const r = run("lint", post(d, { path: "blueprint.md" }), "/");
  assert.equal(r.code, 0);
});
