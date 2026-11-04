# StrataBP

Version: 0.4
Status: Draft

A StrataBP describes any subject, at any scale, in four layers. Every layer zooms into one element of the layer before it. The structure is the same everywhere; only the content changes. This is a guide to structure, not a strict template: use what fits the subject and leave out what does not.

## Definitions

- **Subject:** a bounded thing that has a purpose and parts.
- **Part:** a named piece of a subject with one responsibility, stated in one line in Layer 2. A unit of responsibility, not of where or how it is run.
- **Seam:** a place where a part meets another part, or the subject meets what lies beyond it, with what crosses and in which direction. A seam is about responsibility, not about where parts run. Where they run belongs to the Lifecycle view.
- **Layer:** one kind of content about a subject, written for one audience at one level of detail.
- **Ring:** the order of the layers, with Layer 1 innermost. A layer may refer to the layers inside it and never to the layers outside it.
- **Standing:** whether a part has its own stack or is described inside its subject's stack. A part gets its own stack when someone can use it on its own.
- **Stack:** the set of layers that describe one subject.

## Element types

Every element in a layer has exactly one of these types, stated beside its name.

- **Actor:** a person, role or group that uses the subject or is served by it.
- **Outsider:** something beyond the subject's boundary that it depends on or exchanges with.
- **Subject:** the bounded thing a stack describes.
- **Part:** a unit of responsibility inside a subject. Parts are listed in Layer 2.
- **Piece:** a grouping inside one part, that cannot stand on its own. Pieces appear only inside that part's entry in Layer 3; they are never listed in Layer 2.
- **Detail:** the lowest-level elements a piece is made of.

## Rules for the layers

1. Each layer zooms into the one before it. Detail increases; nothing moves between layers.
2. The layers are rings: a layer may refer to the layers inside it, never to the layers outside it. A change to an inner layer reaches every layer outside it.
3. A parent names its parts, each with a one-line responsibility; that is the parent's own content. A part's own stack refers back to its parent and elaborates; the parent never depends on the part's details.
4. Each layer holds one kind of content, stated in its Intent. Content of another kind belongs in the layer that holds it. Specific means (tools, materials, methods) are named in Layer 4, Construction. Earlier layers name them only when they are a constraint stated in Layer 1.
5. The topics inside a layer are in dependency order: each builds on the ones before it.
6. Layers past the second are written where a maker needs them. A subject made of independent members needs only its upper layers; the lower layers are those members' own stacks. Nesting is unlimited: any part may have its own stack, and any subject may have any number of peers.
7. Every layer ends with its assumptions and decisions. Each assumption says why we think so; each decision says why.
8. Every element has a name, a one-line responsibility, and labeled relationships.

## How to fill it out

- Write anything that happens as Given, When, Then. One scenario keeps its form down the layers.

## Every layer has

- **Intent:** why the layer exists and the one kind of content it holds.
- **Audience:** who reads it.
- **Success:** its acceptance criteria, written as Given, When, Then.
- **Contents:** its topics, in dependency order.
- **Suggestions:** guidance on writing it well.
- **Checklist:** the questions that show it is right.

## Layer 1: Vision

- **Scope and shows:** the whole subject. It shows the subject, its actors and its outsiders.
- **Intent:** what the subject is for, stated before any design.
- **Audience:** anyone who needs to know why the subject exists, including those who will make it.
- **Success:** Given someone who has never seen the subject, when they read this layer, then they can say what need it addresses, who it serves, and how success would be measured.
- **Status:** always written.
- **Contents:**
  1. **Need:** what is missing or wrong that the subject exists to address.
  2. **Target audience:** who has that need, and anyone else with a stake.
  3. **Value:** what the subject provides to them, as key scenarios.
  4. **Focus:** what the subject sets out to cover.
  5. **Success measures:** what is true when it works, and how we would know.
  6. **Qualities and constraints:** what must hold for the whole subject, and limits such as cost, time or rules.
  7. **Vocabulary:** the key terms later layers use.
  8. **Assumptions and decisions.**
- **Suggestions:**
  - Write for a reader who has never seen the subject.
  - State the need before the value, and the value before the focus.
  - Write value as short scenarios (Given, When, Then).
  - Make each success measure something that can be checked.
  - Leave out parts and specific means; they belong in later layers.
- **Checklist:**
  - [ ] Is the need stated in terms its target audience would recognise?
  - [ ] Is the target audience named, with anyone else who has a stake?
  - [ ] Is the value written as key scenarios?
  - [ ] Can every success measure be checked?
  - [ ] Is every constraint stated, with its source?
  - [ ] Is every term used later defined in Vocabulary?
  - [ ] Does it name no parts and no specific means other than a stated constraint?

## Layer 2: Architecture

