# Audit ecosystems and output contract

The reference the `audit` script and the `project-audit` skill share: how an ecosystem is detected, how a license is classified, and exactly what the script prints.

## Detection table

The script reads the root manifest and picks the ecosystem:

| Manifest | Ecosystem | Tools / install hint |
|----------|-----------|----------------------|
| `package.json` | npm | `npm audit` plus lockfile and `node_modules` licenses |
| `pyproject.toml` / `requirements.txt` | pip | `pip-audit` plus `pip-licenses` |
| `Cargo.toml` | cargo | `cargo audit` plus `cargo-deny` |
| `go.mod` | go | `govulncheck` plus `go-licenses` |
| `pom.xml` / `build.gradle` | maven / gradle | OWASP dependency-check |

- Only npm runs now. Another manifest makes every check `NOT RUN` with the install hint and `ecosystem=<eco>`, exit 2 when nothing else is found.
- No manifest: `ecosystem=none`, every check `NOT RUN`, exit 2.
- Both npm and another: npm runs and one extra line `ecosystem <eco> NOT RUN no detector yet` is added. Only the root `package.json` is read (no workspaces).

## License scope and classes

The allow-list is the first line of `AGENTS.md` matching `Licenses allowed: <comma-separated SPDX ids>` (case-insensitive). No such line makes `licenses NOT RUN` with the hint `add "Licenses allowed: MIT, ..." to AGENTS.md`.

Two scopes:
- **SHIPPED** — `dependencies`, `peerDependencies` and anything bundled into a published artifact. Classified against the allow-list.
- **DEV-ONLY** — `devDependencies` and their transitives. Written to `licenses-dev.txt` and summarized in one `licenses-dev info <n> <top-3>` line, with no effect on the exit code.

Each SHIPPED package falls in one class:
- **allowed** — on the allow-list. An SPDX `OR` expression picks the best branch, `AND` the worst leaf, and `MIT-0` counts as allowed whenever `MIT` is allowed.
- **rejected** — a copyleft or weak-copyleft id (`GPL-* AGPL-* LGPL-* MPL-* EPL-* CDDL-* EUPL-* OSL-* CPAL-* SSPL-* BUSL-* CC-BY-SA-* CC-BY-NC-*`). A finding: critical for a shipped package, high when its entry is `peer: true` or `optional: true`.
- **unclassified** — missing, `UNLICENSED`, `SEE LICENSE`, custom, or any id on neither list. One `NEEDS-DECISION license <id> packages=<n> scope=SHIPPED` line per distinct id, counted in `decisions`.

A **bundler** in a build script (`esbuild|vite build|webpack|rollup|tsup|parcel`) makes the dev/shipped label unreliable; it is flagged `NEEDS-DECISION bundler-detected <pkg>` once.

An owner's decision on a `NEEDS-DECISION` becomes a policy line in the project's `AGENTS.md`, recorded once. Once recorded it is a decision.

## The six checks

- **licenses** — needs `package-lock.json` (lockfile v2 or v3, field `packages`); without it `licenses NOT RUN` and `unpinned` gains the finding `no-lockfile`. The license id comes from the lock entry, else `node_modules/<path>/package.json`, else `UNKNOWN`.
- **advisories** — `npm audit --json` run once, parsed even on a non-zero exit; severity maps critical->critical, high->high, moderate->medium, low->low. A spawn failure, missing JSON or an `error` key gives `advisories NOT RUN` with the short reason.
- **install-scripts** — lock entries with `hasInstallScript: true`, severity medium.
- **unpinned** — `dependencies`, `devDependencies`, `optionalDependencies` specs that do not match `^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$`, except specs starting `file:`, `link:` or `workspace:`; severity low.
- **secrets** — reported by `file:line NAME` only; the matched text never reaches stdout or a detail file. A file named like a secret (`.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`, ...) is never opened; it is reported `secret-file-tracked <path>` only when `git ls-files` lists it. Severity high.
- **code-patterns** — heuristics over `.js .mjs .cjs .jsx .ts .tsx .html` (`eval-call`, `new-function`, `exec-string` medium; `inner-html`, `tls-off` low), for human judgment.

## Output contract

At most 30 lines, detail under `_internal/scratch/audit/`:

```
audit <basename> <YYYY-MM-DD UTC> ecosystem=<eco>
<check> <ok|findings|NOT RUN> <count> <detail-file>    # six lines, order: licenses advisories install-scripts unpinned secrets code-patterns
top:
<severity> <check> <target> <note>                      # <=10 lines, ranked critical>high>medium>low
decisions <N>
licenses-dev info <n> <top-3>
NEEDS-DECISION ...                                       # one per open decision, <=10, then "... <k> more in <detail-file>"
```

- Status is `ok`, `findings` or `NOT RUN`. The script never emits `known`.
- Exit codes: `0` all ok, `1` any finding or `decisions` above 0, `2` nothing found but something `NOT RUN`, `3` script error (stderr `audit: error <message>`).
