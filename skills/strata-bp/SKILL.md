---
name: strata-bp
description: "structure documentation for any subject (a system, idea, domain or environment) as four zoom layers (Vision, Architecture, Components, Specification) so anyone, person or model, can make it from the documents. Use to document, specify, blueprint or plan a subject, or to review such documents."
---

# StrataBP (four zoom layers for any subject)

Intent: describe a subject in layers, each holding one kind of content, so the subject can be made from the documents without asking.

## When to use
- Asked to document, specify, blueprint or plan a subject, or to review documents that do so.
- Not for a quick note or a one-off answer; the layers are for a subject that has a purpose and parts.

## How to work
1. Read `references/strata-bp-guide.md` first.
2. Gather facts as assertions and have the owner confirm or correct them. Ask by layer, as the guide's Procedure says.
3. Write Layer 1, then Layer 2. Write later layers only for the parts a maker needs them for.
4. Write anything that happens as Given, When, Then.
5. Lay it out as the guide's Formatting section says. A diagram is optional and supplements the text; the text is the source of truth.
6. For a missing fact write `Not supplied: <what is needed>` and ask for it. Never invent it.
7. Run the guide's checklists on each layer; fix every no, or note why.
8. Run `scripts/strata-bp-lint.mjs` on the document; it reports warnings, and you fix or explain each.
9. See `examples/strata-bp-example.md` for one way to fill the layers.

## The layers at a glance
- Layer 1, Vision: why the subject exists.
- Layer 2, Architecture: the parts and how they meet.
- Layer 3, Components: how one part does its job.
- Layer 4, Specification: the detail needed to make it.

## Rules that matter
- Ring: a layer refers only inward, never to the layers outside it.
- One kind of content per layer; content of another kind goes to the layer that holds it.
- It is a guide to structure, not a strict template: use what fits, leave out what does not.

## References
- `references/strata-bp-guide.md`: the structure, procedure and checklists.
- `examples/strata-bp-example.md`: a worked example filling all four layers.

Prevents: content in the wrong layer, invented facts, documents nobody can make from.
