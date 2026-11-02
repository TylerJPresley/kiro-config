import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const here = path.dirname(new URL(import.meta.url).pathname);
const tool = path.join(here, "ctx.mjs");
const scratch = path.join(here, "..", "scratch");

// A fake HOME with session-state files: [{ id, cwd, pct, mtime (seconds ago), lock }].
const fakeHome = (sessions) => {
  fs.mkdirSync(scratch, { recursive: true });
  const home = fs.mkdtempSync(path.join(scratch, "ctx-"));
  const dir = path.join(home, ".kiro/sessions/cli");
  fs.mkdirSync(dir, { recursive: true });
  for (const s of sessions) {
    const f = path.join(dir, `${s.id}-0000-0000-0000-000000000000.json`);
    const j = { session_id: s.id, cwd: s.cwd, session_state: { agent_name: "orchestrator", conversation_metadata: s.pct == null ? {} : { last_context_usage: { percentage: s.pct, model_id: "m" } } } };
    fs.writeFileSync(f, JSON.stringify(j));
    const t = new Date(Date.now() - s.ago * 1000);
    fs.utimesSync(f, t, t);
    if (s.lock) fs.writeFileSync(f.replace(/\.json$/, ".lock"), "");
  }
  return home;
};
const run = (home, args = [], env = {}) => {
  const r = spawnSync("node", [tool, "--cwd", "/work", ...args], { encoding: "utf8", env: { PATH: process.env.PATH, HOME: home, ...env } });
  fs.rmSync(home, { recursive: true, force: true });
  return r.stdout.trim();
};
const two = () => [
  { id: "aaaaaaaa", cwd: "/work", pct: 12, ago: 600, lock: true }, // this session, older mtime
  { id: "bbbbbbbb", cwd: "/work", pct: null, ago: 5, lock: true }, // another session, newer, same folder
];

test("KIRO_SESSION_ID picks this session even when another in the same folder is newer", () => {
  const out = run(fakeHome(two()), [], { KIRO_SESSION_ID: "aaaaaaaa-0000-0000-0000-000000000000" });
  assert.match(out, /context 12\.0%/);
  assert.match(out, /session aaaaaaaa/);
});

test("--session overrides the environment", () => {
  const sessions = [...two(), { id: "cccccccc", cwd: "/work", pct: 27, ago: 900, lock: false }];
  const out = run(fakeHome(sessions), ["--session", "cccccccc"], { KIRO_SESSION_ID: "aaaaaaaa" });
  assert.match(out, /context 27\.0% {2}\(OFFER-RESET\)/);
});

test("an unknown session id says so and never borrows another session's number", () => {
  const out = run(fakeHome(two()), ["--session", "zzzzzzzz"]);
  assert.match(out, /not found/);
  assert.doesNotMatch(out, /12\.0%/);
});

test("without an id the newest session in the folder is used, with an ambiguity warning", () => {
  const out = run(fakeHome(two()));
  assert.match(out, /session bbbbbbbb/);
  assert.match(out, /2 live sessions share this folder/);
});

test("no warning when only one session is live in the folder", () => {
  const out = run(fakeHome([{ id: "aaaaaaaa", cwd: "/work", pct: 31, ago: 5, lock: true }]));
  assert.match(out, /context 31\.0% {2}\(HANDOFF-NOW\)/);
  assert.doesNotMatch(out, /share this folder/);
});
