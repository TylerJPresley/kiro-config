#!/usr/bin/env node
// List the existing tests a change touched, so a reviewer compares them with the plan.
// usage: node test-diff.mjs [--base REF=HEAD] [--head REF] [--plan FILE] [--cwd DIR]
import { execFileSync } from "node:child_process"; import fs from "node:fs";
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg("--base", "HEAD");
const HEAD = arg("--head");
const PLAN = arg("--plan");
const CWD = arg("--cwd", process.cwd());
const TOUCHED = "MDR";

const IS_TEST = (p) =>
  /(^|\/)(tests?|__tests__)\//.test(p) ||
  /\.(test|spec)\.[cm]?[jt]sx?$/.test(p) ||
  /_test\.(go|py)$/.test(p) ||
  /(^|\/)test_[^/]*\.py$/.test(p);

function git(args) {
  return execFileSync("git", args, { cwd: CWD, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function die(code, msg) {
  if (msg) process.stderr.write(msg + "\n");
  process.exit(code);
}

try {
  git(["rev-parse", "--is-inside-work-tree"]);
} catch {
  die(2, "test-diff: not inside a git repository");
}

// --name-status -z: records are NUL-separated; a record is one token (status[+score])
// then one path, or for R/C two paths (old, new).
function parseNameStatus(raw) {
  const t = raw.split("\0").filter((x) => x.length);
  const rows = [];
  for (let i = 0; i < t.length; i++) {
    const code = t[i][0];
    if (code === "R" || code === "C") {
      rows.push({ code, old: t[++i], path: t[++i] });
    } else {
      rows.push({ code, path: t[++i] });
    }
  }
  return rows;
}

// --numstat -z: "<added>\t<deleted>\t" then NUL path, or for renames
// "<added>\t<deleted>\t" NUL old NUL new. Binary counts are "-".
function parseNumstat(raw) {
  const t = raw.split("\0");
  const map = new Map();
  let i = 0;
  while (i < t.length) {
    const head = t[i++];
    if (!head) break;
    const m = head.match(/^(-|\d+)\t(-|\d+)\t(.*)$/s);
    if (!m) continue;
    const add = m[1] === "-" ? 0 : Number(m[1]);
    const del = m[2] === "-" ? 0 : Number(m[2]);
    let p = m[3];
    if (p === "") { const _old = t[i++]; p = t[i++]; }
    map.set(p, { add, del });
  }
  return map;
}

const range = HEAD ? [`${BASE}..${HEAD}`] : [BASE];
let status, numstat;
try {
  status = parseNameStatus(git(["diff", "-z", "-M", "--name-status", ...range]));
  numstat = parseNumstat(git(["diff", "-z", "-M", "--numstat", ...range]));
} catch (e) {
  die(2, "test-diff: " + (e.message || "git diff failed"));
}

const lines = [];
const touched = []; // paths of M/D/R existing tests
let newCount = 0;

for (const row of status) {
  const probe = row.code === "R" || row.code === "C" ? row.path : row.path;
  if (!IS_TEST(probe) && !(row.old && IS_TEST(row.old))) continue;
  if (row.code === "A") { newCount++; continue; }
  if (!TOUCHED.includes(row.code)) continue;
  const counts = numstat.get(row.path) || numstat.get(row.old) || { add: 0, del: 0 };
  if (row.code === "R") {
    lines.push(`R ${row.old} -> ${row.path} +${counts.add} -${counts.del}`);
  } else {
    lines.push(`${row.code} ${row.path} +${counts.add} -${counts.del}`);
  }
  touched.push(row.path);
}

// Untracked test files count as new when no explicit --head is given.
if (!HEAD) {
  const others = git(["ls-files", "--others", "--exclude-standard", "-z"]).split("\0").filter((x) => x.length);
  for (const p of others) if (IS_TEST(p)) newCount++;
}

for (const l of lines) console.log(l);
console.log(`test-diff: touched=${touched.length} new=${newCount}`);

if (!PLAN) process.exit(0);

// --plan: compare touched tests with the "## Existing tests changed" section.
let planText;
try { planText = fs.readFileSync(PLAN, "utf8"); } catch { die(2, `test-diff: cannot read plan ${PLAN}`); }
const hm = planText.match(/^## Existing tests changed[^\n]*\n/m);
let body = "";
if (hm) {
  const after = planText.slice(hm.index + hm[0].length);
  const next = after.match(/^## /m);
  body = next ? after.slice(0, next.index) : after;
}
const named = new Map(); // path -> reason (may be empty)
for (const line of body.split("\n")) {
  const m = line.match(/^-\s+(.+?)\s*::\s*(.*)$/);
  if (m) named.set(m[1].trim(), m[2].trim());
}

let fail = false;
for (const p of touched) {
  if (!named.has(p)) { console.log(`UNNAMED ${p}`); fail = true; }
  else if (!named.get(p)) { console.log(`NOREASON ${p}`); fail = true; }
}
const touchedSet = new Set(touched);
for (const p of named.keys()) {
  if (!touchedSet.has(p)) console.log(`UNTOUCHED ${p}`);
}
process.exit(fail ? 1 : 0);
