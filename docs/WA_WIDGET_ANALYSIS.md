# Jeff's Enhanced WA Widget - QA Analysis

**Date:** January 5, 2026
**Test URL:** https://sbnc-website-redesign-playground.wildapricot.org/Events
**Purpose:** Thorough QA evaluation of Jeff's enhanced WA calendar widget

---

## Overview

Jeff has built a JavaScript enhancement layer on top of the native Wild Apricot calendar. This document analyzes what works, what doesn't, and what issues exist.

---

## What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| Month/Week/Year/List views | Working | All view toggles functional |
| Committee filter panel | Working | Collapsible with badge counts |
| Event Type filter | Working | Public Events, Free |
| Time of Day filter | Working | Morning, Afternoon, Evening |
| Text search | Working | Real-time filtering, case-insensitive |
| Time-of-day color coding | Working | Orange/Blue/Purple |
| Waitlist badge | Working | Red badge on waitlisted events |
| Coming Soon badge | Working | Green badge for future registration |
| Recurring event indicator | Working | Shows "1 of 3", "2 of 3" notation |
| Filter persistence | Working | Saves to localStorage |
| Mobile responsive | Working | Stacks filters vertically <768px |
| "Stride by the Tide" | **Present** | Shows correctly on multiple dates |

---

## Issues Found (from Code Analysis)

### P1 - Critical

#### Events Without Committee Tags Get Hidden

**What happens:** When a user selects ANY committee filter (e.g., "Happy Hikers"), events that don't have a committee tag assigned are completely hidden from view - even though the user didn't explicitly filter them out.

**Root cause:** The filter logic checks `if (!tags) { passesTagFilter = false; }`. This means an event with only time-of-day tags (like `data-tags="morning"`) but no committee tag will fail the committee filter check.

**Example scenario:**
1. User clicks "Happy Hikers" filter
2. Expected: Show only Happy Hikers events
3. Actual: Hides ALL events that don't have ANY committee tag, not just non-hiking events

**Impact:** Users may miss important events (like club-wide events or newly added events) that haven't been tagged with a specific committee.

**Fix:** Change filter logic to pass events through committee filter if they have no committee tag (treat untagged events as "all committees").

---

### P2 - Functional Issues

#### No "No Results" Message

**What happens:** When a user's filter/search combination results in zero matching events, the calendar simply appears empty. There's a small "Showing 0 of X events" counter, but no prominent message explaining why no events are visible.

**Example scenario:**
1. User searches for "xyznonexistent"
2. Zero events match
3. Calendar shows blank - user might think calendar is broken

**Impact:** Confusing user experience. Users don't know if their filters are too restrictive or if there's a bug.

**Fix:** Add a visible "No events match your filters" message when event count reaches zero.

---

#### Case Sensitivity in Tag Matching

**What happens:** The filter code checks for exact lowercase strings like `'public'` and `'free'`. If Wild Apricot returns tags with different capitalization (e.g., `'Public'` or `'FREE'`), the filter won't match.

**Code example:**
```javascript
const eventTypeFilters = selectedTags.filter(t =>
  t === 'public' || t === 'free'  // lowercase only
);
```

**Impact:** Events may not appear under the correct filter if WA's tag case doesn't match exactly.

**Fix:** Use case-insensitive comparison: `t.toLowerCase() === 'public'`

---

#### localStorage Fails Silently in Incognito

**What happens:** Filter persistence relies on localStorage. In private/incognito browsing mode, localStorage may be blocked or cleared, causing filters to reset unexpectedly.

**Current behavior:** Error is caught and logged to console, but user gets no feedback.

**Impact:** Minor - affects privacy-focused users. Filters work during session but don't persist.

**Fix:** Could add visual indicator when persistence is unavailable.

---

#### Registration Opens Date Hidden But Drives Badge

**What happens:** The code removes "(Registration Opens Jan 6)" text from event titles to clean up display, but this same date still drives the green "Coming Soon!" badge logic.

**User experience:** User sees "Coming Soon!" badge but can't see WHEN registration actually opens because that text was stripped.

**Impact:** Confusing - users don't know when to check back for registration.

**Fix:** Either keep the registration date visible, or add it to the badge tooltip.

---

### P3 - Minor/Edge Cases

#### Year Boundary in Coming Soon Calculation

**What happens:** The Coming Soon badge calculates registration open dates by parsing month/day and assuming current year. Edge case: if registration opens in January for a December event (next year), the logic may miscalculate.

**Code:**
```javascript
let regDate = new Date(`${regMonthStr} ${regDay}, ${eventYear}`);
if (regDate > eventDate) {
  regDate.setFullYear(eventYear - 1);  // Adjustment attempt
}
```

**Impact:** Rare - only affects events spanning year boundaries.

---

#### Timezone Not Handled in Date Comparisons

**What happens:** All date comparisons use `new Date()` which uses the user's local timezone. The "Coming Soon" badge may show incorrectly for users in different timezones.

**Impact:** Minor - may cause badge to appear/disappear at wrong time for users not in Pacific timezone.

---

#### Parent Span Hiding May Affect Layout

**What happens:** When filtering events, the code hides both the event link AND its parent `<span>` container. This could potentially affect the layout of sibling elements.

**Impact:** Needs visual verification - may cause spacing issues in some views.

---

#### HTML Entity Double-Encoding

**What happens:** The code uses a textarea-based HTML entity decoder. If WA returns double-encoded entities like `&amp;amp;` (which becomes `&amp;` after one decode), display may be incorrect.

**Impact:** Edge case - only affects events with unusual character encoding.

---

### Needs Verification (Manual Testing)

| Issue | How to Test |
|-------|-------------|
| View My Events link | Log in and click "View My Events" - does it navigate correctly? |
| Card click in all views | Click events in Month, Week, Year, List views - do all navigate to event page? |
| Mobile layout | Resize browser to <768px or test on phone - do filters stack correctly? |
| Actual untagged events | Open DevTools, inspect event elements, find any with only time-of-day tags |

---

## Features NOT Present (Limitations)

| Feature | Status | Notes |
|---------|--------|-------|
| "My Registered" highlighting | **Not present** | Can't see at a glance which events you're signed up for on the calendar itself |
| Search by description | **Not possible** | WA widget doesn't retrieve description text from API |
| "Has Openings" filter | **Not present** | Can't filter to show only events with available spots |
| "Weekend" quick filter | **Not present** | No one-click filter for weekend events |
| "After Hours" quick filter | **Not present** | No one-click filter for evening/weekend events |

---

## Technical Notes

### Data Source
- Events pulled from WA's native calendar DOM
- Metadata extracted from `href`, `title`, and `data-tags` attributes
- No external server or database

### Filter Logic
- OR within categories (selecting multiple committees shows events from any)
- AND between categories (must match at least one from each active category)

### Persistence
- Filter state: `localStorage.setItem('sbnc_calendar_filters', ...)`
- Search term: `localStorage.setItem('sbnc_calendar_search', ...)`

## Summary

Jeff's WA Widget is a solid enhancement over the native WA calendar, adding filtering, search, and visual indicators.

**Key strengths:**
- Recurring events (like "Stride by the Tide") display correctly
- Committee/Time/Type filtering works well
- Text search functional
- Good visual indicators (badges, colors)

**Key limitations:**
1. No "My Registered" highlighting on calendar
2. No "Weekend" / "After Hours" / "Has Openings" filters
3. Can't search descriptions (WA API limitation)
4. Untagged events may be hidden when filters active

---

*QA Analysis performed January 5, 2026*
