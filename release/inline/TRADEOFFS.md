# WA Calendar vs ClubCalendar: Tradeoff Analysis

## Executive Summary

ClubCalendar provides significantly better member experience for finding events. The inline version runs entirely within Wild Apricot with no external dependencies.

## The Core Problem

Organizations with many events (50-200+ per month) across multiple committees need members to:

- Find events they can actually attend (not sold out)
- Find events that fit their budget
- Find events that match their interests and schedule

**The WA Calendar shows events. ClubCalendar helps members find the right events.**

## Comparison Matrix

| Dimension | WA Calendar | ClubCalendar |
|-----------|-------------|--------------|
| Member Experience | Basic browsing | Smart filtering and search |
| Maintenance Burden | Zero | Very Low (single HTML file) |
| External Dependencies | None | FullCalendar CDN only |
| Reliability | Guaranteed | High (graceful error handling) |

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

### 2. Maintenance Burden

**WA Calendar:**
- Zero maintenance
- Updates handled by Wild Apricot

**ClubCalendar Inline:**
- Single HTML file (no build process)
- No external server to maintain
- No sync jobs to monitor
- Only updates needed: occasional FullCalendar version bumps

**Winner:** WA Calendar, but ClubCalendar inline burden is minimal

### 3. Technical Architecture

**WA Calendar:**
- Fully managed by Wild Apricot
- No customization possible

**ClubCalendar Inline:**
- Runs 100% within Wild Apricot page
- Uses WA's internal API for event data
- FullCalendar library loaded from public CDN
- No external servers involved
- Event data never leaves Wild Apricot

### 4. Reliability

**WA Calendar:**
- Always works (vendor supported)

**ClubCalendar Inline:**
- Depends on: WA being up (same as WA Calendar)
- Depends on: FullCalendar CDN (99.9%+ uptime)
- Graceful error handling shows message if issues occur

**Winner:** Tie for practical purposes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WA API changes | Low | Medium | Widget uses stable WA APIs |
| FullCalendar CDN down | Very Low | Medium | Could self-host if needed |
| JavaScript error | Low | Low | Error handling shows message |

## Decision Framework

### Choose WA Calendar Only If:

- You have fewer than 30 events per month
- Members don't struggle to find events
- Zero tolerance for any custom code

### Choose ClubCalendar Inline If:

- You have many events (50+/month)
- Members need better filtering and search
- You want improved experience with minimal maintenance

## Summary

The inline version of ClubCalendar provides significant member experience improvements with minimal maintenance overhead. Since it runs entirely within Wild Apricot and has no external server dependencies, the risk profile is very low.

For organizations with many events across multiple committees, the filtering and search capabilities make it much easier for members to find relevant events.
