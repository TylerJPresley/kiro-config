# <feature>: plan

Written for the Implementer and the scripts that check it. State where every command runs. Point to the criteria file and any shared brief.

## 1. Goal and non-goals
Goal: the outcome in one or two sentences, with the measure that shows it worked.
Outcome of the feature: the command that proves it, and the reviewer's verdict.
Non-goals: what this plan does not do.

## 2. Blueprint change
Reference the blueprint section the Architect drafted and the owner approved. The plan follows it; it does not restate or re-decide it.

## 3. Pinned decisions
One line each, each with the reason it was chosen. Mark an owner's decision and carry it to him through a normal reply.
- D1 <decision> — <reason>.
- D2 <decision> — <reason>.

## 4. Criteria
Acceptance criteria, each with a runnable check that exits 0 when the criterion holds. Write a behavior scenario as Given/When/Then; write a standing rule as EARS.
- <name> :: <command that exits 0 when it holds>
- Scenario: Given <state>, When <trigger>, Then <result>.
- Rule (EARS): WHEN <trigger>, THE SYSTEM SHALL <result>.

## 5. Seams
Steps divided at seams that each leave the project working. List each step's files and its dependencies.
- [ ] S1 <step>. Files: <paths>. Depends on: <none | step ids>.
- [ ] S2 <step>. Files: <paths>. Depends on: S1.

## Existing tests changed
Each test this feature modifies, with the reason, so a reviewer sees which existing behavior moved.
- <path> :: <reason it changed>

## 6. Risks and not verified
What is checked only mechanically, what a reviewer reads, and what stays unverified.
