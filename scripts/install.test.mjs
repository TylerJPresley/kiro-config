import { test, after } from "node:test";
import assert from "node:assert";
import { execFileSync } from "node:child_process";
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
const SCRIPT = path.join(here, "install.mjs");

// Minimal steering-lint with the same CLI contract, used when the real sibling is not
// beside this test (e.g. the mutant copy run in a temp dir). Fails on a steering .md
// missing an Intent:/Applies: line, passes otherwise.
const STEERING_LINT_STUB = `import fs from "node:fs"; import path from "node:path";
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const s = arg("--steering-dir"); let bad = 0;
if (s && fs.existsSync(s)) for (const f of fs.readdirSync(s).filter((x) => x.endsWith(".md"))) {
  const t = fs.readFileSync(path.join(s, f), "utf8");
  if (!/^Intent:\\s*\\S/m.test(t) || !/^Applies:\\s*\\S/m.test(t)) bad++;
}
process.exit(bad ? 1 : 0);
`;

function run(args) {
  try {
    const out = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || "") + (e.stderr || "") };
  }
}

function tmp(prefix) {
  return mk(prefix);
}

function writeFile(root, rel, body) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
  return p;
}

// A minimal, valid source tree: one file in each of the four directories.
// steering and skills pass steering-lint; agents holds valid JSON.
function makeSource() {
  const src = tmp("install-src-");
  writeFile(src, "steering/one.md", "# One\n\nIntent: x\nApplies: y\n\n- rule\n");
  writeFile(
    src,
    "skills/demo/SKILL.md",
    '---\nname: demo\ndescription: "a demo skill, used when testing"\n---\n\n# Demo\n'
  );
  writeFile(src, "agents/director.json", JSON.stringify({ name: "director" }));
  writeFile(src, "scripts/tool.mjs", "// tool\n");
  // install resolves steering-lint from the source scripts dir for --check; use the
  // sibling when present, else a minimal stub with the same CLI (so tests run in any location)
  const sibling = path.join(here, "steering-lint.mjs");
  const lintDest = path.join(src, "scripts", "steering-lint.mjs");
  if (fs.existsSync(sibling)) fs.copyFileSync(sibling, lintDest);
  else writeFile(src, "scripts/steering-lint.mjs", STEERING_LINT_STUB);
  return src;
}

test("creates new files", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  const r = run(["--source", src, "--target", target]);
  assert.strictEqual(r.code, 0);
  assert.ok(fs.existsSync(path.join(target, "steering/one.md")));
  // agents is one of the four directories; a mutant that drops it leaves this file uncopied
  assert.ok(fs.existsSync(path.join(target, "agents/director.json")));
  assert.ok(fs.existsSync(path.join(target, "skills/demo/SKILL.md")));
  assert.ok(fs.existsSync(path.join(target, "scripts/tool.mjs")));
});

test("second run is a no-op", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  run(["--source", src, "--target", target]);
  const second = run(["--source", src, "--target", target]);
  assert.strictEqual(second.code, 0);
  assert.match(second.out, /SAME agents\/director\.json/);
  assert.doesNotMatch(second.out, /^(NEW|CHANGED) /m);
  assert.ok(!fs.existsSync(path.join(target, "_internal", "backups")));
});

test("backs up changed file before overwrite", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  run(["--source", src, "--target", target]);
  // change the target copy, then re-run from source
  fs.writeFileSync(path.join(target, "scripts/tool.mjs"), "// old target content\n");
  const r = run(["--source", src, "--target", target]);
  assert.strictEqual(r.code, 0);
  assert.match(r.out, /CHANGED scripts\/tool\.mjs/);
  // target now matches source
  assert.strictEqual(fs.readFileSync(path.join(target, "scripts/tool.mjs"), "utf8"), "// tool\n");
  // a backup of the old content exists
  const backups = path.join(target, "_internal", "backups");
  const dirs = fs.readdirSync(backups).filter((d) => d.startsWith("install-"));
  assert.strictEqual(dirs.length, 1);
  const bak = path.join(backups, dirs[0], "scripts/tool.mjs");
  assert.strictEqual(fs.readFileSync(bak, "utf8"), "// old target content\n");
});

