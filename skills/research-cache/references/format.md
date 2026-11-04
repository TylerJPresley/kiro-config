# Research cache format

The cache lives under a research directory (`_internal/research` by default). It holds two kinds of entry and an index.

## Layout
- `sources/<slug>.md` — one fetched source.
- `findings/<slug>.md` — one analysis finding.
- `sources/<slug>/00-index.md` plus `NN-<title>.md` — a large source split into sections.
- `index.md` — the generated index, refreshed by the `research-index` script.

## Entry frontmatter
A source or finding opens with YAML frontmatter between `---` lines:

- `origin` — the URL the source came from, or the local path it was read from.
- `date` — the date the entry was made, as `YYYY-MM-DD`.
- `question` — the question the entry answers.
- `summary` — the one-line summary that becomes the index line.
- `sha256` — the hash of the file, recorded when `origin` is a local path.
- `copy` — a path to a saved copy, kept when the origin file may move or disappear.
- `from` — a finding only: the list of source slugs the finding rests on.

A split source's section files (`NN-<title>.md`) need a `summary` line; the `00-index.md` carries the full frontmatter.

## Index lines
The index lists sources then findings, one line each, sorted by slug and free of timestamps:

```
- [<slug>](<relpath>) (<date>) <summary> | <question>
```

## Checking
`research-index --check` prints one `PROBLEM <code> <path>` per issue and exits non-zero. A missing field, a bad date, a missing or mismatched hash, a dangling reference, an entry without frontmatter, or an index out of date all surface this way.
