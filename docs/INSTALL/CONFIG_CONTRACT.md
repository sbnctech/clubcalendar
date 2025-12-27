# ClubCalendar Configuration Contract

This document defines the configuration contract for the ClubCalendar inline widget. It specifies allowed fields, default values, and validation rules.

---

> **For Non-Technical Admins**
>
> Configuration is a block of settings at the top of the widget code. You can safely edit values between the curly braces `{ }`. If you make a mistake, the widget will show a friendly error message telling you what to fix.

---

## Security Boundary

**The configuration MUST NOT contain:**

- API keys or secrets
- Authentication tokens
- Passwords or credentials
- Personal member data

All authentication happens automatically through the Wild Apricot session.

---

## Configuration Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `waAccountId` | string | Your Wild Apricot Account ID. Find in WA Admin → Settings → Account. |

### Display Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `headerTitle` | string | `"Club Events"` | Title shown at top of calendar. |
| `showHeader` | boolean | `true` | Show/hide the header bar. |
| `showFilters` | boolean | `true` | Show/hide the filter panel. |
| `showMyEvents` | boolean | `true` | Show "My Events" tab for logged-in members. |
| `defaultView` | string | `"dayGridMonth"` | Initial calendar view. Options: `"dayGridMonth"`, `"timeGridWeek"`, `"listMonth"`. |

### Theme Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `primaryColor` | string | `"#2c5aa0"` | Main accent color (hex format). |
| `accentColor` | string | `"#d4a800"` | Secondary accent color (hex format). |
| `stylePreset` | string | `"default"` | Visual style. Options: `"default"`, `"compact"`, `"minimal"`. |

### Audience Mode

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `audienceMode` | string | `"member"` | Who can see events. Options: `"public"`, `"member"`. |

- `"public"`: Shows only public events. No login required.
- `"member"`: Shows all events. Requires WA login.

### Filter Configuration

#### Quick Filters (Toggle Buttons)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `quickFilters.weekend` | boolean | `true` | Show "Weekend" filter button. |
| `quickFilters.openings` | boolean | `true` | Show "Has Openings" filter button. |
| `quickFilters.afterhours` | boolean | `true` | Show "After Hours" filter button. |
| `quickFilters.public` | boolean | `true` | Show "Public Events" filter button. |
| `quickFilters.free` | boolean | `false` | Show "Free" filter button. |

#### Dropdown Filters

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `dropdownFilters.committee` | boolean | `true` | Show Committee dropdown. |
| `dropdownFilters.activity` | boolean | `true` | Show Activity dropdown. |
| `dropdownFilters.price` | boolean | `true` | Show Price dropdown. |
| `dropdownFilters.eventType` | boolean | `true` | Show Event Type dropdown. |
| `dropdownFilters.recurring` | boolean | `true` | Show Recurring dropdown. |
| `dropdownFilters.venue` | boolean | `true` | Show Venue dropdown. |
| `dropdownFilters.tags` | boolean | `true` | Show Tags dropdown. |

### Tag Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `showEventTags` | boolean | `true` | Show tag badges on events. |
| `hiddenTags` | string[] | `[]` | Tags to hide from display. |
| `allowedTags` | string[] | `null` | If set, only show these tags. |

### Auto-Tagging Rules

Auto-tagging rules automatically add tags to events based on their title.

| Field | Type | Description |
|-------|------|-------------|
| `autoTagRules` | array | List of tagging rules. |

Each rule has:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Rule type: `"name-prefix"` or `"name-contains"`. |
| `pattern` | string | Text to match in event title. |
| `tag` | string | Tag to add when matched (format: `category:value`). |

### UI Labels (Customization)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `labels.noEvents` | string | `"No events found"` | Message when no events match filters. |
| `labels.loading` | string | `"Loading events..."` | Loading message. |
| `labels.error` | string | `"Unable to load events"` | Error message. |
| `labels.myEvents` | string | `"My Events"` | Tab label for registered events. |
| `labels.allEvents` | string | `"All Events"` | Tab label for all events. |

### Advanced Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `pastEventsVisible` | boolean | `false` | Show past events. |
| `pastEventsDays` | number | `14` | Days of past events to show. |
| `showEventDots` | boolean | `true` | Show dots on calendar dates with events. |
| `showWaitlistCount` | boolean | `false` | Show waitlist count for sold-out events. |

---

## Validation Rules

### String Fields

- `waAccountId`: Required. Must be numeric string (digits only).
- `headerTitle`: Optional. Max 100 characters.
- `primaryColor`, `accentColor`: Must be valid hex color (`#RRGGBB` or `#RGB`).
- `defaultView`: Must be one of: `dayGridMonth`, `timeGridWeek`, `listMonth`.
- `audienceMode`: Must be one of: `public`, `member`.
- `stylePreset`: Must be one of: `default`, `compact`, `minimal`.

### Boolean Fields

All boolean fields accept only `true` or `false` (not strings, not 0/1).

### Array Fields

- `hiddenTags`, `allowedTags`: Array of strings. Each string max 50 characters.
- `autoTagRules`: Array of rule objects. Max 100 rules.

### Auto-Tag Rules

- `type`: Must be `name-prefix` or `name-contains`.
- `pattern`: Required. Non-empty string, max 100 characters.
- `tag`: Required. Must match format `category:value` (letters, numbers, hyphens only).

---

## Error Messages

When validation fails, the widget shows a friendly error instead of crashing:

| Error | Message |
|-------|---------|
| Missing waAccountId | "Configuration error: waAccountId is required. Find it in WA Admin → Settings → Account." |
| Invalid color | "Configuration error: primaryColor must be a hex color like #2c5aa0" |
| Invalid view | "Configuration error: defaultView must be dayGridMonth, timeGridWeek, or listMonth" |
| Invalid rule | "Configuration error: autoTagRules[3] is invalid. Each rule needs type, pattern, and tag." |

---

## Complete Field Reference

```
CLUBCALENDAR_CONFIG = {
    // REQUIRED
    waAccountId: string,

    // DISPLAY
    headerTitle: string,
    showHeader: boolean,
    showFilters: boolean,
    showMyEvents: boolean,
    defaultView: "dayGridMonth" | "timeGridWeek" | "listMonth",

    // AUDIENCE
    audienceMode: "public" | "member",

    // THEME
    primaryColor: string (hex),
    accentColor: string (hex),
    stylePreset: "default" | "compact" | "minimal",

    // QUICK FILTERS
    quickFilters: {
        weekend: boolean,
        openings: boolean,
        afterhours: boolean,
        public: boolean,
        free: boolean
    },

    // DROPDOWN FILTERS
    dropdownFilters: {
        committee: boolean,
        activity: boolean,
        price: boolean,
        eventType: boolean,
        recurring: boolean,
        venue: boolean,
        tags: boolean
    },

    // TAGS
    showEventTags: boolean,
    hiddenTags: string[],
    allowedTags: string[] | null,

    // AUTO-TAGGING
    autoTagRules: [
        { type: string, pattern: string, tag: string }
    ],

    // UI LABELS
    labels: {
        noEvents: string,
        loading: string,
        error: string,
        myEvents: string,
        allEvents: string
    },

    // ADVANCED
    pastEventsVisible: boolean,
    pastEventsDays: number,
    showEventDots: boolean,
    showWaitlistCount: boolean
}
```

---

## Revision History

| Date | Change |
|------|--------|
| 2024-12-26 | Initial contract specification |
