# Library room booking service (RFP)

Version: 0.1.0

This is a worked blueprint for a request for proposals (RFP): a town council asks bidders to propose a way for patrons to book the public library's meeting rooms. The issuer states the need, the value, the parts and their seams, and the limits an answer must meet. The means are left to the bidder. It is one way to fill the layers, not a template.

An item is numbered by its topic's number in its layer guide and a count that starts at 1 under each topic, and it is written with that number under its own topic: `9.1` is the first item under topic 9 (Risks). A citation, and `--impact`, put the document in front, joined with a hyphen: `vision`, `structure` or `detail.<part>`. So the first risk of the Vision is written `9.1` and cited `vision-9.1`, and the first Construction item of the part Session is written `7.1` and cited `detail.session-7.1`. Which topics are required is stated in the guide, under Short stacks.

## Layer 1: Vision

Scope: the whole room booking service, its patrons and staff, and the outside bodies it depends on.

### 1. Need

The town library has meeting rooms that residents want to use for study groups, clubs and small events. In the council's account, a resident today must ask at the desk or phone during opening hours, and staff keep the bookings on paper. The council says rooms are sometimes promised twice, residents do not know what is free, and staff spend desk time on questions a resident could settle alone. The town wants a service that lets residents book rooms themselves and lets staff see and manage the use.

### 2. Target audience

- **Patrons (actor):** residents of the town who want a room for a set time.
- **Library staff (actor):** the people who run the desk, keep the rooms ready and hold events of their own.
- **Town council (outsider):** the body that pays for the service and asks how the rooms are used.
- **A message channel (outsider):** the path by which a patron is told about a booking.
- **The clock and calendar (outsider):** the passage of time, against which a booking is judged coming.

### 3. Value

- 3.1. Given a patron who wants a room on a day for a number of people, when they ask what is free, then they see the rooms that are open, fit them and are free at that time.
- 3.2. Given a patron who has chosen a free room and time, when they book it, then the room is held for them and they are told it is confirmed.
- 3.3. Given a patron who no longer needs a booking, when they cancel it, then the time is free for others at once and the patron is told it is cancelled.
- 3.4. Given a booking is coming, when its day nears, then the patron is reminded through the channel they gave.
- 3.5. Given the library needs a room for its own event or for repair, when staff block it for a span, then no one can book it then and each patron already booked in that span is told.
- 3.6. Given the council asks how the rooms are used, when staff ask for the report, then they see each room's booked and unused hours for the month.

### 4. Focus

The service covers listing the rooms, booking and cancelling, telling patrons about their bookings, blocking rooms and reporting use. It does not cover taking payment, lending equipment, or bookings made at the desk by phone that bypass the service.

### 5. Success measures

- The share of room bookings made by patrons without help from staff.
Not supplied: the share that marks success.
- The number of bookings promised twice.
Not supplied: the count at the start, and the target.
- The hours of staff desk time spent on booking questions.
Not supplied: the hours today, and the saving the town wants.

### 6. Qualities and constraints

- **No double booking:** a room is never held by two patrons for overlapping times.
- **Open to every patron:** a patron can search, book and cancel from a phone or a library computer without staff help.
- **Private:** the service holds only what it needs to keep a booking and tell the patron, and shows it to library staff and no one else.
- **Accessible:** the patron's side meets the accessibility standard the town follows. Not supplied: which standard.
- **Constraint, budget:** the town pays from one budget line. Not supplied: the ceiling and the contract term.
- **Constraint, evaluation:** each bid is judged first on whether it meets every limit the town fixes, then on price and on the fit of the means it proposes. Not supplied: the weights, the closing date and the contact for questions.

### 7. Vocabulary

- **Patron:** a resident who books a room.
- **Block:** a span of time in which staff withdraw a room from booking.
- **Hold:** a booking that has been accepted and keeps a room for a patron.

### 8. Costs

- 8.1. Given the town awards the work, when the service is built, run and changed over the contract term, then it costs Not supplied: the budget ceiling. Paid by the town.

### 9. Risks

- 9.1. Given a bid meets the price but not a limit, when bids are compared, then the town can award work that fails its need. Severity: High. Answered by vision-12.2.

