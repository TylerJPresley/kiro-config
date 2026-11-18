# To-do app

## Layer 2: Structure

Scope: the whole app, divided into its parts, with the seams between them and with the outside.

### 1. Parts

- Access (part): establishes who the keeper is and admits only them to their own commitments.
- Ledger (part): holds each commitment and its state, and answers for what is saved, changed and done.
- Folders (part): holds the named groupings, their order, and who may see each one.
- Timing (part): judges each commitment against the clock and says what is due, overdue and upcoming.
- Notifier (part): sends the keeper a message about a due commitment when the app is not open.
- Presence (part): keeps every device and shared person showing the same commitments, and reconciles changes made apart.

### 2. Standing

- Access: sbp-detail-access.md
- Ledger: sbp-detail-ledger.md
- Folders: sbp-detail-folders.md
- Timing: sbp-detail-timing.md
- Notifier: sbp-detail-notifier.md
- Presence: sbp-detail-presence.md

### 3. Seams between parts

- Access to Ledger: a proven keeper identity crosses, so Ledger serves only that keeper's own items. Access initiates on each session.
- Folders to Ledger: a grouping's identity and its membership cross, so each commitment is held under one grouping and reached through it. Folders initiates when a commitment is filed or moved.
- Ledger to Timing: each commitment's due day or time crosses, so Timing can judge it. Ledger initiates when a due value is set or changed.
- Timing to Notifier: the fact that a commitment has become due, and when, crosses, so Notifier can decide to send. Timing initiates when a due moment arrives.
- Ledger to Presence: every change to a commitment crosses, so Presence can carry it to the keeper's other devices and to shared people. Ledger initiates on each change.
- Folders to Presence: a change to a grouping or its sharing crosses, so Presence carries it the same way. Folders initiates on each change.

### 4. Seams with the outside

- The keeper's devices to Access: a proof of who the keeper is crosses from the device, and an admission crosses back. The device initiates when the keeper signs in.
- The keeper's devices to Presence: up-to-date commitments and groupings cross to each device, and the device's own new changes cross back. The device initiates when it connects.
- Timing to the clock and calendar: the current time crosses in, so Timing can judge what is due. Timing initiates when it reads the time.
- Notifier to a notification channel: a message for the keeper crosses out to the channel. Notifier initiates when a commitment is due and the app is closed.

### 5. Shared things

- The keeper's proven identity, established by Access, is relied on by every other part to scope what it holds and shows to that one keeper.
- A single notion of "now", read from the clock and calendar, is relied on by Timing and Notifier so that "due" means the same thing everywhere.

### 6. Scenario paths

- 6.1. Realizes vision-3.1. Given the keeper has a commitment in mind, when they write it down in a few seconds, then Access admits the keeper, Ledger saves the new item under the keeper, and Presence carries it to the keeper's other devices.
- 6.2. Realizes vision-3.2. Given the keeper has many commitments, when they open the app, then Access admits the keeper and Folders returns the keeper's groupings in order, each holding its own Ledger.
- 6.3. Realizes vision-3.3. Given some commitments have a day or time they are due, when the keeper looks, then Ledger supplies the due values and Timing ranks them into today, overdue and upcoming for the keeper to see.
- 6.4. Realizes vision-3.4. Given a commitment is due soon and the app is not open, when its due time approaches, then Timing marks it due and Notifier sends the keeper a message through the chosen notification channel.
- 6.5. Realizes vision-3.5. Given the keeper finishes a commitment, when they mark it done, then Ledger records it done so it leaves the active view, Folders still lists it as kept, and Presence carries the change to other devices.
- 6.6. Realizes vision-3.6. Given the keeper added commitments on their phone, when they open the app on their computer, then Presence brings the computer up to date from the changes Ledger and Folders recorded, under the same Access.
- 6.7. Realizes vision-3.7. Given a grouping is shared with another person, when either person changes it, then Ledger or Folders records the change under the shared grouping and Presence carries it to every person the grouping is shared with.

### 7. Costs

- 7.1. Given the app needs a number of screens, when the phone app and the web page are built, then it costs 4,800 USD one-off. Paid by the maintainer.
- 7.2. Given keepers receive a number of alerts, when the notification channel sends them, then it costs 15 USD per month. Paid by the maintainer.

### 8. Risks

- 8.1. Given the keeper changes the same grouping on two devices while offline, when both devices reconnect, then one change can overwrite the other. Severity: Medium. Answered by structure-11.2.

### 9. Open Concerns

- 9.1. Given Notifier messages a keeper when the app is not open, when the maintainer says which channels a keeper may choose, then the seam between Notifier and the outside is fixed and structure-7.2 can be checked. Raised by the maintainer.

### 10. Assumptions

- 10.1. A commitment belongs to exactly one grouping at a time. Basis: the keeper arranges commitments into groups they think in, and a single home keeps "what is in this group" unambiguous. If wrong: Folders and Ledger would need a many-to-many seam.

### 11. Decisions

- 11.1. "Due" is judged by one part, Timing, rather than by each part that cares about time. Reason: the clock is a shared thing, and one judge keeps "due", "overdue" and "upcoming" meaning the same for both the keeper's view and the alerts.
- 11.2. Keeping devices and shared people in step is one part, Presence, separate from the parts that own the data. Reason: reconciling changes made apart is a single hard job; concentrating it keeps each data part simple and the reachable-anywhere quality in one place.
- Not supplied: whether a shared grouping has an owner who alone may unshare it, or any member may.

## View: Lifecycle

Scope: how the app is produced, put into service, kept working and changed, written once for the whole subject.

- Given a change to the app is ready, when the maintainer releases it, then the phone app and the web page are updated so every device runs a compatible version, and a keeper on an older version is still served until they update.
- Given the app is running, when a keeper's commitments grow or a new keeper joins, then the running parts carry the added load within the prompt and durable limits, and the maintainer is warned before any part nears its capacity.
- Given a part fails or a connection drops, when the keeper uses the app, then saved commitments remain durable, reads and adds continue offline, and the app reconciles on recovery without losing a change.
- Given the maintainer must change how commitments or groupings are stored, when they roll the change out, then existing commitments are carried forward unchanged and no keeper loses access during the change.
- Given a keeper closes their account, when they ask for it, then their commitments are removed from every device and store, and nothing of theirs remains readable.
