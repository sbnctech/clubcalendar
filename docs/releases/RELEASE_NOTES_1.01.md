# ClubCalendar 1.01 Release Notes

**Release Date:** December 30, 2024

---

## Summary

Version 1.01 is a stability and reliability update that fixes several critical bugs discovered during initial testing and adds automatic failover to ensure members always have calendar access.

---

## New Features

### Auto-Refresh on Tab Focus
Calendar automatically refreshes event data when users return to the tab after 30+ seconds away. This keeps registration availability current—important when events are filling up quickly.

### Automatic Failover to WA Calendar
If ClubCalendar encounters a fatal error (container not found, FullCalendar fails to load, API errors), it automatically shows the Wild Apricot calendar fallback or displays a helpful error message with a link to events.

### Typography Customization
New config options `fontFamily` and `baseFontSize` allow organizations to match ClubCalendar's typography to their site theme.

---

## Bug Fixes

### CRITICAL: Member Visibility Fixed
**Issue:** Anonymous users were seeing member-only events.
**Fix:** Member-only events are now properly filtered out for non-logged-in users. This was a security-relevant issue.

### Interest Area Filter Fixed
**Issue:** Selecting an Interest Area filter broke quick filters (`quickFilters is undefined`).
**Fix:** The `applyFilters()` function now properly preserves filter state.

### Today's Events Now Display
**Issue:** Events occurring earlier today were filtered out.
**Fix:** Date cutoff now uses start of day instead of current time.

### Previous Navigation Works
**Issue:** Navigating to previous months showed empty calendar.
**Fix:** Past events are now automatically loaded when navigating backward.

### "Open to Public" Filter Works
**Issue:** The public events quick filter wasn't implemented.
**Fix:** Now properly shows only events tagged as public or with guest tickets.

### Registration Date Mapping Fixed
**Issue:** "Just Opened" and "Opening Soon" filters never matched any events.
**Fix:** The `registrationOpenDate` field is now correctly mapped from JSON events.

---

## Improvements

- **Popup Link Accessibility:** Text links in event popups are now underlined for better visibility and accessibility.

- **Test Coverage:** Added 29 new unit tests covering the bug fixes and new features (715 total tests passing).

---

## Technical Notes

- **Debounce interval:** Auto-refresh triggers after 30 seconds of stale data (configurable).

- **Filter clarification:** "After Hours" and "Evening" are intentionally different:
  - Evening = events starting at 5pm or later
  - After Hours = weekends OR events after 5pm on weekdays

- **API Pagination:** Updated sync script to use WA's recommended `$top`/`$skip` pagination pattern.

---

## Upgrade Instructions

1. Replace `ClubCalendar_EVENTS_PAGE.html` in your WA Custom HTML gadget
2. Optionally update `ClubCalendar_CONFIG_PAGE.html` if using the config page
3. No configuration changes required—existing settings continue to work

---

## Known Issues

None at this time.

---

## Version History

- **1.01** (2024-12-30) - Stability and reliability update
- **1.0** (2024-12-28) - Initial release
