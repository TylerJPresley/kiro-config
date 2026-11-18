# Example: a to-do app (companion to the Strata Blueprints guide)

This is a worked blueprint for a software product: an app where a person keeps tasks on lists, sees what is due, and reaches the same tasks from a phone and from a web page. It is one way to fill the layers, not a template. Every scenario stays as Given, When, Then down the layers, and specific means appear only in Layer 3 Construction.

## Layer 1: Vision

Scope: the whole app, its people and the things beyond it that it leans on.

### 1. Need

A person carries many small commitments in their head: things to do today, things due later, things that belong to work and things that belong to home. Held only in memory, a commitment is forgotten until it is late, and the person cannot tell at a glance what needs doing now. They want a trusted place to put every commitment, grouped the way they think about it, that tells them what is due and lets them reach it wherever they are.

### 2. Target audience

- **The keeper (actor):** a person managing their own commitments, who adds things through the day on whatever device is at hand and wants to see what is due without hunting.
- **A household or team member (actor):** a person who shares a grouping of commitments with the keeper and adds to or completes items in it.
- **The keeper's devices (outsider):** the phone and the computer the keeper already owns, through which they reach the app.
- **The clock and calendar (outsider):** the passage of time, against which "due" is judged.
- **A notification channel (outsider):** the path by which a reminder reaches the keeper when the app is not open.

### 3. Value

- 3.1. Given the keeper has a commitment in mind, when they write it down in a few seconds, then it is saved and shows up as something to do.
- 3.2. Given the keeper has many commitments, when they open the app, then the commitments are grouped the way the keeper arranged them, each group shown on its own.
- 3.3. Given some commitments have a day or time they are due, when the keeper looks, then they see what is due today and what is overdue, in due order.
- 3.4. Given a commitment is due soon and the app is not open, when its due time approaches, then the keeper is alerted through a channel they chose.
- 3.5. Given the keeper finishes a commitment, when they mark it done, then it leaves the list of things to do and the keeper can still find it later.
- 3.6. Given the keeper added commitments on their phone, when they open the app on their computer, then the same commitments appear, up to date.
- 3.7. Given a grouping is shared with another person, when either person changes it, then both see the change without asking the other.

### 4. Focus

The app covers capturing commitments quickly, grouping them, judging what is due against time, alerting the keeper, marking things done and keeping them findable, reaching the same commitments from more than one device, and sharing a grouping with another person. It does not cover note-taking, long documents, project planning with dependencies, or team workflows beyond a shared grouping.

### 5. Success measures

- A commitment is captured in under five seconds from the moment the keeper decides to add it.
- When the keeper opens the app, what is due today and what is overdue are visible without any search or filter step.
- A change made on one device is visible on another device within a few seconds, without the keeper doing anything.
- When a commitment's due time arrives and the app is closed, the keeper is alerted within a minute.
- No commitment the keeper saved is ever lost or shown to a person it was not shared with.

### 6. Qualities and constraints

- **Durable:** once the app tells the keeper a commitment is saved, it survives a closed app, a dead battery and a lost connection.
- **Prompt:** opening the app and seeing today's commitments feels immediate; a change reaches the keeper's other devices within seconds.
- **Reachable offline:** the keeper can read and add commitments with no connection, and the app reconciles when the connection returns.
- **Private by default:** a keeper's commitments are visible only to that keeper and to anyone they deliberately share a grouping with; no one else, inside the product or out, can read them.
- **Trustworthy with identity:** only the rightful keeper reaches their commitments, and proving who they are is quick and does not expose their secret.
- **Within reach of one maintainer:** the app is built and run by a very small team, so its moving parts are few and its running cost is low.

### 7. Vocabulary

- **Commitment:** one thing the keeper means to do, the smallest unit the app holds. (Shown to the keeper as a task.)
- **Grouping:** a named collection of commitments the keeper arranges, such as "Work" or "Groceries".
- **Due:** having a day, or a day and time, by which a commitment is meant to be done.
- **Done:** marked by the keeper as finished; it leaves the active view but is kept.
- **Alert:** a message sent to the keeper about a due commitment when the app is not open.
- **Device:** one phone or computer through which the keeper reaches the app.
- **Shared grouping:** a grouping two or more people can both read and change.

### 8. Costs

- 8.1. Given the app is kept running, when the maintainer spends time on it, then it costs Not supplied: the hours each month. Paid by the maintainer.

### 9. Risks

- 9.1. Given a keeper shares a grouping with the wrong person, when that person opens it, then the keeper's commitments are read by someone they did not intend. Severity: High. Answered by vision-12.1.
- 9.2. Given the one maintainer is away, when the app stops working, then keepers wait for a fix. Severity: Low. Answered by Not supplied: who covers for the maintainer.

### 10. Open Concerns

- 10.1. Given keepers may want their commitments in more than one language, when the maintainer says whether the app must be translated, then the qualities are re-weighed and the costs that follow from them are priced again. Raised by a keeper.

### 11. Assumptions

- 11.1. The keeper reaches the app through devices they already own, over an ordinary consumer connection that is sometimes absent. Basis: the audience is a single person managing personal commitments, not an enterprise fleet. If wrong: the offline and reachable-anywhere qualities would be re-weighed.
- 11.2. Most keepers hold hundreds, not millions, of live commitments. Basis: personal task-keeping, not archival storage. If wrong: the prompt and durable qualities would need stricter limits.

### 12. Decisions

- 12.1. The app serves one keeper's own commitments first, with sharing as a deliberate, limited act, rather than being a team workspace. Reason: the need is a trusted personal place; a shared grouping meets the household case without the weight of team roles.
- Not supplied: whether the keeper may invite a person who has no account yet, or only an existing keeper, to a shared grouping.
