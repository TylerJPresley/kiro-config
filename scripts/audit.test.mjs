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
const SCRIPT = path.join(here, "audit.mjs");

// A fake `npm` is placed first on PATH so no test reaches the network.
function tmp() {
  return mk("audit-");
}

// Build a directory holding a fake `npm` that prints the given JSON (or exits with code).
function fakeNpm(jsonOrNull, { exitCode = 0 } = {}) {
  const bin = tmp();
  const payload = jsonOrNull == null ? "" : JSON.stringify(jsonOrNull);
  // The fake ignores arguments and prints the fixed JSON, then exits exitCode.
  const script =
    `#!/usr/bin/env node\n` +
    `process.stdout.write(${JSON.stringify(payload)});\n` +
    `process.exit(${exitCode});\n`;
  const p = path.join(bin, "npm");
  fs.writeFileSync(p, script);
  fs.chmodSync(p, 0o755);
  return bin;
}

// A fake npm that is not executable JS — simulates a spawn/JSON failure.
function brokenNpm() {
  const bin = tmp();
  const p = path.join(bin, "npm");
  fs.writeFileSync(p, "#!/usr/bin/env node\nprocess.stdout.write('not json');\nprocess.exit(0);\n");
  fs.chmodSync(p, 0o755);
  return bin;
}

const EMPTY_AUDIT = { vulnerabilities: {} };

function run(dir, { npmBin, env = {} } = {}) {
  const PATH = (npmBin ? npmBin + path.delimiter : "") + process.env.PATH;
  try {
    const out = execFileSync("node", [SCRIPT, "--dir", dir], {
      encoding: "utf8",
      env: { ...process.env, PATH, ...env },
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || "") + (e.stderr || "") };
  }
}

function write(dir, rel, content) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

// A minimal allow-list so license checks run.
const AGENTS_ALLOW = "# Project\n\n- Licenses allowed: MIT, ISC, BSD-2-Clause, Apache-2.0\n";

function pkg(extra = {}) {
  return JSON.stringify({ name: "demo", version: "1.0.0", ...extra });
}

// lockfile v3 with the given package entries (keyed by node_modules path).
function lock(packages) {
  return JSON.stringify({ lockfileVersion: 3, packages: { "": {}, ...packages } });
}

test("header and six check lines", () => {
  const d = tmp();
  write(d, "package.json", pkg());
  write(d, "package-lock.json", lock({}));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  const lines = r.out.trim().split("\n");
  assert.match(lines[0], /^audit \S+ \d{4}-\d{2}-\d{2} UTC ecosystem=npm$/);
  for (const c of ["licenses", "advisories", "install-scripts", "unpinned", "secrets", "code-patterns"]) {
    assert.ok(lines.some((l) => l.startsWith(c + " ")), "missing check line " + c);
  }
});

test("clean project is ok", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { left: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/left": { license: "MIT" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.strictEqual(r.code, 0, r.out);
});

test("unpinned range flagged", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { left: "^1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/left": { license: "MIT" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /unpinned findings/);
  assert.strictEqual(r.code, 1);
});

test("no lockfile flagged", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { left: "1.0.0" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /licenses NOT RUN/);
  assert.match(r.out, /no-lockfile/);
});

test("rejected license critical for shipped", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { copyleft: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/copyleft": { license: "GPL-3.0" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  const detail = fs.readFileSync(path.join(d, "_internal/scratch/audit/licenses.txt"), "utf8");
  assert.match(detail, /critical copyleft GPL-3\.0/);
  assert.strictEqual(r.code, 1);
});

test("peer rejected license is high", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { pcl: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/pcl": { license: "GPL-3.0", peer: true } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  const detail = fs.readFileSync(path.join(d, "_internal/scratch/audit/licenses.txt"), "utf8");
  assert.match(detail, /high pcl GPL-3\.0/);
});

