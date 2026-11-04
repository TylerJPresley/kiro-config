#!/usr/bin/env node
// Gather release-prep audit facts for a project: licenses, advisories, install scripts,
// unpinned specs, secrets, code patterns. A script gathers; the reviewer judges flagged items.
// usage: node audit.mjs [--dir DIR]
// Reads files and runs `npm audit --json` once. Writes only <dir>/_internal/scratch/audit/.
// Secret values never reach stdout or any detail file.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const EXIT = { ok: 0, findings: 1, notRun: 2, error: 3 };

// Ecosystem detection table. Only npm runs now; the rest report NOT RUN with the install hint.
const ECOSYSTEMS = [
  { manifest: "package.json", eco: "npm", hint: "run `npm audit` with a lockfile" },
  { manifest: "pyproject.toml", eco: "pip", hint: "install pip-audit and pip-licenses" },
  { manifest: "requirements.txt", eco: "pip", hint: "install pip-audit and pip-licenses" },
  { manifest: "Cargo.toml", eco: "cargo", hint: "install cargo-audit and cargo-deny" },
  { manifest: "go.mod", eco: "go", hint: "install govulncheck and go-licenses" },
  { manifest: "pom.xml", eco: "maven", hint: "install OWASP dependency-check" },
  { manifest: "build.gradle", eco: "gradle", hint: "install OWASP dependency-check" },
];

const CHECK_ORDER = ["licenses", "advisories", "install-scripts", "unpinned", "secrets", "code-patterns"];
const SEV_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

const REJECT_PREFIXES = [
  "GPL-", "AGPL-", "LGPL-", "MPL-", "EPL-", "CDDL-", "EUPL-",
  "OSL-", "CPAL-", "SSPL-", "BUSL-", "CC-BY-SA-", "CC-BY-NC-",
];

