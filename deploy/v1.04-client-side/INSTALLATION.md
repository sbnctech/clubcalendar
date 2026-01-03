# ClubCalendar v1.04 Installation Guide

## Overview

ClubCalendar v1.04 runs entirely client-side on Wild Apricot, using WA's Member API. No external server required.

**Audience**: Members only (logged-in users)

**For public event pages**: Use Wild Apricot's native event widget instead.

## Prerequisites

1. Wild Apricot administrator access
2. Paid WA plan (trial accounts cannot whitelist external scripts)

---

## Step 1: Whitelist the CDN

ClubCalendar loads the FullCalendar library from a CDN. You must whitelist this domain first.

1. Log into Wild Apricot as admin
2. Go to **Settings → Security → JavaScript whitelist**
3. Add this domain: `cdnjs.cloudflare.com`
4. Click **Save**

**Why?** Wild Apricot blocks external JavaScript by default. Without this step, the calendar will not load.

---

## Step 2: Get Your API Credentials

### Account ID

1. Look at the URL when viewing your admin dashboard
2. The Account ID is the number in URLs like: `https://sbnewcomers.wildapricot.org/admin/settings`
3. Or check **Settings → Account → Account ID**

For SBNC: **176353**

### Client ID (API Application)

1. Go to **Settings → Security → Authorized applications**
2. Click **Authorize application**
3. Select **User authorization**
4. Click **Continue**
5. Enter application name: `ClubCalendar`
6. Click **Authorize**
7. Copy the **Client ID** that's generated

---

## Step 3: Add CSS Variables (Optional)

ClubCalendar auto-detects colors from your WA theme. Skip this step unless you want custom colors.

1. Go to **Website → CSS**
2. Scroll to the bottom of existing CSS
3. Paste the contents of `CSS_VARIABLES.txt`
4. Modify colors to match your brand if needed
5. Click **Save**

See `THEME_DESIGNER_GUIDE.md` for all available CSS variables.

---

## Step 4: Create a Members-Only Page

1. Go to **Website → Site pages**
2. Click **Add page**
3. Set page title (e.g., "Club Calendar" or "Member Events")
4. Under **Access**, select **Restricted to certain membership levels**
5. Check all member levels that should see the calendar
6. Click **Save**

---

## Step 5: Add the Widget

**Option A: Use the Builder (Recommended)**

1. Open `builder/index.html` in your browser
2. Fill in your Account ID and Client ID
3. Configure options as desired
4. Click **Generate Widget**
5. Click **Copy to Clipboard**
6. Edit your members-only page
7. Add a **Custom HTML** gadget
8. Paste the widget code
9. Save the gadget and page

**Option B: Manual Configuration**

1. Edit your members-only page
2. Add a **Custom HTML** gadget
3. Paste the entire contents of `widget-member.html`
4. Update the configuration at the top:

```javascript
window.CLUBCALENDAR_CONFIG = {
    waAccountId: '176353',         // Your Account ID
    waClientId: 'YOUR_CLIENT_ID',  // From Step 2
    headerTitle: 'Club Events',
    // ... rest of config
};
```

5. Save the gadget and page

---

## Step 6: Test

1. Log in as a regular member (not admin)
2. Navigate to your calendar page
3. Verify:
   - Events load and display
   - Filters work (time of day, committee, etc.)
   - "My Events" tab shows your registrations
   - Clicking an event goes to the registration page

## Configuration Options

### Basic Settings

```javascript
window.CLUBCALENDAR_CONFIG = {
    waAccountId: '176353',
    waClientId: 'abc123',
    headerTitle: 'Club Events',     // Shown at top of widget
    defaultView: 'dayGridMonth',    // dayGridMonth, listMonth, timeGridWeek
    showFilters: true,              // Show filter bar
    showHeader: true,               // Show title header
};
```

### Feature Toggles

```javascript
{
    showMyEvents: true,             // Show "My Events" tab
    showRegistrantCount: true,      // Show "5 of 20 registered"
    showWaitlist: true,             // Show waitlist status
}
```

### Quick Filters

```javascript
{
    quickFilters: {
        weekend: true,      // Weekend events
        openings: true,     // Events with spots available
        afterhours: true,   // Events after 5pm
        free: false,        // Free events (disabled)
        public: true,       // Public access events
    }
}
```

### Auto-Tagging Rules

Automatically tag events based on name patterns:

```javascript
{
    autoTagRules: [
        { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
        { type: 'name-prefix', pattern: 'Games!:', tag: 'committee:games' },
        { type: 'name-prefix', pattern: 'Wine Appreciation:', tag: 'committee:wine' },
        // Add more rules for your committees
    ]
}
```

## Troubleshooting

See `TROUBLESHOOTING.md` for detailed solutions. Quick fixes:

| Problem | Quick Fix |
|---------|-----------|
| Calendar blank/won't load | Verify `cdnjs.cloudflare.com` is whitelisted |
| "Login Required" message | Page must be members-only AND user logged in |
| No events showing | Check Account ID and Client ID are correct |
| Console shows CSP error | CDN not whitelisted (Step 1) |
| Styling looks wrong | Hard refresh (Ctrl+Shift+R) |

## Updating the Widget

To update ClubCalendar:

1. Get the new `widget-member.html`
2. Edit your calendar page
3. Edit the Custom HTML gadget
4. Replace the entire contents (keep your config at the top)
5. Save

**Tip**: Copy your config section before updating, then paste it back after.

## Support

For technical issues, contact: technology@sbnewcomers.org