- **Scope and shows:** the whole subject. It shows the parts, the seams between them and with the outside, the actors and the outsiders.
- **Intent:** how the subject is divided into parts, and where each part meets another part or the outside.
- **Audience:** those who decide how the work is divided.
- **Success:** Given this layer and Layer 1, when someone checks each part and each key scenario, then every part and seam is named, traces to the purpose, and every scenario has a path through the parts.
- **Status:** always written.
- **Contents:**
  1. **Parts:** what the subject is divided into. For a subject made of independent members, the parts are those peers, each with a one-line responsibility and its own stack.
  2. **Standing:** whether each part has its own stack or is described here.
  3. **Seams between parts:** where parts meet, what crosses, in which direction, and why.
  4. **Seams with the outside:** where the subject meets what is beyond it.
  5. **Shared things:** what several parts rely on in common.
  6. **Scenario paths:** how each key scenario from Layer 1 moves across the parts.
  7. **Assumptions and decisions.**
- **Suggestions:**
  - Show the whole subject in one view, with its actors and outsiders.
  - Keep the parts at a similar size and one level of detail.
  - Label every seam with what crosses and why; point it from the one that initiates.
  - If a view holds too many parts to read, split it into focused views.
  - Record each part's standing: its own stack, or described here.
- **Checklist:**
  - [ ] Does every part have a name, a type and a one-line responsibility?
  - [ ] Does every part trace back to a need or a value in Layer 1?
  - [ ] Does every seam say what crosses, in which direction, and why?
  - [ ] Does every actor and outsider appear, with its seam?
  - [ ] Are the shared things listed once, here?
  - [ ] Does every key scenario have a path through the parts?
  - [ ] Does it refer only to Layer 1, never to Layers 3 or 4?

## Layer 3: Components

- **Scope and shows:** one part. It shows the part's pieces, its seams, its concepts and its rules.
- **Intent:** how one part does its job, one entry per part.
- **Audience:** the makers and reviewers of that part.
- **Success:** Given one part's entry, when a maker reads it, then they can tell what the part does, and what it offers and needs at each seam, without asking.
- **Status:** recommended for a complex part; otherwise optional.
- **Contents:**
  1. **Responsibility:** what the part is accountable for.
  2. **Concepts and states:** what the part works with, and the states it moves through.
  3. **Seams:** what the part offers and needs at each of its seams.
  4. **Rules:** how the part acts, as scenarios.
  5. **Inside:** what the part is made of, if it has parts of its own.
  6. **Limits:** the measurable share of the Layer 1 qualities for this part.
  7. **Assumptions and decisions.**
- **Suggestions:**
  - One entry per part, each covering a single concern.
  - State what the part offers and needs at each seam before how it works inside.
  - Write rules as scenarios (Given, When, Then).
  - Write limits as measurable values.
  - If the part has no inside worth describing, say so and skip the pieces.
- **Checklist:**
  - [ ] Is the part's responsibility stated, and does it match Layer 2?
  - [ ] Are its concepts and states listed?
  - [ ] Does it say what the part offers and needs at each of its seams?
  - [ ] Is every rule a scenario?
  - [ ] Is every limit measurable, and does it trace to a quality in Layer 1?
  - [ ] Does every piece have a name and a type?
  - [ ] Does it refer only to Layers 1 and 2?

## Layer 4: Specification

- **Scope and shows:** one part. It shows the details its pieces are made of.
- **Intent:** the detail a maker needs to make one part, where Layer 3 leaves it open.
- **Audience:** those who make and maintain the part.
- **Success:** Given the detail for one part, when the part is made and checked, then it passes every scenario and limit in Layer 3.
- **Status:** optional; written only where Layer 3 leaves a gap a maker needs closed.
- **Contents:**
  1. **Construction:** what the part is made of and how it is assembled, and, where it matters, how the part is run.
  2. **Exact seams:** the precise formats, values and tolerances at each seam.
  3. **Verification:** the checks, written from the Layer 3 scenarios and limits.
  4. **Assumptions and decisions.**
- **Suggestions:**
  - Write it only where Layer 3 leaves a gap a maker needs closed.
  - Name specific means here, not earlier, unless a Layer 1 constraint requires them.
  - Write each check from one Layer 3 scenario or limit, so it traces to it.
  - State how the part is run only where it matters.
- **Checklist:**
  - [ ] Does every detail have a name and a type?
  - [ ] Does every seam have its exact formats, values and tolerances?
  - [ ] Does every Layer 3 scenario and limit have a check?
  - [ ] Are all specific means named here, or required by a Layer 1 constraint?
  - [ ] Does it refer only to Layers 1 to 3?

## Views across the layers

Views are not layers. Each is optional and refers inward.

