# ClubCalendar - SBNC Operator Checklist (Inline-only)

This checklist is for the SBNC Tech Chair / site admin when deploying or updating ClubCalendar.

## A. Prereqs and safety
- [ ] Confirm you are editing the SBNC playground site first (not production).
- [ ] Confirm you have Admin access to edit pages and add Custom HTML blocks.
- [ ] Confirm you can roll back quickly (copy/paste old HTML blocks into a safe note).

## B. Pages required (2 pages)
1) Config page (stores JSON config)
- [ ] Create a hidden or admin-only page at: /clubcalendar-config
- [ ] Paste the full "Config page HTML" into a single Custom HTML gadget/block on that page.
- [ ] Save & Publish.
- [ ] Visit /clubcalendar-config and confirm the JSON is visible in-page (or at least the page loads).

2) Events/Calendar page (renders widget)
- [ ] Choose the page where the calendar should appear.
- [ ] Paste the full "Events page HTML" into a single Custom HTML gadget/block on that page.
- [ ] Save & Publish.
- [ ] Visit the page and confirm you see the ClubCalendar title and no error box.

## C. Functional checks
- [ ] Filters render (dropdowns and/or quick filters) per config.
- [ ] Clicking a filter updates the visible event list/calendar.
- [ ] Event time is correct for America/Los_Angeles.
- [ ] Confirm behavior across DST boundaries using known events (if available).
- [ ] Confirm member-only events are not exposed on public pages (if intended).
- [ ] Confirm logged-in experience matches expectations.

## D. Performance and reliability
- [ ] Page load is reasonable (no long blank screen).
- [ ] If WA/event feed fails, widget shows a clear error and fallback link (no silent failure).
- [ ] Browser console has no repeated errors.

## E. Publishing and change control
- [ ] Keep a copy of the last known-good config JSON.
- [ ] Any change to config should be followed by a quick spot-check of the calendar page.
- [ ] Record the date/time of changes and the person making them.

## F. Troubleshooting quick hits
- If you see "Config block not found":
  - [ ] Confirm /clubcalendar-config exists and is published
  - [ ] Confirm the config page includes <script id="clubcalendar-config"> JSON </script>
- If you see JSON parse errors:
  - [ ] Validate the JSON (missing comma, quotes, etc.)
- If events are empty:
  - [ ] Confirm the widget is pointing to the correct WA/events source as required by current implementation
  - [ ] Check browser network tab for blocked requests (CORS/403/404)

