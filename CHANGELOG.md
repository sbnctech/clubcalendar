# ClubCalendar Changelog

## Version 1.02 (2026-01-01)

### Security Fixes

- **CRITICAL: My Events requires login** - The "My Events" email lookup feature is now only available to logged-in members. Previously, anyone could enter any email address to see another person's event registrations. This privacy vulnerability has been fixed with two layers of protection:
  - My Events tab is hidden for non-logged-in users
  - `findMyEvents()` function rejects calls when `memberLevel` is not set

### Improvements

- **CSS custom properties for theming** - All hardcoded colors have been replaced with CSS custom properties (`--clubcal-*`). Organizations can now customize colors via WA's Custom CSS without modifying the widget code:
  - Primary/accent colors: `--clubcal-primary`, `--clubcal-accent`
  - Text colors: `--clubcal-text`, `--clubcal-text-muted`
  - Status colors: `--clubcal-success`, `--clubcal-warning`, `--clubcal-error`, `--clubcal-info`
  - Filter dot colors: `--clubcal-dot-*`
  - Availability colors: `--clubcal-avail-*`

- **Defensive filter array handling** - Added null checks to prevent crashes when filter arrays (`quickFilters`, `timeOfDay`, `memberAvailability`) are undefined

- **Cost display uses category strings** - Popup now shows actual cost categories (`Free`, `Under $25`, `$25-50`, etc.) instead of confusing fake midpoint values like "$12" or "$37". Both filtering and display now use the human-readable category strings.

- **Add to Calendar icons** - Inline SVG icon buttons for Google Calendar, Outlook.com, Yahoo Calendar, and Apple Calendar (.ics). Branded colors with hover effects and tooltips. No dropdown required

### Code Refactoring

- **jQuery dependency removed** - All DOM manipulation now uses vanilla JavaScript. Removes ~85KB dependency. FullCalendar is the only external library.

- **Explicit memberLevel handling** - Changed default `memberLevel` from `null` to `'public'` for clarity. All checks now explicitly test for `'public'` instead of falsy values.

- **Event delegation** - Replaced inline `onclick` handlers with `data-action` attributes and a single delegated event listener. Reduces global API surface and improves maintainability.

### Documentation

- Created `docs/CSS_CUSTOMIZATION_GUIDE.md` with all CSS variables and default values
- Updated `docs/JEFF_REVIEW_RESPONSE.md` with implementation status
- Updated `docs/FEATURE_COMPATIBILITY_CHART.md` to version 1.02

### Code Quality

- Addressed Jeff Phillips' code review feedback
- Consolidated architecture-dependent issues documentation

---

## Version 1.01 (2025-12-30)

### New Features

- **Auto-refresh on tab focus**: Calendar automatically refreshes event data when user returns to the tab (after 30 seconds since last refresh). This keeps registration availability up-to-date.

- **Automatic failover to Wild Apricot calendar**: If ClubCalendar encounters a fatal error (container not found, FullCalendar fails to load, API errors), it automatically shows a pre-placed WA calendar fallback or displays an error message with link to events.

- **Typography customization**: New config options `fontFamily` and `baseFontSize` allow organizations to match their site's typography.

### Bug Fixes

- **CRITICAL: Fixed visibility issue** - Anonymous users were seeing member-only events. Now member-only events are properly filtered out for non-logged-in users.

- **Fixed Interest Area filter TypeError** - Selecting an Interest Area filter was breaking the quick filters (`quickFilters is undefined`). The `applyFilters()` function now properly preserves filter state.

- **Fixed today's events not displayed** - Events occurring earlier today were being filtered out because the cutoff used current time instead of start of day.

- **Fixed Previous navigation empty** - Navigating to previous months in the calendar now automatically loads past events as needed.

- **Fixed "Open to Public" quick filter** - The public events filter was missing from the filter logic; now properly shows only events tagged as public or with guest tickets.

- **Fixed registration_open_date mapping** - The `registrationOpenDate` field was not being mapped from JSON events, causing "Just Opened" and "Opening Soon" filters to never match.

### Improvements

- **Popup link accessibility** - Text links in event popups are now underlined for better accessibility and usability.

- **Added test coverage** - Added 17 new tests for member visibility filtering and 12 tests for visibility-based auto-refresh.

### Notes

- The "After Hours" and "Evening" filters are intentionally different:
  - **Evening**: Events starting at 5pm or later
  - **After Hours**: Weekends OR events after 5pm on weekdays

- Quick filters for "Just Opened", "Opening Soon", and "Openings for Newbies" require the events data to include the relevant fields (`registration_open_date` and newbie tags).

- "Few Spots Left" filter works for logged-in members or public events with 3 or fewer spots remaining.

---

## Version 1.0 (2025-12-28)

Initial release of ClubCalendar widget.

### Features

- FullCalendar-based event display with month view and list view
- Interest area, committee, and cost filtering
- Quick filters: Weekend, Openings, Free, After Hours, Newbie-friendly
- Time of day filters: Morning, Afternoon, Evening
- My Events tab for looking up personal registrations
- Event popup with details and registration link
- Add to Calendar (.ics) functionality
- Configurable colors, headers, and filters
