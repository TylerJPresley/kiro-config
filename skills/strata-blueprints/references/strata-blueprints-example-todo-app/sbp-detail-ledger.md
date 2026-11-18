# To-do app

## Layer 3: Detail

Scope: one part in each entry below; there is one entry for every part listed in Layer 2.

### Ledger (part)

#### 1. Responsibility

Holds each commitment and everything true about it, and answers for saving a new one, changing it, marking it done and keeping it findable, so that nothing the keeper saved is ever lost.

#### 2. Concepts and states

- A commitment, with its text, an optional due value, and the grouping it belongs to.
- A commitment's state: active (to do), done (finished but kept) or removed.
- A change, one recorded edit to a commitment, carrying when and by whom.

#### 3. Seams

- Access to Ledger, needs: a proven keeper identity, so every item is held and shown under the right keeper.
- Folders to Ledger, needs: the grouping a commitment belongs to and who may see it.
- Ledger to Timing, offers: each commitment's due day or time, for Timing to judge.
- Ledger to Presence, offers: every change to a commitment, for Presence to carry.

#### 4. Rules

- 4.1. Realizes vision-3.1. Given the keeper has a commitment in mind, when they write it down in a few seconds, then Ledger saves it as active and confirms it is saved before the keeper looks away.
- 4.2. Realizes vision-3.5. Given the keeper finishes a commitment, when they mark it done, then Ledger records it done so it leaves the active view and stays findable as a kept item.
- 4.3. Given the keeper edits a commitment while offline, when the device reconnects, then Ledger accepts the recorded change and offers it to Presence.

#### 5. Inside

- A store of commitments (piece), which holds each item and its current state.
- A change log (piece), which records each edit in order so a change made apart can be reconciled.

#### 6. Limits

- 6.1. A saved commitment survives a closed app, a dead battery and a lost connection (Layer 1, Durable).
- 6.2. A commitment is confirmed saved within one second of the keeper writing it (Layer 1, Prompt).
- 6.3. A done commitment remains findable and is never silently discarded (Layer 1, Durable).

#### 7. Construction

- 7.1. Each change is written to durable local storage before the save is confirmed, and only then offered to Presence. Reason: meets "survives a lost connection" and lets the one-second confirm happen without waiting for the network.
- 7.2. Every commitment carries the identity of its keeper, and a read returns only items under the asking keeper's identity. Reason: meets "shown only to that keeper" from Layer 1.
- 7.3. A done or removed commitment is kept in the store, out of the active view, until the keeper clears it. Reason: meets "never silently discarded" while keeping done items findable.

#### 8. Costs

- 8.1. Given a number of keepers use the app, when their commitments are held and served, then it costs 35 USD per month. Paid by the maintainer.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

- 11.1. A keeper holds hundreds, not millions, of live commitments, so the whole set can be held and reconciled on a single device. Basis: personal task-keeping, from Layer 1. If wrong: the store and the one-second confirm would need a different approach.

#### 12. Decisions

- 12.1. The change log is kept rather than only the current value of each commitment. Reason: a change made offline on one device can be reconciled against another only if the order of changes is known, which serves the reachable-offline quality.
