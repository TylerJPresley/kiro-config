#!/usr/bin/env node
// Lint the steering and skills: shape, duplicated rules, total size. No model needed.
// usage: node steering-lint.mjs [--steering-dir DIR] [--skills-dir DIR] [--also PROJECT/.kiro]
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const dirs = [{ s: arg("--steering-dir", path.join(os.homedir(), ".kiro/steering")), k: arg("--skills-dir", path.join(os.homedir(), ".kiro/skills")) }];
const also = arg("--also"); if (also) dirs.push({ s: path.join(also, "steering"), k: path.join(also, "skills") });
const DESC_MAX = 320;
let bad = 0; const fail = (m) => { bad++; console.log("FAIL " + m); };
let total = 0; const lines = new Map(); const warns = [];
const ROLE = /\b(?:Director|Architect|Planner|Implementer|Documenter|Reviewer|Researcher|Security reviewer)\b/; // case-sensitive, whole word: steering states what must hold, agent prompts say who
for (const { s, k } of dirs) {
  if (fs.existsSync(s)) for (const f of fs.readdirSync(s).filter((x) => x.endsWith(".md")).sort()) {
    const t = fs.readFileSync(path.join(s, f), "utf8"); total += t.length;
    if (!/^Intent:\s*\S/m.test(t)) fail(`${f}: missing 'Intent:' line`);
    if (!/^Applies:\s*\S/m.test(t)) fail(`${f}: missing 'Applies:' line`);
    if (/^Prevents:/m.test(t)) fail(`${f}: carries a 'Prevents:' line`);
    const hits = t.split("\n").flatMap((l, i) => (ROLE.test(l) ? [i + 1] : [])); if (hits.length) warns.push(`steering lint WARN: ${f}: ${hits.length} line(s) name a role (${hits.map((n) => "L" + n).join(", ")})`);
    for (const l of t.split("\n")) { const n = l.trim().replace(/\s+/g, " ").toLowerCase(); if (n.length >= 60 && !n.startsWith("#")) (lines.get(n) ?? lines.set(n, new Set()).get(n)).add(f); }
  }
  if (fs.existsSync(k)) for (const d of fs.readdirSync(k)) {
    if (!fs.statSync(path.join(k, d)).isDirectory()) continue;
    const p = path.join(k, d, "SKILL.md");
    if (!fs.existsSync(p)) { fail(`skill ${d}: no SKILL.md`); continue; }
    const t = fs.readFileSync(p, "utf8"); const fm = t.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) { fail(`skill ${d}: no frontmatter`); continue; }
    const name = (fm[1].match(/^name:\s*"?([^"\n]+)"?/m) || [])[1]; const desc = (fm[1].match(/^description:\s*"?(.+?)"?$/m) || [])[1];
    if (name !== d) fail(`skill ${d}: name '${name}' != directory`);
    if (!desc) fail(`skill ${d}: no description`); else if (desc.length > DESC_MAX) fail(`skill ${d}: description ${desc.length} > ${DESC_MAX} chars (it is always loaded)`);
  }
}
for (const [l, fs_] of lines) if (fs_.size > 1) fail(`duplicated rule in ${[...fs_].join(", ")}: "${l.slice(0, 80)}…"`);
console.log(`always-on steering: ${total} bytes (~${Math.round(total / 4)} tokens)`);
console.log(bad ? `${bad} problem(s)` : "steering lint OK"); for (const w of warns) console.log(w); process.exit(bad ? 1 : 0);
