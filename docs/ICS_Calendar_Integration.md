# ICS Calendar Integration Guide

This document describes the ICS (iCalendar) integration that allows users to add ClubCalendar events to their personal calendars (Apple Calendar, Google Calendar, Outlook, etc.) with proper timezone handling.

## Overview

The ICS integration solves a common problem with Wild Apricot's native calendar exports: timezone confusion. Wild Apricot exports events in UTC format (`DTSTART:20250110T230000Z`) without proper timezone information, causing calendar applications to display confusing times like "11 PM GMT" in the event details.

Our solution generates ICS files with explicit timezone information using the `TZID` parameter and includes a complete `VTIMEZONE` block for `America/Los_Angeles`.

## Architecture

### Components

1. **ICS Endpoint** (`/ics/event.php`) - Server-side PHP script that generates RFC 5545 compliant ICS files
2. **Widget Integration** - JavaScript function in `clubcalendar-widget.js` that triggers downloads
3. **Configuration** - `icsBaseUrl` config option for endpoint URL

### Data Flow

```
User clicks "Add to Calendar"
        ↓
Widget calls generateIcsUrl(event)
        ↓
JavaScript fetches ICS from endpoint
        ↓
PHP generates ICS with VTIMEZONE
        ↓
Browser downloads .ics file
        ↓
Calendar app imports event
```

## Server-Side Endpoint

### Location

- **URL**: `https://mail.sbnewcomers.org/ics/event.php`
- **File Path**: `/home/sbnewcom/public_html/ics/event.php`

### Query Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `id` | Yes | Event ID | `6430013` |
| `title` | No | Event title (default: "SBNC Event") | `Brophy%20Bros` |
| `start` | Yes | Start time in ISO 8601 format | `2025-12-10T20:00:00.000Z` |
| `end` | No | End time in ISO 8601 (default: start + 2 hours) | `2025-12-10T22:00:00.000Z` |
| `location` | No | Event location | `Santa%20Barbara` |
| `description` | No | Event description | `Monthly%20lunch` |

### Example Request

```
https://mail.sbnewcomers.org/ics/event.php?id=6430013&title=Brophy+Bros&start=2025-12-10T20:00:00.000Z&end=2025-12-10T22:00:00.000Z&location=Brophy+Bros
```

### Response Headers

```
Content-Type: text/calendar; charset=utf-8
Content-Disposition: attachment; filename="sbnc-event-6430013.ics"
Access-Control-Allow-Origin: *
Cache-Control: no-cache, must-revalidate
```

### ICS Output Format

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ClubCalendar//SBNC Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Santa Barbara Newcomers Club
X-WR-TIMEZONE:America/Los_Angeles
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
X-LIC-LOCATION:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:6430013@sbnewcomers.org
DTSTAMP:20251210T060124Z
DTSTART;TZID=America/Los_Angeles:20251210T120000
DTEND;TZID=America/Los_Angeles:20251210T140000
SUMMARY:Brophy Bros
LOCATION:Brophy Bros
URL:https://sbnewcomers.org/event-6430013
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR
```

### Key Features

- **VTIMEZONE Block**: Complete timezone definition with DAYLIGHT and STANDARD rules
- **TZID Parameter**: `DTSTART;TZID=America/Los_Angeles:20251210T120000` ensures correct local time display
- **RFC 5545 Compliance**: Proper text escaping and line folding at 75 octets
- **CORS Support**: Allows cross-origin requests from the widget

## Widget Integration

### Configuration

Add `icsBaseUrl` to the widget configuration:

```javascript
window.CLUBCALENDAR_CONFIG = {
    container: '#clubcalendar',
    eventsUrl: '../data/events.json',
    icsBaseUrl: 'https://mail.sbnewcomers.org/ics/event.php',
    // ... other options
};
```

### generateIcsUrl Function

Located in `clubcalendar-widget.js` (lines 2291-2312):

```javascript
function generateIcsUrl(event) {
    // Convert dates to ISO 8601 format
    let startDate = event.start || event.startDate;
    let endDate = event.end || event.endDate;

    // Handle Date objects - convert to ISO string
    if (startDate instanceof Date) {
        startDate = startDate.toISOString();
    }
    if (endDate instanceof Date) {
        endDate = endDate.toISOString();
    }

    const params = new URLSearchParams({
        id: event.id,
        title: event.title || event.name || 'Event',
        start: startDate,
        end: endDate,
        location: event.location || ''
    });
    return `${CONFIG.icsBaseUrl}?${params.toString()}`;
}
```

### downloadIcs Function

Public API method for downloading ICS files (lines 3807-3828):

```javascript
downloadIcs: async function(url, eventId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch ICS');
        const icsContent = await response.text();

        // Create blob and trigger download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `sbnc-event-${eventId}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('ICS download failed:', error);
        alert('Failed to download calendar file. Please try again.');
    }
}
```

### Button in Event Popup

The "Add to Calendar" button is rendered in the event popup (line 3373):

```html
<button class="clubcal-btn clubcal-btn-calendar"
        onclick="window.ClubCalendar.downloadIcs('${generateIcsUrl(event)}', '${event.id}')">
    Add to Calendar
