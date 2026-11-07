#!/usr/bin/env node
// gate.mjs: this project's gate. Exit 0 only when every check passes; exit 1 otherwise.
// Add this file when the project has checks to run. A project with no checks has no gate.mjs.
// List `node gate.mjs` among the plan's criteria; it is run from the repo root.
// List this project's real checks in CHECKS: tests, typecheck, lint, build.
// Each check is [name, command, args]. Run a Node script with process.execPath.
// On Windows, add { shell: true } to the spawnSync options of a check that runs npm.
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const CHECKS = [
  // ['tests', process.execPath, ['--test']],
];

if (CHECKS.length === 0) {
  console.error("gate: no checks declared. List this project's checks in CHECKS; a project with no checks has no gate.mjs.");
  process.exit(1);
}

for (const [name, command, args] of CHECKS) {
  console.log(`gate: ${name}`);
  const r = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`gate: ${name} failed`);
    process.exit(1);
  }
}
console.log('gate: all checks passed');
