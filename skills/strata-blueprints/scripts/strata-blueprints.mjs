#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Strata Blueprints tool: condense a stack (leave out each topic whose whole body is None.), or publish it as one document.
// usage: node strata-blueprints.mjs condense <file.md or folder> --out <path> [--force]
//        node strata-blueprints.mjs publish <file.md or folder> --out <file> [--force]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const MARKER = "<!-- strata-blueprints: condensed (generated; omitted topics read None.) -->";
export const PUBLISHED_MARKER = "<!-- strata-blueprints: condensed, published (generated; each omitted topic read None. or held only open questions) -->";
const MARKER_PREFIX = "<!-- strata-blueprints: condensed";
const PUBLISHED_PREFIX = "<!-- strata-blueprints: condensed, published";
export const IDCORE = String.raw`(?:vision|structure|detail\.[a-z0-9]+)-[1-9]\d*\.[1-9]\d*`;
const TOKEN = new RegExp(String.raw`(?<![\w.-])(${IDCORE})(?!\w|-|\.\d)`, "g");
export const NAMES = ["Vision", "Structure", "Detail"];
export const TOPICS = {
  1: ["Need", "Target audience", "Value", "Focus", "Success measures", "Qualities and constraints", "Vocabulary", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
  2: ["Parts", "Standing", "Seams between parts", "Seams with the outside", "Shared things", "Scenario paths", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
  3: ["Responsibility", "Concepts and states", "Seams", "Rules", "Inside", "Limits", "Construction", "Costs", "Risks", "Open Concerns", "Assumptions", "Decisions"],
};
const USAGE = "usage: node strata-blueprints.mjs condense <file.md or folder> --out <path> [--force]\n       node strata-blueprints.mjs publish <file.md or folder> --out <file> [--force]";

const hasMarker = (line) => (line || "").trim().startsWith(MARKER_PREFIX);
const hasPublished = (line) => (line || "").trim().startsWith(PUBLISHED_PREFIX);

// Split text into lines without line endings, and remember the line ending to write back.
function split(text) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  if (lines.at(-1) === "") lines.pop();
  return { lines, eol };
}
const join = (lines, eol) => lines.join(eol) + eol;
const isBlank = (s) => s.trim() === "";

// Read the structure the lint reads: layers, units (a layer, or a Layer 3 part entry) and topic blocks.
function scan(lines) {
  const heads = [];
  let fence = null;
  lines.forEach((line, i) => {
    const t = line.trim();
    const f = t.match(/^(```|~~~)/);
    if (fence) { if (t.startsWith(fence) && t.slice(3).trim() === "") fence = null; return; }
    if (f) { fence = f[1]; return; }
    const h = t.match(/^(#{1,6}) /);
    if (h) heads.push({ i, level: h[1].length, t });
  });
  const endOf = (k, maxLevel) => {
    for (let j = k + 1; j < heads.length; j++) if (heads[j].level <= maxLevel) return heads[j].i;
    return lines.length;
  };
  const layers = [];
  let layer = null, entry = null;
  heads.forEach((h, k) => {
    if (h.level === 2) {
      entry = null; layer = null;
      const m = h.t.slice(3).match(/^Layer (\d+): (.+)$/);
      if (m && +m[1] >= 1 && +m[1] <= 3 && NAMES[m[1] - 1] === m[2].trim()) {
        layer = { n: +m[1], i: h.i, end: endOf(k, 2), bare: { topics: [] }, entries: [] };
        layers.push(layer);
      }
      return;
    }
    if (!layer) return;
    const topic = (re, unit, level) => {
      const m = h.t.match(re);
      if (!m) return false;
      const idx = TOPICS[layer.n].indexOf(m[2]);
      if (idx < 0) return false;
      unit.topics.push({ i: h.i, end: endOf(k, level), idx, name: m[2], no: +m[1] });
      return true;
    };
    if (h.level === 3) {
      const part = h.t.match(/^### (.+?) \(part\)\s*$/);
      if (layer.n === 3 && part) {
        entry = { i: h.i, end: endOf(k, 3), topics: [], name: part[1] };
        layer.entries.push(entry);
      } else {
        entry = null;
        topic(/^### (\d+)\. (.+?)\s*$/, layer.bare, 3);
      }
    } else if (h.level === 4 && layer.n === 3 && entry) {
      topic(/^#### (\d+)\. (.+?)\s*$/, entry, 4);
    }
  });
  return layers;
}

const bodyIsNone = (lines, t) => {
  const body = lines.slice(t.i + 1, t.end).filter((l) => !isBlank(l));
  return body.length === 1 && body[0].trim() === "None.";
};

// condense: returns { text, count }.
export function condenseResult(text) {
  const { lines: raw, eol } = split(text);
  let lines = raw;
  if (hasMarker(lines[0])) lines = lines.slice(lines.length > 1 && isBlank(lines[1]) ? 2 : 1);
  const layers = scan(lines);
  if (!layers.length) throw new Error("no layer heading found");
  const drop = new Set();
  let count = 0;
  for (const layer of layers) {
    const units = layer.n === 3 ? (layer.entries.length ? layer.entries : [layer.bare]) : [layer.bare];
    for (const u of units) for (const t of u.topics) {
      if (!bodyIsNone(lines, t)) continue;
      count++;
      for (let i = t.i; i < t.end; i++) drop.add(i);
    }
  }
  const kept = lines.filter((_, i) => !drop.has(i));
  while (kept.length && isBlank(kept.at(-1))) kept.pop();
  return { text: join([MARKER, "", ...kept], eol), count };
}
export const condenseText = (text) => condenseResult(text).text;

// --- publish ------------------------------------------------------------------
// Open-question lines only: every non-blank line, after one list marker, starts with "Not supplied:".
const bodyIsNotSupplied = (lines, t) => {
  const body = lines.slice(t.i + 1, t.end).map((l) => l.trim()).filter(Boolean);
  return body.length > 0 && body.every((l) => l.replace(/^[-*+] /, "").startsWith("Not supplied:"));
};
const cut = (s) => (s.length > 80 ? s.slice(0, 80) + "..." : s);
const base = (name) => path.basename(name);
const slugOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const anchorOf = (s) => s.toLowerCase().replace(/[^\p{L}\p{N} _-]/gu, "").replace(/ /g, "-");
const layerNo = (t) => {
  const m = t.match(/^## Layer (\d+): (.+)$/);
  return m && +m[1] >= 1 && +m[1] <= 3 && NAMES[m[1] - 1] === m[2].trim() ? +m[1] : 0;
};
// True for each line that is a fence line or sits inside a fenced block (the rule scan uses).
function fenceMask(lines) {
  let fence = null;
  return lines.map((line) => {
    const t = line.trim();
    const f = t.match(/^(```|~~~)/);
    if (fence) { if (t.startsWith(fence) && t.slice(3).trim() === "") fence = null; return true; }
    if (f) { fence = f[1]; return true; }
    return false;
  });
}
// The order of the parts named in the Parts topic of a structure file, as slugs.
function partOrder(text) {
  const { lines } = split(text);
  const mask = fenceMask(lines);
  const order = [];
  let topic = null;
  lines.forEach((line, i) => {
    if (mask[i]) return;
    const t = line.trim();
    if (/^## /.test(t)) { topic = null; return; }
    const h = t.match(/^### \d+\. (.+?)\s*$/);
    if (h) { topic = h[1]; return; }
    if (topic !== "Parts") return;
    const body = t.replace(/^(?:[-*+]|\d+[.)])\s+/, "").replace(/^\*+/, "");
    const m = body.match(/^(.+?)\s*\(part\)/);
    if (m) order.push(slugOf(m[1].replace(/\*+$/, "").trim()));
  });
  return order;
}
const EXPECT = (name) => { const b = base(name); return b === "sbp-vision.md" ? 1 : b === "sbp-structure.md" ? 2 : /^sbp-detail-.+\.md$/.test(b) ? 3 : 0; };
const trimBlank = (ls) => { let a = 0, b = ls.length; while (a < b && isBlank(ls[a])) a++; while (b > a && isBlank(ls[b - 1])) b--; return ls.slice(a, b); };

// publishFiles([{ name, text }], { single }): returns { text, dropped, open, files, questions }; throws Error with the refusal text.
export function publishFiles(input, opts = {}) {
  for (const f of input) if (hasPublished(split(f.text).lines[0])) throw new Error(`${f.name} is a published document; publish from the source files`);
  // order: vision, structure, then the detail files in the order of Parts (ties and unnamed files by name)
  const structure = input.find((f) => base(f.name) === "sbp-structure.md");
  const order = structure ? partOrder(structure.text) : [];
  const rank = (f) => {
    const b = base(f.name);
    if (b === "sbp-vision.md") return -2;
    if (b === "sbp-structure.md") return -1;
    if (!/^sbp-detail-.+\.md$/.test(b)) return order.length + 1;
    const i = order.indexOf(b.slice(11, -3));
    return i < 0 ? order.length : i;
  };
  const files = input.length > 1 ? [...input].sort((a, b) => rank(a) - rank(b) || (base(a.name) < base(b.name) ? -1 : base(a.name) > base(b.name) ? 1 : 0)) : [...input];
  const eol = files.some((f) => f.text.includes("\r\n")) ? "\r\n" : "\n";

  // phase 1: per file, find the topics to drop
  const parsed = files.map((f) => {
    const { lines } = split(f.text);
    const skip = new Set();
    if (hasMarker(lines[0])) { skip.add(0); if (lines.length > 1 && isBlank(lines[1])) skip.add(1); }
    const layers = scan(lines);
    if (!layers.length) throw new Error(`${f.name}: no layer heading found`);
    const want = opts.single ? 0 : EXPECT(f.name);
    if (want) for (const l of layers) if (l.n !== want) throw new Error(`${f.name}: '${lines[l.i].trim()}' does not belong in ${f.name}, which holds Layer ${want}`);
    const drop = new Set(), dropped = [];
    for (const layer of layers) {
      const units = layer.n === 3 ? (layer.entries.length ? layer.entries : [layer.bare]) : [layer.bare];
      for (const u of units) for (const t of u.topics) {
        const none = bodyIsNone(lines, t);
        if (!none && !bodyIsNotSupplied(lines, t)) continue;
        for (let i = t.i; i < t.end; i++) drop.add(i);
        const doc = layer.n === 1 ? "vision" : layer.n === 2 ? "structure" : u.name ? `detail.${u.name.toLowerCase()}` : "detail";
        const text = none ? "None." : cut(lines.slice(t.i + 1, t.end).map((l) => l.trim()).filter(Boolean).map((l) => l.replace(/^[-*+] /, "")).join(" "));
        dropped.push({ doc, no: t.no, name: t.name, kind: none ? "none" : "not-supplied", text });
      }
    }
    return { f, lines, skip, drop, dropped, mask: fenceMask(lines) };
  });

  // phase 2: a kept line must not cite an item of a topic that is left out
  const gone = new Map();
  for (const p of parsed) for (const d of p.dropped) gone.set(`${d.doc}-${d.no}`, d);
  const problems = [];
  for (const p of parsed) p.lines.forEach((line, i) => {
    if (p.skip.has(i) || p.drop.has(i) || p.mask[i]) return;
    for (const m of line.replace(/`[^`]*`/g, " ").matchAll(TOKEN)) {
      const id = m[1].match(/^(.+)-(\d+)\.\d+$/);
      const d = gone.get(`${id[1]}-${id[2]}`);
      if (d) problems.push(`${p.f.name} line ${i + 1}: cites ${m[1]}, which is in topic ${d.no}. ${d.name} of ${d.doc}, left out of the published document (${d.kind === "none" ? "None." : "Not supplied:"})`);
    }
  });
  if (problems.length) throw new Error(problems.join("\n"));

  // phase 3: merge
  let top = [];
  const layerBlocks = [], tailBlocks = [];
  let seenL3 = false;
  parsed.forEach((p, fi) => {
    const kept = [];
    p.lines.forEach((s, i) => { if (!p.skip.has(i) && !p.drop.has(i)) kept.push({ s, n: i + 1, m: p.mask[i] }); });
    const heads = kept.map((k, j) => (!k.m && /^## /.test(k.s.trim()) ? j : -1)).filter((j) => j >= 0);
    const first = heads.length ? heads[0] : kept.length;
    let pre = kept.slice(0, first);
    if (fi === 0) top = trimBlank(pre.map((k) => k.s));
    else {
      const a = pre.findIndex((k) => !isBlank(k.s));
      if (a >= 0) {
        let rest = pre;
        if (/^# /.test(pre[a].s)) rest = pre.slice(a + 1);
        const b = rest.find((k) => !isBlank(k.s));
        if (b) throw new Error(`${p.f.name}: text before the first layer heading (line ${b.n}) cannot be merged; only the first file may hold it`);
      }
    }
    heads.forEach((h, k) => {
      const end = k + 1 < heads.length ? heads[k + 1] : kept.length;
      let ls = kept.slice(h, end).map((x) => x.s);
      const n = layerNo(ls[0].trim());
      if (n === 3) {
        if (seenL3) {
          let j = 1;
          while (j < ls.length && isBlank(ls[j])) j++;
          if (j < ls.length && ls[j].trim().startsWith("Scope:")) j++;
          ls = ls.slice(j);
        }
        seenL3 = true;
      }
      (n ? layerBlocks : tailBlocks).push(trimBlank(ls));
    });
  });

  // table of contents: every ## and ### heading outside fences, anchors by the GitHub rule
  const body = [];
  const join2 = (blocks) => { for (const b of blocks) { if (body.length) body.push(""); body.push(...b); } };
  join2(layerBlocks); join2(tailBlocks);
  const TOC = "\u0000";
  const merged = [...(top.length ? [...top, ""] : []), "## Contents", "", TOC, "", ...body];
  const mask = fenceMask(merged);
  const seen = new Map();
  const toc = [];
  merged.forEach((line, i) => {
    if (mask[i]) return;
    const m = line.trim().match(/^(#{1,6}) (.*)$/);
    if (!m) return;
    const text = m[2].trim();
    const a = anchorOf(text);
    const c = seen.get(a) ?? 0;
    seen.set(a, c + 1);
    const anchor = c ? `${a}-${c}` : a;
    if (m[1].length > 3 || m[1].length === 1 || line === "## Contents") return;
    toc.push(`${m[1].length === 3 ? "  " : ""}- [${text.replace(/[\[\]]/g, "\\$&")}](#${anchor})`);
  });
  const at = merged.indexOf(TOC);
  const out = [PUBLISHED_MARKER, "", ...merged.slice(0, at), ...toc, ...merged.slice(at + 1)];
  while (isBlank(out.at(-1))) out.pop();

  // open questions, counted as the lint counts them
  const om = fenceMask(out);
  const open = [];
  let questions = 0;
  out.forEach((line, i) => {
    if (om[i] || /^## /.test(line.trim())) return;
    const c = (line.replace(/`[^`]*`/g, "").match(/Not supplied:/g) || []).length;
    if (!c) return;
    questions += c;
    open.push({ line: i + 1, text: cut(line.trim()) });
  });
  return { text: join(out, eol), dropped: parsed.flatMap((p) => p.dropped), open, files: files.length, questions };
}

// --- command line -------------------------------------------------------------
class Refuse extends Error {}
const die = (msg) => { throw new Refuse(msg); };

// The real path of p, resolving symlinks in the nearest existing parent.
function realish(p) {
  let cur = path.resolve(p);
  const rest = [];
  for (;;) {
    try { return path.join(fs.realpathSync(cur), ...rest.reverse()); } catch {
      const up = path.dirname(cur);
      if (up === cur) return path.resolve(p);
      rest.push(path.basename(cur)); cur = up;
    }
  }
}
const lstat = (p) => { try { return fs.lstatSync(p); } catch { return null; } };
const inside = (child, parent) => child === parent || child.startsWith(parent + path.sep);

export function run(argv, log = console.log) {
  const [cmd, ...rest] = argv;
  if (cmd !== "condense" && cmd !== "publish") die(`unknown subcommand: ${cmd}`);
  let out = null, force = false;
  const pos = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--out") { if (i + 1 >= rest.length) die("--out needs a path"); out = rest[++i]; }
    else if (a === "--force") force = true;
    else if (a.startsWith("--")) die(`unknown option: ${a}`);
    else pos.push(a);
  }
  if (pos.length !== 1) die(pos.length ? "give one file or folder" : `${cmd} needs a file or a folder`);
  if (out === null) die(`${cmd} needs --out <path>`);
  const input = pos[0];
  const st = fs.existsSync(input) ? fs.statSync(input) : die(`no such file: ${input}`);
  const isDir = st.isDirectory();
  if (!isDir && !st.isFile()) die(`not a file: ${input}`);

  // Safety: the source is never written.
  const rin = realish(input), rout = realish(out);
  if (rout === rin || (isDir && inside(rout, rin)) || inside(rin, rout)) die(`--out ${out} overlaps the input ${input}`);
  const ost = lstat(out);
  if (ost && ost.isSymbolicLink()) die(`--out ${out} is a symlink`);
  if (cmd === "publish") return publish({ input, out, force, isDir, ost, log });
  if (isDir && ost && !ost.isDirectory()) die(`--out ${out} is a file; give a folder for a folder input`);
  if (!isDir && ost && ost.isDirectory()) die(`--out ${out} is a folder; give a file path for a file input`);

  // Read everything and compute every result before the first write.
  const jobs = [];
  const files = [];
  if (isDir) {
    const isFile = (n) => { try { return fs.statSync(path.join(input, n)).isFile(); } catch { return false; } };
    const all = fs.readdirSync(input).filter(isFile);
    const names = [];
    if (all.includes("sbp-vision.md")) names.push("sbp-vision.md");
    if (all.includes("sbp-structure.md")) names.push("sbp-structure.md");
    names.push(...all.filter((n) => /^sbp-detail-.+\.md$/.test(n)).sort());
    if (!names.length) die(`no sbp-vision.md, sbp-structure.md or sbp-detail-*.md in ${input}`);
    for (const n of names) files.push({ src: path.join(input, n), dest: path.join(out, n) });
  } else files.push({ src: input, dest: out });
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(f.src, "utf8"); } catch (e) { die(`cannot read ${f.src}: ${e.code || e.message}`); }
    if (hasPublished(split(text).lines[0])) die(`${f.src} is a published document; condense the source files`);
    let r;
    try { r = condenseResult(text); } catch (e) { die(`${f.src}: ${e.message}`); }
    const dst = lstat(f.dest);
    if (dst) {
      if (dst.isSymbolicLink()) die(`${f.dest} is a symlink`);
      if (!dst.isFile()) die(`${f.dest} is not a file`);
      if (!force) {
        let first = "";
        try { first = fs.readFileSync(f.dest, "utf8").split(/\r?\n/, 1)[0]; } catch (e) { die(`cannot read ${f.dest}: ${e.code || e.message}`); }
        if (!hasMarker(first)) die(`${f.dest} exists and is not a condensed copy; use --force to overwrite it`);
      }
    }
    jobs.push({ ...f, r });
  }
  if (isDir) fs.mkdirSync(out, { recursive: true });
  else fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  for (const j of jobs) {
    fs.writeFileSync(j.dest, j.r.text);
    log(`condensed ${j.dest}: dropped ${j.r.count} topic(s)`);
  }
}

// The files of a stack folder, the way condense finds them (flat; nested stacks ignored).
function stackNames(input) {
  const isFile = (n) => { try { return fs.statSync(path.join(input, n)).isFile(); } catch { return false; } };
  const all = fs.readdirSync(input).filter(isFile);
  const names = [];
  if (all.includes("sbp-vision.md")) names.push("sbp-vision.md");
  if (all.includes("sbp-structure.md")) names.push("sbp-structure.md");
  names.push(...all.filter((n) => /^sbp-detail-.+\.md$/.test(n)).sort());
  if (!names.length) die(`no sbp-vision.md, sbp-structure.md or sbp-detail-*.md in ${input}`);
  return names;
}

function publish({ input, out, force, isDir, ost, log }) {
  if (ost && ost.isDirectory()) die(`--out ${out} is a folder; give a file path`);
  const srcs = isDir ? stackNames(input).map((n) => path.join(input, n)) : [input];
  const files = srcs.map((src) => {
    try { return { name: src, text: fs.readFileSync(src, "utf8") }; } catch (e) { die(`cannot read ${src}: ${e.code || e.message}`); }
  });
  let r;
  try { r = publishFiles(files, { single: !isDir }); } catch (e) { die(e.message); }
  if (ost && !ost.isFile()) die(`${out} is not a file`);
  if (ost && !force) {
    let first = "";
    try { first = fs.readFileSync(out, "utf8").split(/\r?\n/, 1)[0]; } catch (e) { die(`cannot read ${out}: ${e.code || e.message}`); }
    if (!hasMarker(first)) die(`${out} exists and is not a condensed copy or a published document; use --force to overwrite it`);
  }
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, r.text);
  for (const d of r.dropped) log(`dropped ${d.doc} ${d.no}. ${d.name}: ${d.text}`);
  for (const o of r.open) log(`open ${out} line ${o.line}: ${o.text}`);
  const a = r.dropped.filter((d) => d.kind === "none").length;
  log(`published ${out}: ${r.files} file(s), dropped ${r.dropped.length} topic(s) (${a} None., ${r.dropped.length - a} Not supplied:), ${r.questions} open question(s) remain`);
}

export function main(argv) {
  if (!argv.length) { console.log(USAGE); return 0; }
  try { run(argv); return 0; } catch (e) {
    if (!(e instanceof Refuse)) throw e;
    for (const l of e.message.split("\n")) console.error(`strata-blueprints: ${l}`);
    return 2;
  }
}

const entry = (() => { try { return pathToFileURL(fs.realpathSync(process.argv[1])).href; } catch { return null; } })();
if (import.meta.url === entry) process.exitCode = main(process.argv.slice(2));
