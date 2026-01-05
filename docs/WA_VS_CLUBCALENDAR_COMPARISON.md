# Jeff's WA Widget vs ClubCalendar - Feature Comparison

**Date:** January 5, 2026
**Purpose:** Objective comparison of Jeff's enhanced WA Widget and ClubCalendar

---

## Overview

| Aspect | Jeff's WA Widget | ClubCalendar |
|--------|------------------|--------------|
| **Architecture** | JavaScript overlay on native WA calendar | Standalone widget with external data source |
| **Data Source** | WA page DOM (live) | SQLite database (synced from WA API) |
| **Deployment** | Embedded in WA page | Can run on WA or any website |
| **Fallback** | N/A (is the fallback) | Falls back to WA widget if issues occur |

---

## Feature Comparison

### Calendar Views

| Feature | WA Widget | ClubCalendar |
|---------|-----------|--------------|
| Month view | Yes | Yes |
| Week view | Yes | Yes |
| Year view | Yes | No |
| List view | Yes | Yes |
| Day view | No | No |

### Filtering

| Feature | WA Widget | ClubCalendar |
|---------|-----------|--------------|
| Committee filter | Yes | Yes |
| Time of day filter | Yes | Yes |
| Event type filter (Public/Free) | Yes | Yes |
| Text search | Yes (title only) | Yes (title + description) |
| "Weekend" quick filter | No | Yes |
| "After Hours" quick filter | No | Yes |
| "Has Openings" filter | No | Yes |
| "Opening Soon" filter | No | Yes |
| "Openings for Newbies" filter | No | Yes |
| Filter persistence | Yes (localStorage) | Yes (localStorage) |

### Visual Indicators

| Feature | WA Widget | ClubCalendar |
|---------|-----------|--------------|
| Time-of-day color coding | Yes | Yes |
| Waitlist badge | Yes (red) | Yes |
| Coming Soon badge | Yes (green) | Yes |
| Recurring event indicator | Yes ("1 of 3") | Yes |
| "My Registered" highlighting | No | Yes |
| Spots remaining count | No | Yes |

### Member Features

| Feature | WA Widget | ClubCalendar |
|---------|-----------|--------------|
| "View My Events" link | Yes | Yes |
| Highlight registered events | No | Yes |
| Show which events user is registered for | No | Yes |
| One-click to event page | Yes | Yes |

### Search Capabilities

| Feature | WA Widget | ClubCalendar |
|---------|-----------|--------------|
| Search by title | Yes | Yes |
| Search by description | No* | Yes |
| Case-insensitive | Yes | Yes |
| Real-time filtering | Yes | Yes |

*WA Widget cannot search descriptions because the WA calendar DOM doesn't include description text. This is a limitation of the WA platform, not Jeff's code.

ClubCalendar CAN search descriptions because it has access to the full event data via the SQLite database synced from the WA API.

---

## Known Issues Comparison

### WA Widget Issues (from automated testing)

| Issue | Severity | Status |
|-------|----------|--------|
| Show All clears search text | P2 | Confirmed by test |
| No "no results" message | P2 | Confirmed by test |
| Untagged events hidden by filters | P1 | Code review (not in current data) |
| Registration Opens date stripped | P2 | Code review |
| Year boundary in Coming Soon calc | P3 | Code review (edge case) |
| Timezone not handled | P3 | Code review |

### ClubCalendar Issues (from Jeff/Donna testing - now fixed)

| Issue | Severity | Status |
|-------|----------|--------|
| Public vs Member registration messages | P2 | Fixed in v1.40 |
| Repeating events display | P2 | Fixed in v1.40 |
| Various UI refinements | P3 | Fixed in v1.40 |

---

## Presentation & Usability

### Jeff's WA Widget

**Strengths:**

- **Collapsible filter panels** - Keeps the UI clean by hiding committee filters until needed
- **Badge counts** on filter categories - Shows how many options are in each group
- **"Showing X of Y events"** counter - Gives feedback on filter results
- **Integrated with WA look** - Feels native to the Wild Apricot page

**Weaknesses:**

- **No feedback when filters yield zero results** - Calendar just goes blank
- **Filter panels can intercept clicks** - Collapsed panels can block interaction
- **Show All clears search** - Potentially confusing behavior
- **Registration date stripped** - "Coming Soon" badge appears but user can't see WHEN registration opens

### ClubCalendar

**Strengths:**

- **Quick filter buttons visible** - Weekend, Has Openings, After Hours are one-click accessible
- **Color-coded dots** - Visual language for filter types (purple=weekend, green=openings, etc.)
- **Help modal** - Built-in documentation for users
- **"My Registered" highlighting** - Immediate visual feedback on your events
- **Spots remaining visible** - Don't have to click into event to see availability