const SECRET_PATTERNS = [
  { name: "aws-access-key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "github-token", re: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  { name: "slack-token", re: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: "generic-secret", re: /(api[_-]?key|secret|token|passw(or)?d)\s*[:=]\s*["'][^"'\s]{12,}["']/i },
];

const CODE_PATTERNS = [
  { name: "eval-call", re: /\beval\s*\(/, sev: "medium" },
  { name: "new-function", re: /\bnew Function\s*\(/, sev: "medium" },
  { name: "exec-string", re: /\b(?:exec|execSync)\s*\(\s*(?:`|["'][^"']*["']\s*\+)/, sev: "medium" },
  { name: "inner-html", re: /\.innerHTML\s*=/, sev: "low" },
  { name: "tls-off", re: /rejectUnauthorized\s*:\s*false/, sev: "low" },
];

const CODE_EXT = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".html"]);
const WALK_SKIP = new Set([".git", "node_modules", "_internal", "dist", "build", "out", "coverage"]);
// File names like the secret set are never opened for scanning.
const SECRET_FILE_RE = /(^|\/)(\.env(\..*)?|.*\.pem|.*\.key|id_rsa.*|id_ed25519.*|id_ecdsa.*|id_dsa.*|\.netrc|credentials\.json|.*\.p12|.*\.pfx|.*\.jks)$/;

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// --- License policy (SPDX) ---
function loadAllowList(dir) {
  const p = path.join(dir, "AGENTS.md");
  let text;
  try {
    text = fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*[-*]?\s*Licen[sc]es? allowed:\s*(.+)$/i);
    if (m) return m[1].split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  }
  return null;
}

function leafClass(id, allow) {
  let s = id.trim().replace(/\+$/, "").toLowerCase();
  if (!s) return "unclassified";
  if (allow.includes(s)) return "allowed";
  if (s === "mit-0" && allow.includes("mit")) return "allowed";
  for (const pre of REJECT_PREFIXES) if (s.startsWith(pre.toLowerCase())) return "rejected";
  return "unclassified";
}

// best for OR: allowed > unclassified > rejected; worst for AND: rejected > unclassified > allowed
const OR_RANK = { allowed: 0, unclassified: 1, rejected: 2 };
const AND_RANK = { rejected: 0, unclassified: 1, allowed: 2 };

function classifyExpr(expr, allow) {
  const tokens = tokenizeSpdx(expr);
  let pos = 0;
  function peek() {
    return tokens[pos];
  }
  function next() {
    return tokens[pos++];
  }
  function parsePrimary() {
    const t = peek();
    if (t === "(") {
      next();
      const v = parseOr();
      if (peek() === ")") next();
      return v;
    }
    return leafClass(next() || "", allow);
  }
  function parseAnd() {
    let best = parsePrimary();
    while (peek() && peek().toUpperCase() === "AND") {
      next();
      const r = parsePrimary();
      if (AND_RANK[r] < AND_RANK[best]) best = r;
    }
    return best;
  }
  function parseOr() {
    let best = parseAnd();
    while (peek() && peek().toUpperCase() === "OR") {
      next();
      const r = parseAnd();
      if (OR_RANK[r] < OR_RANK[best]) best = r;
    }
    return best;
  }
  return parseOr();
}

function tokenizeSpdx(expr) {
  const out = [];
  let cur = "";
  for (const ch of expr) {
    if (ch === "(" || ch === ")") {
      if (cur.trim()) out.push(cur.trim());
      out.push(ch);
      cur = "";
    } else if (/\s/.test(ch)) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  // merge AND/OR keywords vs ids: keep as-is; classifyExpr compares upper-case
  return out;
}

// --- File walk for secrets and code patterns ---
function* walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (WALK_SKIP.has(e.name)) continue;
      yield* walk(path.join(dir, e.name));
    } else if (e.isFile()) {
      yield path.join(dir, e.name);
    }
  }
}

function readScannable(p) {
  let st;
  try {
    st = fs.statSync(p);
  } catch {
    return null;
  }
  if (st.size > 1024 * 1024) return null;
  let buf;
  try {
    buf = fs.readFileSync(p);
  } catch {
    return null;
  }
  if (buf.includes(0)) return null;
  return buf.toString("utf8");
}

function trackedFiles(dir) {
  try {
    const out = execFileSync("git", ["ls-files"], {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(out.split("\n").filter(Boolean));
  } catch {
    return new Set();
  }
}

// --- main ---
function main() {
  const dir = path.resolve(arg("--dir", process.cwd()));
  const base = path.basename(dir);
  const scratch = path.join(dir, "_internal", "scratch", "audit");
  fs.mkdirSync(scratch, { recursive: true });
  const detail = {};
  const writeDetail = (check, lines) => {
    const file = path.join("_internal/scratch/audit", check + ".txt");
    fs.writeFileSync(path.join(scratch, check + ".txt"), lines.join("\n") + (lines.length ? "\n" : ""));
    detail[check] = file;
    return file;
  };

  // Detect ecosystems present.
  const present = ECOSYSTEMS.filter((e) => fs.existsSync(path.join(dir, e.manifest)));
  const npmPresent = present.some((e) => e.eco === "npm");
  const others = present.filter((e) => e.eco !== "npm");

  const status = {};
  const counts = {};
  const detailFile = {};
  const hint = {}; // check -> install/usage hint for NOT RUN lines
  const top = []; // { sev, check, target, note }
  const decisions = []; // NEEDS-DECISION lines
  const extraLines = []; // bundler / other-ecosystem lines

  for (const c of CHECK_ORDER) {
    status[c] = "NOT RUN";
    counts[c] = 0;
    detailFile[c] = "-";
  }

  let eco;
  let pkg = null;
  if (npmPresent) {
    eco = "npm";
    pkg = readJson(path.join(dir, "package.json")) || {};
  } else if (others.length) {
    eco = others[0].eco;
  } else {
    eco = "none";
  }

  // ---- npm checks ----
  if (npmPresent) {
    const lock = readJson(path.join(dir, "package-lock.json"));
    const lockPackages = lock && lock.packages ? lock.packages : null;

    // licenses + install-scripts rely on the lockfile.
    const allow = loadAllowList(dir);
    const unpinnedFindings = [];

    // unpinned: specs that are not exact semver.
    const exact = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
    for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
      const deps = pkg[field] || {};
      for (const [name, spec] of Object.entries(deps)) {
        if (typeof spec !== "string") continue;
        if (/^(file:|link:|workspace:)/.test(spec)) continue;
        if (!exact.test(spec)) unpinnedFindings.push(`${name} ${spec}`);
      }
    }

    // licenses
    const licenseDetail = [];
    const devLicenses = [];
    const needsByLicense = new Map(); // id -> count (unclassified SHIPPED)
    if (!lockPackages) {
      status.licenses = "NOT RUN";
      detailFile.licenses = writeDetail("licenses", ["no-lockfile: package-lock.json (v2/v3) absent"]);
      unpinnedFindings.push("no-lockfile");
    } else if (!allow) {
      status.licenses = "NOT RUN";
      licenseDetail.push('add "Licenses allowed: MIT, ..." to AGENTS.md');
      detailFile.licenses = writeDetail("licenses", licenseDetail);
      hint.licenses = 'add "Licenses allowed: MIT, ..." to AGENTS.md';
    } else {
      for (const [p, entry] of Object.entries(lockPackages)) {
        if (!p || p === "") continue; // root
        const name = p.replace(/^.*node_modules\//, "");
        let id = entry.license;
        if (!id) {
          const sub = readJson(path.join(dir, p, "package.json"));
          id = sub && sub.license ? (typeof sub.license === "string" ? sub.license : sub.license.type) : null;
        }
        if (!id) id = "UNKNOWN";
        if (entry.dev === true) {
          devLicenses.push(`${name} ${id}`);
          continue;
        }
        const cls = classifyExpr(String(id), allow);
        if (cls === "allowed") continue;
        if (cls === "rejected") {
          const sev = entry.peer === true || entry.optional === true ? "high" : "critical";
          const line = `${sev} ${name} ${id} SHIPPED rejected`;
          licenseDetail.push(line);
          top.push({ sev, check: "licenses", target: name, note: `${id} rejected` });
          counts.licenses++;
        } else {
          needsByLicense.set(id, (needsByLicense.get(id) || 0) + 1);
          licenseDetail.push(`unclassified ${name} ${id} SHIPPED`);
          counts.licenses++;
        }
      }
      for (const [id, n] of needsByLicense) {
        decisions.push(`NEEDS-DECISION license ${id} packages=${n} scope=SHIPPED`);
      }
      detailFile.licenses = writeDetail("licenses", licenseDetail);
      status.licenses = counts.licenses ? "findings" : "ok";
    }

    // dev license info
    let devInfoLine = null;
    if (devLicenses.length) {
      writeDetail("licenses-dev", devLicenses);
      const ids = [...new Set(devLicenses.map((l) => l.split(" ").slice(1).join(" ")))].slice(0, 3).join(", ");
      devInfoLine = `licenses-dev info ${devLicenses.length} ${ids}`;
    }

    // bundler detection
    const scripts = pkg.scripts || {};
    for (const v of Object.values(scripts)) {
      if (typeof v === "string" && /\b(esbuild|vite build|webpack|rollup|tsup|parcel)\b/.test(v)) {
        decisions.push(`NEEDS-DECISION bundler-detected ${pkg.name || base}`);
        break;
      }
    }

    // install-scripts (needs lockfile)
    if (lockPackages) {
      const isFindings = [];
      for (const [p, entry] of Object.entries(lockPackages)) {
        if (!p) continue;
        if (entry.hasInstallScript === true) {
          const name = p.replace(/^.*node_modules\//, "");
          isFindings.push(`medium ${name}`);
          top.push({ sev: "medium", check: "install-scripts", target: name, note: "runs an install script" });
        }
      }
      counts["install-scripts"] = isFindings.length;
      detailFile["install-scripts"] = writeDetail("install-scripts", isFindings);
      status["install-scripts"] = isFindings.length ? "findings" : "ok";
    } else {
      status["install-scripts"] = "NOT RUN";
      detailFile["install-scripts"] = writeDetail("install-scripts", ["no-lockfile"]);
    }

    // unpinned
    counts.unpinned = unpinnedFindings.length;
    detailFile.unpinned = writeDetail("unpinned", unpinnedFindings.map((u) => `low ${u}`));
    status.unpinned = unpinnedFindings.length ? "findings" : "ok";
    for (const u of unpinnedFindings) top.push({ sev: "low", check: "unpinned", target: u, note: "not pinned" });

    // advisories
    const adv = runNpmAudit(dir);
    if (adv.error) {
      status.advisories = "NOT RUN";
      detailFile.advisories = writeDetail("advisories", [adv.error]);
    } else {
      const sevMap = { critical: "critical", high: "high", moderate: "medium", low: "low" };
      const advLines = [];
      for (const v of adv.vulns) {
        const sev = sevMap[v.severity] || "low";
        advLines.push(`${sev} ${v.name}`);
        top.push({ sev, check: "advisories", target: v.name, note: "advisory" });
      }
      counts.advisories = advLines.length;
      detailFile.advisories = writeDetail("advisories", advLines);
      status.advisories = advLines.length ? "findings" : "ok";
    }

    // extra lines for other ecosystems alongside npm
    for (const o of others) {
      extraLines.push(`ecosystem ${o.eco} NOT RUN no detector yet`);
    }

    runSecretAndCode(dir, status, counts, detailFile, top, writeDetail);
    reportAndExit({ base, eco, status, counts, detailFile, hint, top, decisions, extraLines, devInfoLine, npmRan: true });
    return;
  }

  // ---- non-npm: everything NOT RUN ----
  let devInfoLine = null;
  if (others.length) {
    const h = others[0].hint;
    for (const c of CHECK_ORDER) {
      status[c] = "NOT RUN";
      detailFile[c] = writeDetail(c, [h]);
      hint[c] = h;
    }
  }
  reportAndExit({ base, eco, status, counts, detailFile, hint, top, decisions, extraLines, devInfoLine, npmRan: false });
}

function runSecretAndCode(dir, status, counts, detailFile, top, writeDetail) {
  const tracked = trackedFiles(dir);
  const secretFindings = [];
  const codeFindings = [];
  for (const file of walk(dir)) {
    const rel = path.relative(dir, file).split(path.sep).join("/");
    if (SECRET_FILE_RE.test(rel) || SECRET_FILE_RE.test("/" + rel)) {
      // never opened; report only if tracked
      if (tracked.has(rel)) {
        secretFindings.push(`high secret-file-tracked ${rel}`);
        top.push({ sev: "high", check: "secrets", target: rel, note: "secret-named file is tracked" });
      }
      continue;
    }
    const text = readScannable(file);
    if (text == null) continue;
    const lines = text.split("\n");
    // secrets
    for (let i = 0; i < lines.length; i++) {
      for (const pat of SECRET_PATTERNS) {
        if (pat.re.test(lines[i])) {
          const loc = `${rel}:${i + 1} ${pat.name}`;
          secretFindings.push(`high ${loc}`);
          top.push({ sev: "high", check: "secrets", target: loc, note: pat.name });
        }
      }
    }
    // code patterns
    if (CODE_EXT.has(path.extname(file))) {
      for (let i = 0; i < lines.length; i++) {
        for (const pat of CODE_PATTERNS) {
          if (pat.re.test(lines[i])) {
            const loc = `${rel}:${i + 1} ${pat.name}`;
            codeFindings.push(`${pat.sev} ${loc}`);
            top.push({ sev: pat.sev, check: "code-patterns", target: loc, note: pat.name });
          }
        }
      }
    }
  }
  counts.secrets = secretFindings.length;
  detailFile.secrets = writeDetail("secrets", secretFindings);
  status.secrets = secretFindings.length ? "findings" : "ok";
  counts["code-patterns"] = codeFindings.length;
  detailFile["code-patterns"] = writeDetail("code-patterns", codeFindings);
  status["code-patterns"] = codeFindings.length ? "findings" : "ok";
}

function runNpmAudit(dir) {
  let out;
  try {
    out = execFileSync("npm", ["audit", "--json"], {
      cwd: dir,
      encoding: "utf8",
      timeout: 120000,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (e) {
    // npm audit exits non-zero when vulns exist; stdout still carries JSON.
    out = e.stdout;
    if (!out) return { error: "npm audit did not run: " + (e.code || e.message || "spawn failed") };
  }
  let data;
  try {
    data = JSON.parse(out);
  } catch {
    return { error: "npm audit produced no JSON" };
  }
  if (data.error) return { error: "npm audit error: " + (data.error.summary || data.error.code || "unknown") };
  const vulns = [];
  if (data.vulnerabilities && typeof data.vulnerabilities === "object") {
    for (const [name, v] of Object.entries(data.vulnerabilities)) {
      if (v && v.severity && v.severity !== "info") vulns.push({ name, severity: v.severity });
    }
  }
  return { vulns };
}

function reportAndExit({ base, eco, status, counts, detailFile, hint, top, decisions, extraLines, devInfoLine, npmRan }) {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`audit ${base} ${date} UTC ecosystem=${eco}`);
  for (const c of CHECK_ORDER) {
    const tail = status[c] === "NOT RUN" && hint && hint[c] ? hint[c] : detailFile[c] || "-";
    lines.push(`${c} ${status[c]} ${counts[c]} ${tail}`);
  }
  // top section
  const ranked = top
    .slice()
    .sort((a, b) => (SEV_RANK[a.sev] ?? 9) - (SEV_RANK[b.sev] ?? 9))
    .slice(0, 10);
  lines.push("top:");
  for (const t of ranked) lines.push(`${t.sev} ${t.check} ${t.target} ${t.note}`);
  lines.push(`decisions ${decisions.length}`);
  if (devInfoLine) lines.push(devInfoLine);
  for (const e of extraLines) lines.push(e);
  // NEEDS-DECISION lines, at most 10
  const shownDecisions = decisions.slice(0, 10);
  for (const d of shownDecisions) lines.push(d);
  if (decisions.length > 10) {
    lines.push(`... ${decisions.length - 10} more in _internal/scratch/audit/licenses.txt`);
  }

  // cap at 30 lines
  let outLines = lines;
  if (outLines.length > 30) outLines = outLines.slice(0, 30);
  process.stdout.write(outLines.join("\n") + "\n");

  const anyFindings = CHECK_ORDER.some((c) => status[c] === "findings") || decisions.length > 0;
  const anyNotRun = CHECK_ORDER.some((c) => status[c] === "NOT RUN");
  if (anyFindings) process.exit(EXIT.findings);
  if (!npmRan) {
    // nothing ran at all
    process.exit(EXIT.notRun);
  }
  if (anyNotRun) process.exit(EXIT.notRun);
  process.exit(EXIT.ok);
}

try {
  main();
} catch (e) {
  process.stderr.write("audit: error " + (e && e.message ? e.message : String(e)) + "\n");
  process.exit(EXIT.error);
}
