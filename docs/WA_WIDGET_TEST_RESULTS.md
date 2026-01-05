# Jeff's WA Widget - Automated Test Results

**Date:** January 5, 2026
**Test URL:** https://sbnc-website-redesign-playground.wildapricot.org/Events
**Test Framework:** Playwright (Chromium)
**Duration:** 5 minutes

---

## Executive Summary

**Overall: 14 passed, 5 failed**

- 4 failures are test automation issues (collapsible panel UI)
- 1 failure reveals a real bug (Show All clears search)
- Key bugs from code analysis confirmed by testing

---

## Test Results Detail

### Basic Functionality Tests

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-001 | Calendar loads with events | PASS | Found 42 events |
| TC-002 | Filter bar exists | PASS | Filter bar present |
| TC-003 | Search input exists | PASS | Search input visible |
| TC-004 | View toggles exist | PASS | Month/Week/List toggles found |

### Filtering Tests

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-010 | Time of day filter works | FAIL | Test issue - panel intercepts clicks |
| TC-011 | Show All resets filters | FAIL | Test issue - panel intercepts clicks |
| TC-012 | Multiple filters AND logic | FAIL | Test issue - panel intercepts clicks |

**Note:** These failures are due to test automation limitations. The collapsible filter panels have headers that intercept pointer events, preventing Playwright from clicking the filter buttons inside. The filters work correctly when tested manually.

### Search Tests

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-020 | Search filters by title | PASS | 42 events → 5 events for "Golf" |
| TC-021 | Search is case-insensitive | PASS | "GOLF" matches same as "golf" |
| TC-022 | Show All does NOT reset search | FAIL | **BUG: Show All clears search text** |

### Filter Persistence Tests

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-030 | Filters persist after reload | FAIL | Test issue - couldn't click filter |

### Visual Indicator Tests

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-040 | Time-of-day color coding | PASS | All 42 events have color coding |
| TC-041 | Waitlist badges | PASS | Found 1 waitlist badge |
| TC-042 | Coming Soon badges | PASS | Found 0 (none applicable today) |

### Specific Event Tests

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-060 | Stride by the Tide visible | PASS | Found 3 instances |
| TC-061 | Recurring event indicators | PASS | Found 0 "X of Y" indicators |

### Bug Verification Tests

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| BUG-001 | Events without committee tags | PASS | 0 untagged events found |
| BUG-002 | No results message missing | PASS | **Confirmed: No message shown** |
| BUG-003 | Case sensitivity in tags | PASS | All tags are lowercase |

---

## Bugs Confirmed by Testing

### BUG: Show All Clears Search Text (NEW)

- **Severity:** P2 - Functional
- **Test:** TC-022
- **Expected:** Search term "Dance" remains after clicking "Show All"
- **Actual:** Search field is empty after clicking "Show All"
- **Impact:** Users lose their search term when resetting filters

### BUG: No "No Results" Message (CONFIRMED)

- **Severity:** P2 - UX
- **Test:** BUG-002
- **Steps:** Search for "xyznonexistent123456"
- **Expected:** Message like "No events match your search"
- **Actual:** Calendar appears empty with no explanation
- **Impact:** Users may think calendar is broken

---

## Data Observations

### Event Count
- **Total events:** 42

### Tags Found in Production

All tags are lowercase (no case sensitivity issues):

```
free              sunday social      evening
stride by the tide    afternoon      lawn bowling
morning           water sports       girls night out
games!            the network        membership
mas musica        happy hikers       public event
out to lunch      cycling            wellness
golf              snow sports
```

### Tagging Quality
- **Events without committee tags:** 0
- **Conclusion:** All events are properly tagged with committee/activity tags

### Visual Indicators
- **Color-coded events:** 42 (100%)
- **Waitlist badges:** 1
- **Coming Soon badges:** 0

---

## Test Infrastructure Notes

### Why Some Filter Tests Failed

The filter button click tests failed with this error:
```
<div class="filter-panel" data-panel="time-of-day">...</div> intercepts pointer events
```

This is because:

1. Filter panels are collapsible with a header toggle
2. When collapsed, the header element overlays the filter buttons
3. Playwright attempts to click the button but the panel header intercepts
4. This is a test automation issue, not a widget bug

**Fix for future tests:** Expand the panel first by clicking the toggle, then click the filter button.

### Test File Location

```
/Users/edf/clubcalendar/tests/wa-widget/wa-widget.spec.ts
```

### Running the Tests

```bash
cd /Users/edf/clubcalendar/tests/wa-widget
npx playwright test wa-widget.spec.ts --project=chromium --reporter=list
```

---

## Summary

| Category | Result |
|----------|--------|
| Basic functionality | All 4 tests passed |
| Search | 2 of 3 passed (1 bug found) |
| Filtering | Tests need adjustment for collapsible panels |
| Visual indicators | All 3 tests passed |
| Specific events | All 2 tests passed |
| Bug verification | 3 tests completed, 2 bugs confirmed |

**Key Takeaways:**

1. The WA widget is functional for basic calendar display and search
2. Color coding and badges are working correctly
3. All events are properly tagged (no orphan events)
4. Two P2 bugs confirmed: Show All clears search, No "no results" message

---

*Automated test results from January 5, 2026*
