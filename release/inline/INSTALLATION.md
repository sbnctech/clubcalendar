# ClubCalendar Installation Guide

Step-by-step instructions for installing ClubCalendar inline widget into Wild Apricot.

## Prerequisites

- Wild Apricot admin access
- Ability to add Custom HTML gadgets
- Your Wild Apricot Account ID (see below)

## Step 1: Find Your Account ID

**This is required for the widget to work.**

1. Log into Wild Apricot as an administrator
2. Click the **Settings** gear icon (top right)
3. Go to **Account** or **Account Details**
4. Your **Account ID** is displayed at the top
5. It's a 5-6 digit number like `123456`

**Write this number down - you'll need it in Step 4.**

Alternative method (browser console):
```javascript
// Run this in browser console on any WA admin page:
console.log(document.body.innerHTML.match(/accountId['":\s]+(\d+)/)?.[1])
```

## Step 2: Copy the Widget Code

1. Open `clubcalendar-wa-inline.html` in a text editor
2. Select ALL the content (Cmd+A or Ctrl+A)
3. Copy it (Cmd+C or Ctrl+C)

The file is about 2,400 lines - make sure you copy everything.

## Step 3: Create the Events Page in Wild Apricot

1. Log into Wild Apricot as an administrator
2. Go to **Website** -> **Site pages**
3. Click **Add page** to create a new page
4. Name it "Events" or "Calendar"
5. Choose your preferred URL slug (e.g., `/events`)
6. Click **Create**

## Step 4: Add and Configure the Widget

1. In the page editor, click where you want the calendar
2. Click **Insert gadget** in the toolbar
3. Select **HTML** (or **Custom HTML**)
4. Delete any placeholder text
5. Paste the entire widget code you copied
6. **IMPORTANT**: Find this line near the top:
   ```javascript
   waAccountId: 'YOUR_ACCOUNT_ID',
   ```
7. Replace `YOUR_ACCOUNT_ID` with your actual Account ID:
   ```javascript
   waAccountId: '123456',  // Use YOUR number
   ```
8. Click **OK** or **Save** to close the dialog
9. Click **Publish** to save the page

## Step 5: Verify Installation

1. Navigate to your events page (not in edit mode)
2. **You must be logged in as a member** to see events
3. The calendar should load with your organization's events

If you see "Loading..." indefinitely, check:
- You entered your Account ID correctly
- You're logged into Wild Apricot
- The page is published (not in draft mode)

## Customization (Optional)

Edit the `CLUBCALENDAR_CONFIG` section to customize:

```javascript
window.CLUBCALENDAR_CONFIG = {
    waAccountId: '123456',           // Your Account ID (REQUIRED)
    headerTitle: 'Club Events',      // Change the title
    primaryColor: '#2c5aa0',         // Main color (hex code)
    accentColor: '#d4a800',          // Accent color
    showMyEvents: true,              // Show "My Events" tab
    showFilters: true,               // Show filter buttons
    defaultView: 'dayGridMonth',     // Calendar view
};
```

See CONFIGURATION.md for all available options.

## Auto-Tagging (Optional)

If your events follow a naming convention like "Committee: Event Name", you can add auto-tagging rules:

```javascript
autoTagRules: [
    { type: 'name-prefix', pattern: 'Hiking:', tag: 'activity:hiking' },
    { type: 'name-prefix', pattern: 'Social:', tag: 'activity:social' },
    { type: 'name-prefix', pattern: 'Games:', tag: 'activity:games' }
]
```

This enables the Committee/Activity dropdown filters.

## Troubleshooting

### "Could not auto-discover account ID"

This means the widget couldn't find your Account ID. Fix:
1. Edit the HTML gadget
2. Find the `waAccountId` line near the top
3. Make sure it's set to your actual Account ID (not `YOUR_ACCOUNT_ID`)

### Calendar shows "Loading..." forever

1. Open browser console (F12 -> Console)
2. Look for red error messages
3. Common causes:
   - Account ID not set correctly
   - Not logged into Wild Apricot
   - Page not published

### "You must be logged in" message

The widget requires WA authentication to access the events API. Members must be logged in.

### Events not showing

1. Verify events exist in Wild Apricot with future dates
2. Check that events are published and visible to members
3. Make sure you're viewing the right date range

### Styling looks wrong

Wild Apricot themes can sometimes conflict. Try:
1. A different page template
2. Adding the widget to a full-width content area

## How It Works

The inline widget:
1. Reads your Account ID from the config
2. Fetches events directly from WA's internal API (`/sys/api/v2/`)
3. Renders using FullCalendar (loaded from public CDN)

No external servers are involved. Your event data never leaves Wild Apricot.

## Updating the Widget

To update to a new version:
1. Download the new `clubcalendar-wa-inline.html`
2. Copy your `waAccountId` and customizations from the old version
3. Replace the entire HTML gadget content with the new file
4. Publish the page
