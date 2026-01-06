# ClubCalendar v1.04 Release Notes

**Release Date:** January 6, 2026
**Edition:** External Server with Enhanced Member Experience

## Overview

Version 1.04 addresses feedback from the December 2025 and January 2026 design reviews by Donna and Jeff, plus numerous bug fixes and UX improvements.

## Key Changes Since v1.03

### Event Click Behavior (Fixed - Donna P1 #2, Jeff)

| User Type | Behavior |
|-----------|----------|
| **Public (anonymous)** | Shows popup with event details and "Join SBNC to Participate" button |
| **Member (logged in)** | Navigates directly to WA event page for registration |

**Important:** Public users never navigate to event detail pages. They see an informative popup encouraging them to join. This was Donna's request for differentiated click behavior.

### URL Format Fix

- Fixed: Event links now use correct `/Events/{id}` format
- Previously: Used `/event-{id}` which returned 404 errors

### Member Detection (Simplified)

- Members are now identified by having a `waContactId` (logged in via WA)
- Previous logic was overly complex and could fail even when user was logged in

### Public Popup Improvements

- **Paragraph formatting**: Descriptions now preserve paragraph breaks from WA
- **Scrollable content**: Long descriptions scroll within 300px container
- **Close button**: Clear way to dismiss popup
- **Join button**: Links directly to membership signup page

### Search Feature (Donna P2 #1)

- Added search box to filter events by keyword
- Searches event name, description, and tags
- Case-insensitive matching
- Debounced input (300ms) for smooth performance
- Note: WA's native widget doesn't have text search

## Bug Fixes

1. **404 on event click** - Fixed URL format from `/event-{id}` to `/Events/{id}`
2. **Public users navigating to member pages** - Now shows popup instead
3. **Paragraph breaks lost** - Fixed HTML-to-text conversion to preserve `<p>`, `<br>`, `<div>` breaks
4. **Member detection failing** - Simplified to check for `waContactId` presence

## Test Coverage

- **Unit tests**: 1,076 passing
- **Event click behavior tests**: 15 dedicated tests for URL format and popup behavior
- **Production integration test**: Validates search against live data (106 events)

## Files Changed

| File | Changes |
|------|---------|
| `scripts/build/widget-core.html` | Member detection, URL fix, paragraph formatting |
| `tests/unit/event-click-behavior.test.ts` | New test suite (15 tests) |
| `tests/unit/regression-v1.21.test.ts` | Updated URL pattern tests |
| `scripts/build/README.md` | Documented event click behavior |

## Addressing January 5th Review Feedback

### Jeff's Issues (January 5, 2026)

| Issue | Status | Notes |
|-------|--------|-------|
| Anonymous view showing non-public events | By Design | Helps recruitment - prospects see what club offers |
| Ticket type/group visibility | WA handles | WA controls registration restrictions |
| Manual contactId for testing | Pending | Will use `?contactId={Contact.Id}` merge field |
| Recurring events missing (Stride) | Known | Requires server-side expansion in sync |
| Multi-day event display | Known | Same fix as recurring events |
| Can't see events before 12/29 | Known | API needs `months_back` parameter |

### Donna's P1 Issues (January 5, 2026)

| Issue | Status | Notes |
|-------|--------|-------|
| List view + filters don't work | Fixed | Working in v1.04 |
| Clicking event does nothing | Fixed | Now shows popup (public) or navigates (member) |

### Donna's P2 Issues (January 5, 2026)

| Issue | Status | Notes |
|-------|--------|-------|
| No text search | Fixed | Search box added |
| Color dots confusing | Configurable | Can be disabled via config |
| Months-back selector overkill | Configurable | Can simplify to toggle |
| Committee prefix in titles | Configurable | Show/hide via config |
| Filter reorganization | Awaiting | Need final filter list decision |
| Remove Openings filters | Awaiting | Need filter decisions |
| Colors match demo | Deferred | Waiting for Alan's theme |

### December Review (Jeff/Donna)

| Concern | Resolution |
|---------|------------|
| External server dependency | Automatic fallback to WA widget |
| Widget complexity | AI-maintained codebase with docs |
| API pagination | Using `$top`/`$skip` per WA guidelines |
| Hardcoded colors | CSS custom properties (60+ variables) |
| Data freshness | Availability fetched real-time on click |
| Member vs public data | Visibility enforced at server and client |

## Known Issues (Pending Server Fixes)

These require changes to `mail.sbnewcomers.org`:

1. **Recurring events not expanded** - Stride by the Tide shows as one event instead of 81 sessions
2. **Date range hardcoded** - Can't view events more than 7 days in the past
3. **CSS conflicts** - Some button styles overridden by WA theme (deferred to Alan)

## Installation

No changes from v1.03. The widget is hosted on mail.sbnewcomers.org and embedded via iframe:

```html
<iframe
  src="https://mail.sbnewcomers.org/calendar"
  style="width: 100%; height: 800px; border: none;"
  title="Club Events Calendar"
></iframe>
```

## Changelog

### v1.04 (2026-01-06)
- Fixed: Event URLs use `/Events/{id}` format (was `/event-{id}`)
- Fixed: Member detection simplified to `!!CONFIG.waContactId`
- Fixed: Public users see popup, not navigation to member pages
- Fixed: Paragraph breaks preserved in popup descriptions
- Added: 15 dedicated tests for event click behavior
- Added: Search box feature

### v1.03 (2026-01-02)
- New: External server architecture (iframe-based)
- New: "My Registrations" link to WA native page

---

*Maintained by Ed Forman with Claude Code assistance*
