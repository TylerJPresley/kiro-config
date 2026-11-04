#!/usr/bin/env node
// Advisory lint for StrataBP documents: shape checks a program can decide. No model needed.
// usage: node strata-bp-lint.mjs <file.md> [--strict]
import fs from "node:fs";

const NAMES = ["Vision", "Architecture", "Components", "Specification"];
const AD = "Assumptions and decisions";
const TOPICS = {
  1: ["Need", "Target audience", "Value", "Focus", "Success measures", "Qualities and constraints", "Vocabulary", AD],
  2: ["Parts", "Standing", "Seams between parts", "Seams with the outside", "Shared things", "Scenario paths", AD],
  3: ["Responsibility", "Concepts and states", "Seams", "Rules", "Inside", "Limits", AD],
  4: ["Construction", "Exact seams", "Verification", AD],
};

const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
const strict = process.argv.includes("--strict");
if (!file) { console.log("usage: node strata-bp-lint.mjs <file.md> [--strict]"); process.exit(0); }
if (!fs.existsSync(file)) { console.error(`strata-bp-lint: no such file: ${file}`); process.exit(2); }

const rows = fs.readFileSync(file, "utf8").split("\n");
let count = 0, notSupplied = 0;
const warn = (check, detail, n) => { count++; console.log(`WARN ${check}: ${detail} (line ${n})`); };

let fence = null;            // { lang, open } while inside a fenced block
let layer = null;            // current layer number, null outside any layer
let seen = [];               // layer numbers seen, in order
let pendingScope = null;     // line of a layer heading still awaiting its Scope: line
let lastTopic = -1;

for (let i = 0; i < rows.length; i++) {
  const line = rows[i], n = i + 1, t = line.trim();

  if (/\b(TODO|TBD|FIXME)\b/.test(line)) warn("unfinished", `marker '${line.match(/\b(TODO|TBD|FIXME)\b/)[1]}'`, n);

  const f = t.match(/^```\s*(\S*)/);
  if (fence) { if (/^```\s*$/.test(t)) fence = null; continue; }
  if (f) {
    fence = { lang: f[1] };
    let j = i - 1; while (j >= 0 && rows[j].trim() === "") j--;
    const prev = j >= 0 ? rows[j].trim() : "";
    if (!prev.startsWith("Title:")) warn("diagram-title", "fenced block has no 'Title:' line before it", n);
    else if (fence.lang === "mermaid" && !prev.includes("Key:")) warn("diagram-key", "mermaid Title line has no 'Key:'", j + 1);
    continue;
  }

  const h2 = t.match(/^## (.*)$/);
  if (h2) {
    pendingScope = null; lastTopic = -1; layer = null;
    if (/^Layer\b/.test(h2[1])) {
      const m = h2[1].match(/^Layer ([1-4]): (.+)$/);
      if (!m || NAMES[m[1] - 1] !== m[2].trim()) warn("layer-heading", `'${t}' should read '## Layer N: Name' with N=1..4 and Vision, Architecture, Components, Specification`, n);
      else {
        const num = +m[1];
        if (seen.length && num <= seen.at(-1)) warn("layer-heading", `Layer ${num} is out of order`, n);
        seen.push(num); layer = num; pendingScope = n;
      }
    }
    continue;
  }

  if (t === "") continue;
  if (pendingScope !== null) {
    if (!t.startsWith("Scope:")) warn("scope-line", "first line after the layer heading must start with 'Scope:'", n);
    pendingScope = null;
  }

  const h3 = t.match(/^### (\d+)\. (.+?)\s*$/);
  if (h3 && layer) {
    const idx = TOPICS[layer].indexOf(h3[2]);
    if (idx < 0) warn("topic-order", `'${h3[2]}' is not a Layer ${layer} topic`, n);
    else if (idx < lastTopic) warn("topic-order", `'${h3[2]}' is out of order in Layer ${layer}`, n);
    else lastTopic = idx;
  }

  if (layer) for (const m of line.matchAll(/\bLayer (\d+)\b/g)) {
    if (+m[1] > layer && !/^## /.test(t)) warn("ring", `Layer ${layer} refers outward to Layer ${m[1]}`, n);
  }

  const body = t.replace(/^(?:[-*+]|\d+[.)])\s+/, "");
  if (body.startsWith("Given") && !/^Given .+, when .+, then .+/.test(body)) warn("scenario-form", "must read 'Given ..., when ..., then ...'", n);

  if (/^A\d+\.\d+\./.test(t) && !(t.includes("Basis:") && t.includes("If wrong:"))) warn("reasons", "assumption needs 'Basis:' and 'If wrong:'", n);
  if (/^D\d+\.\d+\./.test(t) && !t.includes("Reason:")) warn("reasons", "decision needs 'Reason:'", n);

  notSupplied += (line.replace(/`[^`]*`/g, "").match(/Not supplied:/g) || []).length;
}

if (!seen.includes(1)) warn("layer-heading", "missing '## Layer 1: Vision'", 1);
if (!seen.includes(2)) warn("layer-heading", "missing '## Layer 2: Architecture'", 1);

console.log(`INFO not-supplied: ${notSupplied}`);
console.log(`strata-bp-lint: ${count} warning(s)`);
process.exit(strict && count ? 1 : 0);
