import { test, after } from "node:test";
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Every temp directory a test makes is removed when the file finishes (tmp-hygiene.test.mjs guards this).
const madeDirs = [];
function mk(prefix) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  madeDirs.push(d);
  return d;
}
after(() => {
  const root = path.resolve(os.tmpdir()) + path.sep;
  for (const d of madeDirs) if (path.resolve(d).startsWith(root)) fs.rmSync(d, { recursive: true, force: true });
});

const here = path.dirname(new URL(import.meta.url).pathname);
const SCRIPT = path.join(here, "research-index.mjs");

function run(args) {
  try {
    const out = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || "") + (e.stderr || "") };
  }
}

function tmp() {
  return mk("rindex-");
}

function write(dir, rel, body) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
  return p;
}

function entry(fm, body = "body\n") {
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}

function source(fm) {
  return entry({ origin: "https://example.com/a", date: "2026-01-02", question: "what is a?", summary: "a is a", ...fm });
}

test("writes index from entries", () => {
  const d = tmp();
  write(d, "sources/alpha.md", source({}));
  write(d, "findings/beta.md", entry({ date: "2026-01-03", question: "why beta?", summary: "beta works", from: "[alpha]", origin: "local/beta" }, "f\n"));
  const r = run(["--dir", d]);
  assert.strictEqual(r.code, 0);
  const idx = fs.readFileSync(path.join(d, "index.md"), "utf8");
  assert.match(idx, /## Sources/);
  assert.match(idx, /## Findings/);
  assert.match(idx, /\[alpha\]\(sources\/alpha\.md\) \(2026-01-02\) a is a \| what is a\?/);
  assert.match(idx, /\[beta\]\(findings\/beta\.md\) \(2026-01-03\) beta works \| why beta\?/);
});

test("index is deterministic", () => {
  const d = tmp();
  write(d, "sources/gamma.md", source({}));
  write(d, "sources/alpha.md", source({}));
  run(["--dir", d]);
  const a = fs.readFileSync(path.join(d, "index.md"), "utf8");
  run(["--dir", d]);
  const b = fs.readFileSync(path.join(d, "index.md"), "utf8");
  assert.strictEqual(a, b);
  assert.ok(a.indexOf("alpha") < a.indexOf("gamma"), "sorted by slug");
});

test("check fails on missing origin", () => {
  const d = tmp();
  write(d, "sources/alpha.md", entry({ question: "q", summary: "s" }));
  run(["--dir", d]);
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM MISSING-origin/);
  assert.match(r.out, /PROBLEM MISSING-date/);
});

test("check fails on bad date", () => {
  const d = tmp();
  write(d, "sources/alpha.md", source({ date: "01-02-2026" }));
  run(["--dir", d]);
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM BAD-DATE/);
});

test("check requires sha256 for local origin", () => {
  const d = tmp();
  const local = write(d, "data/file.txt", "payload\n");
  write(d, "sources/alpha.md", source({ origin: local }));
  run(["--dir", d]);
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM NO-HASH/);
});

test("check fails on hash mismatch", () => {
  const d = tmp();
  const local = write(d, "data/file.txt", "payload\n");
  write(d, "sources/alpha.md", source({ origin: local, sha256: "0".repeat(64) }));
  run(["--dir", d]);
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM HASH-MISMATCH/);
});

test("copy satisfies missing local file", () => {
  const d = tmp();
  const copy = write(d, "copies/kept.txt", "payload\n");
  const sha = crypto.createHash("sha256").update("payload\n").digest("hex");
  write(d, "sources/alpha.md", source({ origin: "/gone/orig.txt", sha256: sha, copy }));
  run(["--dir", d]);
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 0, r.out);
});

test("check fails on stale index", () => {
  const d = tmp();
  write(d, "sources/alpha.md", source({}));
  run(["--dir", d]);
  write(d, "sources/delta.md", source({}));
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM STALE-INDEX/);
});

test("split source sections need summary", () => {
  const d = tmp();
  write(d, "sources/big/00-index.md", source({}));
  write(d, "sources/big/01-part.md", entry({ summary: "part one" }));
  write(d, "sources/big/02-bad.md", "---\nno: summary\n---\nx\n");
  run(["--dir", d]);
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM MISSING-summary.*02-bad/);
});

test("findings reference resolves", () => {
  const d = tmp();
  write(d, "sources/alpha.md", source({}));
  write(d, "findings/good.md", entry({ date: "2026-01-03", question: "q", summary: "s", from: "[alpha]", origin: "local/x" }, "f\n"));
  write(d, "findings/bad.md", entry({ date: "2026-01-03", question: "q", summary: "s", from: "[nope]", origin: "local/x" }, "f\n"));
  run(["--dir", d]);
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM BAD-REF.*bad/);
  assert.doesNotMatch(r.out, /BAD-REF.*good/);
});

test("legacy file without frontmatter flagged", () => {
  const d = tmp();
  write(d, "sources/old.md", "just a note, no frontmatter\n");
  run(["--dir", d]);
  const r = run(["--dir", d, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM NO-FRONTMATTER.*old/);
});

// quote verification
const REAL = "The quick brown fox jumps over the lazy dog near the river bank.";
function quoteCase(findingBody, { listed = "[alpha]", alphaBody = `intro\n${REAL}\n`, betaBody = "other\n" } = {}) {
  const d = tmp();
  write(d, "sources/alpha.md", source({ origin: "https://example.com/a" }).replace(/body\n$/, alphaBody));
  write(d, "sources/beta.md", source({ origin: "https://example.com/b" }).replace(/body\n$/, betaBody));
  write(d, "findings/f.md", entry({ date: "2026-01-03", question: "q", summary: "s", from: listed, origin: "https://example.com/f" }, findingBody));
  run(["--dir", d]);
  return run(["--dir", d, "--check"]);
}

test("quote present in a listed source passes", () => {
  const r = quoteCase(`> **The quick** brown fox  jumps over the \`lazy\` dog near the river bank.\n\nQuote: "${REAL}"\n`);
  assert.strictEqual(r.code, 0, r.out);
});

test("invented quote fails with BAD-QUOTE", () => {
  const r = quoteCase("> The slow green turtle crawls under the lazy dog near the river.\n");
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /PROBLEM BAD-QUOTE findings\/f\.md "The slow green turtle/);
  const r2 = quoteCase('Quote: "An invented sentence that is certainly longer than forty characters."\n');
  assert.match(r2.out, /BAD-QUOTE/);
});

test("quote only in an unlisted source fails", () => {
  const r = quoteCase(`> ${REAL}\n`, { alphaBody: "nothing here\n", betaBody: `${REAL}\n` });
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /BAD-QUOTE/);
});

test("short inline quotes are ignored", () => {
  const r = quoteCase('Quote: "not in any source at all"\n');
  assert.strictEqual(r.code, 0, r.out);
});
