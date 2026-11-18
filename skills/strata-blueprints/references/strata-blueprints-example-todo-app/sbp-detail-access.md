# To-do app

## Layer 3: Detail

Scope: one part in each entry below; there is one entry for every part listed in Layer 2.

### Access (part)

#### 1. Responsibility

Establishes that a keeper is who they claim to be, and hands every other part a proof it can trust, so that each keeper reaches only their own commitments and groupings, and shared people reach only what is shared with them.

#### 2. Concepts and states

- A keeper account, which is either unverified, active or locked.
- A session, which is either open (a device currently proven) or ended.
- A credential, the secret only the keeper knows, held so that even the maker cannot read it.

#### 3. Seams

- Access to Ledger, offers: a proven keeper identity that scopes every held item to that keeper.
- The keeper's devices to Access, offers and needs: needs a proof of who the keeper is from the device, and offers an admission that opens a session.

#### 4. Rules

- 4.1. Realizes vision-3.1. Given the keeper has a commitment in mind, when they write it down in a few seconds, then Access confirms the open session and attaches the keeper's identity so the item is saved as theirs.
- 4.2. Given a device presents a proof that does not match an active account, when Access checks it, then Access refuses and no session opens.
- 4.3. Given several wrong proofs arrive for one account in a short time, when the next arrives, then Access locks the account against further attempts and tells the keeper.

#### 5. Inside

- A verifier (piece), which checks a presented proof against what is held.
- A session keeper (piece), which marks a session open or ended and attaches identity to each request.

#### 6. Limits

- 6.1. Admitting a keeper, proof in hand, completes within two seconds (Layer 1, Trustworthy with identity).
- 6.2. A keeper's held secret is never readable by anyone, including the maker (Layer 1, Private by default).
- 6.3. A proof crossing from a device cannot be read or replayed by a third party (Layer 1, Trustworthy with identity).

#### 7. Construction

- 7.1. The keeper's secret is stored only as a slow one-way hash with a per-account salt, never in the clear. Reason: meets "the held secret is never readable" even if the store is copied.
- 7.2. Every proof and admission crosses over an encrypted transport, and a session is carried by a signed, expiring credential the device returns on each request. Reason: meets "cannot be read or replayed" and keeps the two-second admission without re-proving each time.
- Not supplied: how long a session stays open before the keeper must prove themselves again.

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

- 11.1. A keeper proves themselves once per device and is then trusted until the session ends, rather than proving on every action. Basis: the keeper adds items many times a day and would abandon the app if made to re-prove each time. If wrong: the admission limit and session rules would tighten.

#### 12. Decisions

- 12.1. An account is locked, not silently throttled, after repeated wrong proofs. Reason: a lock the keeper is told about protects the account and keeps the keeper informed, meeting "only the rightful keeper reaches their commitments".
