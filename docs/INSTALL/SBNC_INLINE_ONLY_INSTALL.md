# SBNC Inline-Only Install Guide

This document is the canonical reference for embedding ClubCalendar in Wild Apricot using the inline-only method (no external server required).

---

## Embed Contract

| Property | Value |
|----------|-------|
| **Entrypoint** | `widget/clubcalendar-wa-inline.html` (self-contained) |
| **DOM Mount Point** | `<div id="clubcalendar"></div>` |
| **Config Mechanism** | `window.CLUBCALENDAR_CONFIG` (inline object) |
| **External Dependencies** | None (all code inlined) |
| **Authentication** | WA session cookie (auto-detected) |

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

Copy this entire block into a Wild Apricot **Custom HTML gadget**:

```html
<!-- ClubCalendar for SBNC - Inline Install -->
<div id="clubcalendar"></div>

<script>
window.CLUBCALENDAR_CONFIG = {
    // SBNC-specific configuration
    waAccountId: '176353',
    headerTitle: 'SBNC Events',
    showMyEvents: true,
    showFilters: true,
    defaultView: 'dayGridMonth',
    primaryColor: '#2c5aa0',
    accentColor: '#d4a800',

    // SBNC activity committee auto-tagging
    autoTagRules: [
        { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
        { type: 'name-prefix', pattern: 'Games!:', tag: 'committee:games' },
        { type: 'name-prefix', pattern: 'Wine Appreciation:', tag: 'committee:wine' },
        { type: 'name-prefix', pattern: 'Epicurious:', tag: 'committee:epicurious' },
        { type: 'name-prefix', pattern: 'TGIF:', tag: 'committee:tgif' },
        { type: 'name-prefix', pattern: 'Cycling:', tag: 'committee:cycling' },
        { type: 'name-prefix', pattern: 'Golf:', tag: 'committee:golf' },
        { type: 'name-prefix', pattern: 'Performing Arts:', tag: 'committee:performing-arts' },
        { type: 'name-prefix', pattern: 'Local Heritage:', tag: 'committee:local-heritage' },
        { type: 'name-prefix', pattern: 'Wellness:', tag: 'committee:wellness' },
        { type: 'name-prefix', pattern: 'Garden:', tag: 'committee:garden' },
        { type: 'name-prefix', pattern: 'Arts:', tag: 'committee:arts' },
        { type: 'name-prefix', pattern: 'Current Events:', tag: 'committee:current-events' },
        { type: 'name-prefix', pattern: 'Pop-Up:', tag: 'committee:popup' },
        { type: 'name-prefix', pattern: 'Beer Lovers:', tag: 'committee:beer' },
        { type: 'name-prefix', pattern: 'Out to Lunch:', tag: 'committee:out-to-lunch' },
        { type: 'name-prefix', pattern: 'Afternoon Book:', tag: 'committee:book-clubs' },
        { type: 'name-prefix', pattern: 'Evening Book:', tag: 'committee:book-clubs' }
    ]
};
</script>

<!--
  INLINE WIDGET CODE BELOW
  Copy the entire contents of widget/clubcalendar-wa-inline.html
  starting from the second <script> tag
-->
```

**Important:** After the config script, paste the entire widget code from `widget/clubcalendar-wa-inline.html` (the second `<script>` block containing the IIFE).

---

## Installation Steps

1. **Open Wild Apricot Admin**
   - Navigate to Website > Site pages
   - Edit the page where you want the calendar

2. **Add Custom HTML Gadget**
   - Insert a new gadget
   - Select "Custom HTML"

3. **Paste the Code**
   - Copy the canonical snippet above
   - Append the widget JavaScript from `widget/clubcalendar-wa-inline.html`

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

| File | Purpose |
|------|---------|
| `widget/clubcalendar-wa-inline.html` | Self-contained inline version (copy entire file) |
| `widget/clubcalendar-widget-wa.js` | External JS version (requires hosting) |
| `widget/wa-embed-example.html` | Example showing external JS usage |

---

## Version

- **Widget Version:** 2.0.0 (WA Native Edition)
- **Last Updated:** December 2024
- **Maintainer:** ClubCalendar / SBNC Tech
