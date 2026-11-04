#!/usr/bin/env node
// Session tracker: _internal/handoff.md in the directory Kiro was started from.
//   progress.mjs show [--full]        print the tracker, Log trimmed to the last 5 lines unless --full (creates it from the template if missing)
//   progress.mjs log "text"           append a dated line to Log and refresh 'Last updated'
//   progress.mjs set <Section>        replace a section's body with stdin (Goal | State | Next step | Decisions pending | Pointers)
//   progress.mjs path                 print the tracker path
// Directory = --project DIR or the current directory. The tracker lives under _internal/, which Kiro excludes from git.
import fs from "node:fs"; import path from "node:path"; import { spawnSync } from "node:child_process";
const args = process.argv.slice(2); const pi = args.indexOf("--project");
const start = pi >= 0 ? args.splice(pi, 2)[1] : process.cwd();
const root = path.resolve(start);
const slug = path.basename(root).toLowerCase().replace(/[^a-z0-9._-]/g, "-");
const internal = path.join(root, "_internal"); const file = path.join(internal, "handoff.md");
const SECTIONS = ["Goal", "State", "Next step", "Decisions pending", "Pointers", "Log"];
const SETTABLE = SECTIONS.slice(0, 5);
const template = () => `# ${slug} - handoff (Kiro-side; not part of the project)\n\nLast updated: ${new Date().toISOString().slice(0, 10)}\n\n## Goal\n(empty)\n\n## State\n(empty)\n\n## Next step\n(empty)\n\n## Decisions pending\n(none)\n\n## Pointers\n(empty)\n\n## Log\n`;
// Keep _internal/ out of the project's git history without touching tracked files.
const excludeInternal = () => {
  if (!fs.existsSync(path.join(root, ".git"))) return;
  const ignored = spawnSync("git", ["-C", root, "check-ignore", "-q", "_internal"]).status === 0;
  if (ignored) return;
  const ex = path.join(root, ".git", "info", "exclude");
  fs.mkdirSync(path.dirname(ex), { recursive: true });
  const body = fs.existsSync(ex) ? fs.readFileSync(ex, "utf8") : "";
  if (!body.split("\n").includes("/_internal/")) fs.writeFileSync(ex, body.replace(/\n*$/, "\n") + "/_internal/\n");
};
fs.mkdirSync(internal, { recursive: true });
excludeInternal();
if (!fs.existsSync(file)) fs.writeFileSync(file, template());
let t = fs.readFileSync(file, "utf8"); const cmd = args[0] ?? "show";
const touch = (s) => s.replace(/^Last updated: .*$/m, `Last updated: ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
const split = (s) => { const m = {}; let cur = null; let pre = []; for (const l of s.split("\n")) { const h = l.match(/^## (.+)$/); if (h) { cur = h[1]; m[cur] = []; } else if (cur) m[cur].push(l); else pre.push(l); } return { pre: pre.join("\n"), m }; };
const join = ({ pre, m }) => pre + "\n" + Object.entries(m).map(([k, v]) => `## ${k}\n${v.join("\n").replace(/\n+$/, "")}\n`).join("\n");
if (cmd === "show") { if (args[1] === "--full") process.stdout.write(t); else { const q = split(t); const all = (q.m["Log"] ?? []).filter((l) => l.trim()); const hidden = Math.max(0, all.length - 5); q.m["Log"] = [...(hidden ? [`(${hidden} earlier Log lines hidden - \`progress.mjs show --full\` for all)`] : []), ...all.slice(-5)]; process.stdout.write(join(q)); } }
else if (cmd === "path") console.log(file);
else if (cmd === "log") { const text = args.slice(1).join(" ").trim(); if (!text) { console.error('usage: log "text"'); process.exit(2); } const p = split(t); const lines = (p.m["Log"] ?? []).filter((l) => l.trim()); lines.push(`- ${new Date().toISOString().slice(0, 16).replace("T", " ")} ${text}`); p.m["Log"] = lines.slice(-40); fs.writeFileSync(file, touch(join(p))); console.log("logged"); }
else if (cmd === "set") { const sec = args.slice(1).join(" "); if (!SETTABLE.includes(sec)) { console.error("section must be one of: " + SETTABLE.join(" | ")); process.exit(2); } const body = fs.readFileSync(0, "utf8").replace(/\s+$/, ""); const p = split(t); p.m[sec] = body.split("\n"); fs.writeFileSync(file, touch(join(p))); console.log("updated " + sec); }
else { console.error("usage: show | log | set | path"); process.exit(2); }
