# ClubCalendar v1.04 - Bug Fixes and Review Responses

Hi team,

I've released ClubCalendar v1.04 with fixes for the bugs and feedback from our January 5th discussion and earlier reviews.

## What's Fixed

**Event Click Behavior** (Donna's P1 #2 - "clicking event does nothing"):

- **Public visitors**: Click an event and see a popup with title, date/time, scrollable description (with paragraph formatting), and a "Join SBNC to Participate" button. They never navigate to member-only pages.

- **Logged-in members**: Click an event and go directly to the WA event page where they can register. This works reliably now.

**Search Box** (Donna's P2 #1 - "no text search"):

- Added keyword search that filters by event name, description, and tags
- Case-insensitive, with smooth debounced input
- Note: WA's native widget doesn't have this feature

**Other Fixes:**

- Event links now use correct URL format (`/Events/7556341` instead of `/event-7556341` which was 404)
- Paragraph breaks from WA preserved in descriptions (no more walls of text)
- Member detection simplified - if you have a contactId, you're treated as a member

## Addressing Donna's January 5th Concerns

**Data freshness:**

- Event listings sync every 15 minutes from WA
- Availability (spots left, waitlist) is fetched **real-time** when you click an event
- Your registrations ("My Events") fetched **real-time** from WA

**Member vs admin API:**

- Public calendar filters to `AccessLevel='Public'` events only
- Location and registration details hidden from non-members
- WA handles actual registration restrictions

**CSS polish:**

- Ongoing - specific feedback welcome
- Some button styles still affected by WA theme conflicts

## Known Issues (Server Fixes Needed)

From Jeff's January 5th testing:

- **Recurring events** (Stride by the Tide): Shows as one event instead of 81 sessions - requires server-side expansion
- **Past events limited**: Can't see more than 7 days back - API needs parameter update

## Testing

- 1,076 unit tests passing
- 15 new tests for event click behavior
- Production integration test validates against 106 live events

## Try It

The widget is live at https://mail.sbnewcomers.org/calendar

- **Members**: Log into WA first, then click any event → goes to event details page
- **Public**: Click any event → sees "Join SBNC" popup

Let me know if you find issues or have CSS specifics.

Ed
