#!/usr/bin/env node
// Where do Kiro tokens/credits go?  usage: node ~/.kiro/scripts/kiro-usage.mjs [session-id|latest|all] [--top N]
// Reads ~/.kiro/sessions/cli/<id>.json (user_turn_metadatas) - no model, no network.
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const dir = path.join(os.homedir(), ".kiro/sessions/cli");
const arg = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "latest";
const topN = Number(process.argv[process.argv.indexOf("--top") + 1]) || 10;
const since = process.argv.includes("--since") ? Date.parse(process.argv[process.argv.indexOf("--since") + 1]) : 0;
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).filter((x) => x.t >= since).sort((a, b) => b.t - a.t);
const pick = arg === "all" ? files : arg === "latest" ? files.slice(0, 1) : files.filter((x) => x.f.startsWith(arg));
const credit = (m) => { const u = m?.metering_usage; if (u == null) return 0; if (typeof u === "number") return u; if (Array.isArray(u)) return u.reduce((s, x) => s + (Number(x?.value ?? x?.usage ?? 0) || 0), 0); return Number(u.value ?? u.usage ?? 0) || 0; };
let all = [];
for (const { f } of pick) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); const sa = j.session_state?.agent_name ?? "?"; const m = j.session_state?.conversation_metadata;
  const t = m?.user_turn_metadatas; const turns = Array.isArray(t) ? t : Object.values(t ?? {});
  turns.forEach((x, i) => all.push({ s: f.slice(0, 8), i, agent: sa, parent: x.loop_id?.agent_id?.parent_id, inp: x.input_token_count ?? 0, out: x.output_token_count ?? 0, cr: x.cache_read_input_token_count ?? 0, cw: x.cache_write_input_token_count ?? 0, cycles: x.number_of_cycles ?? 0, reqs: x.total_request_count ?? 0, secs: x.turn_duration?.secs ?? (typeof x.turn_duration === "number" ? x.turn_duration : 0), ctx: x.final_context_usage_percentage ?? 0, cred: credit(x), tools: x.builtin_tool_uses ? Object.values(x.builtin_tool_uses).reduce((a, b) => a + (Number(b) || 0), 0) : 0 }));
}
const sum = (k, a = all) => a.reduce((s, x) => s + x[k], 0); const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(Math.round(n * 100) / 100));
console.log(`sessions: ${pick.length}  turns: ${all.length}${since ? "  since " + new Date(since).toISOString().slice(0,10) : ""}`);
const perSess = {}; for (const x of all) (perSess[x.s] ??= { agent: x.agent, cred: 0, reqs: 0 }), (perSess[x.s].cred += x.cred), (perSess[x.s].reqs += x.reqs);
const byAgentSess = {}; for (const v of Object.values(perSess)) { const a = (byAgentSess[v.agent] ??= { n: 0, cred: 0 }); a.n++; a.cred += v.cred; }
console.log("sessions by agent: agent  sessions  credits  avg/session"); for (const [k, v] of Object.entries(byAgentSess).sort((p, q) => q[1].cred - p[1].cred)) console.log(`  ${k.padEnd(22)} ${String(v.n).padStart(5)}  ${fmt(v.cred).padStart(8)}  ${fmt(v.cred / v.n).padStart(7)}`);
console.log(`credits: ${fmt(sum("cred"))}  input: ${fmt(sum("inp"))}  output: ${fmt(sum("out"))}  cache-read: ${fmt(sum("cr"))}  cache-write: ${fmt(sum("cw"))}  requests: ${sum("reqs")}  cycles: ${sum("cycles")}`);
const by = {}; for (const x of all) { const k = x.parent ? "sub:" + x.agent : x.agent; (by[k] ??= []).push(x); }
console.log("\nby agent: name  turns  credits  input  output  requests");
for (const [k, a] of Object.entries(by).sort((p, q) => sum("cred", q[1]) - sum("cred", p[1]))) console.log(`  ${k.padEnd(22)} ${String(a.length).padStart(4)}  ${fmt(sum("cred", a)).padStart(8)}  ${fmt(sum("inp", a)).padStart(8)}  ${fmt(sum("out", a)).padStart(8)}  ${String(sum("reqs", a)).padStart(5)}`);
console.log(`\ntop ${topN} turns by credits: session turn agent credits input output reqs cycles tools secs ctx%`);
for (const x of [...all].sort((a, b) => b.cred - a.cred).slice(0, topN)) console.log(`  ${x.s} #${String(x.i).padStart(3)} ${x.agent.padEnd(14)} ${fmt(x.cred).padStart(7)} ${fmt(x.inp).padStart(8)} ${fmt(x.out).padStart(7)} ${String(x.reqs).padStart(4)} ${String(x.cycles).padStart(3)} ${String(x.tools).padStart(3)} ${String(Math.round(x.secs)).padStart(5)}s ${Math.round(x.ctx)}%`);
const many = all.filter((x) => x.reqs > 20); console.log(`\nturns with >20 model requests: ${many.length} of ${all.length}  (credits ${fmt(sum("cred", many))}, ${Math.round(100 * sum("cred", many) / Math.max(1, sum("cred")))}% of total; avg credits/request ${(sum("cred") / Math.max(1, sum("reqs"))).toFixed(2)})`);
const big = all.filter((x) => x.ctx >= 70); console.log(`\nturns started/ended at >=70% context: ${big.length} of ${all.length}  (credits in them: ${fmt(sum("cred", big))}, ${Math.round(100 * sum("cred", big) / Math.max(1, sum("cred")))}% of total)`);