### 10. Open Concerns

- 10.1. Given patrons may or may not need a library card to book, when the library board says which, then the way a patron is known to the service is chosen and recorded as a limit. Raised by library staff.

### 11. Assumptions

- 11.1. Patrons can reach the service from a phone or a library computer. Basis: the council expects most residents who use the rooms to carry a phone; to confirm before the RFP is issued. If wrong: the service must also be offered at the desk, which changes the Focus.
- 11.2. Bidders hold or can build the means to meet the limits. Basis: the council expects booking services of this kind to be common; to confirm before the RFP is issued. If wrong: no bid meets the limits, and the town changes the limits or the Focus.

### 12. Decisions

- 12.1. The town states needs and limits and leaves the means to the bidder. Reason: bidders can offer what they already run, which lowers the price and keeps the town from fixing a means it has no reason to prefer.
- 12.2. A bid that fails any limit the town fixes is set aside before price is compared. Reason: a low price cannot repair a bid that fails a hard limit, so each limit is pass or fail.

## Layer 2: Structure

Scope: the whole room booking service, divided into parts, with the seams between them and with the outside.

### 1. Parts

- Catalogue (part): holds the rooms, their size and opening hours, and shows which are free.
- Booking (part): holds each booking and keeps any room from being held twice.
- Notices (part): tells a patron about a booking and reminds them before it.
- Desk (part): lets staff block rooms, change the rooms and ask for the use report.

### 2. Standing

- Catalogue: described here.
- Booking: described here.
- Notices: described here.
- Desk: described here.

### 3. Seams between parts

- Desk to Catalogue: a change to a room, its size or its hours crosses. Desk initiates when staff edit a room.
- Catalogue to Booking: a room's opening hours and size cross, so Booking accepts only times a room is open. Catalogue initiates when a room or its hours change.
- Booking to Catalogue: the times held for each room cross, so Catalogue can show what is free. Booking initiates when a hold is made or freed.
- Booking to Notices: a made, freed or displaced booking crosses, so the patron is told. Booking initiates when a booking changes.
- Desk to Booking: a block on a room for a span crosses, so Booking frees any hold inside it. Desk initiates when staff set a block.
- Desk to Booking, report: staff ask for the booked hours of each room for a month. Desk initiates when staff ask for the report.

### 4. Seams with the outside

- Patron to Catalogue: a patron's day, time and number of people cross, and the free rooms come back. The patron initiates.
- Patron to Booking: a patron's choice of room and time crosses, to book or to cancel. The patron initiates.
- Notices to a message channel: a message for a patron crosses out. Notices initiates when a booking changes or a booking draws near.
- The clock and calendar to Notices: the current time crosses in, so Notices knows a booking is near. Notices initiates when it reads the time.
- Library staff to Desk: a staff member's block, room change or report request crosses. Library staff initiate.
- Desk to the town council: the use report crosses out. Desk initiates when staff send it.

### 5. Shared things

- The room and its time: the one pair that Catalogue, Booking and Desk all refer to, so a room and a time mean the same in each.

### 6. Scenario paths

- 6.1. Realizes vision-3.1. Given a patron who wants a room on a day for a number of people, when they ask what is free, then Catalogue lists the rooms that are open and fit, and Booking supplies the times already held so only free rooms show.
- 6.2. Realizes vision-3.2. Given a patron who has chosen a free room and time, when they book it, then Booking holds the room for them and Notices tells them it is confirmed.
- 6.3. Realizes vision-3.3. Given a patron who no longer needs a booking, when they cancel it, then Booking frees the time, Catalogue shows it free and Notices tells the patron it is cancelled.
- 6.4. Realizes vision-3.4. Given a booking is coming, when its day nears, then Notices reads the time and sends the patron a reminder.
- 6.5. Realizes vision-3.5. Given the library needs a room for its own event or for repair, when staff block it for a span, then Desk passes the block to Booking, which frees each hold inside it, and Notices tells each patron.
- 6.6. Realizes vision-3.6. Given the council asks how the rooms are used, when staff ask for the report, then Booking supplies the booked hours of each room and Desk sets them against opening hours.

