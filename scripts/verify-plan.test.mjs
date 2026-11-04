import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

const tool = path.join(path.dirname(new URL(import.meta.url).pathname), "verify-plan.mjs");
const run = (content, extra = []) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-plan-"));
  const f = path.join(dir, "criteria.txt");
  fs.writeFileSync(f, content);
  const r = spawnSync("node", [tool, f, "--log", path.join(dir, "out.log"), ...extra], { encoding: "utf8" });
  const log = fs.existsSync(path.join(dir, "out.log")) ? fs.readFileSync(path.join(dir, "out.log"), "utf8") : "";
  fs.rmSync(dir, { recursive: true, force: true });
  return { ...r, log };
};

test("all passing criteria exit 0 and summarise", () => {
  const r = run("# comment\nfirst :: true\nsecond :: echo ok\n");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /2\/2 criteria pass/);
});

test("a failing criterion exits 1, names itself, and keeps full output in the log only", () => {
  const r = run("good :: true\nbad :: echo detail-line; echo last-line >&2; exit 3\n");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /1\/2 criteria pass/);
  assert.match(r.stdout, /FAIL {2}bad {2}\[exit 3\] last-line/);
  assert.doesNotMatch(r.stdout, /detail-line/);
  assert.match(r.log, /detail-line/);
});

test("a timed-out criterion fails", () => {
  const r = run("slow :: sleep 5\n", ["--timeout", "1"]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /\[exit timeout\]/);
});

test("a malformed line is a usage error", () => {
  assert.equal(run("no separator here\n").status, 2);
});

test("--check validates the file without running any command", () => {
  const r = run("a :: exit 1\nb :: exit 1\n", ["--check"]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /ok: 2 criteria/);
  assert.equal(r.log, "");
});

test("--check rejects an empty file, a duplicate name, an empty command", () => {
  assert.equal(run("# only a comment\n", ["--check"]).status, 2);
  assert.equal(run("a :: true\na :: true\n", ["--check"]).status, 2);
  assert.equal(run("a ::  \n", ["--check"]).status, 2);
});

test("--check before the file name still finds the file", () => {
  const r = run("a :: true\n", ["--check"]);
  assert.equal(r.status, 0);
});
