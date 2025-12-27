# WA Calendar vs ClubCalendar: Tradeoff Analysis & Strategy

## Executive Summary

ClubCalendar provides significantly better member experience for finding events, but requires custom code maintenance. The recommended strategy is a **hybrid deployment** with automatic fallback—members get the rich experience when it works, and seamlessly fall back to the standard WA calendar if it doesn't.

---

## The Core Problem

SBNC has **150+ events per month** across 30+ committees. Members need to:

- Find events they can actually attend (not sold out)
- Find events that fit their budget
- Find events that match their interests and schedule

**The WA Calendar shows events. ClubCalendar helps members find the right events.**

---

## Comparison Matrix

| Dimension | WA Calendar | ClubCalendar |
|-----------|-------------|--------------|
| **Member Experience** | Basic browsing | Smart filtering & search |
| **Maintenance Burden** | Zero | Low (single file, no dependencies) |
| **Event Creator Work** | Standard WA entry | Same + title conventions |
| **Configurability** | Limited | Extensive |
| **Reliability** | Guaranteed | High (with fallback) |

---

## Detailed Analysis

### 1. Member Experience

**WA Calendar:**
- Shows events on a calendar
- Click each event to see details, price, availability
- Filter by tags only
- My Events on separate page

**ClubCalendar:**
- At-a-glance availability ("5 spots left", "Sold Out")
- At-a-glance pricing ($, $$, $$$)
- Quick filters: Weekend, Has Openings, After Hours
- Dropdown filters: Committee, Activity, Price, Event Type
- Full-text search
- Integrated My Events tab
- Saved preferences

**Winner:** ClubCalendar (significantly better for discovery)

---

### 2. Maintenance Burden

**WA Calendar:**
- Zero maintenance
- Updates handled by Wild Apricot
- Always works

**ClubCalendar:**
- Single HTML file (~2,400 lines)
- No build process or external dependencies
- 617 unit tests for confidence
- Potential issues:
  - WA API changes (rare)
  - FullCalendar CDN issues (rare)
  - Browser compatibility (tested)

**Winner:** WA Calendar (but ClubCalendar burden is low)

---

### 3. Event Creator Workload

**WA Calendar:**
- Standard WA event entry
- No special formatting required

**ClubCalendar:**
- Same WA event entry, plus:
- Use "Committee: Event Title" format for best filtering
- Example: `Happy Hikers: Morning Walk at Douglas Preserve`

**Note:** SBNC already uses this format, so no additional work required.

**Winner:** Tie for SBNC (format already in use)

---

### 4. Configurability

**WA Calendar:**
- Section title, margins, week start day
- Show/hide past events
- Tag checkboxes

**ClubCalendar:**
- Every filter can be enabled/disabled
- Different configs for members vs public
- Custom colors, title parsing options
- Fallback configuration

**Winner:** ClubCalendar

---

### 5. Reliability

**WA Calendar:**
- Always works (vendor supported)
- No failure modes

**ClubCalendar (with fallback):**
- Works reliably in normal conditions
- On any error, automatically shows WA Calendar
- Members never see a broken page

**Winner:** Tie (with fallback strategy)

---

## Recommended Strategy: Hybrid Deployment

### The Approach

Deploy **both calendars** on the same page, with ClubCalendar as primary and WA Calendar as automatic fallback.

```
┌─────────────────────────────────────────────────────┐
│                    Normal Operation                  │
│  ┌───────────────────────────────────────────────┐  │
│  │              ClubCalendar                      │  │
│  │  • Rich filtering and search                   │  │
│  │  • Availability and pricing badges             │  │
│  │  • Integrated My Events                        │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │     WA Calendar (hidden, but initialized)      │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    If Error Occurs                   │
│  ┌───────────────────────────────────────────────┐  │
│  │          ClubCalendar (hidden)                 │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              WA Calendar                       │  │
│  │  • Automatically revealed                      │  │
│  │  • Already initialized (instant)              │  │
│  │  • Full functionality                          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Why This Works

| Benefit | Explanation |
|---------|-------------|
| **Best of both worlds** | Rich experience when possible, reliable fallback always |
| **No broken pages** | Members always see a working calendar |
| **Instant fallback** | WA Calendar pre-initialized, no loading delay |
| **Low risk** | Can always revert to WA-only if needed |
| **Gradual confidence** | Monitor error rates, tune over time |

### Implementation Steps

**Step 1: Set up the page structure**
```html
<!-- Primary: ClubCalendar -->
<div id="clubcalendar"></div>
[Paste ClubCalendar widget code]

<!-- Fallback: WA Calendar (hidden) -->
<div id="wa-fallback" style="display:none;">
    [Drag WA Event Calendar gadget here]
</div>
```

**Step 2: Configure ClubCalendar**
```javascript
window.CLUBCALENDAR_CONFIG = {
    fallbackContainerId: 'wa-fallback',
    fallbackEventsUrl: '/events',
    // ... other config
};
```

**Step 3: Test the fallback**
- Open browser console
- Run: `throw new Error('test')`
- Verify WA Calendar appears

**Step 4: Monitor and maintain**
- Check browser console periodically for errors
- Update FullCalendar version annually
- Watch for WA API changes in release notes

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WA API changes | Low | High | Automatic fallback to WA Calendar |
| FullCalendar CDN down | Very Low | High | Automatic fallback to WA Calendar |
| JavaScript error | Low | Medium | Automatic fallback to WA Calendar |
| Maintainer unavailable | Medium | Medium | Code is simple, documented, tested |
| Members confused by two calendars | Very Low | Low | Only one visible at a time |

---

## Decision Framework

### Choose WA Calendar Only If:

- You have fewer than 30 events per month
- Members don't struggle to find events
- No one can maintain any custom code
- Minimizing any technical risk is the absolute priority

### Choose Hybrid (Recommended) If:

- You have many events (50+/month)
- Members need better filtering and search
- You want the best experience with a safety net
- Someone can do occasional maintenance (a few hours/year)

### Choose ClubCalendar Only If:

- You're confident in ongoing maintenance
- You want the richest possible experience
- You're comfortable with some risk of broken pages

---

## Summary

**Recommendation: Hybrid Deployment with Automatic Fallback**

This gives SBNC members:

- **Rich discovery experience** for finding events among 150+ options
- **Automatic safety net** if anything goes wrong
- **Zero broken pages** - always a working calendar
- **Low maintenance burden** - simple code, comprehensive tests

The hybrid approach eliminates the primary concern with custom code (what if it breaks?) while delivering the full member experience improvement.
