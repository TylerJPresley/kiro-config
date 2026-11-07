import { test } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Test files that once leaked temp directories must now leave their TMPDIR empty.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = ["scripts/audit.test.mjs", "scripts/research-index.test.mjs", "scripts/steering-lint.test.mjs"];

for (const f of files) {
  test(`${f} leaves no temp directories behind`, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hygiene-"));
    const env = { ...process.env, TMPDIR: dir };
    delete env.NODE_TEST_CONTEXT; // a nested node --test must run its own tests
    try {
      const r = spawnSync(process.execPath, ["--test", f], {
        cwd: root,
        env,
        encoding: "utf8",
      });
      assert.strictEqual(r.status, 0, r.stdout + r.stderr);
      assert.deepStrictEqual(fs.readdirSync(dir), []);
    } finally {
      if (path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });
}
