# ClubCalendar v1.04 - Client-Side Member API Edition

## What's New in v1.04

This version eliminates the external server dependency by using Wild Apricot's Member API directly from the browser.

### Key Changes from v1.03

| Feature | v1.03 | v1.04 |
|---------|-------|-------|
| Data Source | External server (mail.sbnewcomers.org) | WA Member API (/sys/api/publicview/) |
| Architecture | iframe embedding external page | Inline script on WA page |
| Server Required | Yes | No |
| Audience | Public or members | Members only |
| Login Required | No | Yes |
| CSS Integration | Isolated in iframe | Inherits from WA Custom CSS |

## Strategic Direction

- **Public pages**: Use Wild Apricot's native event widget (no customization)
- **Member pages**: Use ClubCalendar v1.04 with client-side API

## Package Contents

```
v1.04-client-side/
├── README.md                  # This file
├── ARCHITECTURE.md            # Technical architecture documentation
├── INSTALLATION.md            # Step-by-step installation guide
├── MODIFICATIONS.md           # Changes from v1.03 (for developers)
├── THEME_DESIGNER_GUIDE.md    # For graphic designers customizing colors
├── CSS_VARIABLES.txt          # Pasteable CSS for WA Custom CSS
├── widget-member.html         # Complete widget (paste into WA)
├── builder/                   # Interactive widget builder
│   ├── README.md              # Builder documentation
│   ├── index.html             # Builder interface
│   └── widget-core-slim.html  # Widget core (client-side only)
└── orgs/
    └── sbnc/
        └── config.json        # SBNC-specific configuration
```

## Auto Theme Detection

ClubCalendar automatically inherits colors from your Wild Apricot theme:

- **Primary color**: Detected from buttons on the page
- **Accent color**: Detected from link colors
- **Text color**: Detected from body text

No configuration needed for basic theming. For custom colors, see `THEME_DESIGNER_GUIDE.md`.

## Quick Start

1. Get WA API credentials (Account ID and Client ID)
2. Create a members-only page in Wild Apricot
3. Add a Custom HTML gadget
4. Paste contents of `widget-member.html`
5. Update `waClientId` in the config section
6. (Optional) Add CSS_VARIABLES.txt to WA Custom CSS for theming

See `INSTALLATION.md` for detailed instructions.

## Requirements

- Wild Apricot account with admin access
- API Application configured in WA Settings
- Members-only page for hosting the widget

## Compatibility

- Requires logged-in WA member
- Works in all modern browsers
- Mobile-responsive design
- No external dependencies after FullCalendar loads

## Version History

- **v1.04** (2026-01-03): Client-side Member API edition
- **v1.03** (2026-01-02): External server edition with iframe
- **v1.02** (2026-01-01): Inline widget with external server
- **v1.01** (2025-12-30): Initial release
