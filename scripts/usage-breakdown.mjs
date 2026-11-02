#!/usr/bin/env node
// What fills a Kiro session's context, weighted by how often it is re-sent?
// usage: node ~/.kiro/scripts/usage-breakdown.mjs [session-id-prefix|latest] [--top N]
// Reads ~/.kiro/sessions/cli/<id>.jsonl (no model, no network). Every entry is re-sent on every LATER model call, so
// weight = bytes x calls-after-it. Bytes of transcript JSON, a proxy for tokens (system prompt/tools/cache excluded).
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const dir = path.join(os.homedir(), ".kiro/sessions/cli");
const arg = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "latest";
const topN = Number(process.argv[process.argv.indexOf("--top") + 1]) || 8;
const js = fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl")).map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }));
const isTop = (f) => !JSON.parse(fs.readFileSync(path.join(dir, f.slice(0, -1)), "utf8")).parent_session_id;
const cand = js.sort((a, b) => b.t - a.t).filter((x) => (arg === "latest" ? isTop(x.f) : x.f.startsWith(arg)));
if (!cand.length) { console.error("no session"); process.exit(1); }
const L = fs.readFileSync(path.join(dir, cand[0].f), "utf8").trim().split("\n").map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const IMAGE_EQUIV = 6000; // images are stored as JSON byte arrays (inflated ~4x+); token cost depends on pixels, ~1.5k tokens, so count a fixed ~6KB equivalent
const size = (o) => Buffer.byteLength(JSON.stringify(o ?? {}));
const calls = L.filter((e) => e.kind === "AssistantMessage").length;
const names = {}; // toolUseId -> tool name
let seen = 0; const items = [];
const hint = (v) => String(typeof v === "string" ? v : JSON.stringify(v)).replace(/\s+/g, " ").slice(0, 70);
for (const e of L) {
  const after = calls - seen; // calls that will re-send this entry
  if (e.kind === "Prompt") for (const c of e.data?.content ?? []) { const img = c.kind === "image" || /"source":\{"kind":"bytes"/.test(JSON.stringify(c.data ?? {}).slice(0, 80)); items.push(img ? { cat: "user image (fixed ~6KB-equiv)", b: IMAGE_EQUIV, after, h: "screenshot" } : { cat: "user prompt", b: size(c.data), after, h: hint(c.data) }); }
  else if (e.kind === "AssistantMessage") {
    seen++; const afterA = calls - seen;
    for (const c of e.data?.content ?? []) {
      if (c.kind === "toolUse") { names[c.data.toolUseId] = c.data.name; items.push({ cat: `tool call: ${c.data.name}`, b: size(c.data), after: afterA, h: hint(c.data.input?.command ?? c.data.input?.path ?? c.data.input?.operations ?? c.data.input) }); }
      else items.push({ cat: c.kind === "thinking" ? "thinking" : "assistant text", b: size(c.data), after: afterA, h: hint(c.data?.text ?? c.data) });
    }
  } else if (e.kind === "ToolResults") {
    for (const [id, r] of Object.entries(e.data?.results ?? {})) items.push({ cat: `tool result: ${names[id] ?? "?"}`, b: size(r), after, h: hint(r.tool?.kind ?? r.result) });
  }
}
const mb = (n) => (n / 1e6).toFixed(1); const tot = items.reduce((s, x) => s + x.b * x.after, 0) || 1;
console.log(`session ${cand[0].f.slice(0, 8)}  calls ${calls}  entries ${items.length}  re-sent volume ${mb(tot)} MB`);
const cat = {}; for (const x of items) { const c = (cat[x.cat] ??= { n: 0, b: 0, w: 0 }); c.n++; c.b += x.b; c.w += x.b * x.after; }
console.log("\ncategory                         n   size-MB  re-sent-MB  share");
for (const [k, v] of Object.entries(cat).sort((a, b) => b[1].w - a[1].w).slice(0, 14)) console.log(`  ${k.padEnd(30)} ${String(v.n).padStart(4)}  ${mb(v.b).padStart(7)}  ${mb(v.w).padStart(10)}  ${String(Math.round((100 * v.w) / tot)).padStart(3)}%`);
console.log(`\ntop ${topN} single items by re-sent volume (size x later calls)`);
for (const x of [...items].sort((a, b) => b.b * b.after - a.b * a.after).slice(0, topN)) console.log(`  ${mb(x.b * x.after).padStart(6)}MB  ${(x.b / 1e3).toFixed(0).padStart(5)}KB x${String(x.after).padStart(3)}  ${x.cat}  ${x.h}`);
