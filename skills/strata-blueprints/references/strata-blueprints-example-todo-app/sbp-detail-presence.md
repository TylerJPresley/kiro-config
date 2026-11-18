# To-do app

## Layer 3: Detail

Scope: one part in each entry below; there is one entry for every part listed in Layer 2.

### Presence (part)

#### 1. Responsibility

Keeps every one of the keeper's devices, and every member of a shared grouping, showing the same commitments and groupings, and reconciles changes made on different devices while apart, so the keeper reaches up-to-date commitments wherever they are.

#### 2. Concepts and states

- A device's view, either up to date or behind.
- A pending change, recorded on one device and not yet carried to the others.
- A conflict, two changes to the same commitment made apart, and its resolution.

#### 3. Seams

- Ledger to Presence, needs: every change to a commitment, to carry.
- Folders to Presence, needs: every change to a grouping or its sharing, to carry.
- The keeper's devices to Presence, offers and needs: offers each device the up-to-date commitments and groupings, and needs the device's own new changes in return.

#### 4. Rules

- 4.1. Realizes vision-3.6. Given the keeper added commitments on their phone, when they open the app on their computer, then Presence brings the computer up to date from the recorded changes, under the same keeper identity.
- 4.2. Given two devices changed the same commitment while apart, when they reconnect, then Presence reconciles them by a stated rule and leaves both devices showing the same result.
- 4.3. Given a device has no connection, when the keeper reads or adds commitments, then Presence lets the work continue locally and carries the changes when the connection returns.

#### 5. Inside

- A reconciler (piece), which orders changes made apart and settles conflicts.
- A per-device tracker (piece), which remembers how far each device has caught up.

#### 6. Limits

- 6.1. A change made on one device is visible on another within a few seconds of both being connected (Layer 1, Prompt).
- 6.2. The keeper can read and add commitments with no connection, and nothing is lost when it returns (Layer 1, Reachable offline).
- 6.3. A carried change crosses only to the keeper's own devices and to members of a shared grouping (Layer 1, Private by default).

#### 7. Construction

- 7.1. Each change carries the moment it was made and the device that made it; the reconciler orders by that moment and, for a true tie on one commitment, keeps the latest and records the other as superseded. Reason: a stated, repeatable rule meets "both devices show the same result" without asking the keeper.
- 7.2. A device applies a change locally first and carries it when connected, and a connected device is refreshed within seconds. Reason: meets both the offline and the few-seconds limits.
- 7.3. When a conflicting edit is superseded, the keeper is shown that it happened so nothing is lost silently. Reason: a visible record keeps the keeper's trust in the durable quality.

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

- 11.1. Two people rarely change the very same commitment in the very same instant. Basis: a shared grouping is used by a household or small team, not a crowd. If wrong: the last-writer rule would need to give way to a merge the keeper confirms.

#### 12. Decisions

- 12.1. A change is applied on its own device first and carried afterwards, rather than waiting for the network. Reason: this keeps the app usable offline and the confirm prompt fast, meeting the reachable-offline and prompt qualities.
