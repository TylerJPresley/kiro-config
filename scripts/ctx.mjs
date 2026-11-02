#!/usr/bin/env node
// Context usage of the CURRENT Kiro session (newest session-state file, by mtime, matching cwd).
// usage: node ~/.kiro/scripts/ctx.mjs [--session ID] [--cwd DIR]   (session defaults to $KIRO_SESSION_ID)
//
// Reports ONLY the current session. If its percentage is not yet known (a fresh session
// stores null until the server reports usage), it prints "unknown (new session)" and treats
// it as ok — it NEVER falls through to an older session and reports that session's number.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const dir = path.join(os.homedir(), ".kiro/sessions/cli");
const cwd = process.argv.includes("--cwd")
  ? process.argv[process.argv.indexOf("--cwd") + 1]
  : process.cwd();

function loadState(file) {
  // Session-state files are a single JSON object with a `session_state` key.
  // The directory also holds JSONL transcript files; those are not session state.
  let j;
  try {
    j = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  } catch {
    return null; // transcript/JSONL or unreadable
  }
  if (!j || typeof j !== "object" || !j.session_state) return null;
  return j;
}

function pctOf(j) {
  const cm = j.session_state?.conversation_metadata;
  return (
    cm?.last_context_usage?.percentage ??
    j.session_state?.rts_model_state?.context_usage_percentage ??
    null
  );
}

function modelOf(j) {
  const cm = j.session_state?.conversation_metadata;
  return (
    cm?.last_context_usage?.model_id ??
    j.session_state?.rts_model_state?.model_info?.model_id ??
    "?"
  );
}

let files;
try {
  files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
} catch {
  console.log("context: unknown (no sessions dir)");
  process.exit(0);
}

// The current session, in order: --session ID, then $KIRO_SESSION_ID (Kiro sets it for every shell call),
// then the newest session-state file for this cwd (a guess: several sessions can share a folder).
const wanted = (process.argv.includes("--session") ? process.argv[process.argv.indexOf("--session") + 1] : process.env.KIRO_SESSION_ID) || "";
let current = null;
let note = "";
if (wanted) {
  const hit = files.find(({ f }) => f.startsWith(wanted) || wanted.startsWith(f.slice(0, -5)));
  const j = hit && loadState(hit.f);
  if (!j) {
    // Never fall back to another session's number.
    console.log(`context: unknown (session ${wanted.slice(0, 8)} not found)`);
    process.exit(0);
  }
  current = { f: hit.f, j };
} else {
  let newestAny = null;
  for (const { f } of files) {
    const j = loadState(f);
    if (!j) continue;
    if (!newestAny) newestAny = { f, j };
    if (j.cwd === cwd) {
      current = { f, j };
      break;
    }
  }
  if (!current) current = newestAny;
  // Live sessions have a .lock file; several in one folder make the guess above unreliable.
  const live = files.filter(({ f }) => fs.existsSync(path.join(dir, f.replace(/\.json$/, ".lock"))) && loadState(f)?.cwd === cwd).length;
  if (live > 1) note = `  [guess: ${live} live sessions share this folder; pass --session ID]`;
}

if (!current) {
  console.log("context: unknown (no session state found)");
  process.exit(0);
}

const pct = pctOf(current.j);
const id = current.f.slice(0, 8);
if (pct == null) {
  // Not known yet for THIS session — proceed; do not borrow another session's number.
  console.log(`context unknown (new session — no usage reported yet)  (ok)  session ${id}  model ${modelOf(current.j)}${note}`);
  process.exit(0);
}

const level = pct >= 30 ? "HANDOFF-NOW" : pct >= 25 ? "OFFER-RESET" : "ok";
console.log(`context ${pct.toFixed(1)}%  (${level})  session ${id}  model ${modelOf(current.j)}${note}`);
process.exit(0);
