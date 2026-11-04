#!/usr/bin/env node
// A skill source directory is the source of truth. This installs it as a copy into a skills
// folder, or checks that an installed copy has not drifted from the source.
//   node sync-skill.mjs <skill-source-dir> [--target DIR]   copy the skill to <target>/<basename> (replaces the copy)
//   node sync-skill.mjs <skill-source-dir> [--target DIR] --check   exit 1 if the installed copy differs
// --target defaults to ~/.kiro/skills. Before replacing a differing copy, the old copy is backed
// up to <target>/../_internal/backups/sync-skill-<YYYYMMDD-HHMMSS>/<name>.
import { readdirSync, readFileSync, mkdirSync, copyFileSync, rmSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve, basename } from 'node:path';
import { homedir } from 'node:os';

const CHECK_FAIL_EXIT = 1;
const EDGE_EXIT = 2;

const args = process.argv.slice(2);
const check = args.includes('--check');
const targetFlag = args.indexOf('--target');
const targetArg = targetFlag >= 0 ? args[targetFlag + 1] : undefined;
const targetValueIndex = targetFlag >= 0 ? targetFlag + 1 : -1;
const positional = args.filter((a, i) => !a.startsWith('--') && i !== targetValueIndex);

const sourceArg = positional[0];
if (!sourceArg) {
  console.error('sync-skill: a skill source directory is required');
  process.exit(EDGE_EXIT);
}

const source = resolve(sourceArg);
const targetRoot = resolve(targetArg || join(homedir(), '.kiro', 'skills'));
const copy = join(targetRoot, basename(source));

if (!existsSync(join(source, 'SKILL.md'))) {
  console.error(`sync-skill: ${source} has no SKILL.md; not a skill source`);
  process.exit(EDGE_EXIT);
}

if (resolve(copy) === source) {
  console.error('sync-skill: the copy path equals the source path');
  process.exit(EDGE_EXIT);
}

function files(dir, base = dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p, base) : [relative(base, p)];
  }).sort();
}

function differences() {
  const a = files(source), b = files(copy), out = [];
  for (const f of a) {
    if (!b.includes(f)) out.push(`missing in copy: ${f}`);
    else if (!readFileSync(join(source, f)).equals(readFileSync(join(copy, f)))) out.push(`differs: ${f}`);
  }
  for (const f of b) if (!a.includes(f)) out.push(`extra in copy: ${f}`);
  return out;
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

if (check) {
  const d = differences();
  if (d.length) {
    console.log(d.join('\n'));
    console.log(`sync-skill: ${d.length} difference(s) between source and ${copy}`);
    process.exit(CHECK_FAIL_EXIT);
  }
  console.log(`sync-skill: copy at ${copy} matches the source`);
} else {
  // Back up an existing copy only when it differs from the source.
  if (existsSync(copy) && differences().length) {
    const backup = join(targetRoot, '..', '_internal', 'backups', `sync-skill-${stamp()}`);
    for (const f of files(copy)) {
      mkdirSync(dirname(join(backup, f)), { recursive: true });
      copyFileSync(join(copy, f), join(backup, f));
    }
  }
  rmSync(copy, { recursive: true, force: true });
  const list = files(source);
  for (const f of list) {
    mkdirSync(dirname(join(copy, f)), { recursive: true });
    copyFileSync(join(source, f), join(copy, f));
  }
  console.log(`sync-skill: installed ${list.length} file(s) to ${copy}`);
}
