// Tests for strata-bp-lint.mjs. Run: node --test skills/strata-bp/scripts/
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, "strata-bp-lint.mjs");
const example = path.join(here, "..", "examples", "strata-bp-example.md");

function run(file, ...flags) {
  const r = spawnSync(process.execPath, [script, file, ...flags], { encoding: "utf8" });
  return { out: r.stdout, code: r.status, lines: r.stdout.split("\n").filter(Boolean) };
}
function lintText(md, ...flags) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "strata-bp-"));
  const f = path.join(dir, "doc.md"); fs.writeFileSync(f, md);
  try { return run(f, ...flags); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const warns = (r, check) => r.lines.filter((l) => l.startsWith(`WARN ${check}:`));
const L1 = "## Layer 1: Vision\n\nScope: all.\n\n";
const L2 = "## Layer 2: Architecture\n\nScope: all.\n\n";

test("clean pass on the example", () => {
  const r = run(example);
  assert.equal(r.code, 0);
  assert.equal(r.lines.filter((l) => l.startsWith("WARN")).length, 0);
  assert.match(r.lines.at(-1), /^strata-bp-lint: 0 warning\(s\)$/);
  assert.match(r.out, /^INFO not-supplied: 1$/m);
});

test("output shape and strict exit", () => {
  const md = L1 + L2 + "TODO later\n";
  const r = lintText(md);
  assert.equal(r.code, 0);
  assert.match(r.lines.at(-2), /^INFO not-supplied: 0$/);
  assert.match(r.lines.at(-1), /^strata-bp-lint: 1 warning\(s\)$/);
  assert.equal(lintText(md, "--strict").code, 1);
  assert.equal(lintText(L1 + L2, "--strict").code, 0);
});

test("layer-heading: bad name, wrong order, missing layer", () => {
  assert.equal(warns(lintText(L1 + "## Layer 2: Plans\n\nScope: x.\n"), "layer-heading").filter((l) => /Plans/.test(l)).length, 1);
  assert.equal(warns(lintText(L2 + L1), "layer-heading").length >= 1, true);
  const miss = warns(lintText(L2), "layer-heading");
  assert.equal(miss.some((l) => /Layer 1/.test(l)), true);
  assert.equal(warns(lintText(L1), "layer-heading").some((l) => /Layer 2/.test(l)), true);
  assert.equal(warns(lintText(L1 + L2 + "## Layer 5: Extra\n\nScope: x.\n"), "layer-heading").length, 1);
});

test("scope-line", () => {
  const r = lintText("## Layer 1: Vision\n\nSomething else.\n\n" + L2);
  assert.equal(warns(r, "scope-line").length, 1);
  assert.match(warns(r, "scope-line")[0], /\(line 3\)$/);
});

test("topic-order: unknown and out of order; omission and unnumbered allowed", () => {
  assert.equal(warns(lintText(L1 + L2 + "### 1. Parts\n### 2. Seams between parts\n### 3. Assumptions and decisions\n### Diagrams\n"), "topic-order").length, 0);
  assert.equal(warns(lintText(L1 + "### 1. Need\n### 2. Value\n### 3. Target audience\n" + L2), "topic-order").length, 1);
  assert.equal(warns(lintText(L1 + "### 1. Needs\n" + L2), "topic-order").length, 1);
  assert.equal(warns(lintText(L1 + "### 1. Parts\n" + L2), "topic-order").length, 1);
});

test("ring: outward reference warns, inward does not; fences ignored", () => {
  assert.equal(warns(lintText(L1 + "See Layer 3 for more.\n" + L2), "ring").length, 1);
  assert.equal(warns(lintText(L1 + L2 + "See Layer 1 and Layer 2.\n"), "ring").length, 0);
  assert.equal(warns(lintText(L1 + "```\nLayer 3\n```\n" + L2), "ring").length, 0);
});

test("scenario-form", () => {
  assert.equal(warns(lintText(L1 + "- Given a cat it sleeps.\n" + L2), "scenario-form").length, 1);
  assert.equal(warns(lintText(L1 + "- Given a cat, when it is fed, then it sleeps.\n" + L2), "scenario-form").length, 0);
  assert.equal(warns(lintText(L1 + "```\nGiven bad\n```\n" + L2), "scenario-form").length, 0);
});

test("diagram-title", () => {
  assert.equal(warns(lintText(L1 + L2 + "text\n```\nx\n```\n"), "diagram-title").length, 1);
  assert.equal(warns(lintText(L1 + L2 + "Title: Tree.\n```\nx\n```\n"), "diagram-title").length, 0);
});

test("diagram-key", () => {
  assert.equal(warns(lintText(L1 + L2 + "Title: Map.\n```mermaid\nflowchart LR\n```\n"), "diagram-key").length, 1);
  assert.equal(warns(lintText(L1 + L2 + "Title: Map. Key: arrows give.\n```mermaid\nflowchart LR\n```\n"), "diagram-key").length, 0);
});

test("reasons", () => {
  assert.equal(warns(lintText(L1 + "A1.1. Fact. If wrong: x.\n" + L2), "reasons").length, 1);
  assert.equal(warns(lintText(L1 + "A1.1. Fact. Basis: y. If wrong: x.\n" + L2), "reasons").length, 0);
  assert.equal(warns(lintText(L1 + "D1.1. Choice.\n" + L2), "reasons").length, 1);
  assert.equal(warns(lintText(L1 + "D1.1. Choice. Reason: z.\n" + L2), "reasons").length, 0);
});

test("unfinished", () => {
  for (const w of ["TODO", "TBD", "FIXME"]) assert.equal(warns(lintText(L1 + `${w} here\n` + L2), "unfinished").length, 1);
  assert.equal(warns(lintText(L1 + L2), "unfinished").length, 0);
});
