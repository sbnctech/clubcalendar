# Jeff's WA Widget - Test Cases & Code Analysis

**Date:** January 5, 2026
**Source:** https://sbnc-website-redesign-playground.wildapricot.org/Events

---

## Code Review Findings

### Bug 1: Untagged Events Hidden (CONFIRMED)

**Location:** `filterEvents()` function

**Code:**
```javascript
if (!tags) {
  passesTagFilter = false;
}
```

**Issue:** Events without `data-tags` attribute fail ALL filters when any filter is active.

**Test Case:**
1. Find an event without tags
2. Select any filter (e.g., "Morning")
3. Observe: Untagged event disappears even though it's not related to the filter

**Severity:** P1 - Critical

---

### Bug 2: Year Boundary Bug in "Coming Soon" Badge

**Location:** `addMonthViewBadges()` function

**Code:**
```javascript
let regDate = new Date(`${regMonthStr} ${regDay}, ${eventYear}`);
// ...
if (regDate > eventDate) {
  regDate.setFullYear(eventYear - 1);
}
```

**Issue:** If registration opens in January for a December event, logic may incorrectly adjust the year.

**Test Case:**
1. Create event in December 2026
2. Set registration opens January 5, 2027
3. View in December 2026 - badge may calculate incorrectly

**Severity:** P3 - Edge case

---

### Bug 3: Timezone Not Handled in Date Comparisons

**Location:** Multiple date comparisons

