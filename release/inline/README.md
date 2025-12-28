# ClubCalendar - Wild Apricot Inline Widget

A self-contained calendar widget that runs entirely within Wild Apricot.
No external servers. No API keys. Just paste and go.

## Quick Start

1. Open `clubcalendar-wa-inline.html` in a text editor
2. Copy the ENTIRE contents (all 2,400+ lines)
3. Paste into a WA Custom HTML gadget
4. Save and view while logged in

The widget auto-detects your WA account. No configuration required.

## Documentation

| Document | Description |
|----------|-------------|
| INSTALLATION.md | Step-by-step installation guide |
| CONFIGURATION.md | All configuration options |
| EVENT_TAGGING.md | Auto-tagging and title conventions |
| COMPARISON.md | WA Calendar vs ClubCalendar features |
| TRADEOFFS.md | Architecture decisions and analysis |

## Features

- **No External Server** - Runs 100% on Wild Apricot
- **Auto-Detection** - Automatically detects your WA account
- **Real-Time Data** - Fetches events directly from WA API
- **Smart Filtering** - Activity, time, price, availability
- **My Events** - See your registered events in one place
- **Responsive** - Works on desktop and mobile

## How It Works

The widget:
1. Detects your WA account from the page context
2. Fetches events from WA's internal API
3. Renders an interactive calendar using FullCalendar

No external servers. Your data stays in Wild Apricot.

## Requirements

- Wild Apricot membership site
- Admin access to add Custom HTML gadgets
- Members must be logged in to view events

## External Dependencies

- FullCalendar library (loaded from cdn.jsdelivr.net)

That's the only external dependency. No other servers involved.

## License

ISC License
