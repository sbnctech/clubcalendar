# SBNC ClubCalendar Installation Guide

**Version:** 1.02
**Date:** January 1, 2026

This document is the canonical reference for embedding ClubCalendar in Wild Apricot.

---

> **DEPLOYMENT OPTIONS**
>
> - **WA-Only Mode:** Runs entirely within Wild Apricot, no external server
> - **External Server Mode:** Fetches events.json from sync server, supports public calendars
>
> Use the pre-built file: `deploy/ClubCalendar_SBNC_EVENTS_PAGE.html`

---

## Embed Contract

| Property | Value |
|----------|-------|
| **SBNC Events Page** | `deploy/ClubCalendar_SBNC_EVENTS_PAGE.html` |
| **SBNC Config Page** | `deploy/ClubCalendar_SBNC_CONFIG_PAGE.html` |
| **Generic Template** | `widget/clubcalendar-wa-inline.html` |
| **Builder Tool** | `deploy/builder/index.html` |
| **DOM Mount Point** | `<div id="clubcalendar"></div>` |
| **Config Mechanism** | `window.CLUBCALENDAR_CONFIG` (inline object) |
| **External Dependencies** | FullCalendar (CDN), with fallback on failure |
| **Authentication** | WA session cookie (auto-detected) |
| **SBNC Account ID** | `176353` (pre-configured) |

---

## Configuration Contract

The widget reads configuration from `window.CLUBCALENDAR_CONFIG` before the main script executes.

**NOT supported:**
- `window.CLUBCALENDAR_CONFIG_URL` (URL-based config)
- Query string parameters
- Data attributes on the container element

**Required structure:**

```javascript
window.CLUBCALENDAR_CONFIG = {
    // Optional - Auto-detected from WA page context
    waAccountId: '176353',           // SBNC account ID

    // Display options
    headerTitle: 'SBNC Events',
    showMyEvents: true,
    showFilters: true,
    defaultView: 'dayGridMonth',     // 'dayGridMonth' | 'timeGridWeek' | 'listMonth'

    // Theming
    primaryColor: '#2c5aa0',
    accentColor: '#d4a800',

    // Auto-tagging rules (customize for your club)
    autoTagRules: [
        { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
        { type: 'name-prefix', pattern: 'Games!:', tag: 'committee:games' },
        // ... additional rules
    ]
};
```

---

## SBNC Pre-Built Files

**Use this file:** `deploy/ClubCalendar_SBNC_EVENTS_PAGE.html`

This file contains the complete, ready-to-paste widget with:

- SBNC branding ("SBNC Events" header)
- SBNC Account ID pre-configured (`176353`)
- All SBNC activity committee auto-tagging rules
- Full widget code including CSS and JavaScript
- Add to Calendar icons (Google, Outlook, Yahoo, Apple)
- Automatic fallback to WA widget on error

**To install:**

1. Open `deploy/ClubCalendar_SBNC_EVENTS_PAGE.html` in a text editor
2. Select All (Cmd+A) and Copy (Cmd+C)
3. Paste into a Wild Apricot Custom HTML gadget
4. Save and view the page

---

## Installation Steps

1. **Get the widget file**
   - Open `deploy/ClubCalendar_SBNC_EVENTS_PAGE.html` in a text editor
   - Select All (Cmd+A) and Copy (Cmd+C)

2. **Open Wild Apricot Admin**
   - Navigate to Website > Site pages
   - Edit the page where you want the calendar

3. **Add Custom HTML Gadget**
   - Insert a new gadget
   - Select "Custom HTML"
   - Paste the entire content (Cmd+V)

4. **Save and Test**
   - Save the page
   - View as a logged-in member to verify events load
   - Test as public visitor to verify fallback behavior

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Not logged in" error | User not authenticated | Must be logged into WA |
| No events displayed | API request failed | Check browser console for errors |
| Filters not working | Config not loaded before script | Ensure config `<script>` comes first |
| Styling issues | CSS conflicts with WA theme | Adjust `primaryColor`/`accentColor` |

---

## File Reference

### Installation Files

| File | Purpose | Use When |
|------|---------|----------|
| `deploy/ClubCalendar_SBNC_EVENTS_PAGE.html` | **SBNC events calendar** (ready to paste) | Installing on SBNC site |
| `deploy/ClubCalendar_SBNC_CONFIG_PAGE.html` | SBNC configuration page | Admin/config pages |
| `deploy/builder/index.html` | Builder tool for custom configs | Creating new configurations |
| `widget/clubcalendar-wa-inline.html` | Generic template | Customizing for other clubs |

### Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `deploy/CONFIG_CONTRACT.md` | Complete field reference | Technical admins |
| `docs/CSS_CUSTOMIZATION_GUIDE.md` | CSS variable reference | Theme designers |
| `docs/BUILDER_EXECUTIVE_OVERVIEW.md` | Builder architecture | Technical overview |
| `docs/FEATURE_COMPATIBILITY_CHART.md` | Feature comparison by mode | Decision makers |

---

## Version

- **Widget Version:** 1.02
- **Last Updated:** January 1, 2026
- **Maintainer:** ClubCalendar / SBNC Tech
