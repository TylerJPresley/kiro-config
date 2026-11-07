import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

const tool = path.join(path.dirname(new URL(import.meta.url).pathname), "lessons.mjs");
const mkproj = () => fs.mkdtempSync(path.join(os.tmpdir(), "lessons-"));
const run = (cwd, ...args) => spawnSync("node", [tool, ...args], { encoding: "utf8", cwd });
const file = (p) => path.join(p, "_internal", "lessons.md");
const lines = (p) => fs.readFileSync(file(p), "utf8").split("\n").filter((l) => l.startsWith("- ["));
const today = new Date().toISOString().slice(0, 10);
const done = (p) => fs.rmSync(p, { recursive: true, force: true });

test("add creates a new lesson in the line grammar", () => {
  const p = mkproj();
  const r = run(p, "add", "x1", "pat", "ev");
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), `- [x1] pat | ev | seen: 1 (${today}) | watching`);
  assert.deepEqual(lines(p), [`- [x1] pat | ev | seen: 1 (${today}) | watching`]);
  assert.match(fs.readFileSync(file(p), "utf8"), /^# Lessons/);
  done(p);
});

test("adding the same id bumps count and date, keeping the pattern", () => {
  const p = mkproj();
  run(p, "add", "x1", "pat", "ev");
  const old = fs.readFileSync(file(p), "utf8").replace(`(${today})`, "(2020-01-01)");
  fs.writeFileSync(file(p), old);
  const r = run(p, "add", "x1", "other", "ev2");
  assert.equal(r.status, 0);
  assert.deepEqual(lines(p), [`- [x1] pat | ev2 | seen: 2 (${today}) | watching`]);
  assert.doesNotMatch(r.stdout, /READY/);
  done(p);
});

test("third sighting prints READY", () => {
  const p = mkproj();
  run(p, "add", "x1", "pat", "ev");
  run(p, "add", "x1", "pat");
  const r = run(p, "add", "x1", "pat");
  assert.match(r.stdout, /seen: 3/);
  assert.match(r.stdout, /READY to promote/);
  done(p);
});

test("promote marks status promoted with the destination", () => {
  const p = mkproj();
  run(p, "add", "x1", "pat", "ev");
  const r = run(p, "promote", "x1", "steering");
  assert.equal(r.status, 0);
  assert.deepEqual(lines(p), [`- [x1] pat | ev | seen: 1 (${today}) | promoted→steering`]);
  done(p);
});

test("list shows all; list ready shows only watching lessons seen 3+ times", () => {
  const p = mkproj();
  run(p, "add", "a", "pa", "e");
  for (let i = 0; i < 3; i++) run(p, "add", "b", "pb", "e");
  for (let i = 0; i < 3; i++) run(p, "add", "c", "pc", "e");
  run(p, "promote", "c", "script");
  const all = run(p, "list").stdout.trim().split("\n");
  assert.equal(all.length, 3);
  const ready = run(p, "list", "ready").stdout.trim().split("\n");
  assert.equal(ready.length, 1);
  assert.match(ready[0], /^- \[b\] pb \| e \| seen: 3 /);
  done(p);
});

test("round-trip: lines written by add are parsed back by the next add", () => {
  const p = mkproj();
  run(p, "add", "a", "pa | not", "e");
  run(p, "add", "b", "pb", "eb");
  const r = run(p, "add", "b", "pb");
  assert.equal(lines(p).length, 2);
  assert.match(r.stdout, /seen: 2/);
  assert.match(lines(p)[0], /^- \[a\] /);
  done(p);
});

test("bad usage exits 2 with a usage line", () => {
  const p = mkproj();
  for (const args of [[], ["bogus"], ["add"], ["add", "id"], ["promote", "nope", "x"], ["promote"]]) {
    const r = run(p, ...args);
    assert.equal(r.status, 2, args.join(" "));
    assert.match(r.stderr, /usage/);
  }
  done(p);
});