test("dev-only license is info only", () => {
  const d = tmp();
  write(d, "package.json", pkg({ devDependencies: { tool: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/tool": { license: "GPL-3.0", dev: true } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /licenses-dev info 1/);
  assert.match(r.out, /licenses ok/);
  assert.strictEqual(r.code, 0, r.out);
});

test("unclassified license needs decision", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { weird: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/weird": { license: "SEE LICENSE IN FILE" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /NEEDS-DECISION license SEE LICENSE IN FILE packages=1 scope=SHIPPED/);
  assert.match(r.out, /decisions 1/);
  assert.strictEqual(r.code, 1);
});

test("spdx OR picks best branch", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { dual: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/dual": { license: "GPL-3.0 OR MIT" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /licenses ok/);
  assert.strictEqual(r.code, 0, r.out);
});

test("spdx AND picks worst leaf", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { both: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/both": { license: "MIT AND GPL-3.0" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  const detail = fs.readFileSync(path.join(d, "_internal/scratch/audit/licenses.txt"), "utf8");
  assert.match(detail, /critical both/);
  assert.strictEqual(r.code, 1);
});

test("MIT-0 allowed with MIT", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { zero: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/zero": { license: "MIT-0" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /licenses ok/);
  assert.strictEqual(r.code, 0, r.out);
});

test("missing allow-list is NOT RUN", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { left: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/left": { license: "MIT" } }));
  // no AGENTS.md
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /licenses NOT RUN/);
  assert.match(r.out, /add "Licenses allowed/);
});

test("install script flagged", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { hooky: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/hooky": { license: "MIT", hasInstallScript: true } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /install-scripts findings/);
  assert.strictEqual(r.code, 1);
});

test("secret reported by name without value", () => {
  const d = tmp();
  write(d, "package.json", pkg());
  write(d, "package-lock.json", lock({}));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const key = "AKIA" + "ABCDEFGHIJKLMNOP";
  write(d, "src/leak.js", `const k = "${key}";\n`);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.doesNotMatch(r.out, new RegExp(key));
  const detail = fs.readFileSync(path.join(d, "_internal/scratch/audit/secrets.txt"), "utf8");
  assert.doesNotMatch(detail, new RegExp(key));
  assert.match(detail, /aws-access-key/);
});

test("secret-named file is not opened", () => {
  const d = tmp();
  write(d, "package.json", pkg());
  write(d, "package-lock.json", lock({}));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  // .env holds a secret but is never scanned, and it is not git-tracked here.
  write(d, ".env", 'API_KEY="' + "AKIA" + "ABCDEFGHIJKLMNOP" + '"\n');
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.doesNotMatch(r.out, /AKIA/);
  const detail = fs.readFileSync(path.join(d, "_internal/scratch/audit/secrets.txt"), "utf8");
  assert.doesNotMatch(detail, /AKIA/);
  // no secret finding since .env is not opened and not tracked
  assert.match(r.out, /secrets ok/);
});

test("tracked secret file reported", () => {
  const d = tmp();
  write(d, "package.json", pkg());
  write(d, "package-lock.json", lock({}));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  write(d, ".env", 'API_KEY="' + "AKIA" + "ABCDEFGHIJKLMNOP" + '"\n');
  execFileSync("git", ["init", "-q"], { cwd: d });
  execFileSync("git", ["add", ".env"], { cwd: d });
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /secrets findings/);
  const detail = fs.readFileSync(path.join(d, "_internal/scratch/audit/secrets.txt"), "utf8");
  assert.match(detail, /secret-file-tracked \.env/);
  assert.doesNotMatch(detail, /AKIA/);
});

test("code pattern flagged", () => {
  const d = tmp();
  write(d, "package.json", pkg());
  write(d, "package-lock.json", lock({}));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  write(d, "src/danger.js", "function f(x){ return eval(x); }\n");
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /code-patterns findings/);
  const detail = fs.readFileSync(path.join(d, "_internal/scratch/audit/code-patterns.txt"), "utf8");
  assert.match(detail, /eval-call/);
});

test("bundler detected needs decision", () => {
  const d = tmp();
  write(d, "package.json", pkg({ scripts: { build: "esbuild src/index.js --bundle" } }));
  write(d, "package-lock.json", lock({}));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /NEEDS-DECISION bundler-detected/);
});

test("npm audit failure is NOT RUN", () => {
  const d = tmp();
  write(d, "package.json", pkg());
  write(d, "package-lock.json", lock({}));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: brokenNpm() });
  assert.match(r.out, /advisories NOT RUN/);
});

