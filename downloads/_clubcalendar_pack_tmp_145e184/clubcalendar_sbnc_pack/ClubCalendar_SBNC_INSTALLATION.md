# ClubCalendar (SBNC) - WA Inline-Only Installation Pack

Goal
- No external servers (no mail.sbnewcomers.org).
- No external script hosting required.
- Two WA pages:
  1) Config page (admin/config UI) that stores published JSON config in-page.
  2) Events page (inline calendar) that fetches config page HTML, extracts JSON, renders.

What you will paste into WA
- Config page: paste the entire contents of ClubCalendar_SBNC_CONFIG_PAGE.html into a WA Custom HTML gadget.
- Events page: paste the entire contents of ClubCalendar_SBNC_EVENTS_PAGE.html into a WA Custom HTML gadget.

SBNC Setup Steps (WA Admin)
1) Create a new page: /clubcalendar-config
   - Add a Custom HTML gadget.
   - Paste: ClubCalendar_SBNC_CONFIG_PAGE.html
   - Save & Publish.

2) Create a new page: /clubcalendar-events (or your preferred URL)
   - Add a Custom HTML gadget.
   - Paste: ClubCalendar_SBNC_EVENTS_PAGE.html
   - Save & Publish.

3) Configure
   - Visit /clubcalendar-config (as admin).
   - Use the admin UI to set dropdowns/tags/options.
   - Click the button that writes/updates the published JSON block (see instructions on page).
   - Save & Publish (again).

4) Test
   - Logged out: confirm only public events/settings appear.
   - Logged in member: confirm member-only behavior and filters.
   - Confirm timezone correctness across DST.
   - Confirm no references to mail.sbnewcomers.org anywhere.

Rollback
- Unpublish the pages or remove the gadgets.
- Restore prior widget HTML if you are replacing an existing page.

Notes
- The events page fetches the config page by relative URL /clubcalendar-config.
- Both pages must be same WA site domain for fetch() to succeed.
