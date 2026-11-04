# Features

Intent: work is organized into self-standing features, each carried by one plan with a clear outcome.
Applies: when scoping, planning, closing or releasing work.

- Larger work is organized into features. A feature is a complete unit of work carried by one plan, with a one-sentence outcome. It may change what a user sees or not.
- A feature stands on its own: when it closes, the system works without any later feature. It is planned and built that way.
- A plan is divided at defined seams, and every seam leaves the project working. Each seam is a commit.
- A feature is complete when its criteria pass and the blueprints, the code and the repo documents agree.
- A feature too big for one plan is split into smaller features.
- The plans, in order, are the roadmap, and the Planner keeps them in order in the plans folder. A plan starts as an outline with its one-sentence outcome and is expanded into a full plan when its turn comes. The owner sets the order with the Architect, through discovery.
- A feature that is dropped has its plan archived with the reason.
- The Director routes the closing of a feature: the real-environment check runs when it applies (the Reviewer), the Implementer tags the work, the Documenter updates the changelog, the Planner archives the plan, and the handoff moves to the next feature.
- A closed feature carries a feature tag. A release is a release tag that the owner chooses and ships; the Implementer creates it when asked.
- The Director routes a release: the Reviewer's real-environment check, the Security reviewer's audit, the Documenter's changelog, then the release tag when the owner asks.