test("advisory severity ranked", () => {
  const d = tmp();
  write(d, "package.json", pkg());
  write(d, "package-lock.json", lock({}));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const audit = {
    vulnerabilities: {
      lowpkg: { severity: "low" },
      critpkg: { severity: "critical" },
      modpkg: { severity: "moderate" },
    },
  };
  const r = run(d, { npmBin: fakeNpm(audit, { exitCode: 1 }) });
  const lines = r.out.split("\n");
  const topIdx = lines.indexOf("top:");
  const afterTop = lines.slice(topIdx + 1);
  // critical appears before low in the ranked top block
  const critLine = afterTop.findIndex((l) => l.startsWith("critical "));
  const lowLine = afterTop.findIndex((l) => l.startsWith("low "));
  assert.ok(critLine >= 0 && (lowLine === -1 || critLine < lowLine), r.out);
  assert.strictEqual(r.code, 1);
});

test("other manifest is NOT RUN", () => {
  const d = tmp();
  write(d, "Cargo.toml", "[package]\nname = \"x\"\n");
  const r = run(d, {});
  assert.match(r.out, /ecosystem=cargo/);
  assert.match(r.out, /licenses NOT RUN/);
  assert.strictEqual(r.code, 2);
});

test("no manifest exits 2", () => {
  const d = tmp();
  const r = run(d, {});
  assert.match(r.out, /ecosystem=none/);
  assert.strictEqual(r.code, 2);
});

test("output at most 30 lines", () => {
  const d = tmp();
  const deps = {};
  const packages = {};
  for (let i = 0; i < 40; i++) {
    deps["dep" + i] = "^1.0.0";
    packages["node_modules/dep" + i] = { license: "SEE LICENSE" + i };
  }
  write(d, "package.json", pkg({ dependencies: deps }));
  write(d, "package-lock.json", lock(packages));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  const n = r.out.trim().split("\n").length;
  assert.ok(n <= 30, "got " + n + " lines");
});

test("exit 3 on script error", () => {
  const d = tmp();
  // package.json present but not valid JSON for the lock path; force an error by making
  // _internal/scratch/audit a file so mkdir fails.
  write(d, "package.json", pkg());
  fs.mkdirSync(path.join(d, "_internal", "scratch"), { recursive: true });
  fs.writeFileSync(path.join(d, "_internal", "scratch", "audit"), "x");
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.strictEqual(r.code, 3);
  assert.match(r.out, /audit: error/);
});

test("detail files written under scratch", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { left: "^1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/left": { license: "MIT" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.ok(fs.existsSync(path.join(d, "_internal/scratch/audit/unpinned.txt")));
  assert.ok(fs.existsSync(path.join(d, "_internal/scratch/audit/secrets.txt")));
});

test("decisions keep exit 1", () => {
  const d = tmp();
  write(d, "package.json", pkg({ dependencies: { weird: "1.0.0" } }));
  write(d, "package-lock.json", lock({ "node_modules/weird": { license: "Custom-X" } }));
  write(d, "AGENTS.md", AGENTS_ALLOW);
  const r = run(d, { npmBin: fakeNpm(EMPTY_AUDIT) });
  assert.match(r.out, /decisions 1/);
  assert.strictEqual(r.code, 1);
});