### 7. Costs

None.

### 8. Risks

None.

### 9. Open Concerns

None.

### 10. Assumptions

- 10.1. One Booking part can serve every room. Basis: the council expects the library to have a small number of rooms; to confirm before the RFP is issued. If wrong: Booking splits by room group, which adds seams. Not supplied: the number of rooms.

### 11. Decisions

- 11.1. Notices is a part of its own, not a duty of Booking. Reason: telling the patron is a Layer 1 value on its own, and a bidder may offer it apart from booking.

## Layer 3: Detail

Scope: one part in each entry below, only where the town fixes a limit or a rule a bid must meet. Construction in each entry is the bidder's to propose.

### Catalogue (part)

#### 1. Responsibility

Holds each room with its size and opening hours, and answers for showing a patron only the rooms that are open, fit and free.

#### 2. Concepts and states

- A room, with its size and its opening hours.

#### 3. Seams

- Desk to Catalogue, needs: a change to a room, its size or its hours.
- Catalogue to Booking, offers: a room's opening hours and size, whenever a room or its hours change.
- Booking to Catalogue, needs: the times held for each room, so Catalogue can show what is free.
- Patron to Catalogue, offers and needs: a patron's day, time and number of people come in, and the free rooms go back.

#### 4. Rules

- 4.1. Realizes vision-3.1. Given a patron who wants a room on a day for a number of people, when they ask what is free, then Catalogue lists the rooms that are open and fit, and shows only the times that Booking has not held.
- 4.2. Given a room's hours change, when staff save the change, then Catalogue offers the new hours to Booking and shows them from then on.

#### 5. Inside

- Not supplied: left to the bidder.

#### 6. Limits

- 6.1. A room shown as free is free at the moment it is shown, as far as Booking has recorded (Layer 1, No double booking).
- 6.2. A patron completes a search with no staff help (Layer 1, Open to every patron).

#### 7. Construction

- Not supplied: the means and values for this part, proposed by the bidder to meet the Limits.

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

None.

#### 12. Decisions

None.

### Booking (part)

#### 1. Responsibility

Holds each booking and answers for keeping any room from being held twice, so that a booking the patron was told of is a booking they have.

#### 2. Concepts and states

- A hold, which is a booking that has been accepted and keeps one room for one patron for one span of time on one day.

#### 3. Seams

- Catalogue to Booking, needs: a room's opening hours and size, so Booking accepts only times a room is open.
- Booking to Catalogue, offers: the times held for each room, whenever a hold is made or freed.
- Booking to Notices, offers: a made, freed or displaced booking, whenever a booking changes.
- Desk to Booking, needs: a block on a room for a span, so Booking frees any hold inside it.
- Desk to Booking, report, offers and needs: the staff's request for the booked hours of each room for a month comes in, and the booked hours go back.
- Patron to Booking, needs: a patron's choice of room and time, to book or to cancel.

#### 4. Rules

- 4.1. Realizes vision-3.2. Given a patron who has chosen a free room and time, when they book it, then Booking holds the room for them and offers the confirmation to Notices.
- 4.2. Realizes vision-3.3. Given a patron who no longer needs a booking, when they cancel it, then Booking frees the time and offers the change to Catalogue and Notices.
- 4.3. Realizes vision-3.5. Given the library needs a room for its own event or for repair, when staff block it for a span, then Booking frees each hold inside the span and offers each freed booking to Notices.
- 4.4. Realizes vision-3.6. Given the council asks how the rooms are used, when staff ask for the report, then Booking supplies the booked hours of each room for the month.
- 4.5. Given two patrons ask for the same room and time at once, when both submit, then Booking holds it for one and tells the other it is taken.

#### 5. Inside

- Not supplied: left to the bidder.

#### 6. Limits

- 6.1. No two holds for one room overlap in time, however many patrons ask at once (Layer 1, No double booking).
- 6.2. A booking is shown only to its patron and to library staff (Layer 1, Private).
- 6.3. A patron books and cancels with no staff help (Layer 1, Open to every patron).