</button>
```

## PHP Script Reference

### File: `/home/sbnewcom/public_html/ics/event.php`

#### Functions

| Function | Purpose |
|----------|---------|
| `getVTimezone()` | Returns complete VTIMEZONE block for America/Los_Angeles |
| `escapeIcsText($text)` | RFC 5545 compliant text escaping (backslash, semicolon, comma, newlines) |
| `foldLine($line)` | Folds lines at 75 octets per RFC 5545 |
| `formatIcsDateTime($datetime)` | Converts ISO 8601 to ICS format (YYYYMMDDTHHMMSS) |
| `generateUid($eventId)` | Creates UID in format `{eventId}@sbnewcomers.org` |
| `generateDtstamp()` | Returns current UTC timestamp for DTSTAMP |
| `generateIcs($params)` | Main function that assembles complete ICS output |
| `lookupEvent($eventId)` | Stub function for future database integration |

### Timezone Handling

The script converts UTC times to Pacific time:

1. Input: `2025-12-10T20:00:00.000Z` (UTC)
2. Conversion: Creates DateTime object, sets timezone to America/Los_Angeles
3. Output: `DTSTART;TZID=America/Los_Angeles:20251210T120000` (12:00 PM local)

## Future Extensibility

### Google Cloud Function Migration

The PHP script is designed for easy migration to Google Cloud Functions:

1. The core logic is contained in pure functions
2. No database dependencies (uses query parameters)
3. HTTP request/response pattern matches Cloud Functions

To migrate:

```javascript
// Google Cloud Function (Node.js)
exports.generateIcs = (req, res) => {
    const { id, title, start, end, location, description } = req.query;
    // ... same logic as PHP
    res.set('Content-Type', 'text/calendar');
    res.set('Content-Disposition', `attachment; filename="sbnc-event-${id}.ics"`);
    res.send(icsContent);
};
```

### Database Integration

The `lookupEvent()` function is a stub for future integration:

```php
function lookupEvent($eventId) {
    // TODO: Query ClubCalendar database or Wild Apricot API
    // Return: ['title' => ..., 'start' => ..., 'end' => ..., 'location' => ...]
    return null;  // Currently returns null, uses query params instead
}
```

When implemented, calls to `/ics/event.php?id=123` would fetch event details from the database instead of requiring all parameters in the URL.

### Full Calendar ICS Feed

A future enhancement could provide a full calendar ICS feed:

- **URL**: `https://mail.sbnewcomers.org/ics/calendar.php`
- **Purpose**: Allow users to subscribe to the calendar (auto-updating)
- **Limitation**: Wild Apricot does not expose a public ICS feed URL, so this would need to fetch from our events.json or database

## Testing

### curl Test

```bash
curl "https://mail.sbnewcomers.org/ics/event.php?id=12345&title=Test%20Event&start=2025-01-15T14:00:00-08:00&end=2025-01-15T16:00:00-08:00&location=Santa%20Barbara"
```

### Browser Test

1. Open `http://localhost:8080/widget/preview.html`
2. Click any event to open the popup
3. Click "Add to Calendar" button
4. Verify `.ics` file downloads
5. Open in Apple Calendar
6. Verify event shows correct local time without "GMT" confusion

## Troubleshooting

### ICS Not Downloading

- Check browser console for CORS errors
- Verify `icsBaseUrl` is configured in widget
- Test endpoint directly with curl

### Wrong Time in Calendar

- Verify VTIMEZONE block is present in ICS output
- Check that DTSTART uses `TZID=America/Los_Angeles` format
- Ensure times are not using `Z` suffix (UTC)

### Blank Page Instead of Download

- The `download` attribute only works for same-origin URLs
- Use the JavaScript fetch + blob approach (already implemented)
- Check that endpoint returns `Content-Disposition: attachment` header
