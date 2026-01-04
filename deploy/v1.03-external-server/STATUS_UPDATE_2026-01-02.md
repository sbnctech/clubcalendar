# ClubCalendar Status Update

**Date:** January 2, 2026
**Author:** Ed Forman
**Status:** In Progress - Stepping away briefly for appointment

---

## Summary

I'm completing the packaging of ClubCalendar v1.03 (External Server Edition) this afternoon. This is the most viable option I can offer. I need to step away briefly for an appointment but will complete the remaining work when I return.

---

## Why External Server Is the Only Viable Option

After extensive testing, I've determined that ClubCalendar cannot run as a WA-only solution. The choice is binary:

1. **External server version** - Full functionality, reliable, maintainable
2. **Stick with WA's built-in calendar widget** - Limited but zero maintenance

**I strongly recommend the external server version.**

### The Core Problem

Wild Apricot's internal API (`/sys/api/v2/`) requires OAuth authentication tokens. It does not accept browser session cookies, even for logged-in members. This means:

- A widget running on a WA page cannot call the WA API directly
- The API returns empty 200 responses (not errors) when called without OAuth tokens
- There is no way to obtain OAuth tokens from within a WA page without server-side infrastructure

### Why I Can't Make a WA-Only Version Work

- **OAuth tokens require server-side handling** - Cannot securely manage API credentials in browser JavaScript
- **No public feeds available** - iCal, RSS, and WebAPI endpoints all return 404
- **HTML scraping is fragile** - I built a scraping version, but it can't get event descriptions, pricing, capacity, or show "My Events" - and it will break if WA changes their HTML templates

The WA platform simply isn't designed for custom widgets that need rich event data.

---

## What Slowed Me Down

The seemingly arbitrary constraints in the Wild Apricot environment for API calls have significantly slowed my progress. In particular:

**Trial accounts don't allow API access at all.** My test calls to the WA API kept returning empty responses, and I spent considerable time thinking this was an authentication issue with session cookies vs OAuth tokens. It wasn't until I confirmed the production account's API access works fine through mail.sbnewcomers.org that I understood the trial account limitation.

This is not documented clearly by Wild Apricot and cost me several hours of debugging.

---

## Why I Recommend the External Server Approach

The external server approach provides the full ClubCalendar experience with high reliability:

- **No additional hosting cost** - We already have mail.sbnewcomers.org running the President chatbot
- **Modify settings without code changes** - Admin-editable config page on WA
- **Graceful failover** - If the server is slow or down, users see WA's standard calendar (not a broken page)
- **Full feature set** - Event descriptions, pricing, availability, "My Events," filtering, tagging
- **Proper security** - Public view shows no member PII (location, registration status, attendee lists)

---

## What's Done

- Calendar API endpoints added to the chatbot server (app.py)
- Widget updated with side panel mode, enhanced tooltips, audience controls
- SBNC-specific configuration files created
- WA page snippets ready to paste (public and member versions)
- SSH install script for deployment to mail.sbnewcomers.org

---

## Still to Complete

- Endpoint tests
- Installation documentation
- Final verification that public view shows no member data

---

Back shortly.
