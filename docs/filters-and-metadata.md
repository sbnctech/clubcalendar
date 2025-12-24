# ClubCalendar Filters and Metadata Guide

This document explains how filters work in ClubCalendar, what metadata is required for each filter, and how derived fields are automatically generated.

---

## Overview

ClubCalendar uses three types of data to power its filtering system:

1. **Wild Apricot API fields** - Data that comes directly from the WA event record
2. **Title-packed metadata** - Information encoded in event titles (e.g., "Committee: Event Name")
3. **Derived fields** - Data automatically calculated from other fields

**Key principle:** Every filter can be disabled in configuration. If you don't want to maintain certain metadata, simply turn off that filter.

---

## Filter Reference

### Quick Filters

| Filter | Data Source | Metadata Required | How to Disable |
|--------|-------------|-------------------|----------------|
| **Weekend** | Derived | None - calculated from StartDate | `quickFilters: { weekend: false }` |
| **Has Openings** | WA API | Set RegistrationsLimit in WA | `quickFilters: { openings: false }` |
| **After Hours** | Derived | None - calculated from StartDate (5pm+) | `quickFilters: { afterhours: false }` |
| **Free** | WA API | Set pricing in RegistrationTypes | `quickFilters: { free: false }` |
| **Public** | WA API | Set AccessLevel = "Public" in WA | `quickFilters: { public: false }` |

### Dropdown Filters

| Filter | Data Source | Metadata Required | How to Disable |
|--------|-------------|-------------------|----------------|
| **Committee** | Title parsing | Use "Committee: Title" format | `dropdownFilters: { committee: false }` |
| **Activity** | Derived from committee | Use recognized committee names | `dropdownFilters: { activity: false }` |
| **Price** | WA API | Set pricing in RegistrationTypes | `dropdownFilters: { price: false }` |
| **Event Type** | Derived from title | Include keywords like "Workshop", "Hike" | `dropdownFilters: { eventType: false }` |
| **Recurring** | Derived from title | Include "Weekly", "Monthly", or "Daily" | `dropdownFilters: { recurring: false }` |
| **Venue** | Derived from name/location | Include words like "Park", "Beach", "Trail" | `dropdownFilters: { venue: false }` |
| **Tags** | WA API | Add tags to events in WA | `dropdownFilters: { tags: false }` |
| **Date Range** | WA API | None - uses StartDate | `dropdownFilters: { dateRange: false }` |

---

## Title Packing Format

SBNC uses a "title packing" convention where event titles follow this format:

```
Committee Name: Event Title
```

**Examples:**

- `Happy Hikers: Morning Walk at Douglas Preserve`
- `Wine Appreciation: Monthly Tasting - Italian Wines`
- `Games!: Board Game Night`
- `TGIF: Beach Happy Hour`

### What Title Packing Enables

When you use this format, ClubCalendar can:

1. **Extract the committee name** for the Committee dropdown filter
2. **Derive the activity type** based on known committee-to-activity mappings
3. **Display a cleaner title** (just the part after the colon) on event cards

### Configuration Options

```javascript
titleParsing: {
    enabled: true,           // Set to false if you don't use this format
    separator: ':',          // Character that separates committee from title
    maxSeparatorPosition: 30, // How far into title to look for separator
    defaultCategory: 'General', // Fallback when no prefix found
    stripChars: '*-()'       // Characters to remove from committee name
}
```

### For Organizations Without Title Packing

If your organization doesn't use the "Committee: Title" format, simply disable title parsing:

```javascript
titleParsing: { enabled: false }
```

This will:

- Display full event titles as-is
- Hide the Committee dropdown (nothing to filter by)
- Disable activity type derivation (since it depends on committee names)

---

## Derived Fields Reference

These fields are automatically calculated - no manual metadata entry required.

### Time-Based Derivations

| Derived Field | Source | Logic |
|--------------|--------|-------|
| Time of Day | StartDate | Before 12pm = Morning, 12-5pm = Afternoon, After 5pm = Evening |
| Weekend | StartDate | Saturday or Sunday = true |
| After Hours | StartDate | Start time >= 5pm = true |

### Availability Derivations

