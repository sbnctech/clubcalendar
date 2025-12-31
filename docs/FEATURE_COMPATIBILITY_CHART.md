# ClubCalendar Feature Compatibility Chart

**Version:** 1.01
**Date:** December 31, 2025

This document compares feature availability between ClubCalendar's two deployment modes.

---

## Terminology

| Term | Description |
|------|-------------|
| **WA Native Mode** | Single server - widget runs entirely on WA page, fetches directly from WA API |
| **External Server Mode** | Dual server - sync job on server generates JSON, widget loads JSON |

---

## Core Features

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **Calendar Views** | | | |
| Month view | Yes | Yes | |
| Week view | Yes | Yes | |
| List view | Yes | Yes | |
| Year view | Yes | Yes | |
| **Navigation** | | | |
| Previous/Next month | Yes | Yes | |
| Today button | Yes | Yes | |
| Date picker | Yes | Yes | |

---

## Filtering Features

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **Quick Filters** | | | |
| Weekend | Yes | Yes | |
| Has Openings | Yes | Yes | |
| After Hours | Yes | Yes | |
| Free | Yes | Yes | |
| Public | Yes | Yes | |
| **Dropdown Filters** | | | |
| Committee | Yes | Yes | |
| Activity Type | Yes | Yes | |
| Price Range | Yes | Yes | |
| Event Type | Yes | Yes | |
| Recurring | Yes | Yes | |
| Venue | Yes | Yes | |
| Tags | Yes | Yes | |
| **Other Filters** | | | |
| Text search | Yes | Yes | |
| Date range | Yes | Yes | |
| Filter persistence | Yes | Yes | localStorage |

---

## Event Display Features

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **Availability Indicators** | | | |
| Spots available count | Yes | Yes | |
| "Sold Out" badge | Yes | Yes | |
| "X spots left" badge | Yes | Yes | |
| Waitlist count | Yes | No | Requires per-event API call |
| **Registration Status** | | | |
| "Coming Soon" badge | Yes | Yes | |
| "Opens in X days" | Yes | Yes | |
| **Pricing** | | | |
| Price indicator ($, $$, $$$) | Yes | Yes | |
| "Free" badge | Yes | Yes | |
| **Other Display** | | | |
| Color coding (time of day) | Yes | Yes | |
| Event tags | Yes | Yes | |
| Location display | Yes | Yes | |
| Event description | Yes | Yes | |

---

## My Events Features

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **My Events Tab** | Yes | Yes | Different UX |
| Auto-detect logged-in user | Yes | No | WA Native uses session |
| Email lookup required | No | Yes | External requires email input |
| **Registration Display** | | | |
| "Registered" badge on events | Yes (Auto) | Yes (After lookup) | |
| "Waitlist" badge on events | Yes (Auto) | Yes (After lookup) | |
| "Attended" badge (past) | Yes (Auto) | Yes (After lookup) | |
| **My Events Sections** | | | |
| Registered events list | Yes | Yes | |
| Waitlist events list | Yes | Yes | |
| Past events list | Yes | Yes | |

---

## Data & Performance

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **Data Freshness** | | | |
| Real-time event data | Yes | No | External has 15-min delay |
| Real-time availability | Yes | No | External has 15-min delay |
| Real-time registration status | Yes | No | External has 15-min delay |
| **Performance** | | | |
| Fast initial load | No | Yes | External pre-fetches JSON |
| No API calls on page load | No | Yes | External loads static JSON |
| Offline-friendly | No | Partial | JSON can be cached |
| **Auto-refresh** | | | |
| Refresh on tab focus | Yes | Yes | Both support |
| Configurable refresh interval | Yes | Yes | Both support |

---

## Audience & Access

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **Visitor Types** | | | |
| Logged-in members | Yes | Yes | |
| Anonymous visitors | No | Yes | WA Native requires login |
| Public event access | No | Yes | |
| **Authentication** | | | |
| WA session cookie | Required | Not needed | |
| Works without login | No | Yes | |

---

## Failover & Reliability

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **Failover Behavior** | | | |
| Automatic failover | Partial | Yes | |
| Falls back to WA widget | No | Yes | External has WA widget fallback |
| Error message display | Yes | Yes | |
| Link to WA events page | Yes | Yes | |
| **Error Scenarios** | | | |
| API unavailable | Shows error | Falls back to WA | |
| User not logged in | Shows error | Works normally | |
| JSON unavailable | N/A | Falls back to WA | |

---

## Configuration & Theming

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **All config options** | Yes | Yes | Same options available |
| Auto-tag rules | Yes (Client-side) | Yes (Server-side) | |
| Title parsing | Yes | Yes | |
| Custom CSS | Yes | Yes | |
| Theme presets | Yes | Yes | |
| Color customization | Yes | Yes | |

---

## Maintenance & Dependencies

| Feature | WA Native | External Server | Notes |
|---------|:---------:|:---------------:|-------|
| **Dependencies** | | | |
| External server | None | Required | |
| Sync job | None | Required | |
| Cron/scheduler | None | Required | |
| API credentials in server | None | Required | |
| **Maintenance** | | | |
| Server monitoring | None | Required | |
| Sync job logs | None | Required | |
| JSON file hosting | None | Required | |

---

## Summary: When to Use Each Mode

| Scenario | Recommended Mode | Reason |
|----------|------------------|--------|
| Member-only pages | **WA Native** | Simpler, real-time, no server needed |
| Public-facing pages | **External Server** | Works for anonymous visitors |
| Real-time availability critical | **WA Native** | No sync delay |
| Minimal maintenance desired | **WA Native** | No server to maintain |
| Mixed audience (public + members) | **External Server** | Supports both |
| Waitlist count needed | **WA Native** | Can fetch dynamically |
| Fastest page load | **External Server** | Pre-fetched JSON |
| Automatic failover needed | **External Server** | Has WA widget fallback |

---

## Feature Parity Score

| Category | WA Native | External Server |
|----------|-----------|-----------------|
| Filtering | 100% | 100% |
| Event Display | 100% | 95% (no waitlist count) |
| My Events | 100% (auto) | 90% (requires email) |
| Audience Reach | 50% (members only) | 100% (everyone) |
| Data Freshness | 100% (real-time) | 85% (15-min delay) |
| Reliability/Failover | 70% | 100% |
| Maintenance Burden | 0% (none) | 40% (server needed) |

---

## SBNC Build vs Generic Build

In addition to the deployment mode differences above, ClubCalendar offers pre-configured builds:

| Aspect | SBNC Build | Generic Build |
|--------|------------|---------------|
| **Location** | `deploy/ClubCalendar_SBNC_EVENTS_PAGE.html` | `widget/clubcalendar-wa-inline.html` |
| **WA Account ID** | Pre-configured (`176353`) | Must configure |
| **Header Title** | "SBNC Events" | "Club Events" |
| **Auto-Tag Rules** | 18 SBNC committees | Examples only |
| **Ready to Use** | Yes - copy and paste | Requires customization |

See `deploy/ClubCalendar_SBNC_INSTALLATION.md` for SBNC-specific installation instructions.

---

*Document maintained by Ed Forman with AI assistance*
