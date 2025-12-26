# SBNC Inline-Only Install Guide

This document is the canonical reference for embedding ClubCalendar in Wild Apricot using the inline-only method.

---

> **NO EXTERNAL DEPENDENCIES**
>
> - No `mail.sbnewcomers.org` required
> - No external server hosting required
> - No `<script src="...">` loading required
> - Runs entirely within Wild Apricot
>
> Use the canonical snippet: `docs/INSTALL/SBNC_INLINE_SNIPPET.html`

---

## Embed Contract

| Property | Value |
|----------|-------|
| **Canonical Snippet** | `docs/INSTALL/SBNC_INLINE_SNIPPET.html` (SBNC-specific) |
| **Generic Template** | `widget/clubcalendar-wa-inline.html` (for other orgs) |
| **DOM Mount Point** | `<div id="clubcalendar"></div>` |
| **Config Mechanism** | `window.CLUBCALENDAR_CONFIG` (inline object) |
| **External Dependencies** | None (all code inlined) |
| **Authentication** | WA session cookie (auto-detected) |
| **SBNC Account ID** | `176353` (pre-configured in snippet) |

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

## Canonical SBNC Install Snippet

**Use this file:** `docs/INSTALL/SBNC_INLINE_SNIPPET.html`

This file contains the complete, ready-to-paste widget with:

- SBNC branding ("SBNC Events" header)
- SBNC Account ID pre-configured (`176353`)
- All 18 SBNC activity committee auto-tagging rules
- Full widget code (no assembly required)

**To install:**

1. Open `docs/INSTALL/SBNC_INLINE_SNIPPET.html` in a text editor
2. Select All (Cmd+A) and Copy (Cmd+C)
3. Paste into a Wild Apricot Custom HTML gadget
4. Save and view the page

---

## Installation Steps

1. **Get the snippet file**
   - Open `docs/INSTALL/SBNC_INLINE_SNIPPET.html` in a text editor
   - Select All (Cmd+A) and Copy (Cmd+C)

2. **Open Wild Apricot Admin**
   - Navigate to Website > Site pages
   - Edit the page where you want the calendar

3. **Add Custom HTML Gadget**
   - Insert a new gadget
   - Select "Custom HTML"
   - Paste the entire snippet (Cmd+V)

4. **Save and Test**
   - Save the page
   - View as a logged-in member to verify events load

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

| File | Purpose | Use When |
|------|---------|----------|
| `docs/INSTALL/SBNC_INLINE_SNIPPET.html` | **SBNC canonical snippet** (ready to paste) | Installing on SBNC site |
| `widget/clubcalendar-wa-inline.html` | Generic template (for other orgs) | Customizing for other clubs |
| `widget/wa-embed-example.html` | External JS example | Using hosted JS approach |

### Deprecated (Archived)

Server-hosted deployment docs have been archived to `_quarantine/server-hosted/`.
SBNC uses inline-only deployment - no external server required.

---

## Version

- **Widget Version:** 2.0.0 (WA Native Edition)
- **Install Pack:** v1.0.0 (Inline Only)
- **Last Updated:** December 2024
- **Maintainer:** ClubCalendar / SBNC Tech
