# ClubCalendar Technical Architecture

This document provides a comprehensive technical overview of the ClubCalendar widget, including its architecture, Wild Apricot integration, workflows, testing strategy, and styling system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Wild Apricot Integration](#wild-apricot-integration)
4. [Data Flow](#data-flow)
5. [Open Source Dependencies](#open-source-dependencies)
6. [Configuration System](#configuration-system)
7. [CSS and Styling](#css-and-styling)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Workflow](#deployment-workflow)

---

## Architecture Overview

ClubCalendar is a **self-contained JavaScript widget** designed to run entirely within a Wild Apricot page. It requires no external server infrastructure.

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Single HTML file** | Can be pasted directly into WA's Custom HTML gadget |
| **No build step required** | Simplifies deployment for non-technical users |
| **CDN-loaded dependencies** | No need to host JavaScript libraries |
| **Pure functions in core.ts** | Enables unit testing without DOM |
| **CSS-in-JS approach** | Styles are injected at runtime, avoiding external CSS files |

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Wild Apricot Page                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              ClubCalendar Widget                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │  │
│  │  │   Config    │  │  WA API     │  │  FullCalendar│   │  │
│  │  │   System    │  │  Client     │  │  (CDN)       │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘   │  │
│  │         │                │                │           │  │
│  │         v                v                v           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              Core Logic Layer                    │  │  │
│  │  │  • Event transformation    • Tag derivation      │  │  │
│  │  │  • Filter application      • Price calculation   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                          │                            │  │
│  │                          v                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                 UI Layer                         │  │  │
│  │  │  • Calendar rendering   • Filter controls        │  │  │
│  │  │  • Event cards          • Active filter chips    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
clubcalendar/
├── widget/
│   ├── clubcalendar-wa-inline.html   # Main widget (paste into WA)
│   ├── src/
│   │   └── core.ts                   # Pure functions for testing
│   ├── preview.html                  # Local preview page
│   └── wa-embed-example.html         # Example WA embed code
│
├── tests/
│   ├── unit/                         # Vitest unit tests
│   │   ├── core.test.ts              # Core function tests
│   │   ├── tag-derivation.test.ts    # Tag generation tests
│   │   ├── filter-combinations.test.ts
│   │   ├── contrast.test.ts          # Accessibility tests
│   │   └── ...
│   ├── mocks/
│   │   └── wa-events.ts              # Mock WA API data
│   └── admin/                        # E2E tests (Playwright)
│
├── docs/
│   ├── capability-analysis.md
│   ├── filters-and-metadata.md
│   └── technical-architecture.md     # This file
│
└── package.json                      # Dev dependencies only
```

---

## Wild Apricot Integration

### How It Works

1. **Embedding**: The widget HTML is pasted into a WA "Custom HTML" content gadget
2. **Authentication**: Uses WA's native session - if user is logged into WA, widget detects this
3. **API Access**: Calls WA's REST API v2 directly from the browser using the page's auth context
4. **No CORS issues**: Since requests originate from the WA domain, same-origin policy applies

### WA API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/sys/api/v2/accounts/{id}/contacts/me` | Get current logged-in user |
| `/sys/api/v2/accounts/{id}/events` | Fetch events with filtering |
| `/sys/api/v2/accounts/{id}/eventregistrations` | Get user's event registrations |

### API Client Implementation

```javascript
const WaApi = {
    async call(endpoint, options = {}) {
        const url = `/sys/api/v2/accounts/${CONFIG.waAccountId}${endpoint}`;
        const headers = {
            'Accept': 'application/json',
            'clientId': CONFIG.waClientId  // Required for API access
        };

        const response = await fetch(url, { ...options, headers });
        return response.json();
    },

    async getCurrentUser() {
        return this.call('/contacts/me');
    },

    async getEvents(includePastDays = 0) {
        // Paginated fetching with includeEventDetails for pricing
        return this.call(`/events?$filter=StartDate ge ${date}&includeEventDetails=true`);
    }
};
```

### Required WA Configuration

1. **API Client ID**: Create in WA Admin → Settings → Authorized Applications
2. **Account ID**: Found in WA Admin → Settings → Account Details
3. **Content Gadget**: Add a "Custom HTML" gadget to your page

---

## Data Flow

### Initialization Workflow

```
1. Page Load
   │
   ├─→ Parse CONFIG from window.CLUBCALENDAR_CONFIG
   │
   ├─→ Merge with DEFAULT_CONFIG
   │
   ├─→ Load FullCalendar from CDN
   │
   ├─→ Detect WA page theme (fonts, colors)
   │
   ├─→ Inject CSS styles
   │
   ├─→ Build widget HTML structure
   │
   ├─→ Check for logged-in user (WaApi.getCurrentUser)
   │   │
   │   ├─→ If logged in: Apply memberConfig overrides
   │   │                  Fetch user's registrations
   │   │
   │   └─→ If not: Apply publicConfig overrides
   │
   ├─→ Fetch events from WA API (paginated)
   │
   ├─→ Transform events (add derived fields, tags)
   │
   ├─→ Load saved preferences from localStorage
   │
   ├─→ Initialize FullCalendar
   │
   └─→ Apply filters and render
```

### Event Transformation Pipeline

```
WA API Event
    │
    ├─→ Extract base fields (name, date, location, etc.)
    │
    ├─→ Calculate pricing from RegistrationTypes
    │
    ├─→ Calculate availability (limit - confirmed)
    │
    ├─→ Apply auto-tag rules (name-prefix matching)
    │
    ├─→ Derive time-based tags (morning/afternoon/evening, weekend)
    │
    ├─→ Derive availability tags (open/limited/full)
    │
    ├─→ Derive cost tags (free/under-25/under-50/etc.)
    │
    ├─→ Derive activity type from committee name
    │
    ├─→ Derive event type from title keywords
    │
    ├─→ Derive recurring pattern from title
    │
    ├─→ Derive venue type from name/location
    │
    ├─→ Detect public event status
    │
    └─→ TransformedEvent object
```

### Filter Application

```javascript
function applyFilters() {
    filteredEvents = allEvents.filter(event => {
        // Quick filters (OR logic within, AND with other filters)
        if (quickFilters.length > 0) {
            const matchesAny = quickFilters.some(f => FILTER_RULES[f](event));
            if (!matchesAny) return false;
        }

        // Dropdown filters (AND logic)
        if (committee && extractCommittee(event.name) !== committee) return false;
        if (activity && !event.tags.includes(`activity:${activity}`)) return false;
        if (price && !matchesPriceFilter(event, price)) return false;
        if (eventType && !event.tags.includes(`type:${eventType}`)) return false;
        // ... etc

        // Text search
        if (search && !matchesSearch(event, search)) return false;

        // Date range
        if (dateFrom && new Date(event.startDate) < new Date(dateFrom)) return false;
        if (dateTo && new Date(event.startDate) > new Date(dateTo)) return false;

        return true;
    });

    updateCalendar();
    renderActiveFilterChips();
    savePreferences();
}
```

---

## Open Source Dependencies

### Runtime Dependencies (CDN-loaded)

| Library | Version | Purpose | CDN URL |
|---------|---------|---------|---------|
| **FullCalendar** | 6.1.8 | Calendar UI component | jsdelivr.net |

FullCalendar is loaded dynamically at runtime:

```javascript
function loadFullCalendar() {
    return new Promise((resolve, reject) => {
        if (window.FullCalendar) { resolve(); return; }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
```

### Development Dependencies

| Package | Purpose |
|---------|---------|
| **vitest** | Unit test runner |
| **@playwright/test** | End-to-end testing |
| **serve** | Local development server |

---

## Configuration System

### Configuration Hierarchy

```
1. DEFAULT_CONFIG (hardcoded defaults)
       ↓
2. window.CLUBCALENDAR_CONFIG (user overrides)
       ↓
3. memberConfig / publicConfig (runtime overrides based on login state)
       ↓
4. localStorage preferences (saved filter state)
```

### Configuration Merging

```javascript
// Initial merge
let CONFIG = Object.assign({}, DEFAULT_CONFIG, window.CLUBCALENDAR_CONFIG || {});

// After user detection
if (currentUser) {
    CONFIG = mergeConfig(CONFIG, CONFIG.memberConfig);
} else {
    CONFIG = mergeConfig(CONFIG, CONFIG.publicConfig);
}

// Deep merge for nested objects
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

### Full Configuration Reference

```javascript
const DEFAULT_CONFIG = {
    // Required
    waAccountId: null,
    waClientId: null,

    // Display options
    container: '#clubcalendar',
    defaultView: 'dayGridMonth',
    showFilters: true,
    showHeader: true,
    headerTitle: 'Club Events',
    showMyEvents: true,
    showEventTags: true,
    showEventDots: true,

    // Colors
    primaryColor: '#2c5aa0',
    accentColor: '#d4a800',

    // Title parsing
    titleParsing: {
        enabled: true,
        separator: ':',
        maxSeparatorPosition: 30,
        defaultCategory: 'General',
        stripChars: '*-()'
    },

    // Filter visibility
    quickFilters: {
        weekend: true,
        openings: true,
        afterhours: true,
        free: false,
        public: true
    },
    dropdownFilters: {
        committee: true,
        activity: true,
        price: true,
        eventType: true,
        recurring: true,
        venue: true,
        tags: true,
        dateRange: true
    },

    // Tag handling
    hiddenTags: [],
    autoTagRules: [],

    // Member/public overrides
    memberConfig: {},
    publicConfig: {},

    // Theme/styling
    autoTheme: true,
    stylePreset: 'default',
    cssVars: {},
    customCSS: ''
};
```

---

## CSS and Styling

### Styling Architecture

ClubCalendar uses a **three-layer CSS system**:

```
1. CSS Variables (theming layer)
       ↓
2. Base CSS (component styles using variables)
       ↓
3. Custom CSS (user overrides)
```

### CSS Variable System

CSS variables are generated at runtime and injected into `:root`:

```javascript
const cssVarDeclarations = `
:root {
  --clubcal-primary: ${primaryColor};
  --clubcal-accent: ${accentColor};
  --clubcal-heading-font: ${headingFont};
  --clubcal-body-font: ${bodyFont};
  --clubcal-body-color: ${bodyColor};
  --clubcal-card-radius: ${cardRadius};
  --clubcal-button-radius: ${buttonRadius};
  --clubcal-card-shadow: ${cardShadow};
  --clubcal-card-border: ${cardBorder};
}`;
```

### Theme Auto-Detection

When `autoTheme: true`, the widget samples styles from existing WA page elements:

```javascript
const THEME_SAMPLE_SELECTORS = {
    heading: ['h1', 'h2', '.gadgetHeader', '.pageTitle'],
    body: ['body', '.contentArea', 'main'],
    button: ['.primaryButton', 'button.primary', '.btn-primary'],
    card: ['.panel', '.card', '.contentBox']
};

function detectThemeStyles() {
    const detected = {};

    // Sample heading font from first matching element
    const heading = findFirstElement(THEME_SAMPLE_SELECTORS.heading);
    if (heading) {
        detected.headingFont = getComputedStyle(heading).fontFamily;
    }

    // Sample body text color
    const body = findFirstElement(THEME_SAMPLE_SELECTORS.body);
    if (body) {
        detected.bodyColor = getComputedStyle(body).color;
    }

    // ... etc
    return detected;
}
```

### Style Injection

All CSS is injected as a single `<style>` element:

```javascript
function injectStyles() {
    if (document.getElementById('clubcal-wa-styles')) return;

    const style = document.createElement('style');
    style.id = 'clubcal-wa-styles';
    style.textContent = cssVarDeclarations + baseCSS + CONFIG.customCSS;
    document.head.appendChild(style);
}
```

### Customization Options

**Option 1: CSS Variables**
```javascript
cssVars: {
    '--clubcal-primary': '#ff6600',
    '--clubcal-card-radius': '0px'
}
```

**Option 2: Custom CSS**
```javascript
customCSS: `
    .clubcal-event-card { border-left: 4px solid var(--clubcal-primary); }
    .clubcal-quick-filter { text-transform: uppercase; }
`
```

### FullCalendar Styling

FullCalendar's styles are overridden to match the widget theme:

```css
/* Time-of-day color coding */
.clubcal-event-morning { background-color: #ff9800 !important; }
.clubcal-event-afternoon { background-color: #42a5f5 !important; }
.clubcal-event-evening { background-color: #5c6bc0 !important; }
```

---

## Testing Strategy

### Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Test Pyramid                           │
│                                                             │
│                        ▲ E2E Tests                          │
│                       ╱ ╲ (Playwright)                       │
│                      ╱   ╲ - Page loads                      │
│                     ╱     ╲ - User flows                     │
│                    ╱───────╲                                │
│                   ╱ Unit Tests╲                              │
│                  ╱   (Vitest)   ╲                            │
│                 ╱ - Pure functions╲                          │
│                ╱ - Tag derivation   ╲                        │
│               ╱ - Filter logic       ╲                       │
│              ╱ - Price calculation    ╲                      │
│             ╱─────────────────────────╲                     │
│            ╱      602 unit tests        ╲                    │
│           ╱─────────────────────────────╲                   │
└─────────────────────────────────────────────────────────────┘
```

### Unit Testing Approach

**Key principle**: Extract pure functions into `core.ts` so they can be tested without a DOM.

```typescript
// widget/src/core.ts - Pure functions
export function deriveTimeOfDay(startDateStr: string): string | null {
    const hour = new Date(startDateStr).getHours();
    if (hour < 12) return 'time:morning';
    if (hour < 17) return 'time:afternoon';
    return 'time:evening';
}

export function extractPricing(waEvent: WaEvent): PricingInfo {
    // Pure calculation, no side effects
}

export function applyFilters(events, filters): TransformedEvent[] {
    // Pure filter function
}
```

### Test Categories

| Category | File | Tests | Purpose |
|----------|------|-------|---------|
| Core functions | core.test.ts | 90 | Basic function behavior |
| Tag derivation | tag-derivation.test.ts | 82 | All tag generation scenarios |
| Filter combinations | filter-combinations.test.ts | 38 | Multi-filter interactions |
| Event combinations | event-combinations.test.ts | 43 | Event property permutations |
| Edge cases | edge-cases.test.ts | 40 | Null/undefined/boundary values |
| Boundaries | boundaries.test.ts | 67 | Threshold values (e.g., price $24.99 vs $25.00) |
| Config variations | config-variations.test.ts | 30 | Different config combinations |
| Contrast/accessibility | contrast.test.ts | 92 | Color contrast ratios |
| Theme CSS | theme-css.test.ts | 57 | CSS generation |
| Search filter | search-filter.test.ts | 29 | Text search functionality |
| New filters | new-filters.test.ts | 34 | Recently added filters |

### Mock Data

Tests use realistic mock data matching WA API structure:

```typescript
// tests/mocks/wa-events.ts
export const paidWineEvent: WaEvent = {
    Id: 2,
    Name: 'Wine Appreciation: Monthly Tasting',
    StartDate: futureDate(14, 18, 0),  // 6pm, 2 weeks out
    AccessLevel: 'Restricted',
    RegistrationEnabled: true,
    RegistrationsLimit: 30,
    ConfirmedRegistrationsCount: 25,
    RegistrationTypes: [
        { Id: 1, Name: 'Member', BasePrice: 35 },
        { Id: 2, Name: 'Guest', BasePrice: 45 }
    ]
};
```

### Running Tests

```bash
# Unit tests (fast, no browser)
npm test

# Watch mode during development
npm run test:watch

# End-to-end tests (requires browser)
npm run test:e2e

# All tests
npm run test:all
```

---

## Deployment Workflow

### For SBNC (Current Setup)

```
1. Developer edits widget/clubcalendar-wa-inline.html

2. Run tests: npm test

3. Commit and push to GitHub

4. Copy updated HTML to WA Custom HTML gadget
   - WA Admin → Pages → [Calendar Page] → Edit
   - Find Custom HTML gadget
   - Paste entire file contents
   - Save and publish
```

### For Other Organizations

```
1. Fork the GitHub repository

2. Customize CLUBCALENDAR_CONFIG in the HTML:
   - waAccountId: Your WA account ID
   - waClientId: Your API client ID
   - titleParsing: { enabled: false } if not using SBNC format
   - Adjust filter visibility as needed

3. Paste into your WA Custom HTML gadget
```

### Version Control

The widget is versioned through Git. Key files:

- `widget/clubcalendar-wa-inline.html` - Production widget
- `widget/src/core.ts` - Testable core logic (not deployed directly)
- `docs/` - Documentation

### No Build Step Required

The widget is designed to work without compilation:

- JavaScript is ES6+ (supported by modern browsers)
- TypeScript in `core.ts` is for testing only
- No bundling, minification, or transpilation required for deployment

---

## Summary

ClubCalendar is architected for:

- **Simplicity**: Single-file deployment, no server required
- **Testability**: Pure functions extracted for 600+ unit tests
- **Flexibility**: Extensive configuration for different organizations
- **Integration**: Native WA API access, theme detection
- **Maintainability**: Clear separation of concerns, comprehensive documentation
