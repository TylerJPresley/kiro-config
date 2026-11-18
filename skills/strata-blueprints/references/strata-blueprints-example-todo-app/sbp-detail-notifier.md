# To-do app

## Layer 3: Detail

Scope: one part in each entry below; there is one entry for every part listed in Layer 2.

### Notifier (part)

#### 1. Responsibility

Sends the keeper a message about a commitment that has come due when the app is not open, through a channel the keeper chose, so a due commitment is not missed because the app was closed.

#### 2. Concepts and states

- An alert, pending or sent, for one due commitment.
- A chosen channel, the path the keeper picked to be reached by.
- A quiet setting, hours in which the keeper has asked not to be alerted.

#### 3. Seams

- Timing to Notifier, needs: the fact that a commitment has become due, and when.
- Notifier to a notification channel, offers: a message for the keeper about the due commitment.

#### 4. Rules

- 4.1. Realizes vision-3.4. Given a commitment is due soon and the app is not open, when its due time approaches, then Notifier sends the keeper a message through the chosen channel.
- 4.2. Given the keeper has set quiet hours, when a commitment comes due inside them, then Notifier holds the message until the quiet hours end.
- 4.3. Given the keeper has the app open, when a commitment comes due, then Notifier sends no outside message, because the keeper already sees it.

#### 5. Inside

- A sender (piece), which hands a message to the chosen channel.
- A schedule of pending alerts (piece), which holds what is to be sent and when.

#### 6. Limits

- 6.1. An alert reaches the keeper within one minute of the commitment becoming due, outside quiet hours (Layer 1, Prompt).
- 6.2. A message's content reveals a due commitment only to the keeper, not to anyone handling the channel (Layer 1, Private by default).

#### 7. Construction

- 7.1. A due message carries only a neutral prompt to open the app, not the commitment's text, so the channel's handler cannot read the content. Reason: meets "reveals a due commitment only to the keeper".
- 7.2. The keeper chooses one active channel at a time from those the app offers. Reason: one channel keeps the alert certain to arrive once and avoids a storm of duplicate messages.

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

- 11.1. A notification channel can reach the keeper's device when the app is closed. Basis: the Layer 1 outsider is a channel that carries messages to a resting device. If wrong: the keeper would see a due commitment only on opening the app.

#### 12. Decisions

- 12.1. The Notifier sends nothing while the app is open and showing the keeper. Reason: the keeper already sees the due commitment, and a double prompt would be noise rather than help.