**Weaknesses:**

- **More visual density** - More buttons/options visible at once (could overwhelm some users)
- **External dependency** - If server is slow, calendar is slow (though fallback exists)

### UX Comparison

| Aspect | WA Widget | ClubCalendar |
|--------|-----------|--------------|
| Filter discovery | Hidden in panels | Visible buttons |
| Zero results feedback | None | Could add message |
| "My events" visibility | Must click link | Highlighted on calendar |
| Availability info | Must click event | Visible in list/card |
| Learning curve | Lower (fewer options) | Slightly higher (more features) |
| Information density | Lighter | Denser |

### Accessibility Notes

Both use color coding, which could be an issue for colorblind users. Neither appears to have explicit ARIA labels for screen readers (a full accessibility audit was not performed).

---

## Architecture Differences

### Jeff's WA Widget

```
┌─────────────────────────────────────────┐
│  Wild Apricot Page                       │
│  ┌─────────────────────────────────┐    │
│  │  Native WA Calendar (DOM)        │    │
│  └─────────────┬───────────────────┘    │
│                │                         │
│  ┌─────────────▼───────────────────┐    │
│  │  Jeff's JavaScript Enhancement   │    │
│  │  - Reads events from DOM         │    │
│  │  - Adds filter bar               │    │
│  │  - Adds badges/colors            │    │
│  │  - Saves to localStorage         │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Pros:**

- No external server required
- Uses WA's native calendar as base
- Easy to deploy (just add script)

**Cons:**

- Limited to data available in WA DOM
- Can't search descriptions
- No access to real-time availability

### ClubCalendar

```
┌─────────────────────────────────────────┐
│  Any Website (WA or external)            │
│  ┌─────────────────────────────────┐    │
│  │  ClubCalendar Widget             │    │
│  └─────────────┬───────────────────┘    │
└────────────────┼────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  External Server (mail.sbnewcomers.org)  │
│  ┌─────────────────────────────────┐    │
│  │  SQLite Database                 │    │
│  │  - Full event data from WA API   │    │
│  │  - Descriptions, availability    │    │
│  │  - Synced every 15 minutes       │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Pros:**

- Full access to event data
- Can search descriptions
- Real-time availability on click
- Works on any website
- Built-in fallback to WA widget

**Cons:**

- Requires external server
- More complex deployment
- Depends on server uptime

---

## Test Results Summary

### WA Widget Automated Test (Jan 5, 2026)

| Category | Result |
|----------|--------|
| Basic functionality | 4/4 passed |
| Search | 2/3 passed |
| Visual indicators | 3/3 passed |
| Event display | 2/2 passed |
| Bug verification | 2 bugs confirmed |

**Data Found:**

- 42 events loaded
- All 42 events have color coding
- 3 "Stride by the Tide" instances found
- 1 waitlist badge found
- All events properly tagged (0 orphan events)
- All tags lowercase (no case issues)

---

## Use Case Recommendations

### Use WA Widget When:

- You want a simple enhancement to the native WA calendar
- You don't need description search
- You don't need "My Registered" highlighting
- You want to avoid external dependencies

### Use ClubCalendar When:

- You need description search capability
- You want "My Registered" event highlighting
- You need to embed the calendar on non-WA pages
- You want real-time availability information
- You need quick filters (Weekend, After Hours, Has Openings, Opening Soon, Newbies)

---

## Summary Table

| Capability | WA Widget | ClubCalendar | Winner |
|------------|-----------|--------------|--------|
| Ease of deployment | Simple | Complex | WA Widget |
| Search descriptions | No | Yes | ClubCalendar |
| My Registered highlighting | No | Yes | ClubCalendar |
| Availability info | No | Yes | ClubCalendar |
| External server needed | No | Yes | WA Widget |
| Works on non-WA sites | No | Yes | ClubCalendar |
| Fallback capability | N/A | Yes | ClubCalendar |
| Year view | Yes | No | WA Widget |
| Quick filters (Weekend, etc.) | No | Yes | ClubCalendar |
| Filter UI | Good | Good | Tie |
| Visual badges | Good | Good | Tie |

---

## Conclusion

Both solutions are well-built for their respective architectures. Jeff's WA Widget provides solid filtering and visual enhancements within the constraints of the WA DOM. ClubCalendar offers more features (description search, My Registered, availability) by using an external data source.

The choice depends on:

1. **Deployment complexity tolerance** - WA Widget is simpler
2. **Feature requirements** - ClubCalendar has more features
3. **External dependency acceptance** - WA Widget has none
4. **Non-WA site needs** - Only ClubCalendar works outside WA

---

*Comparison document created January 5, 2026*
