import { test, after } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const gateSrc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "gate.mjs");
const made = [];
after(() => {
  const root = path.resolve(os.tmpdir()) + path.sep;
  for (const d of made) if (path.resolve(d).startsWith(root)) fs.rmSync(d, { recursive: true, force: true });
});

// A copy of gate.mjs in a fixture repo whose only test is the given source.
function runGate(testSource) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "gatefix-"));
  made.push(d);
  fs.mkdirSync(path.join(d, "scripts"));
  fs.copyFileSync(gateSrc, path.join(d, "gate.mjs"));
  fs.writeFileSync(path.join(d, "scripts", "steering-lint.mjs"), "");
  fs.writeFileSync(path.join(d, "scripts", "x.test.mjs"), testSource);
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ["gate.mjs"], { cwd: d, env, encoding: "utf8" });
  return { ...r, d };
}

const record = `import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { test } from "node:test";
fs.writeFileSync(path.join(import.meta.dirname, "seen-tmp"), os.tmpdir());
`;

test("a test that cleans up passes the gate, in a private temp directory that is removed", () => {
  const r = runGate(record + `test("ok", () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "a-")); fs.rmSync(d, { recursive: true }); });`);
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  const seen = fs.readFileSync(path.join(r.d, "scripts", "seen-tmp"), "utf8");
  assert.notStrictEqual(seen, os.tmpdir());
  assert.match(path.basename(seen), /^gate-/);
  assert.ok(!fs.existsSync(seen), "the gate's temp directory was not removed");
});

test("a test that leaves a temp directory fails the gate", () => {
  const r = runGate(record + `test("leak", () => { fs.mkdtempSync(path.join(os.tmpdir(), "leaky-")); });`);
  assert.strictEqual(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /left 1 temp entries: leaky-/);
  assert.ok(!fs.existsSync(fs.readFileSync(path.join(r.d, "scripts", "seen-tmp"), "utf8")));
});
