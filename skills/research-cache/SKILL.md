---
name: research-cache
description: "how to store and reuse research so a later session references it without redoing the work. Use when saving a fetched source or an analysis finding, or when reading the existing research cache."
---

# Research cache

Intent: keep fetched sources and analysis findings in one durable form so any later session reuses them, each entry carrying enough to trust and locate it.

## When to use
- A source is fetched from the network or read from a local file and will matter later.
- An analysis produces a finding that builds on one or more sources.
- The existing research is read or its index is refreshed.

## How to work
1. Keep sources and findings apart: a fetched source goes in `sources/`, an analysis finding in `findings/`.
2. Give each entry frontmatter recording its origin, its date, the question it answered and a one-line summary that becomes its index line.
3. For a local source, record a `sha256` of the file, and keep a `copy` in the cache when the file may move or disappear.
4. Link a finding to the sources it rests on with a `from` list of source slugs.
5. Split a large source into numbered section files under a source directory, each with its own summary, so a model loads only the part it needs.
6. Refresh the index with the `research-index` script, and check an entry's shape with its `--check` mode; the format reference holds the full field list.

## References
- `references/format.md`
- `examples/cache/index.md`
- `examples/cache/sources/example-source.md`
- `examples/cache/findings/example-finding.md`
