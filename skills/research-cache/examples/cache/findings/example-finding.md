---
origin: note://analysis
date: 2026-11-04
question: When should a session hand off to a fresh one?
summary: A session hands off before the context fills far enough to cost quality.
from: example-source
---

# When to hand off a session

A finding reads like this: it rests on one or more sources, named in the `from` list, and
states what the analysis concluded. Here the source on context windows supports a rule of
thumb: hand off while the context still has room, rather than waiting for a forced reset.

The `from` list lets `research-index` confirm every source a finding cites still exists.
