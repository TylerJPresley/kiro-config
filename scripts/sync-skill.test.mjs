import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), 'sync-skill.mjs');

function tmp() {
  return mkdtempSync(join(tmpdir(), 'sync-skill-'));
}

// Build a minimal skill source: SKILL.md plus a nested file.
function makeSource(root, { nested = true, skillMd = true } = {}) {
  const src = join(root, 'my-skill');
  mkdirSync(src, { recursive: true });
  if (skillMd) writeFileSync(join(src, 'SKILL.md'), 'name: my-skill\n');
  writeFileSync(join(src, 'top.md'), 'top\n');
  if (nested) {
    mkdirSync(join(src, 'references'), { recursive: true });
    writeFileSync(join(src, 'references', 'guide.md'), 'guide\n');
  }
  return src;
}

// Run the script, returning { status, stdout }. Never throws on non-zero exit.
function run(args) {
  try {
    const stdout = execFileSync('node', [script, ...args], { encoding: 'utf8' });
    return { status: 0, stdout };
  } catch (e) {
    return { status: e.status, stdout: (e.stdout || '') + (e.stderr || '') };
  }
}

test('installs all files', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  const r = run([src, '--target', target]);
  assert.equal(r.status, 0);
  assert.ok(existsSync(join(target, 'my-skill', 'SKILL.md')));
  assert.ok(existsSync(join(target, 'my-skill', 'top.md')));
  rmSync(root, { recursive: true, force: true });
});

test('copies nested directories', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  run([src, '--target', target]);
  assert.equal(readFileSync(join(target, 'my-skill', 'references', 'guide.md'), 'utf8'), 'guide\n');
  rmSync(root, { recursive: true, force: true });
});

test('second run leaves identical copy untouched', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  run([src, '--target', target]);
  // second run: no backup directory created since copy is identical
  run([src, '--target', target]);
  const backups = join(target, '..', '_internal', 'backups');
  assert.ok(!existsSync(backups) || readdirSync(backups).length === 0);
  // check still passes
  const r = run([src, '--target', target, '--check']);
  assert.equal(r.status, 0);
  rmSync(root, { recursive: true, force: true });
});

test('replaces changed copy and backs up old', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  run([src, '--target', target]);
  // mutate the installed copy so the next install differs
  writeFileSync(join(target, 'my-skill', 'top.md'), 'STALE\n');
  run([src, '--target', target]);
  // copy restored to source content
  assert.equal(readFileSync(join(target, 'my-skill', 'top.md'), 'utf8'), 'top\n');
  // old copy backed up under <target>/../_internal/backups/sync-skill-*/
  const backupsRoot = join(target, '..', '_internal', 'backups');
  const dirs = readdirSync(backupsRoot).filter((n) => n.startsWith('sync-skill-'));
  assert.equal(dirs.length, 1);
  assert.equal(readFileSync(join(backupsRoot, dirs[0], 'top.md'), 'utf8'), 'STALE\n');
  rmSync(root, { recursive: true, force: true });
});

test('removes files absent from source', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  run([src, '--target', target]);
  // add a stray file to the copy, then reinstall
  writeFileSync(join(target, 'my-skill', 'stray.md'), 'x\n');
  run([src, '--target', target]);
  assert.ok(!existsSync(join(target, 'my-skill', 'stray.md')));
  rmSync(root, { recursive: true, force: true });
});

test('check passes when identical', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  run([src, '--target', target]);
  const r = run([src, '--target', target, '--check']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /copy at .* matches the source/);
  rmSync(root, { recursive: true, force: true });
});

test('check exits 1 when copy differs', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  run([src, '--target', target]);
  writeFileSync(join(target, 'my-skill', 'top.md'), 'changed\n');
  const r = run([src, '--target', target, '--check']);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /differs: top\.md/);
  assert.match(r.stdout, /1 difference\(s\) between source and/);
  rmSync(root, { recursive: true, force: true });
});

test('check reports missing and extra', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  run([src, '--target', target]);
  rmSync(join(target, 'my-skill', 'top.md')); // missing in copy
  writeFileSync(join(target, 'my-skill', 'extra.md'), 'e\n'); // extra in copy
  const r = run([src, '--target', target, '--check']);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /missing in copy: top\.md/);
  assert.match(r.stdout, /extra in copy: extra\.md/);
  rmSync(root, { recursive: true, force: true });
});

test('check writes nothing', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'target');
  const r = run([src, '--target', target, '--check']);
  // missing target: check must not create it
  assert.equal(r.status, 1);
  assert.ok(!existsSync(target));
  rmSync(root, { recursive: true, force: true });
});

test('check on missing target exits 1', () => {
  const root = tmp();
  const src = makeSource(root);
  const target = join(root, 'does-not-exist');
  const r = run([src, '--target', target, '--check']);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /missing in copy: SKILL\.md/);
  rmSync(root, { recursive: true, force: true });
});

test('refuses source without SKILL.md', () => {
  const root = tmp();
  const src = makeSource(root, { skillMd: false });
  const target = join(root, 'target');
  const r = run([src, '--target', target]);
  assert.equal(r.status, 2);
  rmSync(root, { recursive: true, force: true });
});

test('refuses copy path equal to source', () => {
  const root = tmp();
  const src = makeSource(root);
  // target is the parent of src, so <target>/<basename(src)> == src
  const r = run([src, '--target', root]);
  assert.equal(r.status, 2);
  rmSync(root, { recursive: true, force: true });
});
