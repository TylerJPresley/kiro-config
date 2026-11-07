import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

const tool = path.join(path.dirname(new URL(import.meta.url).pathname), "usage-breakdown.mjs");

// Fake HOME with transcripts: [{ id, parent, lines (array of objects or raw strings) }].
const fakeHome = (sessions) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "usage-breakdown-"));
  const dir = path.join(home, ".kiro/sessions/cli");
  fs.mkdirSync(dir, { recursive: true });
  sessions.forEach((s, i) => {
    const base = path.join(dir, `${s.id}-0000-0000-0000-000000000000`);
    fs.writeFileSync(base + ".json", JSON.stringify({ parent_session_id: s.parent }));
    fs.writeFileSync(base + ".jsonl", s.lines.map((l) => (typeof l === "string" ? l : JSON.stringify(l))).join("\n") + "\n");
    const t = new Date(Date.now() - (sessions.length - i) * 1000);
    for (const e of [".json", ".jsonl"]) fs.utimesSync(base + e, t, t);
  });
  return home;
};
const run = (home, args = []) => {
  const r = spawnSync("node", [tool, ...args], { encoding: "utf8", env: { PATH: process.env.PATH, HOME: home } });
  fs.rmSync(home, { recursive: true, force: true });
  return r;
};
const big = "a".repeat(1000000); // JSON string of 1,000,002 bytes
const transcript = () => [
  { kind: "Prompt", data: { content: [{ kind: "text", data: big }] } },
  { kind: "AssistantMessage", data: { content: [{ kind: "toolUse", data: { toolUseId: "t1", name: "shell", input: { command: "ls -la" } } }] } },
  { kind: "ToolResults", data: { results: { t1: { tool: { kind: "shell" }, result: "ok" } } } },
  { kind: "AssistantMessage", data: { content: [{ kind: "text", data: { text: "done" } }] } },
];

test("weights each entry by the model calls after it", () => {
  const r = run(fakeHome([{ id: "aaaaaaaa", lines: transcript() }]));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^session aaaaaaaa  calls 2  entries 4  re-sent volume 2\.0 MB/);
  // prompt: 1MB x 2 later calls; tool result sits after call 1, so 1 later call; last assistant text: 0 later
  assert.match(r.stdout, /\n {2}user prompt\s+1\s+1\.0\s+2\.0\s+100%/);
  assert.match(r.stdout, /\n {2}tool call: shell\s+1\s+0\.0\s+0\.0\s+0%/);
  assert.match(r.stdout, /\n {2}tool result: shell\s+1/);
  assert.match(r.stdout, /\n {2}assistant text\s+1/);
  assert.match(r.stdout, /top 8 single items[^\n]*\n\s+2\.0MB\s+1000KB x {2}2 {2}user prompt/);
  assert.match(r.stdout, /tool call: shell {2}ls -la/);
});

test("images count as a fixed 6KB equivalent", () => {
  const lines = transcript();
  lines[0] = { kind: "Prompt", data: { content: [{ kind: "image", data: { bytes: new Array(2000).fill(1) } }] } };
  const r = run(fakeHome([{ id: "aaaaaaaa", lines }]));
  assert.match(r.stdout, /user image \(fixed ~6KB-equiv\)\s+1\s+0\.0/);
  assert.match(r.stdout, /\s6KB x {2}2 {2}user image/);
});

test("--top limits the single-item list", () => {
  const r = run(fakeHome([{ id: "aaaaaaaa", lines: transcript() }]), ["--top", "1"]);
  const items = r.stdout.split("top 1 single items")[1].trim().split("\n").slice(1);
  assert.equal(items.length, 1);
});

test("latest skips subagent sessions; a prefix selects any session", () => {
  const sub = [{ kind: "AssistantMessage", data: { content: [{ kind: "text", data: { text: "x" } }] } }];
  const home = () => fakeHome([{ id: "aaaaaaaa", lines: transcript() }, { id: "bbbbbbbb", parent: "aaaaaaaa", lines: sub }]);
  assert.match(run(home()).stdout, /^session aaaaaaaa  calls 2/);
  assert.match(run(home(), ["bbbb"]).stdout, /^session bbbbbbbb  calls 1  entries 1/);
});

test("empty folder: prints 'no session' and exits 1", () => {
  const r = run(fakeHome([]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no session/);
});

test("malformed transcript line is skipped", () => {
  const lines = transcript();
  lines.splice(2, 0, "{not json");
  const r = run(fakeHome([{ id: "aaaaaaaa", lines }]));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /calls 2  entries 4  re-sent volume 2\.0 MB/);
});