#### 7. Construction

- Not supplied: the means and values for this part, proposed by the bidder to meet the Limits.

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

- 11.1. A booking is for one room and one span of time on one day. Basis: the council expects the rooms to be booked by the hour; to confirm before the RFP is issued. If wrong: a booking that runs over several days needs its own rule.

#### 12. Decisions

- 12.1. When two patrons ask at once, the first request received wins. Reason: the patron told "confirmed" must keep the room, and a first-come rule is the one patrons expect.

### Notices (part)

#### 1. Responsibility

Answers for telling the patron what became of their booking and reminding them before it, through the channel the patron gave.

#### 2. Concepts and states

- A message, which tells one patron what became of a booking or that a booking is coming.

#### 3. Seams

- Booking to Notices, needs: a made, freed or displaced booking, so the patron is told.
- Notices to a message channel, offers: a message for a patron, whenever a booking changes or draws near.
- The clock and calendar to Notices, needs: the current time, so Notices knows a booking is near.

#### 4. Rules

- 4.1. Realizes vision-3.4. Given a booking is coming, when its day nears, then Notices sends the patron a reminder through the channel they gave.
- 4.2. Given a message cannot be delivered, when Notices learns of it, then the booking stays held and the failure shows to staff.

#### 5. Inside

- Not supplied: left to the bidder.

#### 6. Limits

- 6.1. A patron is told the result of a booking at once (Layer 1, Open to every patron).
- 6.2. A message holds only what is needed to tell the patron of the booking (Layer 1, Private).

#### 7. Construction

- Not supplied: the means and values for this part, proposed by the bidder to meet the Limits.

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

None.

#### 12. Decisions

None.

### Desk (part)

#### 1. Responsibility

Answers for letting staff change the rooms, block a room for a span and ask for the use report, and for showing staff no more than their work needs.

#### 2. Concepts and states

- A block, which withdraws one room from booking for a span of time.

#### 3. Seams

- Desk to Catalogue, offers: a change to a room, its size or its hours, whenever staff edit a room.
- Desk to Booking, offers: a block on a room for a span, whenever staff set a block.
- Desk to Booking, report, offers and needs: the staff's request for the booked hours of each room for a month goes out, and the booked hours come back.
- Library staff to Desk, needs: a staff member's block, room change or report request.
- Desk to the town council, offers: the use report, whenever staff send it.

#### 4. Rules

- 4.1. Realizes vision-3.5. Given the library needs a room for its own event or for repair, when staff block it for a span, then Desk passes the block to Booking and shows staff each patron affected.
- 4.2. Realizes vision-3.6. Given the council asks how the rooms are used, when staff ask for the report, then Desk shows each room's booked and unused hours for the month.

#### 5. Inside

- Not supplied: left to the bidder.

#### 6. Limits

- 6.1. Only library staff reach the Desk (Layer 1, Private).
- Not supplied: the measure by which the council checks the use report (Layer 1, vision-3.6).

#### 7. Construction

- Not supplied: the means and values for this part, proposed by the bidder to meet the Limits.

#### 8. Costs

None.

#### 9. Risks

None.

#### 10. Open Concerns

None.

#### 11. Assumptions

None.

#### 12. Decisions

None.

## What to notice

- The issuer writes for someone else to answer. Layers 1 and 2 are in full: the need, the value, the parts and their seams. Layer 3 writes all twelve topics for each part: the limits and rules a bid must meet are its content, a topic the town has nothing to say about reads `None.`, and a topic left to the bidder, such as Inside and Construction, reads `Not supplied:`.
- Evaluation is a rule of the document, not an afterthought. `vision-12.2` makes each Limit pass or fail, and the Limits trace to named qualities in Layer 1.
- Each value is numbered in Layer 1 (`3.1` to `3.6`) and cited by its id (`vision-3.1` to `vision-3.6`); its path in Layer 2 and its rule in Layer 3 say `Realizes` and that id, so a bidder can follow one need to the part that must meet it.
- What the town does not know, such as the budget, the standard and the numbers, is marked `Not supplied:` and left for the issuer to fill before the RFP goes out.
