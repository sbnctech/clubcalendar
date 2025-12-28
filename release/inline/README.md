# ClubCalendar - Wild Apricot Inline Widget

A self-contained calendar widget that runs entirely within Wild Apricot.
No external servers. No API keys. Just paste and go.

## Quick Start

1. Find your WA Account ID (Settings -> Account Details)
2. Open `clubcalendar-wa-inline.html` in a text editor
3. Replace `YOUR_ACCOUNT_ID` with your actual Account ID
4. Copy the ENTIRE contents (all 2,400+ lines)
5. Paste into a WA Custom HTML gadget
6. Save and view while logged in

See INSTALLATION.md for detailed steps.

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
- **Simple Setup** - Just add your Account ID and paste
- **Real-Time Data** - Fetches events directly from WA API
- **Smart Filtering** - Activity, time, price, availability
- **My Events** - See your registered events in one place
- **Responsive** - Works on desktop and mobile

## How It Works

The widget:
1. Reads your Account ID from the config
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
