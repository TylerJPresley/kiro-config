import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

const tool = path.join(path.dirname(new URL(import.meta.url).pathname), "kiro-usage.mjs");

// Fake HOME with sessions: [{ id, agent, cwd, from, to, parent, turns, raw }].
const fakeHome = (sessions) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "kiro-usage-"));
  const dir = path.join(home, ".kiro/sessions/cli");
  fs.mkdirSync(dir, { recursive: true });
  sessions.forEach((s, i) => {
    const f = path.join(dir, `${s.id}-0000-0000-0000-000000000000.json`);
    fs.writeFileSync(f, s.raw ?? JSON.stringify({ cwd: s.cwd, title: s.id, created_at: s.from, updated_at: s.to, parent_session_id: s.parent, session_state: { agent_name: s.agent, conversation_metadata: { user_turn_metadatas: s.turns } } }));
    const t = new Date(Date.now() - (sessions.length - i) * 1000);
    fs.utimesSync(f, t, t);
  });
  return home;
};
const run = (home, args) => {
  const r = spawnSync("node", [tool, ...args], { encoding: "utf8", env: { PATH: process.env.PATH, HOME: home } });
  fs.rmSync(home, { recursive: true, force: true });
  return r;
};
const fixture = () => [
  { id: "aaaaaaaa", agent: "director", cwd: "/work/a", from: "2025-01-01T00:00:00Z", to: "2025-01-02T00:00:00Z", turns: [
    { metering_usage: 10, input_token_count: 100, output_token_count: 50, total_request_count: 3, final_context_usage_percentage: 15 },
    { metering_usage: [{ value: 5 }, { usage: 2 }], input_token_count: 200, output_token_count: 10, total_request_count: 2, final_context_usage_percentage: 75 } ] },
  { id: "bbbbbbbb", agent: "worker", cwd: "/work/b", from: "2025-01-03T00:00:00Z", to: "2025-01-03T00:00:00Z", turns: [
    { metering_usage: { value: 20 }, input_token_count: 300, output_token_count: 5, total_request_count: 25, final_context_usage_percentage: 5 } ] },
];

test("all: totals across sessions, credit shapes summed", () => {
  const r = run(fakeHome(fixture()), ["all"]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^sessions: 2  turns: 3/);
  assert.match(r.stdout, /credits: 37  input: 600  output: 65  cache-read: 0  cache-write: 0  requests: 30  cycles: 0/);
  assert.match(r.stdout, /\n {2}director\s+1\s+17\s/);
  assert.match(r.stdout, /\n {2}worker\s+1\s+20\s/);
  assert.match(r.stdout, /turns with >20 model requests: 1 of 3  \(credits 20, 54% of total/);
  assert.match(r.stdout, /turns started\/ended at >=70% context: 1 of 3  \(credits in them: 7, 19% of total\)/);
});

test("latest picks only the newest session", () => {
  const r = run(fakeHome(fixture()), []);
  assert.match(r.stdout, /^sessions: 1  turns: 1/);
  assert.match(r.stdout, /credits: 20 /);
});

test("by-session: total, ranking, per-directory and per-day groups", () => {
  const r = run(fakeHome(fixture()), ["by-session"]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /TOTAL 37 credits, 2 sessions/);
  const top = r.stdout.split("TOP SESSIONS\n")[1].split("\n");
  assert.match(top[0], /^bbbbbbbb worker .*cred\s+20 \(54%\)/);
  assert.match(top[1], /^aaaaaaaa director .*2025-01-01\.\.2025-01-02 turns\s+2 reqs\s+5 cred\s+17 \(46%\) maxctx 75%/);
  assert.match(r.stdout, /BY WORKING DIRECTORY\n\s+20 \/work\/b\n\s+17 \/work\/a/);
  assert.match(r.stdout, /BY DAY[^\n]*\n2025-01-02 17\n2025-01-03 20\n/);
});

test("by-context: director buckets credits per request", () => {
  const r = run(fakeHome(fixture()), ["by-context"]);
  assert.match(r.stdout, /^agent director:/);
  assert.match(r.stdout, /\n 10%\s+1\s+10\s+3\s+3\.33/);
  assert.match(r.stdout, /\n 70%\s+1\s+7\s+2\s+3\.50/);
  assert.doesNotMatch(r.stdout, /\n 0%/);
  const w = run(fakeHome(fixture()), ["by-context", "--agent", "worker"]);
  assert.match(w.stdout, /^agent worker:/);
  assert.match(w.stdout, /\n {2}0%\s+1\s+20\s+25\s+0\.80/);
});

test("empty sessions folder: zero totals, no crash", () => {
  const r = run(fakeHome([]), ["all"]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^sessions: 0  turns: 0/);
  assert.match(r.stdout, /credits: 0 /);
  const s = run(fakeHome([]), ["by-session"]);
  assert.match(s.stdout, /TOTAL 0 credits, 0 sessions/);
});

test("by-session skips a malformed session file", () => {
  const f = fixture();
  f.push({ id: "cccccccc", raw: "{not json" });
  const r = run(fakeHome(f), ["by-session"]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /TOTAL 37 credits, 2 sessions/);
});

test("--top limits ranked rows", () => {
  const r = run(fakeHome(fixture()), ["by-session", "--top", "1"]);
  const top = r.stdout.split("TOP SESSIONS\n")[1].split("\n\n")[0].split("\n");
  assert.equal(top.length, 1);
});

for (const args of [[], ["all"], ["cccccccc"]]) {
  test(`view [${args.join(" ")}] skips a malformed session file`, () => {
    const f = fixture();
    f.push({ id: "cccccccc", raw: "{not json" });
    const r = run(fakeHome(f), args);
    assert.equal(r.status, 0, r.stderr);
    assert.doesNotMatch(r.stderr, /SyntaxError/);
    if (args[0] === "all") assert.match(r.stdout, /^sessions: 2  turns: 3/);
  });
}
