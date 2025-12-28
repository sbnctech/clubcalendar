# ClubCalendar Technical Architecture

## Overview

ClubCalendar is a fully self-contained calendar widget for Wild Apricot (WA) that provides enhanced event discovery through rich filtering, search, and at-a-glance availability information. It runs entirely within WA's Custom HTML Gadget environment with no external server dependencies.

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Wild Apricot Page                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Custom HTML Gadget Container                 │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │              ClubCalendar Widget                     │ │  │
│  │  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐ │ │  │
│  │  │  │   Config   │  │  WA API     │  │  FullCalendar│ │ │  │
│  │  │  │   Layer    │  │  Client     │  │  (CDN)       │ │ │  │
│  │  │  └────────────┘  └─────────────┘  └──────────────┘ │ │  │
│  │  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐ │ │  │
│  │  │  │  Filters   │  │  Tag Engine │  │  Renderer    │ │ │  │
│  │  │  └────────────┘  └─────────────┘  └──────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Fallback: WA Native Calendar (hidden)            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

The widget is a single self-contained HTML file (~2,400 lines):

```
┌────────────────────────────────────────┐
│  <script> CLUBCALENDAR_CONFIG          │  ← User configuration
├────────────────────────────────────────┤
│  <style>                               │  ← All CSS (scoped with clubcal- prefix)
├────────────────────────────────────────┤
│  <div id="clubcalendar">               │  ← Container element
├────────────────────────────────────────┤
│  <script> Main IIFE                    │  ← All JavaScript
│    ├── DEFAULT_CONFIG                  │
│    ├── Config merger (mergeConfig)     │
│    ├── WA API Client                   │
│    ├── Tag derivation engine           │
│    ├── Filter logic                    │
│    ├── FullCalendar integration        │
│    ├── Event card renderer             │
│    ├── My Events tab                   │
│    ├── Fallback handler                │
│    └── Init & bootstrapping            │
└────────────────────────────────────────┘
```

---

## FullCalendar Integration

### Library Loading

FullCalendar is loaded from jsDelivr CDN:
- `@fullcalendar/core` - Core library
- `@fullcalendar/daygrid` - Month view plugin
- `@fullcalendar/timegrid` - Week/day view plugin
- `@fullcalendar/list` - List view plugin

### Initialization

```javascript
const calendar = new FullCalendar.Calendar(el, {
    initialView: CONFIG.defaultView,  // dayGridMonth, timeGridWeek, listMonth
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listMonth'
    },
    events: processedEvents,
    eventClick: handleEventClick,
    eventDidMount: customizeEventElement
});
```

### Event Transformation

WA API events are transformed to FullCalendar format:

```javascript
// WA API format
{ Id, Name, StartDate, EndDate, Location, AccessLevel, ... }

// FullCalendar format
{ id, title, start, end, classNames, extendedProps: { ...waEvent, tags } }
```

---

## WA API Integration

### Authentication Flow