test("dry-run writes nothing", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  const r = run(["--source", src, "--target", target, "--dry-run"]);
  assert.strictEqual(r.code, 0);
  assert.match(r.out, /dry-run: wrote nothing/);
  assert.ok(!fs.existsSync(path.join(target, "steering/one.md")));
  assert.ok(!fs.existsSync(path.join(target, "agents/director.json")));
});

test("check exits 1 when different", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  // target is empty, so every source file is NEW
  const r = run(["--source", src, "--target", target, "--check"]);
  assert.strictEqual(r.code, 1);
  // check writes nothing
  assert.ok(!fs.existsSync(path.join(target, "steering/one.md")));
});

test("reports extra files and keeps them", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  run(["--source", src, "--target", target]);
  // a file in the target not present in the source
  const extra = path.join(target, "steering/extra.md");
  fs.writeFileSync(extra, "# extra\n");
  const r = run(["--source", src, "--target", target]);
  assert.strictEqual(r.code, 0);
  assert.match(r.out, /EXTRA steering\/extra\.md/);
  assert.ok(fs.existsSync(extra), "extra file is kept, never deleted");
});

test("never touches other directories", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  // a directory outside the four listed ones
  writeFile(target, "settings/cli.json", "{}\n");
  run(["--source", src, "--target", target]);
  assert.ok(fs.existsSync(path.join(target, "settings/cli.json")));
  assert.strictEqual(fs.readFileSync(path.join(target, "settings/cli.json"), "utf8"), "{}\n");
});

test("refuses target equal to source", () => {
  const src = makeSource();
  const r = run(["--source", src, "--target", src]);
  assert.strictEqual(r.code, 2);
});

test("check validates agent JSON", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  // install cleanly first so only the JSON check can fail
  run(["--source", src, "--target", target]);
  // corrupt an agent file in the source
  fs.writeFileSync(path.join(src, "agents/director.json"), "{ not valid json");
  const r = run(["--source", src, "--target", target, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /director\.json is not valid JSON/);
});

test("runs steering-lint on target", () => {
  const src = makeSource();
  const target = tmp("install-tgt-");
  run(["--source", src, "--target", target]);
  // plant a steering file in the target that steering-lint rejects (missing Intent/Applies)
  fs.writeFileSync(path.join(target, "steering/bad.md"), "# Bad\n\nno required labels\n");
  const r = run(["--source", src, "--target", target, "--check"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /steering-lint reported problems/);
});

function settingsCase(body) {
  const src = makeSource();
  const target = tmp("install-tgt-");
  run(["--source", src, "--target", target]);
  const settings = path.join(tmp("install-set-"), "cli.json");
  if (body !== undefined) fs.writeFileSync(settings, body);
  return run(["--source", src, "--target", target, "--settings", settings, "--check"]);
}

test("check fails when chat.disableInheritingDefaultResources is true", () => {
  const r = settingsCase('{"chat.disableInheritingDefaultResources": true}');
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /chat\.disableInheritingDefaultResources is true/);
});

test("check passes when the inheritance setting is false or absent", () => {
  assert.strictEqual(settingsCase('{"chat.disableInheritingDefaultResources": false}').code, 0);
  assert.strictEqual(settingsCase("{}").code, 0);
  assert.strictEqual(settingsCase(undefined).code, 0);
});

test("hooks are installed with the other directories", () => {
  const src = makeSource();
  writeFile(src, "hooks/h.json", '{ "version": "v1", "hooks": [] }');
  const target = tmp("install-tgt-");
  const r = run(["--source", src, "--target", target]);
  assert.strictEqual(r.code, 0);
  assert.ok(fs.existsSync(path.join(target, "hooks/h.json")));
});
