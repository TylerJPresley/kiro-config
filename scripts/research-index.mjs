#!/usr/bin/env node
// Index the research cache (sources and findings) and check its shape. No model needed.
// usage: node research-index.mjs [--dir _internal/research] [--check]
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const DIR = arg("--dir", "_internal/research");
const CHECK = process.argv.includes("--check");
const REQUIRED = ["origin", "date", "question", "summary"];

const problems = [];
const problem = (code, p) => problems.push(`PROBLEM ${code} ${p}`);

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

function isLocalOrigin(origin) {
  return !!origin && !/^[a-z][a-z0-9+.-]*:\/\//i.test(origin);
}

function sha256File(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

// Collect entries: { kind: 'source'|'finding', slug, relpath, fm, dir }
function collect() {
  const entries = [];
  for (const kind of ["sources", "findings"]) {
    const base = path.join(DIR, kind);
    if (!fs.existsSync(base)) continue;
    for (const name of fs.readdirSync(base).sort()) {
      const full = path.join(base, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        // split source: slug is the directory, index from 00-index.md
        const slug = name;
        const idx = path.join(full, "00-index.md");
        const rel = path.relative(DIR, idx);
        if (!fs.existsSync(idx)) { problem("NO-FRONTMATTER", rel); continue; }
        const fm = parseFrontmatter(fs.readFileSync(idx, "utf8"));
        entries.push({ kind: kind === "sources" ? "source" : "finding", slug, relpath: rel, fm, file: idx, split: true, dir: full });
      } else if (name.endsWith(".md")) {
        const slug = name.replace(/\.md$/, "");
        const rel = path.relative(DIR, full);
        const fm = parseFrontmatter(fs.readFileSync(full, "utf8"));
        entries.push({ kind: kind === "sources" ? "source" : "finding", slug, relpath: rel, fm, file: full });
      }
    }
  }
  return entries;
}

function validate(entries) {
  const sourceSlugs = new Set(entries.filter((e) => e.kind === "source").map((e) => e.slug));
  for (const e of entries) {
    if (!e.fm) { problem("NO-FRONTMATTER", e.relpath); continue; }
    for (const key of REQUIRED) {
      if (!e.fm[key]) problem(`MISSING-${key}`, e.relpath);
    }
    if (e.fm.date && !/^\d{4}-\d{2}-\d{2}$/.test(e.fm.date)) problem("BAD-DATE", e.relpath);
    // local origin needs a verified hash
    if (isLocalOrigin(e.fm.origin)) {
      if (!e.fm.sha256) problem("NO-HASH", e.relpath);
      else {
        const target = e.fm.copy
          ? path.resolve(DIR, e.fm.copy)
          : path.isAbsolute(e.fm.origin) ? e.fm.origin : path.resolve(DIR, e.fm.origin);
        if (!fs.existsSync(target)) problem("MISSING-FILE", e.relpath);
        else if (sha256File(target) !== e.fm.sha256) problem("HASH-MISMATCH", e.relpath);
      }
    }
    // findings reference existing source slugs
    if (e.kind === "finding" && e.fm.from) {
      for (const ref of (e.fm.from.match(/[A-Za-z0-9][\w.-]*/g) || [])) {
        if (!sourceSlugs.has(ref)) problem("BAD-REF", e.relpath);
      }
    }
    // split-source sections need a summary
    if (e.split) {
      for (const sec of fs.readdirSync(e.dir).sort()) {
        if (sec === "00-index.md" || !/^\d\d-.*\.md$/.test(sec)) continue;
        const srel = path.relative(DIR, path.join(e.dir, sec));
        const sfm = parseFrontmatter(fs.readFileSync(path.join(e.dir, sec), "utf8"));
        if (!sfm) problem("NO-FRONTMATTER", srel);
        else if (!sfm.summary) problem("MISSING-summary", srel);
      }
    }
  }
}

function render(entries) {
  const line = (e) => `- [${e.slug}](${e.relpath.split(path.sep).join("/")}) (${e.fm?.date || ""}) ${e.fm?.summary || ""} | ${e.fm?.question || ""}`;
  const sort = (a, b) => a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  const sources = entries.filter((e) => e.kind === "source").sort(sort);
  const findings = entries.filter((e) => e.kind === "finding").sort(sort);
  const out = ["## Sources", ...sources.map(line), "", "## Findings", ...findings.map(line), ""];
  return out.join("\n");
}

const entries = collect();
if (CHECK) {
  validate(entries);
  const idxPath = path.join(DIR, "index.md");
  const current = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, "utf8") : "";
  if (current !== render(entries)) problem("STALE-INDEX", path.relative(DIR, idxPath) || "index.md");
  for (const p of problems) console.log(p);
  process.exit(problems.length ? 1 : 0);
} else {
  fs.writeFileSync(path.join(DIR, "index.md"), render(entries));
  process.exit(0);
}
