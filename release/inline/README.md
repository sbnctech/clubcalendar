# ClubCalendar - Wild Apricot Inline Widget

A self-contained calendar widget that runs entirely within Wild Apricot.

## Features

- **No External Server Required** - Runs 100% on Wild Apricot
- **Auto-Detection** - Automatically detects your WA account
- **Real-Time Data** - Fetches events directly from WA API
- **Modern UI** - FullCalendar-based responsive design
- **Filtering** - Filter by activity type, time of day, availability

## Installation

1. Create a new page in Wild Apricot (or edit existing)
2. Add a "Custom HTML" gadget
3. Paste the ENTIRE contents of `clubcalendar-wa-inline.html`
4. Save and view the page while logged in

## Files

| File | Description |
|------|-------------|
| `clubcalendar-wa-inline.html` | Main widget - paste into WA Custom HTML gadget |
| `INSTALLATION.md` | Detailed installation guide |
| `CONFIGURATION.md` | Configuration options |

## Requirements

- Wild Apricot membership site
- Admin access to add Custom HTML gadgets
- Members must be logged in to view events

## No Dependencies

This widget has NO external dependencies:
- No external server
- No API keys to configure
- No mail.sbnewcomers.org or any other server
- Only uses WA's internal API and a public CDN for FullCalendar

## License

ISC License - See LICENSE file
