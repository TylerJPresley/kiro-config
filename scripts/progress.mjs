#!/usr/bin/env node
// Session tracker: .kiro/progress.md in the directory Kiro was started from (the same .kiro/ folder Kiro already uses).
//   progress.mjs show                 print the tracker (creates it from the template if missing)
//   progress.mjs log "text"           append a dated line to Log and refresh 'Last updated'
//   progress.mjs set <Section>        replace a section's body with stdin (Cold start | State | Open items | Decisions pending)
//   progress.mjs path                 print the tracker path
// Directory = --project DIR or the current directory. If .kiro/progress.md exists it is used; otherwise it is created from the template.
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; 
const args = process.argv.slice(2); const pi = args.indexOf("--project");
const start = pi >= 0 ? args.splice(pi, 2)[1] : process.cwd();
const root = path.resolve(start);
const slug = path.basename(root).toLowerCase().replace(/[^a-z0-9._-]/g, "-");
const home = path.join(root, ".kiro"); const file = path.join(home, "progress.md");
const SECTIONS = ["Cold start", "State", "Open items", "Decisions pending", "Log"];
const template = () => `# ${slug} - progress tracker (Kiro-side; not part of the project)\n\nLast updated: ${new Date().toISOString().slice(0, 10)}\n\n## Cold start\n1. The project's AGENTS.md is already loaded. Read this tracker (State, Open items, Decisions pending).\n2. Read the project docs named under State.\n3. Run \`git log --oneline -3 && git status --short\`.\n4. Context: \`node ~/.kiro/scripts/ctx.mjs\` (proceed below 40%, wrap up at 40%, no large run at 45%).\n\n## State\n(empty)\n\n## Open items\n(empty)\n\n## Decisions pending\n(none)\n\n## Log\n`;
fs.mkdirSync(home, { recursive: true });
if (!fs.existsSync(file)) fs.writeFileSync(file, template());
let t = fs.readFileSync(file, "utf8"); const cmd = args[0] ?? "show";
const touch = (s) => s.replace(/^Last updated: .*$/m, `Last updated: ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
const split = (s) => { const m = {}; let cur = null; let pre = []; for (const l of s.split("\n")) { const h = l.match(/^## (.+)$/); if (h) { cur = h[1]; m[cur] = []; } else if (cur) m[cur].push(l); else pre.push(l); } return { pre: pre.join("\n"), m }; };
const join = ({ pre, m }) => pre + "\n" + Object.entries(m).map(([k, v]) => `## ${k}\n${v.join("\n").replace(/\n+$/, "")}\n`).join("\n");
if (cmd === "show") process.stdout.write(t);
else if (cmd === "path") console.log(file);
else if (cmd === "log") { const text = args.slice(1).join(" ").trim(); if (!text) { console.error('usage: log "text"'); process.exit(2); } const p = split(t); const lines = p.m["Log"].filter((l) => l.trim()); lines.push(`- ${new Date().toISOString().slice(0, 16).replace("T", " ")} ${text}`); p.m["Log"] = lines.slice(-40); fs.writeFileSync(file, touch(join(p))); console.log("logged"); }
else if (cmd === "set") { const sec = args.slice(1).join(" "); if (!SECTIONS.slice(0, 4).includes(sec)) { console.error("section must be one of: " + SECTIONS.slice(0, 4).join(" | ")); process.exit(2); } const body = fs.readFileSync(0, "utf8").replace(/\s+$/, ""); const p = split(t); p.m[sec] = body.split("\n"); fs.writeFileSync(file, touch(join(p))); console.log("updated " + sec); }
else { console.error("usage: show | log | set | path"); process.exit(2); }
