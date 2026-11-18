# To-do app

## Layer 3: Detail

Scope: one part in each entry below; there is one entry for every part listed in Layer 2.

### Timing (part)

#### 1. Responsibility

Judges each commitment's due value against the current time and says which commitments are due today, which are overdue and which are upcoming, so the keeper sees what needs doing now and the alerting part knows when a commitment has come due.

#### 2. Concepts and states

- A due value on a commitment: a day, or a day and time.
- A judgement: today, overdue or upcoming, computed against "now".
- The passing of a due moment, the instant a commitment's due time arrives.

#### 3. Seams

- Ledger to Timing, needs: each commitment's due day or time.
- Timing to Notifier, offers: the fact that a commitment has become due, and when.
- Timing to the clock and calendar, needs: the current time, to judge against.

#### 4. Rules

- 4.1. Realizes vision-3.3. Given some commitments have a day or time they are due, when the keeper looks, then Timing ranks them into today, overdue and upcoming, in due order.
- 4.2. Given a commitment's due moment arrives, when Timing next reads the time, then Timing marks it due and offers that fact to Notifier.
- 4.3. Given a commitment has no due value, when Timing judges the set, then it is left out of today and overdue and placed among the undated.

#### 5. Inside

None.

#### 6. Limits

- 6.1. A commitment that has become due is recognised as such within one minute of its due moment (Layer 1, Prompt).
- 6.2. The keeper's time zone is honoured so "today" matches the keeper's own day (Layer 1, Prompt).

#### 7. Construction

- 7.1. Timing reads the current moment in the keeper's own time zone each time it judges, rather than storing a precomputed verdict. Reason: keeps "today" correct as time passes and as the keeper travels, meeting the one-minute recognition limit without stale state.
- 7.2. A commitment due "today" with no time is treated as due at the end of the keeper's day. Reason: it is not overdue until the day is over, which matches how the keeper reads "due today".

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

- 11.1. The keeper's device knows the keeper's current time zone. Basis: consumer devices track the local zone as the keeper travels. If wrong: the keeper would have to set a zone by hand for "today" to be right.

#### 12. Decisions

- 12.1. Timing holds no commitment data of its own and judges only what it is handed. Reason: keeping the judge stateless keeps "due" consistent with the Ledger and avoids two copies of the truth.