- **Peers:** for a subject made of independent members, the Layer 2 Parts topic lists the peers and each one's own stack.
- **Scenario paths:** how a key scenario moves across the parts, written as Given, When, Then (Layer 2, topic 6).
- **Lifecycle:** how the subject is produced, put into service, kept working, changed and retired. It is written once for the subject, and again for any part whose lifecycle differs.

## Notation

Every layer opens with a title and a one-line scope. A layer that uses symbols, colours or shapes carries a key. Every element has a name, a type, a one-line description and, where it applies, what it is made of. Every relationship has one label that states its intent and points from the one that initiates. Define terms and acronyms where first used. Never carry meaning by colour alone. One scope per view; never mix layers in one view.

## Formatting

**Markup**
- One heading per layer, such as "## Layer 2: Architecture", followed by its one-line scope.
- Number the topics in dependency order, as the layer lists them.
- Write each scenario as one line: Given …, when …, then ….
- Write a missing fact as `Not supplied: <what is needed>`.

**Diagrams (optional)**

A diagram supplements the text; the text is the source of truth. Use a diagram only where it clarifies; Layer 2 is where it helps most. Choose the simplest form that works:
- An indented tree, to show what contains what.
- A seam list, one line per seam: `A → B: what crosses`.
- A Mermaid flowchart, only where the reader's tool draws it.

Every diagram has a title, one scope, and a key if it uses symbols, colours or shapes. Labels state intent, arrows point from the one that initiates, and no meaning rests on colour alone. The worked example shows each form.

## Procedure

1. Gather the facts about the subject as assertions, and have the owner confirm or correct them. Ask by layer:
   - Layer 1: who has the problem, what happens without a solution, and how we would know it worked.
   - Layer 2: what the subject is divided into, and what each part touches inside and outside.
   - Layer 3: for each part, what it must do, what it needs and what it offers.
   - Layer 4: what exactly the part is made of, with what values.
   When a fact is missing, write `Not supplied: <what is needed>` and ask for it. Never invent it.
2. Write Layer 1, then Layer 2. Stop there for a subject made of independent members.
3. Write Layer 3 for each part that needs it.
4. Write Layer 4 only where Layer 3 leaves a gap.
5. Add the views that are wanted.
6. Run the review checklist. Aim for yes on every answer; where one is no, fix it or note why.

## Review checklist

**General**
- [ ] Does the layer have a title and a one-line scope?
- [ ] Does it state its Intent and its Audience?
- [ ] Does it pass its Success test?
- [ ] Does it hold only its own kind of content, and refer only inward?
- [ ] Does it have a key if it uses symbols, colours or shapes?

**Elements**
- [ ] Does every element have a name and a type?
- [ ] Do you understand what every element does?
- [ ] Where it applies, do you understand what every element is made of?
- [ ] Do you understand every term and acronym used?
- [ ] Do you understand every symbol, colour and shape used?

**Relationships**
- [ ] Does every relationship have a label stating its intent?
- [ ] Does the label match the direction, from the one that initiates?
- [ ] Where it applies, do you understand how the two exchange (the medium or format)?

**Reasons**
- [ ] Does every assumption say why we think so?
- [ ] Does every decision say why?

## Common mistakes

- Mixing layers in one view.
- Vague relationship labels such as "uses", "sends" or "depends on".
- A view that uses symbols or colours with no key.
- Terms and acronyms never defined.
- Elements with no type.
- One view that tries to show everything.
- Content in the wrong layer, such as specific tools named before Layer 4.
- Assumptions and decisions with no reason.
- Layers never updated after the subject changes.

## Edge cases

- **A part that can stand on its own:** it gets its own stack when someone can use it on its own.
- **Peers:** a subject may have any number of peers. Each is described in its own stack, and Layer 2 lists them.
- **A part with no inside worth describing:** skip Layer 3 for it.
- **A subject with no outsiders:** say so in Vision.
- **Shared things:** list them once in Layer 2, not in each part.
- **Arrows:** point from the one that initiates.

## Worked example

A companion example fills all four layers for a community garden: `examples/strata-bp-example.md`. It is one way to fill the layers, not a template.

## Tips

- **Parent line (optional):** a part's stack can open Layer 1 with `Parent: <subject>, part <part>`. A handy habit.
- **Ids (optional):** in a long stack, numbering assumptions and decisions (A2.1, D2.1) helps citing them.
- **Empty topics (optional):** a topic with nothing to say can read `None.` so a reader knows it was considered.
- **One document or many (optional):** a stack can be one document or one per layer.

## When it is done

A stack is done when anyone, person or model, can make the subject from it without asking. Every part has a place, and every key scenario has a path through the parts. Each assumption says why we think so, and each decision says why.
