# ClubCalendar v1.04 Installation Guide

## Overview

ClubCalendar v1.04 runs entirely client-side on Wild Apricot, using WA's Member API. No external server required.

**Audience**: Members only (logged-in users)

**For public event pages**: Use Wild Apricot's native event widget instead.

## Prerequisites

1. Wild Apricot administrator access
2. API Application credentials (Account ID and Client ID)

## Step 1: Get Your API Credentials

### Account ID

1. Log into Wild Apricot as admin
2. Look at the URL when viewing your admin dashboard
3. The Account ID is the number in URLs like: `https://sbnewcomers.wildapricot.org/admin/settings`
4. Or check Settings > Account > Account ID

For SBNC: **176353**

### Client ID (API Application)

1. Go to **Settings > Security > Authorized applications**
2. Click **Add application**
3. Enter a name like "ClubCalendar Widget"
4. Set application type to **Installed Application** (not Server Application)
5. Copy the **Client ID** that's generated
6. Save

## Step 2: Add CSS Variables to WA Custom CSS

1. Go to **Settings > Site > Custom CSS**
2. Scroll to the bottom of existing CSS
3. Paste the contents of `CSS_VARIABLES.txt`
4. Modify colors to match your brand if needed
5. Save

## Step 3: Create a Members-Only Page

1. Go to **Pages > Add page**
2. Set page title (e.g., "Club Calendar" or "Member Events")
3. Under **Access**, select **Restricted to certain membership levels**
4. Check all member levels that should see the calendar
5. Save

## Step 4: Add the Widget

1. Edit your new members-only page
2. Add a **Custom HTML** gadget
3. Paste the entire contents of `widget-member.html`
4. Update the configuration at the top:

```javascript
window.CLUBCALENDAR_CONFIG = {
    waAccountId: '176353',         // Your Account ID
    waClientId: 'YOUR_CLIENT_ID',  // From Step 1
    headerTitle: 'Club Events',
    // ... rest of config
};
```

5. Save the gadget
6. Save the page

## Step 5: Test

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

### "Login Required" Error

The widget only works for logged-in members. If you see a login prompt:

- Verify the page is set to members-only access
- Check that the user is logged in
- Try logging out and back in

### Events Don't Load

1. Check browser console for errors (F12 > Console)
2. Verify Account ID and Client ID are correct
3. Ensure the API Application is set to "Installed Application" type
4. Check that the user has permission to view events

### Styling Issues

1. Verify CSS variables are added to WA Custom CSS
2. Check that CSS was saved (not just in editor)
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### My Events Tab Not Working

The My Events feature requires the `/contacts/me/eventregistrations` endpoint. If it fails:

1. User may not have any registrations
2. API permissions may be restricted
3. Check console for specific error messages

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
