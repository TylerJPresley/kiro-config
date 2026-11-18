---
name: strata-blueprints
description: "Describe any subject as three zoom layers (Vision, Structure, Detail) so a person or a model can make it from the documents. Use to write a blueprint by interviewing the owner and then writing the layers, for an RFP, software documentation, project steering, a standard, a policy or an idea; to review or audit an existing blueprint, layer by layer; or to build a subject (software, a document, a product, a plan) from a blueprint, asking the person wherever it says `Not supplied:`. Use when asked to document, specify, blueprint, plan, interview, review or build from a spec. Not for a quick note or a one-off answer."
license: "MIT"
compatibility: "Plain Markdown; only the scripts in scripts/ need a Node.js LTS"
metadata:
  version: "0.1.0"
---

# Strata Blueprints (three zoom layers for any subject)

Intent: describe a subject in layers, each holding one kind of content, so anyone, person or model, can make the subject from the documents without asking. The stack is the spec that steers what gets built. It is loaded into models as context, so it stays light: context and intent at a high level, and no less than a maker needs.

## Choose the workflow
- AUTHOR: write a blueprint, or review one. The request says document, specify, blueprint, plan, review or audit.
- BUILD: make the subject from a blueprint that exists. The request says build, make, implement or create from it.
- A request for both runs AUTHOR first, then BUILD.
- A subject without purpose and parts (a quick note, a one-off answer) needs neither.

## Files
Load a file when its job comes up, and no sooner.

| Path | Load when |
|---|---|
| `references/strata-blueprints-guide.md` | Always first: the core guide (definitions, rules, how the layers depend on each other, procedure, formatting, views, separate files). |
| `references/strata-blueprints-guide-layer-1.md` | Interviewing for, writing or checking Layer 1. |
| `references/strata-blueprints-guide-layer-2.md` | The same for Layer 2. |
| `references/strata-blueprints-guide-layer-3.md` | The same for Layer 3, or building a part. |
| `assets/strata-blueprints-template.md` | Starting a whole stack in one document. |
| `assets/strata-blueprints-template-layer-1.md`, `assets/strata-blueprints-template-layer-2.md`, `assets/strata-blueprints-template-layer-3.md` | Starting one layer, one part's Detail, or a file of a stack in separate files. |
| `references/strata-blueprints-example.md` | Unsure how Layers 1 and 2 look: a community garden, an idea. |
| `references/strata-blueprints-example-todo-app/` | Unsure how all three layers look, or how a stack in separate files looks: a software product. |
| `references/strata-blueprints-example-rfp.md` | Writing a spec for others to answer, such as an RFP: the issuer fixes the limits and leaves the means to the bidder. |
| `scripts/strata-blueprints-lint.mjs` | Linting a blueprint or folder, and the impact check. |
| `scripts/strata-blueprints.mjs` | Condensing a blueprint for reading, or publishing it as one document. |
| `LICENSE` | Never: MIT. |

## AUTHOR
1. Load the core guide. Start from the template that fits the job (core guide, How to fill it out).
2. Interview the owner, unless the owner has already specified the subject in full. Follow the core guide's Procedure, How to interview, and keep the question log. Load each layer's guide file when the interview reaches that layer, and ask each topic's `Ask the owner`. To fill `Not supplied:` items in an existing blueprint, make them the agenda.
3. Write layer by layer, from each topic's `How to write it`. The core guide's Short stacks says which layers a subject needs and which topics are required; load a layer's guide file only for a layer you write. Its Views across the layers, Formatting and A stack in separate files apply where they come up.
4. Check each layer: run its `Check` lines and its `Check (whole layer)`, and fix every no, or note why.
5. Audit: follow the core guide's Procedure, Audit.
6. Run `node scripts/strata-blueprints-lint.mjs <blueprint.md or folder>`. It reports warnings and a count of `Not supplied:` items; fix or explain each warning.

### Review an existing blueprint
Take the layers present one at a time. For each, load its guide file, run step 4 on it, then go to the next layer. Then run steps 5 and 6. The audit source is what the owner gave: the seed, the answers, the question log. Report findings by layer, each with the fix.

## BUILD
The builder is an agent working with a person. The blueprint is the reference for what to make.
1. To build one part, read only the core guide, the Layer 3 guide file, that part's Detail, and the Layer 1 and Layer 2 entries it cites. In a stack of separate files, that part's Detail is the file Layer 2 Standing names. Layer 1 gives intent and success measures, Layer 2 the parts and seams, Layer 3 the part's Rules, Limits and Construction. Assumptions are built on as given.
2. Find every `Not supplied:` (search the text for it). Group them by part and ask the person in one round before building the part each one blocks. Build the unblocked parts meanwhile. Never fill a `Not supplied:` with a guess, a default or an example value.
3. Build part by part, in the order the Layer 2 seams allow. Each part meets its Responsibility, Rules and Limits and keeps its seams as named. Use the means Construction names. Where Construction is silent on a means and no Rule or Limit depends on the choice, choose the plainest means and tell the person; where one does depend on it, ask.
4. Check the result against the blueprint: each Layer 1 value scenario along its Layer 2 path, each Layer 3 rule and limit, each success measure. Use a test or a command where the subject allows one; for a document, a read-through against each rule. Report each by id.
5. When the blueprint contradicts itself, or the work shows an assumption is wrong (`If wrong:` says what moves), stop that part and tell the person. The blueprint changes only with the person's yes, and then gets the impact check (Limits).
6. Report: what was built, what was checked and how, `Not supplied:` items still open, and the choices made in step 3. When the person answers a `Not supplied:`, offer to write the answer into the blueprint so it stays the source; the written answer gets the impact check (Limits).

## Limits
- An agent works with a person: it asks, confirms and reports. It never settles an open question, or fills a `Not supplied:`, on its own.
- After any change to a blueprint, run the impact check (`node scripts/strata-blueprints-lint.mjs --impact <id> <blueprint-or-folder>` for each id changed) and settle every element it lists before moving on.
- Never record an answer for a lower layer that changes an upper layer. Move it to the upper layer first, have the owner confirm it there, then cascade it down.
- Change a blueprint under review only when the owner asks.

Prevents: content in the wrong layer, invented facts, documents nobody can make from, and builds that guess.