**Code:**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);
```

**Issue:** Uses local timezone. Users in different timezones may see inconsistent "Coming Soon" badges.

**Test Case:**
1. Set computer timezone to Hawaii (UTC-10)
2. Check "Coming Soon" badge for event with registration opening today PST
3. Badge may show incorrectly

**Severity:** P3 - Minor

---

### Bug 4: Case Sensitivity Inconsistency

**Location:** `filterEvents()` function

**Code:**
```javascript
const eventTypeFilters = selectedTags.filter(t =>
  t === 'public' || t === 'public event' || t === 'free'
);
// ...
if (filterTag === 'public') {
  return tags && (tags.includes('public') || tags.includes('public event'));
}
```

**Issue:** Filter checks are case-sensitive. If WA returns "Public" or "FREE", filter won't match.

**Test Case:**
1. Check `data-tags` attribute for actual case used
2. Apply "Public" filter
3. Verify events with "public" vs "Public" tags

**Severity:** P2 - Functional

---

### Bug 5: HTML Entity Decoding May Fail

**Location:** `decodeHTMLEntities()` (referenced but not shown)

**Issue:** Simple textarea approach may fail for complex or nested entities.

**Test Case:**
1. Create event with title containing `&amp;amp;` (double-encoded)
2. Check if title displays correctly

**Severity:** P3 - Minor

---

### Bug 6: No "No Results" Message

**Location:** `filterEvents()` / `updateVisibleCount()`

**Issue:** When all events are filtered out, user sees empty calendar with no explanation.

**Test Case:**
1. Select "Morning" filter
2. Select "Evening" filter (contradictory)
3. Observe: Calendar empty, only shows "0 of X" - no message

**Severity:** P2 - UX

---

### Bug 7: Parent Span Hiding May Break Layout

**Location:** `filterEvents()` card filtering

**Code:**
```javascript
if (parentSpan && parentSpan.tagName === 'SPAN') {
  parentSpan.style.display = 'none';
}
```

**Issue:** Hiding parent span may affect layout of other sibling elements.

**Test Case:**
1. Apply filter in Week view
2. Check for layout shifts or spacing issues
3. Verify hidden events don't leave gaps

**Severity:** P3 - Visual

---

## Functional Test Cases

### TC-001: Filter Persistence

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Morning" filter | Morning events shown |
| 2 | Refresh page | "Morning" filter still active |
| 3 | Clear localStorage | Filter resets to "Show All" |

### TC-002: Search + Filter Combination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "Pickleball" in search | Only Pickleball events shown |
| 2 | Select "Morning" filter | Only morning Pickleball events shown |
| 3 | Click "Show All" | Search remains, all Pickleball shown |

### TC-003: Multi-Category Filter Logic

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Happy Hikers" (committee) | Only hiking events |
| 2 | Also select "Games!" (committee) | Hiking AND Games events (OR) |
| 3 | Also select "Morning" (time) | Only morning hiking/games (AND) |

### TC-004: View Toggle with Filters

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Free" filter in Month view | Free events shown |
| 2 | Switch to Week view | Filter still applied |
| 3 | Switch to List view | Filter still applied |
| 4 | Switch to Year view | Filter still applied |

### TC-005: Waitlist Badge Display

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find event with waitlist | Red "Waitlist" badge visible |
| 2 | Badge has diagonal stripe pattern | Visual indicator clear |
| 3 | Click event | Navigates to event page |

### TC-006: Coming Soon Badge

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find event with future registration | Green "Coming Soon!" badge |
| 2 | After registration opens | Badge disappears |
| 3 | Badge positioning correct | Doesn't overlap content |

### TC-007: Time-of-Day Color Coding

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check morning event (before noon) | Orange background (#fc8508) |
| 2 | Check afternoon event (12-5pm) | Blue background (#3692f3) |
| 3 | Check evening event (after 5pm) | Purple background (#4a54b2), white text |

### TC-008: Recurring Event Display

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find recurring event (e.g., "Golf: Learn to play") | Shows "1 of 3", "2 of 3" etc. |
| 2 | Each instance clickable | Navigates to correct session |
| 3 | All instances show in Month view | Multiple calendar entries |

### TC-009: Search Clear Button

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type in search box | X appears on right |
| 2 | Click X | Search cleared |
| 3 | "Show All" NOT clicked | Filters remain |

### TC-010: Mobile Responsive

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View at <768px width | Filters stack vertically |
| 2 | Collapsible panels work | Can expand/collapse |
| 3 | Events still clickable | Navigation works |

---

## Edge Case Tests

### EC-001: Empty Tag Events

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find event with no `data-tags` | Event visible by default |
| 2 | Apply any filter | **BUG: Event hidden** |
| 3 | Click "Show All" | Event visible again |

### EC-002: Special Characters in Search

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search for "Games!" (with !) | Matches "Games!: Pickleball" |
| 2 | Search for "Wine & Cheese" | Matches correctly |
| 3 | Search for quotes: `"dinner"` | Handles gracefully |

### EC-003: Very Long Event Titles

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find event with long title | Title truncates properly |
| 2 | Hover shows full title | Tooltip works |
| 3 | In card view | No overflow issues |

### EC-004: Incognito/Private Mode

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open in incognito | Calendar loads |
| 2 | Select filter | Works for session |
| 3 | Console shows error | localStorage fail logged |

---

## Performance Tests

### PT-001: Initial Load Time

- Measure time from page load to calendar fully rendered
- Expected: <3 seconds
- Note: Depends on WA server response

### PT-002: Filter Response Time

- Measure time from filter click to events re-rendered
- Expected: <100ms
- Test with 50+ events

### PT-003: Search Debounce

- Type quickly in search box
- Expected: No lag or UI freeze
- Verify filtering happens smoothly

---

## Summary of Issues Found

| ID | Issue | Priority | Type |
|----|-------|----------|------|
| BUG-001 | Untagged events hidden by filters | P1 | Logic |
| BUG-002 | Year boundary in Coming Soon calc | P3 | Edge case |
| BUG-003 | Timezone not handled | P3 | Edge case |
| BUG-004 | Case sensitivity in tag matching | P2 | Logic |
| BUG-005 | HTML entity double-encoding | P3 | Display |
| BUG-006 | No "no results" message | P2 | UX |
| BUG-007 | Parent span hiding layout | P3 | Visual |

---

*Test cases created January 5, 2026*
