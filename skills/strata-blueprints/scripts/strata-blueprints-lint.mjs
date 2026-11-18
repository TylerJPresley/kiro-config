#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Advisory lint for Strata Blueprints documents: shape checks a program can decide. No model needed.
// usage: node strata-blueprints-lint.mjs <file.md> [--strict]
//        node strata-blueprints-lint.mjs <folder> [--strict]
//        node strata-blueprints-lint.mjs --impact <id> <file.md or folder>
import fs from "node:fs";
import path from "node:path";

const NAMES = ["Vision", "Structure", "Detail"];
const TOPICS = {
  1: ["Need", "Target audience", "Value", "Focus", "Success measures", "Qualities and constraints", "Vocabulary", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
  2: ["Parts", "Standing", "Seams between parts", "Seams with the outside", "Shared things", "Scenario paths", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
  3: ["Responsibility", "Concepts and states", "Seams", "Rules", "Inside", "Limits", "Construction", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
};
// Topics whose items carry a number (each item, written <topic>.<count>, at the start of its line).
const NEEDS_ID = {
  1: ["Value", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
  2: ["Scenario paths", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
  3: ["Rules", "Limits", "Construction", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
};
// A file whose first line starts with this is a condensed copy: omitted topics read None., so the topics check skips it.
const MARKER_PREFIX = "<!-- strata-blueprints: condensed";
const hasMarker = (firstLine) => (firstLine || "").trim().startsWith(MARKER_PREFIX);
const DOC_LAYER = (doc) => (doc === "vision" ? 1 : doc === "structure" ? 2 : 3);
const topicNo = (layer, name) => (TOPICS[layer] ? TOPICS[layer].indexOf(name) + 1 || null : null);

// An item is written with its number, <topic>.<count>: 9.1, 6.2, 7.1. Its id is the document it sits in plus the number:
// vision-9.1, structure-6.2, detail.ledger-7.1. A citation writes the id in full.
const NUMBER = /^\**([1-9]\d*)\.([1-9]\d*)(?!\w|-|\.\d)(?=[.:)*\s]|$)/;
const IDCORE = String.raw`(?:vision|structure|detail\.[a-z0-9]+)-[1-9]\d*\.[1-9]\d*`;
const TOKEN = new RegExp(String.raw`(?<![\w.-])(${IDCORE})(?!\w|-|\.\d)`, "g");
const OWNID = new RegExp(String.raw`^\**(${IDCORE})(?!\w|-|\.\d)(?=[.:)*\s]|$)`);
const START = (s) => NUMBER.test(s) || OWNID.test(s);
const parseId = (id) => { const m = id.match(/^(.+)-([1-9]\d*)\.([1-9]\d*)$/); return { id, doc: m[1], topic: +m[2], item: +m[3] }; };
const clean = (s) => s.replace(/`[^`]*`/g, " ");
const docOf = (e) => (e.layer === 1 ? "vision" : e.layer === 2 ? "structure" : e.layer === 3 && e.entry !== null ? `detail.${e.entry.toLowerCase()}` : null);

const USAGE = "usage: node strata-blueprints-lint.mjs <file.md> [--strict] | <folder> [--strict] | --impact <id> <file.md or folder>";
if (process.argv[2] === "--impact") runImpact(process.argv.slice(3));

const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
const strict = process.argv.includes("--strict");
if (!file) { console.log(USAGE); process.exit(0); }
const target = loadTarget(file);
const rows = target.rows;
let count = 0, notSupplied = 0;
const warnAt = (check, detail, loc) => { count++; console.log(`WARN ${check}: ${detail} (${loc})`); };
const warn = (check, detail, n) => warnAt(check, detail, target.where(n));
if (target.folder) folderChecks(target.folder, warnAt);
const MARK = /^(?:[-*+]|\d+[.)])\s+/;

let fence = null;            // { lang, open } while inside a fenced block
let layer = null;            // current layer number, null outside any layer
let seen = [];               // layer numbers seen, in order
let pendingScope = null;     // line of a layer heading still awaiting its Scope: line
let lastTopic = -1;
let entry = null;            // current Detail entry's part name, or null
let lastEntryTopic = -1;     // last entry topic index seen
const units = [];            // written layers (1, 2) and Layer 3 entries: { layer, name, line, heads }, checked at the end
let unit = null;             // the open unit, or null

for (let i = 0; i < rows.length; i++) {
  const line = rows[i], n = i + 1, t = line.trim();

  if (/\b(TODO|TBD|FIXME)\b/.test(line)) warn("unfinished", `marker '${line.match(/\b(TODO|TBD|FIXME)\b/)[1]}'`, n);

  const f = t.match(/^(```|~~~)\s*(\S*)/);
  if (fence) { if (t.startsWith(fence.mark) && t.slice(3).trim() === "") fence = null; continue; }
  if (f) {
    fence = { lang: f[2], mark: f[1] };
    let j = i - 1; while (j >= 0 && rows[j].trim() === "") j--;
    const prev = j >= 0 ? rows[j].trim() : "";
    if (!prev.startsWith("Title:")) warn("diagram-title", "fenced block has no 'Title:' line before it", n);
    else if (fence.lang === "mermaid" && !prev.includes("Key:")) warn("diagram-key", "mermaid Title line has no 'Key:'", j + 1);
    continue;
  }

  const h2 = t.match(/^## (.*)$/);
  if (h2) {
    pendingScope = null; lastTopic = -1; layer = null;
    entry = null; lastEntryTopic = -1; unit = null;
    if (/^Layer\b/.test(h2[1])) {
      const m = h2[1].match(/^Layer (\d+): (.+)$/);
      if (!m || +m[1] < 1 || +m[1] > 3 || NAMES[m[1] - 1] !== m[2].trim()) {
        warn("layer-heading", `'${t}' should read '## Layer N: Name' where N is 1 to 3 and the names are ${NAMES.map((x, i) => `${i + 1} ${x}`).join(", ")}`, n);
      } else {
        const num = +m[1];
        if (seen.length && num <= seen.at(-1)) warn("layer-heading", `Layer ${num} is out of order`, n);
        seen.push(num); layer = num; pendingScope = n;
        if (num < 3) { unit = { layer: num, name: null, line: n, heads: new Set() }; units.push(unit); }
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
  if (h3 && layer && layer < 3 && unit) unit.heads.add(h3[2]);
  if (h3 && layer) {
    const idx = TOPICS[layer].indexOf(h3[2]);
    if (idx < 0) warn("topic-order", `'${h3[2]}' is not a Layer ${layer} topic`, n);
    else if (idx < lastTopic) warn("topic-order", `'${h3[2]}' is out of order in Layer ${layer}`, n);
    else lastTopic = idx;
  }

  const h3part = t.match(/^### (.+?) \(part\)\s*$/);
  if (t.startsWith("### ")) {
    if (layer === 3 && h3part) { entry = h3part[1]; lastEntryTopic = -1; unit = { layer: 3, name: entry, line: n, heads: new Set() }; units.push(unit); }
    else { entry = null; if (layer === 3) unit = null; }
  }

  if (entry !== null) {
    const h4 = t.match(/^#### (\d+)\. (.+?)\s*$/);
    if (h4) {
      if (unit) unit.heads.add(h4[2]);
      const idx = TOPICS[3].indexOf(h4[2]);
      if (idx < 0) warn("topic-order", `'${h4[2]}' is not a Layer 3 topic in the entry '${entry}'`, n);
      else if (idx < lastEntryTopic) warn("topic-order", `'${h4[2]}' is out of order in the entry '${entry}'`, n);
      else lastEntryTopic = idx;
    }
  }

  if (layer) for (const m of line.matchAll(/\bLayer (\d+)\b/g)) {
    if (+m[1] > layer && !/^## /.test(t)) warn("ring", `Layer ${layer} refers outward to Layer ${m[1]}`, n);
  }

  notSupplied += (line.replace(/`[^`]*`/g, "").match(/Not supplied:/g) || []).length;
}

if (!seen.includes(1)) warn("layer-heading", "missing '## Layer 1: Vision'", 1);
if (!seen.includes(2)) warn("layer-heading", `missing '## Layer 2: ${NAMES[1]}'`, 1);

for (const u of units) {
  if (!u.heads.size) continue;
  if (target.condensedAt(u.line)) continue;
  for (const name of TOPICS[u.layer]) {
    if (!u.heads.has(name)) warn("topics", `topic '${name}' is missing in ${u.name === null ? `Layer ${u.layer}` : `the entry '${u.name}'`}`, u.line);
  }
}

// --- ids, citations, reasons, costs, risks and open concerns ---------------
const els = readElements(rows);
assignOwn(els);
for (const e of els) {
  e.cites = [];
  for (const c of e.body.matchAll(TOKEN)) if (c[1] !== (e.own && e.own.id) && c[1] !== e.oldTok) e.cites.push({ id: c[1], at: c.index });
  e.topicNo = e.layer ? topicNo(e.layer, e.topic) : null;
}
// scenario-form: a scenario reads Given, when, then, after its own id and after a Realizes sentence.
for (const e of els) {
  const scen = e.text.replace(/^\**/, "").replace(new RegExp(String.raw`^(?:${IDCORE}|[1-9]\d*\.[1-9]\d*)[.:)]*\**\s+`), "").replace(new RegExp(String.raw`^Realizes\s+${IDCORE}[.:)]*\s+`), "");
  if (scen.startsWith("Given") && !/^Given .+, when .+, then .+/.test(scen)) warn("scenario-form", "must read 'Given ..., when ..., then ...'", e.n);
}
const live = els.filter((e) => e.layer !== null);
const defined = new Map();             // id -> element, any own id in layers 1 to 3
const slugsListed = [];                // part names from Layer 2 Parts
for (const e of live) if (e.own && !defined.has(e.own.id)) defined.set(e.own.id, e);
for (const e of live) {
  if (e.layer !== 2 || e.topic !== "Parts" || e.table) continue;
  const pm = e.text.replace(/^\**/, "").match(/^(.+?)\s*\(part\)/);
  if (pm) slugsListed.push({ name: pm[1].replace(/\*+$/, "").trim(), n: e.n });
}
for (const p of slugsListed) if (!/^[A-Za-z0-9]+$/.test(p.name)) warn("id", `part name '${p.name}' is not one word`, p.n);
const partSlugs = new Set(slugsListed.map((p) => p.name.toLowerCase()));

const firstOf = new Map();
for (const e of live) {
  if (!e.own) {
    const exempt = e.table || /^(None\.|Not supplied:|Title:)/.test(e.body);
    if (e.topic && !exempt && !(e.layer === 3 && e.entry === null) && NEEDS_ID[e.layer].includes(e.topic)) warn("id", `an item under ${e.topic} has no number`, e.n);
    continue;
  }
  const { id, doc, topic } = e.own;
  if (e.oldForm) warn("id", `write '${topic}.${e.own.item}.' at the start of the item; the document goes only in a citation`, e.n);
  if (e.layer === 3 && partSlugs.size && !partSlugs.has(doc.slice(7))) warn("id", `${id} names '${doc.slice(7)}', which is not a part in Layer 2 Parts`, e.n);
  if (e.topicNo !== null && topic !== e.topicNo) warn("id", `${id} is numbered for topic ${topic}, but sits under ${e.topic}`, e.n);
  if (firstOf.has(id)) warn("id", `${id} repeats the one on ${target.where(firstOf.get(id).n)}`, e.n);
  else firstOf.set(id, e);
}

// id-ref: each citation points to a defined id, inward, and never into another part.
for (const e of live) {
  const ab = e.body.indexOf("Answered by ");
  const risks = e.topic === "Risks";
  for (const c of e.cites) {
    const p = parseId(c.id);
    const answer = risks && ab >= 0 && c.at > ab;
    if (e.layer === 3 && e.entry !== null && p.doc.startsWith("detail.") && p.doc !== `detail.${e.entry.toLowerCase()}`) {
      warn("id-ref", `${c.id} belongs to another part, and the entry '${e.entry}' may not cite it`, e.n);
      continue;
    }
    if (answer) continue;
    if (!defined.has(c.id)) warn("id-ref", `${c.id} is not defined`, e.n);
    else if (DOC_LAYER(p.doc) > e.layer) warn("id-ref", `${c.id} is defined in ${p.doc}, which is outward of Layer ${e.layer}`, e.n);
  }
}

// reasons: Assumptions need Basis and If wrong, Decisions need Reason; read from the id's topic number.
for (const e of live) {
  if (!e.own || e.body.includes("Not supplied:")) continue;
  const l = e.layer;
  const a = l === 2 ? 10 : 11, d = l === 2 ? 11 : 12;
  if (e.own.topic === a && !(e.body.includes("Basis:") && e.body.includes("If wrong:"))) warn("reasons", "assumption needs 'Basis:' and 'If wrong:'", e.n);
  if (e.own.topic === d && !e.body.includes("Reason:")) warn("reasons", "decision needs 'Reason:'", e.n);
}

// scenario-trace: a Layer 1 value scenario is traced by a Realizes sentence in Layer 2 and in Layer 3.
{
  const traced = { 2: new Set(), 3: new Set() };
  for (const e of live) {
    if (e.layer < 2) continue;
    for (const m of e.body.matchAll(new RegExp(String.raw`Realizes\s+(${IDCORE})(?!\w|-|\.\d)`, "g"))) traced[e.layer].add(m[1]);
  }
  for (const e of live) {
    if (e.layer !== 1 || !e.own || e.own.topic !== 3) continue;
    if (seen.includes(2) && !traced[2].has(e.own.id)) warn("scenario-trace", `${e.own.id} has no path in Layer 2`, e.n);
    if (seen.includes(3) && !traced[3].has(e.own.id)) warn("scenario-trace", `${e.own.id} has no rule in Layer 3`, e.n);
  }
}

// --- costs and risks topics ----------------------------------------------
const AMOUNT = /^(?:[A-Za-z]+ )*[$€£¥]?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?\s+[A-Za-z][^\n]*$/;
const validAmount = (s) => /^Not supplied:\s*\S/.test(s) || AMOUNT.test(s);
const SEVERITY = ["High", "Medium", "Low", "Not rated"];
const SHAPE = { Costs: { check: "cost-shape", no: { 1: 8, 2: 7, 3: 8 } }, Risks: { check: "risk-shape", no: { 1: 9, 2: 8, 3: 9 } }, "Open Concerns": { check: "concern-shape", no: { 1: 10, 2: 9, 3: 10 } } };

for (const e of live) {
  const sh = e.topic && SHAPE[e.topic];
  if (!sh || (e.layer === 3 && e.entry === null)) continue;
  const check = sh.check, label = e.topic, kind = e.topic;
  if (e.table) { warn(check, "a table line; write the topic as a list", e.n); continue; }
  if (e.body === "None." || /^Not supplied:\s*\S/.test(e.body)) continue;
  const mine = e.own && e.own.topic === sh.no[e.layer];
  const im = e.own && e.body.slice(e.ownEnd).match(/^\.\s+(.*)$/);
  if (!mine || !im) {
    warn(check, `a line under ${label} must be 'None.' or start '${sh.no[e.layer]}.<n>.'`, e.n);
    continue;
  }
  const own = `${e.own.topic}.${e.own.item}`;
  const rest = im[1].trim();
  if (kind === "Costs") {
    const pb = rest.indexOf(". Paid by ");
    const head = pb > 0 ? rest.slice(0, pb) : "";
    const payer = pb > 0 ? rest.slice(pb + 10) : "";
    let ok = /^\S.*\.$/.test(payer);
    const gwt = head.match(/^Given .+, when .+, then it costs (.+)$/);
    if (gwt) ok = ok && validAmount(gwt[1].trim());
    else if (ok) {
      ok = false;
      for (let k = head.indexOf(": "); k >= 0; k = head.indexOf(": ", k + 1)) if (validAmount(head.slice(k + 2).trim())) { ok = true; break; }
    }
    if (!ok) warn(check, `a cost must read '${own}. Given <condition or volume>, when <the subject is built, run or changed>, then it costs <amount>. Paid by <who>.' with a valid amount (the older form '${own}. <What>: <amount>. Paid by <who>.' is also accepted)`, e.n);
  } else if (kind === "Open Concerns") {
    const rb = rest.indexOf(". Raised by ");
    const who = rb > 0 ? rest.slice(rb + 12) : "";
    if (rb <= 0 || !/^Given .+, when .+, then .+/.test(rest.slice(0, rb)) || !/^\S.*\.$/.test(who)) {
      warn(check, `an open concern must read '${own}. Given ..., when ..., then .... Raised by <who>.'`, e.n);
    }
  } else {
    const sv = rest.indexOf(". Severity: "), ab = rest.indexOf(". Answered by ");
    const sev = sv > 0 && ab > sv ? rest.slice(sv + 12, ab) : "";
    const ans = ab > 0 ? rest.slice(ab + 14) : "";
    if (sv <= 0 || ab <= sv || !/^Given .+, when .+, then .+/.test(rest.slice(0, sv)) || !SEVERITY.includes(sev) || !/^\S.*\.$/.test(ans)) {
      warn(check, `a risk must read '${own}. Given ..., when ..., then .... Severity: High, Medium, Low or Not rated. Answered by <answer>.'`, e.n);
      continue;
    }
    if (ans.startsWith("Not supplied:")) continue;
    const toks = [...ans.matchAll(TOKEN)].map((m) => m[1]);
    if (!toks.length) warn("risk-ref", "'Answered by' names no id and does not begin 'Not supplied:'", e.n);
    for (const tok of toks) {
      const at = defined.has(tok) ? DOC_LAYER(parseId(tok).doc) : null;
      if (at === null) warn("risk-ref", `${tok} is not defined in a layer`, e.n);
      else if (at > e.layer) warn("risk-ref", `${tok} is defined in Layer ${at}, outward of Layer ${e.layer}`, e.n);
    }
  }
}

console.log(`INFO not-supplied: ${notSupplied}`);
console.log(`strata-blueprints-lint: ${count} warning(s)`);
process.exit(strict && count ? 1 : 0);

// =========================================================================
// Folder mode and impact mode. Function declarations, hoisted; they use no
// constant that is defined after the first call.
// =========================================================================

// The elements of a text: a bullet with its wrapped and nested lines, a paragraph, or a table row.
// Each carries its first line, its layer, topic and open entry, and whether it is a table row.
function readElements(rows) {
  const els = [];
  let cur = null, layer = null, topic = null, entry = null, fence = null;
  const close = () => { cur = null; };
  const start = (n, text, indent, list, table = false) => { cur = { n, text, indent, list, table, layer, topic, entry }; els.push(cur); };
  for (let i = 0; i < rows.length; i++) {
    const line = rows[i], t = line.trim(), n = i + 1;
    const f = t.match(/^(```|~~~)/);
    if (fence) { if (t.startsWith(fence) && t.slice(3).trim() === "") fence = null; continue; }
    if (f) { fence = f[1]; close(); continue; }
    if (t === "") { close(); continue; }
    if (/^#{1,6}\s/.test(t)) {
      close();
      if (/^## /.test(t)) {
        const m = t.match(/^## Layer ([123]): (.+)$/);
        layer = m && NAMES[m[1] - 1] === m[2].trim() ? +m[1] : null;
        topic = null; entry = null;
      } else if (/^### /.test(t)) {
        const pe = t.match(/^### (.+?) \(part\)\s*$/);
        const tp = t.match(/^### \d+\. (.+?)\s*$/);
        if (layer === 3 && pe) { entry = pe[1]; topic = null; }
        else if (tp) { topic = tp[1]; if (layer === 3) entry = null; }
        else { topic = null; if (layer === 3) entry = null; }
      } else if (/^#### /.test(t) && layer === 3 && entry !== null) {
        const tp = t.match(/^#### \d+\. (.+?)\s*$/);
        topic = tp ? tp[1] : null;
      }
      continue;
    }
    if (t.startsWith("|")) {
      close();
      if (!/^\|[\s:|-]+\|?$/.test(t)) { start(n, t, 0, false, true); close(); }
      continue;
    }
    const indent = line.length - line.trimStart().length;
    const mk = t.match(/^(?:[-*+]|\d+[.)])\s+(.*)$/);
    if (mk && indent <= 1) { start(n, mk[1], indent, true); continue; }
    if (cur && !(indent <= 1 && START(clean(t)))) { cur.text += " " + t; continue; }
    if (mk) start(n, mk[1], indent, true); else start(n, t, indent, false);
  }
  for (const e of els) e.text = e.text.trim();
  return els;
}

// Each element that starts with its number gets its full id: the document it sits in plus the number. A full id at the start
// (the old form) is read as that number and flagged by the id check. With no document (outside a layer, in a view, in Layer 3
// with no open entry) the number is not an id.
function assignOwn(els) {
  for (const e of els) {
    e.body = clean(e.text).trim();
    e.own = null; e.oldForm = false; e.oldTok = null; e.ownEnd = 0;
    const nm = e.body.match(NUMBER), fm = nm ? null : e.body.match(OWNID);
    if (fm) e.oldTok = fm[1];
    const doc = docOf(e);
    if (!doc) continue;
    let topic, item;
    if (nm) { topic = +nm[1]; item = +nm[2]; e.ownEnd = nm[0].length; }
    else if (fm) { const p = parseId(fm[1]); topic = p.topic; item = p.item; e.oldForm = true; e.ownEnd = fm[0].length; }
    else continue;
    e.own = { id: `${doc}-${topic}.${item}`, doc, topic, item };
  }
}

function die(msg) { console.error(`strata-blueprints-lint: ${msg}`); process.exit(2); }

// Load a file or a folder. Returns { rows, where(n), folder }.
function loadTarget(arg) {
  if (!fs.existsSync(arg)) die(`no such file: ${arg}`);
  const st = fs.statSync(arg);
  if (st.isDirectory()) return loadFolder(arg);
  if (!st.isFile()) die(`not a file: ${arg}`);
  let text;
  try { text = fs.readFileSync(arg, "utf8"); } catch (e) { die(`cannot read ${arg}: ${e.code || e.message}`); }
  const rows = text.split("\n");
  return { rows, where: (n) => `line ${n}`, folder: null, condensedAt: () => hasMarker(rows[0]) };
}

function slugOf(name) { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

// The lines of a text outside fenced blocks, as { n, t } (1-based line, trimmed text).
function* plainLines(rows) {
  let fence = null;
  for (let i = 0; i < rows.length; i++) {
    const t = rows[i].trim();
    const f = t.match(/^(```|~~~)/);
    if (fence) { if (t.startsWith(fence) && t.slice(3).trim() === "") fence = null; continue; }
    if (f) { fence = f[1]; continue; }
    yield { n: i + 1, t };
  }
}

// Parts and Standing lines of the structure file.
function readStructure(rows) {
  const parts = [], standing = [];
  let topic = null;
  for (const { n, t } of plainLines(rows)) {
    if (/^## /.test(t)) { topic = null; continue; }
    const h = t.match(/^### \d+\. (.+?)\s*$/);
    if (h) { topic = h[1]; continue; }
    const body = t.replace(/^(?:[-*+]|\d+[.)])\s+/, "").replace(/^\*+/, "");
    if (topic === "Parts") {
      const m = body.match(/^(.+?)\s*\(part\)/);
      if (m) parts.push({ name: m[1].replace(/\*+$/, "").trim(), n });
    } else if (topic === "Standing") {
      const m = body.match(/^(.+?)\*{0,2}:\s*\**\s*(.+?)\s*$/);
      if (m) standing.push({ part: m[1].trim(), text: m[2].replace(/\.$/, "").trim(), n });
    }
  }
  return { parts, standing };
}

function loadFolder(dir) {
  const isFile = (n) => { try { return fs.statSync(path.join(dir, n)).isFile(); } catch { return false; } };
  const all = fs.readdirSync(dir).filter(isFile);
  const names = [];
  const hasVision = all.includes("sbp-vision.md"), hasStructure = all.includes("sbp-structure.md");
  const details = all.filter((n) => /^sbp-detail-.+\.md$/.test(n)).sort();
  if (!hasVision && !hasStructure && !details.length) die(`no sbp-vision.md, sbp-structure.md or sbp-detail-*.md in ${dir}`);
  const read = (n) => {
    try { return fs.readFileSync(path.join(dir, n), "utf8").split("\n"); } catch (e) { die(`cannot read ${path.join(dir, n)}: ${e.code || e.message}`); }
  };
  const files = {};
  if (hasVision) { names.push("sbp-vision.md"); files["sbp-vision.md"] = read("sbp-vision.md"); }
  let structure = { parts: [], standing: [] };
  if (hasStructure) { names.push("sbp-structure.md"); files["sbp-structure.md"] = read("sbp-structure.md"); structure = readStructure(files["sbp-structure.md"]); }
  const order = structure.parts.map((p) => slugOf(p.name));
  const rank = (n) => { const i = order.indexOf(n.slice(11, -3)); return i < 0 ? order.length : i; };
  const ordered = [...details].sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : 1));
  for (const n of ordered) { names.push(n); files[n] = read(n); }
  // Assemble one virtual document and keep a map from each virtual row to (file, line).
  const rows = [], map = [];
  let firstDetail = true;
  const condensed = new Set();
  names.forEach((name, k) => {
    const src = files[name];
    const drop = new Set();
    if (hasMarker(src[0])) { condensed.add(name); drop.add(0); if (src.length > 1 && src[1].trim() === "") drop.add(1); }
    const nextNonBlank = (from) => { let j = from; while (j < src.length && src[j].trim() === "") j++; return j; };
    if (k > 0) {
      let j = nextNonBlank(drop.has(1) ? 2 : drop.has(0) ? 1 : 0);
      if (j < src.length && /^# /.test(src[j])) { drop.add(j); if (j + 1 < src.length && src[j + 1].trim() === "") drop.add(j + 1); j = nextNonBlank(j + 1); }
      if (name.startsWith("sbp-detail-")) {
        if (!firstDetail) {
          if (j < src.length && /^## Layer 3\b/.test(src[j].trim())) { drop.add(j); j = nextNonBlank(j + 1); }
          if (j < src.length && src[j].trim().startsWith("Scope:")) drop.add(j);
        }
      }
    }
    if (name.startsWith("sbp-detail-")) firstDetail = false;
    if (k > 0) { rows.push(""); map.push({ file: name, line: 1 }); }
    src.forEach((r, i) => { if (!drop.has(i)) { rows.push(r); map.push({ file: name, line: i + 1 }); } });
  });
  const where = (n) => { const m = map[n - 1]; return m ? `${m.file} line ${m.line}` : `line ${n}`; };
  const condensedAt = (n) => !!map[n - 1] && condensed.has(map[n - 1].file);
  return { rows, where, map, condensedAt, folder: { dir, files, details, hasStructure, structure } };
}

// Checks that only a folder has: layer headings per file, one entry per detail file, Standing.
function folderChecks(f, warnAt) {
  const expect = (name) => (name === "sbp-vision.md" ? 1 : name === "sbp-structure.md" ? 2 : 3);
  for (const [name, rows] of Object.entries(f.files)) {
    const entries = [];
    for (const { n, t } of plainLines(rows)) {
      const lh = t.match(/^## Layer (\d+)\b/);
      if (lh && +lh[1] !== expect(name)) warnAt("layer-heading", `'${t}' does not belong in ${name}, which holds Layer ${expect(name)}`, `${name} line ${n}`);
      const e = t.match(/^### (.+?) \(part\)\s*$/);
      if (e && name.startsWith("sbp-detail-")) entries.push({ name: e[1], n });
    }
    if (name.startsWith("sbp-detail-") && entries.length !== 1) {
      warnAt("layer-heading", `${name} must hold exactly one '### <Part> (part)' entry; it holds ${entries.length}`, `${name} line ${entries.length > 1 ? entries[1].n : 1}`);
    }
    f.files[name].entries = entries;
  }
  if (!f.hasStructure) return;
  const { parts, standing } = f.structure;
  const bySlug = new Map();
  for (const p of parts) {
    const s = slugOf(p.name);
    if (bySlug.has(s)) warnAt("standing", `parts '${bySlug.get(s).name}' and '${p.name}' share the file slug '${s}'`, `sbp-structure.md line ${p.n}`);
    else bySlug.set(s, p);
  }
  const named = new Set();
  for (const s of standing) {
    const loc = `sbp-structure.md line ${s.n}`;
    const file = s.text.match(/^(sbp-detail-[^\s,]+\.md)$/);
    const own = s.text.match(/^own stack, (.+?)\/?$/);
    if (file) {
      named.add(file[1]);
      if (!f.details.includes(file[1])) warnAt("standing", `${s.part} names ${file[1]}, which is not in the folder`, loc);
    } else if (own) {
      let ok = false;
      try { ok = fs.statSync(path.join(f.dir, own[1].replace(/\/+$/, ""))).isDirectory(); } catch { ok = false; }
      if (!ok) warnAt("standing", `${s.part} names its own stack ${own[1]}/, which is not a folder here`, loc);
    } else if (/^described here$/i.test(s.text)) {
      warnAt("standing", `${s.part} says 'described here'; in a stack of separate files name the part's file or its own stack`, loc);
    }
  }
  for (const d of f.details) {
    if (!named.has(d)) warnAt("standing", `${d} is named by no Standing line`, `${d} line 1`);
    const slug = d.slice(11, -3);
    const part = bySlug.get(slug);
    if (!part) { warnAt("standing", `${d}: '${slug}' is not the slug of a part in Parts`, `${d} line 1`); continue; }
    const e = f.files[d].entries[0];
    if (e && e.name !== part.name) warnAt("standing", `the entry '${e.name}' differs from the Parts name '${part.name}'`, `${d} line ${e.n}`);
  }
}

// --impact <id> <file or folder>
function runImpact(args) {
  const opts = args.filter((a) => a.startsWith("--"));
  if (opts.length) die(`unknown option in --impact mode: ${opts[0]}`);
  if (args.length < 1) die("--impact needs an id and a file or folder");
  const [id, arg] = args;
  if (!new RegExp(`^${IDCORE}$`).test(id)) die(`not an id: ${id}`);
  if (arg === undefined) die("--impact needs a file or folder after the id");
  if (args.length > 2) die(`unexpected extra argument: ${args[2]}`);
  const target = loadTarget(arg);
  const els = readElements(target.rows);
  // Element facts: label, own id, cites.
  for (const e of els) {
    e.label = e.layer === null ? "Other"
      : `Layer ${e.layer} > ${e.entry !== null ? (e.topic ? `${e.entry} (part) > ${e.topic}` : `${e.entry} (part)`) : (e.topic || "-")}`;
  }
  assignOwn(els);
  for (const e of els) {
    e.id = e.own ? e.own.id : null;
    e.cites = [...new Set([...e.body.matchAll(TOKEN)].map((m) => m[1]).filter((x) => x !== e.id && x !== e.oldTok))];
  }
  const defs = new Map(), dups = [];
  for (const e of els) if (e.id) { if (defs.has(e.id)) dups.push([e.id, defs.get(e.id), e]); else defs.set(e.id, e); }
  const place = (e) => target.where(e.n);
  const seed = defs.get(id) || null;
  const citers = (x) => els.filter((e) => e.cites.includes(x));
  // Breadth first by depth; each element once, under the earliest parent at the smallest depth.
  const parent = new Map(), depth = new Map(), kids = new Map();
  const cycles = [], seenCycle = new Set();
  let level = [{ e: seed, id }], d = 0;
  const onPath = (e, p) => { for (let x = p; x; x = parent.get(x)) if (x === e) return true; return false; };
  while (level.length) {
    d++;
    const next = [];
    for (const { e: p, id: pid } of level) {
      for (const c of citers(pid)) {
        if (c === p) continue;
        if (seed && (c === seed || onPath(c, p))) {
          const key = `${c.id}>${pid}`;
          if (!seenCycle.has(key)) { seenCycle.add(key); cycles.push(`WARN impact: cycle ${c.id} ... ${pid}`); }
          continue;
        }
        if (depth.has(c)) continue;
        depth.set(c, d); parent.set(c, p);
        if (!kids.has(p)) kids.set(p, []);
        kids.get(p).push(c);
        if (c.id) next.push({ e: c, id: c.id });
      }
    }
    next.sort((a, b) => els.indexOf(a.e) - els.indexOf(b.e));
    level = next;
  }
  const out = [];
  let code = 0;
  if (seed) out.push(`impact ${id}: defined in ${seed.layer === null ? "Other" : `Layer ${seed.layer}`}, ${place(seed)}`);
  else { out.push(`WARN impact: ${id} is not defined in ${arg}`); code = 1; }
  out.push(id);
  const cut = (s) => (s.length > 80 ? s.slice(0, 80) + "..." : s);
  const walk = (p, dd) => {
    for (const c of (kids.get(p) || []).sort((a, b) => els.indexOf(a) - els.indexOf(b))) {
      out.push(`${"  ".repeat(dd)}d${dd}  ${place(c)}  ${c.label}  ${c.id || "-"}  ${cut(c.text)}`);
      walk(c, dd + 1);
    }
  };
  walk(seed, 1);
  for (const [dupId, a, b] of dups) if (dupId === id) out.push(`WARN impact: ${id} is defined on lines ${a.n} and ${b.n}`);
  out.push(...cycles);
  const deepest = Math.max(0, ...depth.values());
  out.push(`INFO impact: ${depth.size} element(s) reached, deepest ${deepest}`);
  console.log(out.join("\n"));
  process.exit(code);
}
