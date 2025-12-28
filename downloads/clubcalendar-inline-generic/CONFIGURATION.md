# ClubCalendar Configuration Guide

The widget is configured via the `CLUBCALENDAR_CONFIG` object at the top of the HTML file.

## Basic Configuration
```javascript
window.CLUBCALENDAR_CONFIG = {
    // Display
    headerTitle: 'Club Events',      // Title shown above calendar
    primaryColor: '#2c5aa0',         // Main accent color
    accentColor: '#d4a800',          // Secondary accent color
    
    // Features
    showMyEvents: true,              // Show "My Events" tab
    showFilters: true,               // Show filter dropdowns
    defaultView: 'dayGridMonth',     // Initial calendar view
};
```

## Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `headerTitle` | string | 'Club Events' | Title displayed above calendar |
| `primaryColor` | string | '#2c5aa0' | Primary theme color |
| `accentColor` | string | '#d4a800' | Accent/highlight color |
| `showMyEvents` | boolean | true | Show "My Events" tab for registered events |
| `showFilters` | boolean | true | Show filter buttons and dropdowns |
| `defaultView` | string | 'dayGridMonth' | Initial view: dayGridMonth, dayGridWeek, listWeek |
| `container` | string | '#clubcalendar' | CSS selector for widget container |

## Calendar Views

- `dayGridMonth` - Traditional monthly calendar grid
- `dayGridWeek` - Weekly calendar grid  
- `listWeek` - List view of events for the week

## Quick Filters

The widget includes built-in quick filter buttons:

- **Weekend** - Shows only Saturday/Sunday events
- **Has Openings** - Hides sold-out events
- **After Hours** - Events starting after 5 PM

## Dropdown Filters

Automatically generated from your event data:

- **Committee** - Filter by organizing committee
- **Activity** - Filter by activity type
- **Price** - Free, $, $$, $$$
- **Type** - Multi-day, Single session, etc.

## Auto-Tagging

Events are automatically tagged based on title patterns. See EVENT_TAGGING.md for details.

## Styling

The widget uses CSS custom properties that you can override:
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
2. Check browser console for errors (F12 → Console)
3. Verify the entire HTML was pasted (not truncated)

### Events not showing?

1. You must be logged in as a member
2. Events must be published and visible to members
3. Check if date range includes current/future events

### Styling conflicts?

Add `!important` to CSS overrides if WA styles are conflicting:
```css
#clubcalendar .fc-button {
    background-color: #2c5aa0 !important;
}
```
