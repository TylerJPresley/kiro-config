#!/usr/bin/env node
// Install the steering, agents, skills, scripts and hooks into a target .kiro by sha256 compare.
// usage: node install.mjs [--source DIR] [--target DIR=~/.kiro] [--dry-run] [--check] [--settings FILE]
// Copies only the four listed directories; a changed file is backed up first; EXTRA files
// in the target are listed and kept; other target paths are left untouched.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const DIRS = ["steering", "agents", "skills", "scripts", "hooks"];

const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > 0 ? process.argv[i + 1] : d;
};
const flag = (n) => process.argv.includes(n);

const here = path.dirname(new URL(import.meta.url).pathname);
const source = path.resolve(arg("--source", path.dirname(here)));
const target = path.resolve(arg("--target", path.join(os.homedir(), ".kiro")));
const dryRun = flag("--dry-run");
const check = flag("--check");

if (source === target) {
  console.error("install: target equals source; refusing");
  process.exit(2);
}

const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

// relative file paths under dir (recursive), posix-style
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

const stamp = () => {
  const d = new Date();
  const z = (n, w = 2) => String(n).padStart(w, "0");
  return (
    `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-` +
    `${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`
  );
};

// Build the plan: one record per source file plus EXTRA records for target-only files.
const plan = [];
for (const dir of DIRS) {
  const srcDir = path.join(source, dir);
  const tgtDir = path.join(target, dir);
  const srcRel = new Set();
  for (const abs of walk(srcDir)) {
    const rel = path.join(dir, path.relative(srcDir, abs));
    srcRel.add(rel);
    const tgt = path.join(target, rel);
    let status;
    if (!fs.existsSync(tgt)) status = "NEW";
    else if (sha(abs) === sha(tgt)) status = "SAME";
    else status = "CHANGED";
    plan.push({ status, rel, src: abs, tgt });
  }
  for (const abs of walk(tgtDir)) {
    const rel = path.join(dir, path.relative(tgtDir, abs));
    if (!srcRel.has(rel)) plan.push({ status: "EXTRA", rel, tgt: abs });
  }
}
plan.sort((a, b) => a.rel.localeCompare(b.rel));

for (const r of plan) console.log(`${r.status} ${r.rel}`);

if (check) {
  let problems = 0;
  const changed = plan.filter((r) => r.status === "NEW" || r.status === "CHANGED");
  if (changed.length) {
    problems += changed.length;
    console.log(`check: ${changed.length} file(s) differ from the target`);
  }

  // Node 18+
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 18) {
    problems++;
    console.log(`check: node ${process.versions.node} is below 18`);
  }

  // JSON parse of agents/*.json in the source
  const agentsDir = path.join(source, "agents");
  if (fs.existsSync(agentsDir)) {
    for (const f of fs.readdirSync(agentsDir).filter((x) => x.endsWith(".json")).sort()) {
      try {
        JSON.parse(fs.readFileSync(path.join(agentsDir, f), "utf8"));
      } catch (e) {
        problems++;
        console.log(`check: agents/${f} is not valid JSON: ${e.message}`);
      }
    }
  }

  // steering-lint on the target tree
  const lint = path.join(source, "scripts", "steering-lint.mjs");
  if (fs.existsSync(lint)) {
    try {
      execFileSync(
        "node",
        [lint, "--steering-dir", path.join(target, "steering"), "--skills-dir", path.join(target, "skills")],
        { encoding: "utf8", stdio: "ignore" }
      );
    } catch {
      problems++;
      console.log("check: steering-lint reported problems on the target");
    }
  }

  // custom agents inherit default steering and skills unless this setting is true
  const settingsFile = path.resolve(arg("--settings", path.join(target, "settings", "cli.json")));
  if (fs.existsSync(settingsFile)) {
    try {
      if (JSON.parse(fs.readFileSync(settingsFile, "utf8"))["chat.disableInheritingDefaultResources"] === true) {
        problems++;
        console.log(`check: chat.disableInheritingDefaultResources is true in ${settingsFile}; agents would lose all steering and skills`);
      }
    } catch (e) {
      problems++;
      console.log(`check: ${settingsFile} is not valid JSON: ${e.message}`);
    }
  }

  process.exit(problems ? 1 : 0);
}

if (dryRun) {
  console.log("dry-run: wrote nothing");
  process.exit(0);
}

// Apply: NEW and CHANGED are copied; a CHANGED file is backed up first. EXTRA and SAME are left.
const backupRoot = path.join(target, "_internal", "backups", `install-${stamp()}`);
for (const r of plan) {
  if (r.status === "CHANGED") {
    const bak = path.join(backupRoot, r.rel);
    fs.mkdirSync(path.dirname(bak), { recursive: true });
    fs.copyFileSync(r.tgt, bak);
  }
  if (r.status === "NEW" || r.status === "CHANGED") {
    fs.mkdirSync(path.dirname(r.tgt), { recursive: true });
    fs.copyFileSync(r.src, r.tgt);
  }
}
process.exit(0);
