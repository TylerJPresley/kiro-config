# To-do app

## Layer 3: Detail

Scope: one part in each entry below; there is one entry for every part listed in Layer 2.

### Folders (part)

#### 1. Responsibility

Holds the keeper's named groupings, the order the keeper put them in, and who may see each one, so that commitments appear arranged the way the keeper thinks and a grouping can be shared deliberately.

#### 2. Concepts and states

- A grouping, with its name, its position in the keeper's order, and its membership.
- A grouping's sharing state: private to the keeper, or shared with named people.
- A membership, the set of people who may read and change a shared grouping.

#### 3. Seams

- Folders to Ledger, offers: a grouping's identity and membership, so each commitment is filed under one grouping and reached through it.
- Folders to Presence, offers: every change to a grouping or its sharing, for Presence to carry.

#### 4. Rules

- 4.1. Realizes vision-3.2. Given the keeper has many commitments, when they open the app, then Folders returns the keeper's groupings in the order the keeper set, each ready to show its own commitments.
- 4.2. Realizes vision-3.7. Given a grouping is shared with another person, when either person changes it, then Folders records the change under the shared grouping for Presence to carry to every member.
- 4.3. Given the keeper reorders their groupings, when they move one, then Folders records the new order and keeps it for next time.

#### 5. Inside

- A grouping store (piece), which holds each grouping, its order and its membership.

#### 6. Limits

- 6.1. A grouping and its order are durable across app restarts and devices (Layer 1, Durable).
- 6.2. A shared grouping's content is visible only to its named members (Layer 1, Private by default).

#### 7. Construction

- 7.1. A grouping's membership is a list of keeper identities, checked on every read of the grouping so only members see its commitments. Reason: meets "visible only to its named members".
- 7.2. A grouping sits at the top level of the keeper's order and is not nested inside another grouping. Reason: a flat, ordered set matches how the keeper arranges groups and keeps "which group holds this" unambiguous.

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

- 11.1. The keeper has a small number of groupings, few enough to show all at once. Basis: groupings mirror the areas of a person's life, which are few. If wrong: Folders would need its own browsing and search.

#### 12. Decisions

- 12.1. A commitment lives in exactly one grouping at a time. Reason: a single home keeps "what is in this group" unambiguous and matches the Layer 2 assumption, so the keeper never wonders where an item is.