1. Widget checks if user is logged in via `/contacts/me` endpoint
2. If authenticated, `memberConfig` is merged into base config
3. If guest, `publicConfig` is merged into base config
4. API calls use session cookie (automatic with WA)

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/accounts/{id}/contacts/me` | Check login status, get user info |
| `/accounts/{id}/events` | Fetch all events |
| `/accounts/{id}/eventregistrations` | Get user's registrations |

### Rate Limiting & Caching

- Events are fetched once on page load
- Filtering is done client-side (no additional API calls)
- Registration check happens once for "My Events" tab

---

## Tag Derivation Engine

### Auto-Tag Rules

Tags are automatically derived from event properties:

```javascript
const autoTagRules = [
    // Time-based
    { check: isWeekend, tag: 'day:weekend' },
    { check: isMorning, tag: 'time:morning' },
    { check: isAfternoon, tag: 'time:afternoon' },
    { check: isEvening, tag: 'time:evening' },

    // Availability-based
    { check: isSoldOut, tag: 'availability:sold-out' },
    { check: hasOpenings, tag: 'availability:has-openings' },

    // Cost-based
    { check: isFree, tag: 'cost:free' },

    // Access-based
    { check: isPublic, tag: 'public-event' }
];
```

### Custom Tag Rules (Config)

Operators can define pattern-based rules:

```javascript
autoTagRules: [
    { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
    { type: 'name-contains', pattern: 'Wine', tag: 'activity:wine' }
]
```

---

## Filter System

### Quick Filters (Toggles)

- Weekend, Has Openings, After Hours, Free, Public
- Multiple can be active (AND logic)

### Dropdown Filters

- Committee, Activity, Price, Event Type, Recurring, Venue, Tags
- Single selection per dropdown

### Search

- Full-text search across event titles
- Real-time filtering as user types
- Debounced for performance

### Filter State

```javascript
const currentFilters = {
    quickFilters: [],      // ['weekend', 'openings']
    committee: null,       // 'happy-hikers'
    activity: null,        // 'wine'
    price: null,           // 'free' | 'paid'
    search: '',            // 'book club'
    dateRange: null        // { start, end }
};
```

---

## Auth-Based Rendering (Option A)

### Single Page, Dual Config

The widget supports different configurations for guests vs members:

```javascript
window.CLUBCALENDAR_CONFIG = {
    // Base config (applies to all)
    headerTitle: 'Club Events',
    showFilters: true,

    // Applied when NOT logged in
    publicConfig: {
        showMyEvents: false,
        quickFilters: { public: false }
    },

    // Applied when logged in
    memberConfig: {
        showMyEvents: true
    }
};
```

### Config Merge Function

```javascript
function mergeConfig(base, overrides) {
    const result = { ...base };
    for (const key of Object.keys(overrides)) {
        if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
            result[key] = { ...result[key], ...overrides[key] };
        } else {
            result[key] = overrides[key];
        }
    }
    return result;
}
```

---

## Fallback System

### Strategy

If any error occurs, the widget activates a fallback:

1. Hides ClubCalendar container
2. Shows pre-placed WA Calendar widget (if present)
3. Or displays a friendly error message with link to events list

### Implementation

```javascript
function showFallback(errorMessage) {
    log('FALLBACK', 'Activating:', errorMessage);

    // Hide ClubCalendar
    document.querySelector(CONFIG.container).style.display = 'none';

    // Show WA Calendar if present
    const fallback = document.getElementById(CONFIG.fallbackContainerId);
    if (fallback) {
        fallback.style.display = 'block';
        return;
    }

    // Otherwise show error message
    showErrorMessage();
}
```

---

## WA Gadget Constraints

The widget is designed to comply with WA's Custom HTML Gadget restrictions:

### Constraints Followed

| Constraint | Implementation |
|------------|---------------|
| No ES modules | Uses IIFE pattern |
| No eval/new Function | Static code only |
| No inline event handlers | Delegated event listeners |
| CSS isolation | All classes prefixed `clubcal-` or `clubcalendar-` |
| Whitelisted CDNs only | FullCalendar from jsDelivr |
| Strict mode | `'use strict'` in IIFE |
| DOM ready handling | Checks `document.readyState` |

### Example: Delegated Event Handlers

```javascript
// Instead of onclick="..." (stripped by WA)
container.addEventListener('click', (e) => {
    const card = e.target.closest('.clubcal-event-card[data-event-url]');
    if (card) window.open(card.dataset.eventUrl, '_blank');
});
```

---

## Testing

### Unit Tests (638 tests)

| Category | Tests | Purpose |
|----------|-------|---------|
| Core | 90 | Config, init, basic operations |
| Tag Derivation | 82 | Auto-tagging, custom rules |
| Boundaries | 67 | Edge cases, limits |
| Theme/CSS | 57 | Color generation, contrast |
| Event Combinations | 43 | Multi-factor scenarios |
| Filter Combinations | 38 | Complex filter states |
| Config Variations | 30 | Different config shapes |
| Search | 29 | Text search behavior |
| Edge Cases | 40 | Unusual inputs |
| New Filters | 34 | New filter features |
| WA Constraints | 21 | Gadget compliance |
| Fallback | 15 | Error handling |

### E2E Tests (14 tests)

| Test | Purpose |
|------|---------|
| Widget loads without errors | Console error check |
| Inline handlers stripped | Delegated events work |
| Widget structure | Container renders |
| Header displays | Title visible |
| CSS prefixed | No global leaks |
| Filter clicks | Toggle behavior |
| Tab switching | Navigation works |
| Guest mode | publicConfig applied |
| Member mode | memberConfig applied |
| Fallback on API failure | Graceful degradation |
| Event card clicks | Links work |
| Keyboard navigation | A11y support |
| Load performance | Under 10s |
| No memory leaks | Multiple reloads safe |

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

---

## Coding Standards

### JavaScript

- ES5 compatible (no arrow functions in output, though source may use them)
- Strict mode enabled
- No global namespace pollution (IIFE)
- Defensive coding with try/catch
- XSS protection via `textContent` or `escapeHtml()`

### CSS

- All classes prefixed with `clubcal-` or `clubcalendar-`
- No bare element selectors
- CSS custom properties for theming
- Mobile-first responsive design

### HTML

- Semantic markup where possible
- ARIA attributes for accessibility
- No inline event handlers
- Data attributes for JavaScript hooks

---

## Security Considerations

- No API keys in client code (session auth only)
- User content escaped before rendering
- No `eval()` or `new Function()`
- No `innerHTML` with untrusted content
- Config validation before use

---

## Performance

- Single file load (no round trips)
- FullCalendar loaded from CDN (cached)
- Client-side filtering (no API calls after init)
- Minimal DOM manipulation
- Delegated event listeners

---

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+ (Chromium)
- No IE11 support (FullCalendar requirement)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-26 | 1.0 | Initial architecture document |
| 2024-12-26 | 1.1 | Added publicConfig/memberConfig pattern |
| 2024-12-26 | 1.2 | Added WA constraint compliance tests |
