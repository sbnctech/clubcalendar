# ClubCalendar Installation Guide

Step-by-step instructions for installing ClubCalendar inline widget into Wild Apricot.

## Prerequisites

- Wild Apricot admin access
- Ability to add Custom HTML gadgets

That's it! No external server, no API keys, no configuration files.

## Step 1: Copy the Widget Code

1. Open `clubcalendar-wa-inline.html` in a text editor
2. Select ALL the content (Cmd+A or Ctrl+A)
3. Copy it (Cmd+C or Ctrl+C)

The file is about 2,400 lines - make sure you copy everything.

## Step 2: Create or Edit a Page in Wild Apricot

1. Log into Wild Apricot as an administrator
2. Go to Website -> Site pages
3. Either:
   - Click "Add page" to create a new Events page, OR
   - Click "Edit" on an existing page where you want the calendar

## Step 3: Add a Custom HTML Gadget

1. In the page editor, click where you want the calendar
2. Click "Insert gadget" in the toolbar
3. Select "HTML" (or "Custom HTML" depending on your WA version)
4. A code editor dialog opens

## Step 4: Paste the Widget Code

1. Delete any placeholder text in the HTML gadget
2. Paste the entire contents you copied in Step 1
3. Click "OK" or "Save" to close the dialog
4. Click "Publish" to save the page

## Step 5: View Your Calendar

1. Navigate to your page (not in edit mode)
2. You must be logged in as a member to see events
3. The calendar should load with your organization's events

## Customization (Optional)

To customize colors or features, edit the `CLUBCALENDAR_CONFIG` section near the top of the HTML:
```javascript
window.CLUBCALENDAR_CONFIG = {
    headerTitle: 'Club Events',      // Change the title
    primaryColor: '#2c5aa0',         // Main color (hex code)
    accentColor: '#d4a800',          // Accent color
    showMyEvents: true,              // Show "My Events" tab
    showFilters: true,               // Show filter buttons
    defaultView: 'dayGridMonth',     // Calendar view
};
```

See CONFIGURATION.md for all available options.

## Troubleshooting

### Calendar shows "Loading..." or nothing appears

1. Make sure you're logged into Wild Apricot
2. Check that you pasted the ENTIRE file (all 2,400+ lines)
3. Open browser console (F12 -> Console) and look for errors

### "You must be logged in" message

The widget requires WA authentication to access the events API. Members must be logged in.

### Events not showing

1. Verify events exist in Wild Apricot with future dates
2. Check that events are published and visible to members
3. Try refreshing the page

### Styling looks wrong

Wild Apricot themes can sometimes conflict. Try:
1. A different page template
2. Adding the widget to a full-width content area

## How It Works

The inline widget:
1. Detects your WA account automatically from the page context
2. Fetches events directly from WA's internal API (`/sys/api/v2/`)
3. Renders using FullCalendar (loaded from public CDN)

No external servers are involved. Your event data never leaves Wild Apricot.

## Updating the Widget

To update to a new version:
1. Download the new `clubcalendar-wa-inline.html`
2. Copy your customizations from the old CONFIG section
3. Replace the entire HTML gadget content with the new file
4. Publish the page