| Derived Field | Source | Logic |
|--------------|--------|-------|
| Spots Available | RegistrationsLimit - ConfirmedRegistrationsCount | Null if no limit set |
| Is Full | spotsAvailable === 0 | True when sold out |
| Availability Status | spotsAvailable | 0 = "Sold Out", 1-5 = "Limited", 6+ = "Open", null = "Unlimited" |

### Price Derivations

| Derived Field | Source | Logic |
|--------------|--------|-------|
| Min Price | RegistrationTypes[].BasePrice | Lowest price across all registration types |
| Is Free | minPrice === 0 | True for free events |
| Price Indicator | minPrice | Free, $(<$25), $$($25-49), $$$($50-99), $$$$($100+) |

### Activity Type Derivation

Activity type is derived from the **committee name** (the part before the colon). The mapping:

| Committee Prefix | Activity Type |
|-----------------|---------------|
| Happy Hikers, Cycling, Golf | Physical/Fitness |
| TGIF, Pop-Up, Out to Lunch | Social |
| Epicurious, Wine Appreciation, Beer Lovers | Food & Drink |
| Performing Arts, Arts, Local Heritage | Arts & Culture |
| Current Events, Book Clubs | Educational |
| Games!, Games | Games |
| Wellness | Wellness |
| Garden | Garden |

**Note:** If your committee names differ, this derivation won't work. Either:

- Use recognized committee names, OR
- Disable the Activity filter: `dropdownFilters: { activity: false }`

### Event Type Derivation

Event type is derived from **keywords in the event title** (after the colon):

| Keyword | Event Type Tag |
|---------|---------------|
| workshop | type:workshop |
| tasting | type:tasting |
| day trip, tour | type:trip |
| hike | type:hike |
| walk | type:walk |
| happy hour | type:happy-hour |
| game night | type:game-night |
| discussion | type:discussion |
| lecture | type:lecture |
| class | type:class |
| performance, concert, show | type:performance |

**Example:** "Wine Appreciation: **Tasting** - Italian Wines" would get `type:tasting`

### Recurring Derivation

Derived from keywords anywhere in the event name:

| Keyword | Tag |
|---------|-----|
| weekly | recurring:weekly |
| monthly | recurring:monthly |
| daily | recurring:daily |

### Venue Type Derivation

Derived from keywords in event name OR location field:

| Keywords | Tag |
|----------|-----|
| park, beach, trail, garden, outdoor, preserve, hike | venue:outdoor |

---

## Auto-Generated Tags

ClubCalendar automatically generates internal tags for filtering. These tags are not displayed to users but power the filter system.

| Tag Prefix | Purpose | Example |
|------------|---------|---------|
| `time:` | Time of day | `time:morning`, `time:afternoon`, `time:evening` |
| `day:` | Day of week | `day:weekend` |
| `availability:` | Capacity status | `availability:open`, `availability:limited`, `availability:full` |
| `cost:` | Price category | `cost:free`, `cost:under-25`, `cost:under-50` |
| `activity:` | Activity category | `activity:physical`, `activity:social` |
| `committee:` | Committee name | `committee:happy-hikers` |
| `type:` | Event format | `type:workshop`, `type:hike` |
| `recurring:` | Recurrence pattern | `recurring:weekly`, `recurring:monthly` |
| `venue:` | Venue type | `venue:outdoor` |
| `public-event` | Public access | Applied when AccessLevel = "Public" |

---

## Minimal Configuration Example

For an organization that wants minimal metadata requirements:

```javascript
window.CLUBCALENDAR_CONFIG = {
    // Disable title parsing - use full event names as-is
    titleParsing: { enabled: false },

    // Only show filters that work without metadata
    quickFilters: {
        weekend: true,      // Works - derived from date
        openings: true,     // Works - uses WA registration data
        afterhours: true,   // Works - derived from date
        free: true,         // Works - uses WA pricing
        public: true        // Works - uses WA access level
    },

    dropdownFilters: {
        committee: false,   // Disabled - requires title packing
        activity: false,    // Disabled - requires committee names
        eventType: false,   // Disabled - requires keywords in titles
        recurring: false,   // Disabled - requires keywords in titles
        venue: false,       // Disabled - requires keywords
        price: true,        // Works - uses WA pricing
        tags: true,         // Works - uses WA tags
        dateRange: true     // Works - uses WA dates
    }
};
```

This configuration requires **zero special formatting** in event titles while still providing useful filtering by date, price, availability, and any manually-added WA tags.
