# ClubCalendar Configuration Guide

The widget is configured via the `CLUBCALENDAR_CONFIG` object near the top of the HTML file.

## Required Configuration

```javascript
window.CLUBCALENDAR_CONFIG = {
    // REQUIRED - Your Wild Apricot Account ID
    waAccountId: '123456',           // Find at: Settings -> Account Details

    // OPTIONAL - Display settings
    headerTitle: 'Club Events',      // Title shown above calendar
    primaryColor: '#2c5aa0',         // Main accent color
    accentColor: '#d4a800',          // Secondary accent color

    // OPTIONAL - Features
    showMyEvents: true,              // Show "My Events" tab
    showFilters: true,               // Show filter dropdowns
    defaultView: 'dayGridMonth',     // Initial calendar view
};
```

## Available Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| waAccountId | string | **YES** | - | Your WA Account ID (5-6 digits) |
| headerTitle | string | No | 'Club Events' | Title displayed above calendar |
| primaryColor | string | No | '#2c5aa0' | Primary theme color (hex) |
| accentColor | string | No | '#d4a800' | Accent/highlight color (hex) |
| showMyEvents | boolean | No | true | Show "My Events" tab |
| showFilters | boolean | No | true | Show filter buttons and dropdowns |
| defaultView | string | No | 'dayGridMonth' | Initial view |
| container | string | No | '#clubcalendar' | CSS selector for widget container |

## Calendar Views

- `dayGridMonth` - Traditional monthly calendar grid
- `dayGridWeek` - Weekly calendar grid  
- `listWeek` - List view of events for the week

## Quick Filters

Built-in quick filter buttons:

- **Weekend** - Saturday/Sunday events only
- **Has Openings** - Hides sold-out events
- **After Hours** - Events starting after 5 PM

## Dropdown Filters

Automatically generated from your event data:

- **Committee** - Filter by organizing committee
- **Activity** - Filter by activity type
- **Price** - Free, $, $$, $$$
- **Type** - Multi-day, Single session, etc.

## Color Examples

| Color | Hex Code | Use For |
|-------|----------|---------|
| Blue | #2c5aa0 | Default, professional |
| Green | #2e7d32 | Nature, outdoors |
| Purple | #6a1b9a | Elegant, creative |
| Orange | #e65100 | Energetic, active |
| Teal | #00796b | Fresh, modern |

## Styling Overrides

The widget uses CSS custom properties you can override:
```css
#clubcalendar {
    --clubcal-primary: #2c5aa0;
    --clubcal-accent: #d4a800;
    --clubcal-background: #ffffff;
    --clubcal-text: #333333;
}
```

## Troubleshooting

### Widget not loading?

1. Ensure you're logged into Wild Apricot
2. Check browser console for errors (F12 -> Console)
3. Verify the entire HTML was pasted (not truncated)

### Events not showing?

1. You must be logged in as a member
2. Events must be published and visible to members
3. Check if date range includes current/future events

### Styling conflicts?

Add !important to CSS overrides if WA styles conflict:
```css
#clubcalendar .fc-button {
    background-color: #2c5aa0 !important;
}
```
