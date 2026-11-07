# Specs

Intent: work is spec-driven, so the blueprint defines what is built and the code follows it.
Applies: before and during any design, implementation or review.

- Work is spec-driven: the blueprint defines what is built, and the code follows it. `strata-bp` is the spec standard, with four layers: Vision, Architecture, Components and Specification.
- The blueprints set the project's direction. A blueprint carries intent and direction; the model works out the details from it. The owner specifies a detail only when he chooses to.
- Read the relevant blueprint before design, implementation or review.
- A plan tracks a change to the blueprints, and the handoff tracks progress and state.
- Changes to approved blueprint text go through the owner: propose, confirm the wording, then write the approved text. Approving the idea is separate from approving the wording.
- A blueprint describes the finished system in present tense and states its direction affirmatively; its limits are stated plainly as limits. Build progress lives in plans and the handoff.
- When code and a blueprint differ, the blueprint is the reference. The owner amends the blueprint first when the code is right.
- The `strata-bp-lint` script runs after every blueprint change.
