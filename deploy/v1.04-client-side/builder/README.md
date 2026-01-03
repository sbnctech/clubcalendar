# ClubCalendar Widget Builder

**Version:** 1.04 Client-Side Edition

An interactive tool for generating customized ClubCalendar widgets for Wild Apricot sites.

---

## What It Does

The builder walks you through configuring a ClubCalendar widget and generates ready-to-paste HTML code for your Wild Apricot site.

---

## How to Use

### Step 1: Open the Builder

Open `index.html` in a web browser. No server required - it runs entirely in your browser.

### Step 2: Enter Organization Info

| Field | Description | Example |
|-------|-------------|---------|
| Organization Name | Full name of your club | Santa Barbara Newcomers Club |
| Short Name | Abbreviation (for header) | SBNC |

### Step 3: Enter Wild Apricot API Credentials

| Field | Where to Find It | Example |
|-------|------------------|---------|
| WA Account ID | WA Admin → Settings → look at URL | 176353 |
| WA Client ID | WA Admin → Settings → Authorized Applications | abc123xyz... |

**To get your Client ID:**

1. Log in to Wild Apricot as admin
2. Go to **Settings → Security → Authorized applications**
3. Click **Add application**
4. Set:
   - Application name: `ClubCalendar`
   - Application type: **JavaScript application**
5. Save and copy the **Client ID**

### Step 4: Customize Appearance (Optional)

| Setting | Default | Description |
|---------|---------|-------------|
| Header Title | "Club Events" | Text shown in calendar header |
| Primary Color | Auto-detect | Main brand color (buttons, header) |
| Accent Color | Auto-detect | Secondary color (highlights) |
| Default View | Month | Initial calendar view |

**Note:** Colors auto-detect from your WA theme if left blank.

### Step 5: Configure Filters (Optional)

Enable/disable filter dropdowns:

- **Activity Filter** - Filter by event type/committee
- **Time Filter** - Morning, Afternoon, Evening
- **Availability Filter** - Has openings, waitlist, etc.

Enable/disable quick filter buttons:

- **Weekend** - Saturday/Sunday events
- **Has Openings** - Events with available spots
- **After Hours** - Evening events
- **Free** - No-cost events
- **Open to Public** - Public events

### Step 6: Generate & Copy

1. Click **Generate Widget**
2. Review the preview
3. Click **Copy to Clipboard**
4. Paste into your WA Custom HTML gadget

---

## Installation in Wild Apricot

1. Log in to Wild Apricot as admin
2. Go to **Website → Site pages**
3. Create or edit a **members-only** page
4. Add a **Custom HTML** gadget
5. Paste the generated code
6. Save the page

**Important:** The widget requires users to be logged in. Place it on a members-only page.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Builder interface |
| `widget-core-slim.html` | Widget core code (loaded by builder) |
| `README.md` | This documentation |

---

## Configuration Reference

The generated widget includes a config object:

```javascript
window.CLUBCALENDAR_CONFIG = {
    // Required
    waAccountId: '176353',
    waClientId: 'your-client-id',
    useClientSideApi: true,

    // Appearance
    headerTitle: 'Club Events',
    primaryColor: '#2c5aa0',      // Leave blank for auto-detect
    accentColor: '#d4a800',       // Leave blank for auto-detect
    defaultView: 'dayGridMonth',  // or 'listMonth'

    // Feature toggles
    showFilters: true,
    showHeader: true,
    showActivityFilter: true,
    showTimeFilter: true,
    showAvailabilityFilter: true,

    // Quick filters
    quickFilters: {
        weekend: true,
        openings: true,
        afterhours: true,
        free: false,
        public: true
    },

    // Advanced
    disableThemeDetection: false  // Set true to disable auto-detect
};
```

---

## Troubleshooting

### "Login Required" message appears

- Widget must be on a **members-only** page
- User must be logged in to Wild Apricot
- Check that Client ID is correct

### Calendar shows no events

- Verify Account ID is correct
- Check browser console for API errors
- Ensure there are upcoming events in Wild Apricot

### Colors don't match my theme

- Colors auto-detect from WA page elements
- Override with explicit colors in builder
- Or add CSS to **Website → CSS** (see THEME_DESIGNER_GUIDE.md)

### Builder won't generate widget

- Ensure all required fields are filled (Account ID, Client ID)
- Check browser console for JavaScript errors

---

## Advanced: Manual Editing

After generating, you can manually edit the config in the pasted code:

```javascript
window.CLUBCALENDAR_CONFIG = {
    // Edit values here
};
```

Changes take effect on page reload.

---

## Version History

- **v1.04** - Client-side API, auto theme detection, slim widget core

---

*For theme customization, see `../THEME_DESIGNER_GUIDE.md`*
