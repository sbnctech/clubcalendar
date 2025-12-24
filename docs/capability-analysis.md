# ClubCalendar Capability Analysis

## Rubric Requirements vs Implementation Status

This document compares the original requirements from the event calendar improvements rubric against what has been implemented in ClubCalendar.

---

## Implemented Features

| Requirement | Status | Implementation Notes |
|-------------|--------|---------------------|
| Show sold out vs open | **Complete** | Events display "Sold Out", "X spots left", or spot count. Visual badges on cards. |
| Show # open slots | **Complete** | Displays available spots on event cards and in list view. |
| Filter on committees | **Complete** | Dropdown filter populated from event title prefixes (configurable). |
| Color coding/legend | **Complete** | Time-of-day color coding (Morning/Afternoon/Evening) with legend. |
| Price indicator | **Complete** | Yelp-style pricing ($, $$, $$$, $$$$, Free) displayed on cards. |
| Find events with text search | **Complete** | Full-text search across name, description, and location. |
| Save filter preferences | **Complete** | localStorage persistence for filters and view (30-day expiry). |
| Date range filter | **Complete** | From/To date inputs for filtering event date range. |
| "Coming Soon" badge | **Complete** | Shows "Opens in X days" for events with future registration start dates. |
| Filter by activity type | **Complete** | Dropdown for Physical, Social, Food & Drink, Arts, Educational, etc. |
| Filter by event type | **Complete** | Dropdown for Workshop, Tasting, Trip, Hike, Happy Hour, etc. |
| Filter by recurring | **Complete** | Dropdown for Weekly, Monthly, Daily events. |
| Filter by venue type | **Complete** | Dropdown for Outdoor events. |
| Filter by price range | **Complete** | Dropdown for Free, Under $25, Under $50, Under $100. |
| Quick filters | **Complete** | Toggle buttons for Weekend, Has Openings, After Hours, Public. |
| My Events tab | **Complete** | Shows registered events, waitlist, and past events for logged-in users. |
| List view parity | **Complete** | List view shows same rich info as calendar popups. |
| Manual tags display | **Complete** | Manual WA tags shown on event cards (configurable). |
| Tags dropdown filter | **Complete** | Filter by manual tags from events. |

---

## Not Yet Implemented

| Requirement | Status | Reason |
|-------------|--------|--------|
| Show # people on waitlist | **Possible but costly** | WA Events API doesn't include waitlist count directly. Would require querying `/eventregistrations?eventId={id}` for each event and counting registrations with waitlist status. This adds one API call per event, which may be slow for calendars with many events. Could be implemented as an optional feature with performance trade-off. |

---

## Configuration Flexibility

All features can be enabled/disabled via configuration:

```javascript
window.CLUBCALENDAR_CONFIG = {
    // Quick filter toggles
    quickFilters: {
        weekend: true,
        openings: true,
        afterhours: true,
        free: false,
        public: true
    },

    // Dropdown filter toggles
    dropdownFilters: {
        committee: true,
        activity: true,
        price: true,
        eventType: true,
        recurring: true,
        venue: true,
        tags: true
    },

    // Title parsing (for non-SBNC orgs)
    titleParsing: {
        enabled: false  // Disable if you don't use "Committee: Title" format
    }
};
```

---

## Visual Features Summary

| Feature | Visual Element |
|---------|---------------|
| Availability | Badge: "Sold Out" (red), "3 spots left" (orange), "25 spots" (green) |
| Price | Badge: "Free", "$", "$$", "$$$", "$$$$" |
| Time of day | Colored dot: Morning (yellow), Afternoon (blue), Evening (purple) |
| Registration status | Badge: "Opens in 5 days" (amber) |
| Public events | Badge: "Public" indicator |
| User registration | Badge: "Registered", "Waitlist", "Attended" |

---

## Data Sources

| Feature | Data Source |
|---------|-------------|
| Event details | Wild Apricot Events API |
| Pricing | RegistrationTypes.BasePrice from WA API |
| Availability | RegistrationsLimit - ConfirmedRegistrationsCount |
| Committee | Parsed from event name prefix (configurable) |
| Activity type | Derived from committee name mapping |
| Event type | Derived from keywords in event title |
| Tags | WA event Tags field + auto-derived tags |
