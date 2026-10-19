#!/usr/bin/env node
// Track recurring patterns in <cwd>/_internal/lessons.md.  No model needed.
//   lessons.mjs add <id> "<pattern>" "<evidence>"   new lesson, or bump the count of an existing id
//   lessons.mjs promote <id> <where>                mark promoted (steering/skill/script/AGENTS.md)
//   lessons.mjs list [ready]                        all lessons, or only watching ones seen >= 3 times
import fs from "node:fs"; import path from "node:path";
const file = path.join(process.cwd(), "_internal", "lessons.md");
const HEAD = "# Lessons (recurring patterns)\n\nOne line per pattern: `- [id] pattern | evidence | seen: N (last date) | status`. Status is `watching` or `promoted→<where>`. A pattern seen 3 times is promoted to the cheapest durable form: script > skill > steering line > AGENTS.md (project nuance only). Maintained with `node ~/.kiro/scripts/lessons.mjs`.\n\n";
const read = () => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : HEAD);
const parse = (t) => t.split("\n").map((l) => { const m = l.match(/^- \[([^\]]+)\] (.*?) \| (.*?) \| seen: (\d+) \(([^)]*)\) \| (.*)$/); return m ? { id: m[1], pattern: m[2], evidence: m[3], n: +m[4], last: m[5], status: m[6] } : null; }).filter(Boolean);
const fmt = (e) => `- [${e.id}] ${e.pattern} | ${e.evidence} | seen: ${e.n} (${e.last}) | ${e.status}`;
const save = (t, es) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, t.split("\n").filter((l) => !l.startsWith("- [")).join("\n").replace(/\n*$/, "\n") + es.map(fmt).join("\n") + "\n"); };
const [cmd, id, a, b] = process.argv.slice(2); const t = read(); const es = parse(t); const today = new Date().toISOString().slice(0, 10);
if (cmd === "add") { if (!id || !a) { console.error('usage: add <id> "<pattern>" "<evidence>"'); process.exit(2); } const e = es.find((x) => x.id === id);
  if (e) { e.n++; e.last = today; if (b) e.evidence = b; } else es.push({ id, pattern: a, evidence: b ?? "", n: 1, last: today, status: "watching" });
  save(t, es); const x = es.find((y) => y.id === id); console.log(fmt(x)); if (x.n >= 3 && x.status === "watching") console.log("READY to promote: choose script > skill > steering line > AGENTS.md"); }
else if (cmd === "promote") { const e = es.find((x) => x.id === id); if (!e || !a) { console.error("usage: promote <id> <where>"); process.exit(2); } e.status = `promoted→${a}`; save(t, es); console.log(fmt(e)); }
else if (cmd === "list") { const r = id === "ready"; for (const e of es) if (!r || (e.n >= 3 && e.status === "watching")) console.log(fmt(e)); }
else { console.error("usage: lessons.mjs add|promote|list"); process.exit(2); }
