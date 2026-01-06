# ClubCalendar v1.03 Release Notes

**Release Date:** January 2, 2026  
**Edition:** External Server (Iframe)

## Overview

Version 1.03 introduces the External Server architecture, hosting the calendar on mail.sbnewcomers.org and embedding it in Wild Apricot pages via iframe. This approach bypasses WA's Content Security Policy restrictions that blocked previous client-side implementations.

## Architecture Change

**Previous (v1.02):** Widget ran entirely on WA page, called WA API directly  
**New (v1.03):** Calendar hosted on mail.sbnewcomers.org, embedded via iframe

### Why the change?

Wild Apricot's Content Security Policy (CSP) blocks:
- Loading scripts from external domains (JSONP approach failed)
- Direct API calls from custom HTML gadgets (returns empty responses)

The iframe approach bypasses these restrictions entirely.

## Features

- **Full calendar view** with month and list views
- **Event popup** showing date, time, location, and availability
- **"My Registrations" link** to WA's native registrations page
- **Real-time data** from mail.sbnewcomers.org SQLite cache (synced from WA)
- **Responsive design** works on mobile devices
- **Fallback** to WA events page if server unavailable

## "My Events" Implementation Decision

### What we considered:
1. **Email lookup in iframe** - Rejected (security concern: asking users to enter email)
2. **Pass user ID in URL** - Rejected (exposes user ID, enumeration risk)
3. **OAuth login flow** - Rejected (adds complexity, maintenance burden)
4. **Link to WA native page** - **Selected**

### Why we chose the link approach:
- **Simple:** One click takes user to WA's authenticated "My Registrations" page
- **Secure:** No cross-domain authentication needed; WA handles auth
- **Maintainable:** No additional server code to maintain
- **Reliable:** Uses WA's built-in functionality

The "My Registrations" button in the calendar header links directly to:
`https://sbnewcomers.org/Sys/Profile/EventRegistrations`

This provides 95% of the value with minimal complexity.

## Installation

### WA Page Setup

Paste this into a Custom HTML gadget:

```html
<div class="clubcalendar-iframe-container">
  <iframe
    src="https://mail.sbnewcomers.org/calendar/"
    style="width: 100%; height: 800px; border: none; border-radius: 8px;"
    title="Club Events Calendar"
  ></iframe>
</div>
```

### Server Components

- **Calendar page:** `https://mail.sbnewcomers.org/calendar/`
- **Events API:** `https://mail.sbnewcomers.org/api/events`
- **Data source:** SQLite database synced from WA (daily at 3 AM)

## Known Limitations

1. **Fixed iframe height** - Set to 800px; doesn't auto-resize
2. **No integrated "My Events"** - Links to WA instead (by design)
3. **Data freshness** - Events updated daily; real-time changes may take up to 24 hours

## Files

| File | Location | Purpose |
|------|----------|---------|
| Calendar page | `/var/www/html/calendar/index.html` | Rendered calendar |
| Events API | `/var/www/chatbot/backend/app.py` | JSON event data |
| Iframe embed | `deploy/v1.03-external-server/orgs/sbnc/wa-iframe-embed.html` | WA gadget code |

## Changelog

### v1.03 (2026-01-02)
- New: External server architecture (iframe-based)
- New: Calendar hosted on mail.sbnewcomers.org
- New: "My Registrations" link to WA native page
- Fixed: CSP blocking issues resolved
- Removed: Client-side WA API calls (blocked by CSP)
- Removed: Email-based "My Events" lookup (security concern)

### v1.02 (2025-12-31)
- Client-side widget with WA API integration
- Blocked by WA Content Security Policy

---

*Maintained by Ed Forman with Claude Code assistance*
