/**
 * Club Events/Calendar Widget
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file contains the embeddable events/calendar widget for Santa Barbara
 * Newcomers Club. It is designed to be embedded in Wild Apricot pages.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  CODE ORGANIZATION - READ THIS FIRST                                   │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  This code has TWO distinct parts:                                     │
 * │                                                                         │
 * │  1. EXTERNAL LIBRARIES (loaded from CDN - we don't maintain these)     │
 * │     - FullCalendar: Calendar display and navigation                    │
 * │     - jQuery: DOM manipulation (may already be loaded by WA)           │
 * │                                                                         │
 * │  2. CLUBCALENDAR SHIM (this file - we maintain this code)                      │
 * │     Organized into three broad categories:                             │
 * │                                                                         │
 * │     A. SETTINGS (Sections 1-2) - What to show and how it looks         │
 * │        ├── Configuration: Default values, API URLs, feature flags      │
 * │        └── CSS Overrides: Styling to match WA theme                    │
 * │                                                                         │
 * │     B. DATA LAYER (Section 3) - Where data comes from                  │
 * │        └── API Integration: Fetches events from WA database            │
 * │                                                                         │
 * │     C. UI LAYER (Sections 4-6) - How it all works together             │
 * │        ├── Widget Integration: HTML, filters, calendar rendering       │
 * │        ├── Public API: External access points                          │
 * │        └── Initialization: Startup sequence                            │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  CODE ANALYSIS - Maintenance Guide                                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  SECTION BREAKDOWN (% of code, dependencies, stability)                │
 * │                                                                         │
 * │  ┌─────────────────────────────────────────────────────────────────┐   │
 * │  │ CATEGORY A: SETTINGS (~25% of code)                             │   │
 * │  │ Overall stability: HIGH - Changes rarely needed                 │   │
 * │  ├─────────────────────────────────────────────────────────────────┤   │
 * │  │                                                                 │   │
 * │  │ Section 1: Configuration                                        │   │
 * │  │   Lines: ~80 (~6%)                                              │   │
 * │  │   Dependencies: None                                            │   │
 * │  │   Stability: HIGH                                               │   │
 * │  │   Break risk: LOW - Only breaks if server URL changes           │   │
 * │  │   Reason to change: Server migration, new features              │   │
 * │  │                                                                 │   │
 * │  │ Section 2: CSS Overrides                                        │   │
 * │  │   Lines: ~250 (~19%)                                            │   │
 * │  │   Dependencies: None (pure CSS)                                 │   │
 * │  │   Stability: HIGH                                               │   │
 * │  │   Break risk: LOW - Visual only, won't break functionality      │   │
 * │  │   Reason to change: WA theme update, design refresh             │   │
 * │  │                                                                 │   │
 * │  └─────────────────────────────────────────────────────────────────┘   │
 * │                                                                         │
 * │  ┌─────────────────────────────────────────────────────────────────┐   │
 * │  │ CATEGORY B: DATA LAYER (~12% of code)                           │   │
 * │  │ Overall stability: MEDIUM - May need updates with backend       │   │
 * │  ├─────────────────────────────────────────────────────────────────┤   │
 * │  │                                                                 │   │
 * │  │ Section 3: API Integration                                      │   │
 * │  │   Lines: ~150 (~12%)                                            │   │
 * │  │   Dependencies: fetch API (browser built-in)                    │   │
 * │  │   Stability: MEDIUM                                             │   │
 * │  │   Break risk: MEDIUM - Breaks if API changes                    │   │
 * │  │   Reason to change: Backend API changes, new data fields        │   │
 * │  │   Watch for: Endpoint URL changes, response format changes      │   │
 * │  │                                                                 │   │
 * │  └─────────────────────────────────────────────────────────────────┘   │
 * │                                                                         │
 * │  ┌─────────────────────────────────────────────────────────────────┐   │
 * │  │ CATEGORY C: UI LAYER (~63% of code)                             │   │
 * │  │ Overall stability: MEDIUM - Core functionality lives here       │   │
 * │  ├─────────────────────────────────────────────────────────────────┤   │
 * │  │                                                                 │   │
 * │  │ Section 4: Widget Integration                                   │   │
 * │  │   Lines: ~600 (~47%)                                            │   │
 * │  │   Dependencies: FullCalendar, jQuery                            │   │
 * │  │   Stability: MEDIUM                                             │   │
 * │  │   Break risk: MEDIUM-HIGH                                       │   │
 * │  │   Reason to change: New filters, layout changes, lib updates    │   │
 * │  │   Watch for: Library version updates, API changes               │   │
 * │  │   Sub-sections:                                                 │   │
 * │  │     - Dependency Loading: LOW risk (stable CDN URLs)            │   │
 * │  │     - HTML Construction: LOW risk (pure string templates)       │   │
 * │  │     - Filter Logic: MEDIUM risk (ties to data & UI)             │   │
 * │  │     - Calendar Rendering: MEDIUM-HIGH (FullCalendar dependent)  │   │
 * │  │                                                                 │   │
 * │  │ Section 5: Public API                                           │   │
 * │  │   Lines: ~40 (~3%)                                              │   │
 * │  │   Dependencies: Internal functions only                         │   │
 * │  │   Stability: HIGH                                               │   │
 * │  │   Break risk: LOW - Simple function exports                     │   │
 * │  │   Reason to change: Adding new public methods                   │   │
 * │  │   IMPORTANT: Don't remove methods (external code may use them)  │   │
 * │  │                                                                 │   │
 * │  │ Section 6: Initialization                                       │   │
 * │  │   Lines: ~50 (~4%)                                              │   │
 * │  │   Dependencies: All other sections                              │   │
 * │  │   Stability: HIGH                                               │   │
 * │  │   Break risk: LOW - Simple orchestration                        │   │
 * │  │   Reason to change: New startup steps, loading order changes    │   │
 * │  │                                                                 │   │
 * │  └─────────────────────────────────────────────────────────────────┘   │
 * │                                                                         │
 * │  EXTERNAL LIBRARY RISK ASSESSMENT                                      │
 * │  ─────────────────────────────────────────────────────────────────────  │
 * │                                                                         │
 * │  FullCalendar (v6.x)                                                   │
 * │    Risk: MEDIUM - Active development, breaking changes between majors  │
 * │    Pinned to: Major version 6                                          │
 * │    Watch for: Options renamed, deprecated features                     │
 * │    Mitigation: Test after any version update                           │
 * │                                                                         │
 * │  jQuery (v3.x)                                                         │
 * │    Risk: LOW - Extremely stable, rarely has breaking changes           │
 * │    Pinned to: Major version 3 (auto-updates minors)                    │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @version 1.01
 * @author ClubCalendar
 */

(function() {
    'use strict';

/* ╔═══════════════════════════════════════════════════════════════════════════╗
   ║                                                                           ║
   ║                     EXTERNAL LIBRARIES DOCUMENTATION                      ║
   ║                                                                           ║
   ║  These libraries are loaded from CDN. We DO NOT maintain this code.      ║
   ║  Documentation links for reference when troubleshooting:                 ║
   ║                                                                           ║
   ║  FullCalendar (v6.x)                                                     ║
   ║  ─────────────────────────────────────────────────────────────────────   ║
   ║  Purpose: Calendar display, event rendering, date navigation             ║
   ║  Docs: https://fullcalendar.io/docs                                      ║
   ║  CDN: https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8                        ║
   ║  Key methods we use:                                                     ║
   ║    - new FullCalendar.Calendar(el, options) - Initialize calendar        ║
   ║    - calendar.render() - Display the calendar                            ║
   ║    - calendar.refetchEvents() - Reload events from source                │
   ║    - calendar.changeView(viewName) - Switch between views                ║
   ║  Views: dayGridMonth, timeGridWeek, timeGridDay, listMonth               ║
   ║                                                                           ║
   ║  jQuery (v3.x)                                                           ║
   ║  ─────────────────────────────────────────────────────────────────────   ║
   ║  Purpose: DOM manipulation, event handling                               ║
   ║  Docs: https://api.jquery.com/                                           ║
   ║  CDN: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/               ║
   ║                                                                           ║
   ╚═══════════════════════════════════════════════════════════════════════════╝ */


/* ╔═══════════════════════════════════════════════════════════════════════════╗
   ║                                                                           ║
   ║                         CLUBCALENDAR SHIM - START                                 ║
   ║                                                                           ║
   ║  Everything below this line is ClubCalendar-specific code that we maintain.      ║
   ║                                                                           ║
   ╚═══════════════════════════════════════════════════════════════════════════╝ */


// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  CATEGORY A: SETTINGS                                                     ║
// ║  What to show and how it looks                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: CONFIGURATION                                    [~6% of code]
// ═══════════════════════════════════════════════════════════════════════════
// Dependencies: None
// Stability: HIGH | Break risk: LOW
//
// This section contains ClubCalendar-specific default settings.
// These can be overridden by setting window.CLUBCALENDAR_CONFIG before loading.
//
// WHAT YOU MIGHT NEED TO CHANGE:
// - API endpoint URLs if server location changes
// - Default filter settings
// - Feature flags (showFilters, showHeader)
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * @typedef {Object} CalendarConfig
     * @property {string} container - CSS selector for calendar container
     * @property {string} apiBase - Base URL for ClubCalendar API endpoints
     * @property {string} defaultView - Initial view mode ('month', 'week', 'list')
     * @property {boolean} showFilters - Whether to show filter controls
     * @property {boolean} showHeader - Whether to show calendar header
     * @property {string} headerTitle - Custom header title
     */

    /**
     * Default configuration values.
     * Override by setting window.CLUBCALENDAR_CONFIG before this script loads.
     *
     * @type {CalendarConfig}
     * @constant
     */
    const DEFAULT_CONFIG = {
        container: '#clubcalendar',          // Where to render the calendar
        eventsUrl: '',                         // URL to events.json file (preferred)
        apiBase: '',                           // Auto-detected from script URL or page location (for SQLite API fallback)
        defaultView: 'dayGridMonth',           // FullCalendar view name
        showFilters: true,                     // Show interest/committee/time filters
        showHeader: true,                      // Show "Club Events" header
        headerTitle: 'Club Events',            // Header title text
        showActivityFilter: true,              // Show activity group filter
        showTimeFilter: true,                  // Show time period filter
        showAvailabilityFilter: true,          // Show availability filter
        showMyEvents: true,                    // Show "My Events" tab
        pastEventsVisible: false,              // Show past events
        pastEventsDays: 14,                    // Days of past events to show in calendar view
        pastEventsMonthsList: 6,               // Months of past events to show in list view
        futureMonthsLimit: 3,                  // How many months ahead to show
        eventClickBehavior: 'popup',           // 'popup', 'link', or 'both'
        primaryColor: '#2c5aa0',               // WA primary blue
        accentColor: '#d4a800',                // WA secondary gold
        // Typography customization
        fontFamily: null,                      // Custom font (e.g., 'Arial, sans-serif') - null uses system fonts
        baseFontSize: null,                    // Base font size (e.g., '15px') - null uses widget defaults
        cacheDuration: 300,                    // Seconds to cache events
        refreshInterval: 0,                    // Auto-refresh interval (0 = disabled)
        memberLevel: null,                     // Member level: 'Newbie', 'NewcomerMember', 'Alumni', 'Guest', or null for public
        useLiveApi: false,                     // Use live WA API instead of SQLite-cached data
        showAddToCalendar: true,               // Show "Add to Calendar" button in event popup
        icsBaseUrl: 'https://mail.sbnewcomers.org/ics/event.php',  // ICS generator endpoint URL
        // Failover configuration
        fallbackContainerId: 'wa-fallback',    // ID of hidden WA calendar container to show on error
        fallbackEventsUrl: '/events'           // URL to link to if no fallback container exists
    };

    /**
     * Remote configuration loaded from /api/config.json
     * @type {Object|null}
     */
    let remoteConfig = null;

    /**
     * Merged configuration (defaults + remote + user overrides)
     * @type {CalendarConfig}
     */
    let CONFIG = Object.assign({}, DEFAULT_CONFIG, window.CLUBCALENDAR_CONFIG || {});

    // Auto-detect API base URL if not explicitly set
    if (!CONFIG.apiBase) {
        CONFIG.apiBase = detectApiBase();
    }

    /**
     * Interest area keyword mappings for filtering events by content.
     * @constant
     */
    const INTEREST_KEYWORDS = {
        'food': ['dinner', 'lunch', 'brunch', 'restaurant', 'food', 'cooking', 'chef', 'cuisine', 'potluck', 'meal'],
        'wine': ['wine', 'winery', 'vineyard', 'tasting', 'sommelier'],
        'beer': ['beer', 'brewery', 'ale', 'lager', 'craft beer', 'pub'],
        'performing-arts': ['theater', 'theatre', 'concert', 'symphony', 'opera', 'ballet', 'play', 'musical', 'performance'],
        'visual-arts': ['gallery', 'museum', 'art walk', 'exhibit', 'artist', 'painting', 'sculpture'],
        'tours': ['tour', 'historic', 'heritage', 'architecture', 'walking tour', 'docent'],
        'outdoors': ['hike', 'hiking', 'trail', 'beach', 'park', 'outdoor', 'nature', 'canyon', 'mountain'],
        'athletic': ['golf', 'cycling', 'bike', 'sailing', 'kayak', 'pickleball', 'tennis', 'bowling'],
        'garden': ['garden', 'botanic', 'plant', 'flower', 'nursery'],
        'books': ['book', 'read', 'author', 'novel', 'literary'],
        'discussion': ['discussion', 'current events', 'foreign policy', 'politics', 'speaker'],
        'wellness': ['wellness', 'mindfulness', 'meditation', 'soundbath', 'healing'],
        'social': ['happy hour', 'social', 'mixer', 'networking', 'party'],
        'games': ['game', 'trivia', 'cards', 'canasta', 'bunco', 'billiards', 'board game']
    };

    /**
     * Committee prefix mappings for filtering events by organizer.
     * @constant
     */
    const COMMITTEE_KEYWORDS = {
        'Games!': ['Games!:', 'Games!'],
        'Wellness': ['Wellness:'],
        'Arts': ['Arts:', 'SB Arts:', 'Visual Arts:'],
        'Local Heritage': ['Local Heritage:'],
        'Wine Appreciation': ['Wine Appreciation:'],
        'Pop-Up': ['Pop-Up:', 'Pop Up:', 'POP UP:'],
        'Happy Hikers': ['Happy Hikers:'],
        'Garden': ['Garden:', 'Gardening:'],
        'Volunteers': ['Volunteers in Action:'],
        'Epicurious': ['Epicurious:'],
        'Current Events': ['Current Events:', 'Foreign Policy:'],
        'Book Clubs': ['Afternoon Book:', 'Evening Book:', 'Books and Bites:'],
        'TGIF': ['TGIF:'],
        'Performing Arts': ['Performing Arts:', 'Theater Lovers:'],
        'Golf': ['Golf:'],
        'Cycling': ['Cycling:'],
        'Beer Lovers': ['Beer Lovers:'],
        'Out to Lunch': ['Out to Lunch:']
    };


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1B: FILTER BUSINESS RULES                           [EASY TO FIND]
// ═══════════════════════════════════════════════════════════════════════════
// This section defines ALL filter business rules in one place.
//
// WHAT'S HERE:
// - Filter definitions (labels, colors, criteria)
// - Helper functions that evaluate if an event matches a filter
//
// TO ADD A NEW FILTER:
// 1. Add entry to FILTER_RULES below
// 2. Add CSS for dot/badge colors in Section 2
// 3. Add button HTML in buildWidgetHTML()
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * FILTER BUSINESS RULES
     * ─────────────────────────────────────────────────────────────────────────
     * Each filter has:
     *   - id: unique identifier used in code
     *   - label: display text for buttons and badges
     *   - tooltip: hover text for calendar dots
     *   - dotColor: CSS color for the filter dot
     *   - badgeBg: badge background color (list view)
     *   - badgeText: badge text color (list view)
     *   - group: filter grouping for UI layout
     *   - criteria: function(event, context) => boolean
     *
     * The 'context' object passed to criteria contains:
     *   - now: current Date
     *   - eventDate: parsed event start date
     *   - dayOfWeek: 0=Sunday, 6=Saturday
     *   - eventHour: hour of event start (0-23)
     *   - tags: parsed event tags array
     *   - availability: event availability status object
     *   - isFree: boolean if event is free
     */
    const FILTER_RULES = {
        // ─────────────────────────────────────────────────────────────────────
        // REGISTRATION STATUS FILTERS
        // ─────────────────────────────────────────────────────────────────────
        justopened: {
            id: 'justopened',
            label: 'Just Opened',
            tooltip: 'Just Opened',
            dotColor: '#e91e63',        // Pink
            badgeBg: '#fce4ec',
            badgeText: '#c2185b',
            group: 'registration',
            criteria: (event, ctx) => {
                // Registration opened within the last 7 days
                if (!event.registrationOpenDate) return false;
                const regOpenDate = new Date(event.registrationOpenDate);
                const sevenDaysAgo = new Date(ctx.now);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return regOpenDate >= sevenDaysAgo && regOpenDate <= ctx.now;
            }
        },
        openingsoon: {
            id: 'openingsoon',
            label: 'Opening Soon',
            tooltip: 'Opening Soon',
            dotColor: '#009688',        // Teal
            badgeBg: '#e0f2f1',
            badgeText: '#00796b',
            group: 'registration',
            criteria: (event, ctx) => {
                // Registration opens within the next 7 days
                if (!event.registrationOpenDate) return false;
                const regOpenDate = new Date(event.registrationOpenDate);
                const sevenDaysFromNow = new Date(ctx.now);
                sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                return regOpenDate > ctx.now && regOpenDate <= sevenDaysFromNow;
            }
        },
        openings: {
            id: 'openings',
            label: 'Openings for Any Member',
            tooltip: 'Openings for Any Member',
            dotColor: '#4caf50',        // Green
            badgeBg: '#e8f5e9',
            badgeText: '#2e7d32',
            group: 'registration',
            criteria: (event, ctx) => {
                // Event has available spots (not full)
                return ctx.availability && ctx.availability.status !== 'full';
            }
        },

        // ─────────────────────────────────────────────────────────────────────
        // TIMING FILTERS
        // ─────────────────────────────────────────────────────────────────────
        weekend: {
            id: 'weekend',
            label: 'Weekend',
            tooltip: 'Weekend',
            dotColor: '#9c27b0',        // Purple
            badgeBg: '#f3e5f5',
            badgeText: '#7b1fa2',
            group: 'timing',
            criteria: (event, ctx) => {
                // Saturday (6) or Sunday (0)
                return ctx.dayOfWeek === 0 || ctx.dayOfWeek === 6;
            }
        },
        afterhours: {
            id: 'afterhours',
            label: 'After Hours',
            tooltip: 'After Hours',
            dotColor: '#5c6bc0',        // Indigo
            badgeBg: '#e8eaf6',
            badgeText: '#3949ab',
            group: 'timing',
            criteria: (event, ctx) => {
                // Weekends OR after 5pm on weekdays
                const isWeekend = ctx.dayOfWeek === 0 || ctx.dayOfWeek === 6;
                const isAfter5pmWeekday = ctx.dayOfWeek >= 1 && ctx.dayOfWeek <= 5 && ctx.eventHour >= 17;
                return isWeekend || isAfter5pmWeekday;
            }
        },

        // ─────────────────────────────────────────────────────────────────────
        // COST & AUDIENCE FILTERS
        // ─────────────────────────────────────────────────────────────────────
        free: {
            id: 'free',
            label: 'Free',
            tooltip: 'Free',
            dotColor: '#ffc107',        // Yellow/Amber
            badgeBg: '#fff8e1',
            badgeText: '#f57f17',
            group: 'cost',
            criteria: (event, ctx) => {
                return ctx.isFree;
            }
        },
        newbie: {
            id: 'newbie',
            label: 'Openings for Newbies',
            tooltip: 'Openings for Newbies',
            dotColor: '#00bcd4',        // Cyan
            badgeBg: '#e0f7fa',
            badgeText: '#00838f',
            group: 'audience',
            criteria: (event, ctx) => {
                // Any event with openings has openings for newbies
                // (Newbies are members, so if there are spots available, newbies can register)
                return ctx.availability && ctx.availability.status !== 'full';
            }
        },
        public: {
            id: 'public',
            label: 'Open to Public',
            tooltip: 'Open to Public',
            dotColor: '#8bc34a',        // Light Green
            badgeBg: '#f1f8e9',
            badgeText: '#558b2f',
            group: 'audience',
            criteria: (event, ctx) => {
                // Event is open to non-members/public
                return ctx.tags.some(t =>
                    t.toLowerCase().includes('public event') ||
                    t.toLowerCase().includes('public')
                ) || event.hasGuestTickets === 1;
            }
        }
    };

    /**
     * TIME OF DAY DISPLAY RULES
     * ─────────────────────────────────────────────────────────────────────────
     * Controls the color coding for events based on start time.
     */
    const TIME_OF_DAY_RULES = {
        morning: {
            label: 'Morning',
            color: '#ff9800',           // Orange
            criteria: (hour) => hour < 12
        },
        afternoon: {
            label: 'Afternoon',
            color: '#42a5f5',           // Blue
            criteria: (hour) => hour >= 12 && hour < 17
        },
        evening: {
            label: 'Evening',
            color: '#5c6bc0',           // Purple
            criteria: (hour) => hour >= 17
        },
        allday: {
            label: 'All Day',
            color: '#66bb6a',           // Green
            criteria: (hour, isAllDay) => isAllDay
        }
    };

    /**
     * Evaluates all filter rules against an event and returns matches.
     * @param {Object} event - The event to evaluate
     * @returns {Object} - Object with filter IDs as keys, boolean values
     */
    function evaluateFilters(event) {
        const eventDate = new Date(event.startDate);
        const context = {
            now: new Date(),
            eventDate: eventDate,
            dayOfWeek: eventDate.getDay(),
            eventHour: eventDate.getHours(),
            tags: parseTags(event.tags),
            availability: getAvailability(event),
            isFree: event.isFree === 1 || event.minPrice === 0
        };

        const matches = {};
        for (const [id, rule] of Object.entries(FILTER_RULES)) {
            matches[id] = rule.criteria(event, context);
        }
        return matches;
    }

    /**
     * Gets filter rule by ID.
     * @param {string} filterId - The filter ID
     * @returns {Object|null} - The filter rule or null
     */
    function getFilterRule(filterId) {
        return FILTER_RULES[filterId] || null;
    }


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: CSS OVERRIDE / THEME INTEGRATION                 [~19% of code]
// ═══════════════════════════════════════════════════════════════════════════
// Dependencies: None (pure CSS)
// Stability: HIGH | Break risk: LOW (visual only)
//
// This section contains CSS that styles the widget to match the ClubCalendar/WA theme.
// All class names use the .clubcal- prefix to avoid conflicts with host pages.
//
// WHAT YOU MIGHT NEED TO CHANGE:
// - Colors to match WA theme updates (search for #2c5aa0, #d4a800)
// - Font sizes if design changes
// - Layout spacing/margins
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Injects widget CSS styles into the document.
     * Uses .clubcal-* scoped class names to avoid conflicts.
     *
     * COLOR MAPPING TO WA THEME:
     *   #2c5aa0 - WA primary blue (header, links, focus states)
     *   #d4a800 - WA secondary gold (accents, highlights)
     *   #f8f9fa - Light gray background (filter bar)
     *   #333333 - Primary text color
     *   #666666 - Secondary/muted text
     *
     * @returns {void}
     */
    function injectStyles() {
        // Skip if already injected
        if (document.getElementById('clubcalendar-styles')) {
            return;
        }

        const css = `
/* ═══════════════════════════════════════════════════════════════════════════
   ClubCalendar Widget Styles

   These styles override/extend FullCalendar styles to match WA theme.
   ═══════════════════════════════════════════════════════════════════════════ */

/* --- Base Container --- */
.clubcalendar-widget {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #333;
    line-height: 1.5;
    width: 100%;
    box-sizing: border-box;
}

/* --- Header Styling --- */
.clubcalendar-header {
    padding: 15px 0;
    margin-bottom: 15px;
    border-bottom: 2px solid #2c5aa0;
}
.clubcalendar-header h2 {
    margin: 0;
    color: #2c5aa0;
    font-size: 24px;
    font-weight: 600;
}
.clubcalendar-header p {
    margin: 5px 0 0;
    color: #666;
    font-size: 14px;
}

/* --- Help Icon and Tooltip --- */
.clubcal-header-row {
    display: flex;
    align-items: center;
    gap: 10px;
}
.clubcal-help-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #e8f0fe;
    color: #2c5aa0;
    font-size: 13px;
    font-weight: 700;
    cursor: help;
    position: relative;
    border: 1px solid #2c5aa0;
    transition: all 0.2s ease;
}
.clubcal-help-icon:hover {
    background: #2c5aa0;
    color: white;
}
.clubcal-help-tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 10px;
    width: 320px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    padding: 15px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: 1000;
    text-align: left;
    font-weight: normal;
}
.clubcal-help-tooltip::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #ddd;
}
.clubcal-help-tooltip::after {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid white;
}
.clubcal-help-icon:hover .clubcal-help-tooltip {
    opacity: 1;
    visibility: visible;
}
.clubcal-help-tooltip h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #2c5aa0;
    font-weight: 600;
}
.clubcal-help-tooltip p {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #666;
    line-height: 1.5;
}
.clubcal-help-section {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
}
.clubcal-help-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}
.clubcal-help-section strong {
    display: block;
    font-size: 11px;
    color: #333;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.clubcal-help-dots {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
}
.clubcal-help-dot-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #555;
}
.clubcal-help-dot-item .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

/* --- Filter Bar --- */
.clubcal-filter-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: flex-end;
    margin-bottom: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
}
.clubcal-filter-group {
    display: flex;
    flex-direction: column;
    min-width: 150px;
}
.clubcal-filter-group label {
    font-size: 11px;
    color: #666;
    margin-bottom: 4px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.clubcal-filter-group select {
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: white;
}
.clubcal-filter-group select:focus {
    outline: none;
    border-color: #2c5aa0;
    box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.2);
}

/* --- Quick Filters --- */
.clubcal-quick-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;
    margin-top: 12px;
}
.clubcal-quick-filter {
    padding: 6px 14px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}
.clubcal-quick-filter:hover {
    background: #2c5aa0;
    color: white;
    border-color: #2c5aa0;
}
.clubcal-quick-filter.active {
    background: #2c5aa0;
    color: white;
    border-color: #2c5aa0;
}

/* --- Clear Button --- */
.clubcal-btn-clear {
    padding: 8px 16px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.2s;
}
.clubcal-btn-clear:hover {
    background: #f0f0f0;
}
.clubcal-clear-btn {
    padding: 8px 16px;
    background: #dc3545;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: white;
    transition: all 0.2s;
    margin-left: auto;
}
.clubcal-clear-btn:hover {
    background: #c82333;
}

/* --- View Toggle --- */
.clubcal-view-toggle {
    display: flex;
    gap: 4px;
    background: #2c5aa0;
    padding: 4px;
    border-radius: 6px;
}
.clubcal-view-btn {
    padding: 6px 14px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.8);
    transition: all 0.2s;
}
.clubcal-view-btn:hover {
    background: rgba(255,255,255,0.15);
    color: white;
}
.clubcal-view-btn.active {
    background: white;
    color: #2c5aa0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* --- Results Count --- */
.clubcal-results-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;
    color: #666;
}
.clubcal-results-bar strong {
    color: #333;
}

/* --- Calendar Container --- */
.clubcalendar-content {
    min-height: 400px;
    width: 100%;
}

/* --- FullCalendar Overrides --- */
.clubcalendar-widget .fc {
    font-family: inherit;
    width: 100% !important;
}
.clubcalendar-widget .fc-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.clubcalendar-widget .fc-toolbar-chunk:nth-child(2) {
    flex: 1;
    text-align: center;
}
.clubcalendar-widget .fc-toolbar-title {
    font-size: 1.2em;
    color: #333;
    display: inline;
}
.clubcalendar-widget .fc-button-primary {
    background-color: #2c5aa0;
    border-color: #2c5aa0;
}
.clubcalendar-widget .fc-button-primary:hover {
    background-color: #234a80;
    border-color: #234a80;
}
.clubcalendar-widget .fc-button-primary:disabled {
    background-color: #6c9bd1;
    border-color: #6c9bd1;
}
.clubcalendar-widget .fc-button-primary:not(:disabled).fc-button-active {
    background-color: #1e3d6b;
    border-color: #1e3d6b;
}
.clubcalendar-widget .fc-daygrid-day-number {
    color: #333;
}
.clubcalendar-widget .fc-col-header-cell-cushion {
    color: #666;
}

/* --- Event Styling --- */
.clubcalendar-widget .fc-event {
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
}
.clubcalendar-widget .fc-event:hover {
    opacity: 0.9;
}

/* List view specific styles */
.clubcalendar-widget .fc-list-event:hover td {
    background-color: #f5f5f5 !important;
}
.clubcalendar-widget .fc-list-event-time {
    white-space: nowrap;
}
.clubcalendar-widget .fc-list-event-title {
    cursor: pointer;
}
.clubcalendar-widget .fc-list-event .clubcal-event-content {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}
.clubcalendar-widget .fc-list-event .clubcal-event-time-row {
    display: none; /* Time is shown in separate column in list view */
}
.clubcalendar-widget .fc-list-event .clubcal-event-title-row {
    display: inline;
}
.clubcalendar-widget .fc-list-day-cushion {
    background: #f8f9fa;
}
.clubcalendar-widget .fc-list-event-graphic {
    display: none; /* Hide default dot */
}

/* List view badges */
.clubcal-event-content-list {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}
.clubcal-badges-container {
    display: inline-flex;
    gap: 6px;
    flex-wrap: wrap;
}
.clubcal-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
}
.clubcal-badge.weekend {
    background: #f3e5f5;
    color: #7b1fa2;
}
.clubcal-badge.openings {
    background: #e8f5e9;
    color: #2e7d32;
}
.clubcal-badge.free {
    background: #fff8e1;
    color: #f57f17;
}
.clubcal-badge.afterhours {
    background: #e8eaf6;
    color: #3949ab;
}
.clubcal-badge.newbie {
    background: #e0f7fa;
    color: #00838f;
}
.clubcal-badge.justopened {
    background: #fce4ec;
    color: #c2185b;
}
.clubcal-badge.openingsoon {
    background: #e0f2f1;
    color: #00796b;
}

/* Active filters display */
.clubcal-active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 0;
    font-size: 13px;
    color: #666;
    min-height: 20px;
}
.clubcal-active-filters:empty {
    display: none;
}
.clubcal-active-filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #e3f2fd;
    color: #1565c0;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
}
.clubcal-active-filter-label {
    font-weight: 600;
}
.clubcal-filter-count {
    background: #2c5aa0;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
}
.clubcalendar-widget .fc-daygrid-event {
    padding: 2px 4px;
}

/* --- Event Time-of-Day Colors (readable text on all) --- */
.clubcal-event-morning {
    background-color: #ff9800 !important;
    border-color: #e68900 !important;
    color: #000 !important;
}
.clubcal-event-afternoon {
    background-color: #42a5f5 !important;
    border-color: #1e88e5 !important;
    color: #000 !important;
}
.clubcal-event-evening {
    background-color: #5c6bc0 !important;
    border-color: #3f51b5 !important;
    color: #fff !important;
}
.clubcal-event-allday {
    background-color: #66bb6a !important;
    border-color: #43a047 !important;
    color: #000 !important;
}

/* Time filter buttons */
.clubcal-time-filters {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}
.clubcal-time-filter-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border: 1px solid #ddd;
    border-radius: 15px;
    background: white;
    font-size: 12px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
}
.clubcal-time-filter-btn:hover {
    background: #f5f5f5;
    border-color: #bbb;
}
.clubcal-time-filter-btn.active {
    background: #e3f2fd;
    border-color: #2196f3;
    color: #1565c0;
}
.clubcal-time-filter-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
}
.clubcal-time-filter-dot.morning { background: #ff9800; }
.clubcal-time-filter-dot.afternoon { background: #42a5f5; }
.clubcal-time-filter-dot.evening { background: #5c6bc0; }
.clubcal-time-filter-dot.allday { background: #66bb6a; }

/* Availability filter buttons */
.clubcal-avail-filters {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
}
.clubcal-avail-filter-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 12px;
    background: white;
    font-size: 11px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
}
.clubcal-avail-filter-btn:hover {
    background: #f5f5f5;
    border-color: #bbb;
}
.clubcal-avail-filter-btn.active {
    background: #e8f5e9;
    border-color: #4caf50;
    color: #2e7d32;
}

/* Availability indicator dots */
.clubcal-avail-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
}
.clubcal-avail-dot.public { background: #4caf50; }
.clubcal-avail-dot.available { background: #2196f3; }
.clubcal-avail-dot.limited { background: #ff9800; }
.clubcal-avail-dot.waitlist { background: #f44336; }
.clubcal-avail-dot.unavailable { background: #9e9e9e; }

/* Filter button dots - each filter type has a unique color */
.clubcal-filter-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
}
.clubcal-filter-dot.weekend { background: #9c27b0; }
.clubcal-filter-dot.openings { background: #4caf50; }
.clubcal-filter-dot.free { background: #ffc107; }
.clubcal-filter-dot.afterhours { background: #5c6bc0; }
.clubcal-filter-dot.newbie { background: #00bcd4; }
.clubcal-filter-dot.public { background: #8bc34a; }
.clubcal-filter-dot.justopened { background: #e91e63; }
.clubcal-filter-dot.openingsoon { background: #009688; }

/* Event display - custom content with time+dots on first line */
.clubcalendar-widget .fc-daygrid-event {
    white-space: normal !important;
    padding: 2px 4px !important;
    margin-right: 1px !important;
}
.clubcal-event-content {
    display: flex;
    flex-direction: column;
}
.clubcal-event-time-row {
    display: flex;
    align-items: center;
    font-size: 10px;
    font-weight: 600;
    opacity: 0.9;
    white-space: nowrap;
}
.clubcal-event-title-row {
    font-size: 11px;
    line-height: 1.2;
    word-wrap: break-word;
}
.clubcalendar-widget .fc-event-main {
    display: block !important;
    padding-right: 1px;
}
.clubcalendar-widget .fc-daygrid-event-dot {
    display: none !important;
}

/* Allow day cells to expand */
.clubcalendar-widget .fc-daygrid-day-frame {
    min-height: auto !important;
}
.clubcalendar-widget .fc-daygrid-day-events {
    min-height: auto !important;
}

/* Filter row - allows wrapping to multiple lines */
.clubcal-filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 12px;
}
.clubcal-filter-row-label {
    font-size: 11px;
    color: #888;
    font-weight: 500;
    margin-right: 4px;
}

/* Quick action buttons - flexible sizing */
.clubcal-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 14px;
    background: white;
    font-size: 12px;
    color: #555;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}
.clubcal-action-btn:hover {
    background: #f0f0f0;
    border-color: #bbb;
}
.clubcal-action-btn.active {
    background: #2c5aa0;
    border-color: #2c5aa0;
    color: white;
}
.clubcal-action-btn.active .clubcal-filter-dot,
.clubcal-action-btn.active .clubcal-time-filter-dot,
.clubcal-action-btn.active .clubcal-avail-dot {
    box-shadow: 0 0 0 1px white;
}

/* Past events checkbox */
.clubcal-past-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #666;
    margin-left: auto;
}
.clubcal-past-toggle input {
    width: 14px;
    height: 14px;
    cursor: pointer;
}

/* Cost filter */
.clubcal-cost-filter {
    padding: 5px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    background: white;
}

/* --- Event Popup --- */
.clubcal-event-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    max-width: 450px;
    width: 90%;
    z-index: 10000;
    overflow: hidden;
}
.clubcal-event-popup-header {
    background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6b 100%);
    color: white;
    padding: 20px;
}
.clubcal-event-popup-header h3 {
    margin: 0 0 8px;
    font-size: 18px;
}
.clubcal-event-popup-category {
    display: inline-block;
    padding: 3px 10px;
    background: rgba(255,255,255,0.2);
    border-radius: 12px;
    font-size: 11px;
    text-transform: uppercase;
}
.clubcal-event-popup-body {
    padding: 20px;
}
.clubcal-event-popup-meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
}
.clubcal-event-popup-meta-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #666;
}
.clubcal-event-popup-meta-item strong {
    color: #333;
}
.clubcal-event-popup-actions {
    display: flex;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid #eee;
}
.clubcal-event-popup-actions .clubcal-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
}
.clubcal-btn-primary {
    background: #2c5aa0;
    color: white;
}
.clubcal-btn-primary:hover {
    background: #234a80;
}
.clubcal-btn-secondary {
    background: #f0f0f0;
    color: #333;
}
.clubcal-btn-secondary:hover {
    background: #e0e0e0;
}
.clubcal-btn-calendar {
    background: #4caf50;
    color: white;
    text-decoration: none;
}
.clubcal-btn-calendar:hover {
    background: #43a047;
}

/* --- Popup text links (not buttons) should be underlined for accessibility --- */
.clubcal-event-popup-body a:not(.clubcal-btn) {
    text-decoration: underline;
    color: #2c5aa0;
}
.clubcal-event-popup-body a:not(.clubcal-btn):hover {
    text-decoration: underline;
    color: #1e3d6b;
}

/* --- Expandable Sections (Accordion) --- */
.clubcal-popup-sections {
    border-top: 1px solid #eee;
    margin-top: 15px;
}
.clubcal-popup-section {
    border-bottom: 1px solid #eee;
}
.clubcal-popup-section:last-child {
    border-bottom: none;
}
.clubcal-popup-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: #2c5aa0;
    transition: color 0.2s;
}
.clubcal-popup-section-header:hover {
    color: #1e3d6b;
}
.clubcal-popup-section-header .clubcal-section-icon {
    margin-right: 8px;
}
.clubcal-popup-section-header .clubcal-section-arrow {
    transition: transform 0.3s;
    font-size: 12px;
}
.clubcal-popup-section.expanded .clubcal-section-arrow {
    transform: rotate(180deg);
}
.clubcal-popup-section-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
}
.clubcal-popup-section.expanded .clubcal-popup-section-content {
    max-height: 300px;
    overflow-y: auto;
}
.clubcal-popup-section-inner {
    padding: 0 0 15px;
}

/* --- Registrants List --- */
.clubcal-registrants-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.clubcal-registrant {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 13px;
}
.clubcal-registrant-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #2c5aa0;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
}
.clubcal-registrant-name {
    flex: 1;
    color: #333;
}
.clubcal-registrant-name a {
    color: #2c5aa0;
    text-decoration: none;
}
.clubcal-registrant-name a:hover {
    text-decoration: underline;
}
.clubcal-registrants-loading,
.clubcal-registrants-empty {
    padding: 15px;
    text-align: center;
    color: #666;
    font-size: 13px;
}
.clubcal-registrants-count {
    font-size: 12px;
    color: #666;
    font-weight: normal;
    margin-left: 8px;
}

/* --- Photo Gallery Link --- */
.clubcal-gallery-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    color: white;
    text-decoration: none;
    font-size: 14px;
    transition: transform 0.2s, box-shadow 0.2s;
}
.clubcal-gallery-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
.clubcal-gallery-link .clubcal-gallery-count {
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
}

/* --- Popup Overlay --- */
.clubcal-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
}

/* --- Loading State --- */
.clubcal-loading {
    text-align: center;
    padding: 40px;
    color: #888;
}
.clubcal-error {
    text-align: center;
    padding: 40px;
    color: #c00;
    background: #fee;
    border-radius: 8px;
}

/* --- Tabs --- */
.clubcal-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 0;
}
.clubcal-tab-btn {
    flex: 1;
    padding: 14px 20px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    background: #e0e0e0;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 8px 8px 0 0;
}
.clubcal-tab-btn:hover {
    background: #d0d0d0;
}
.clubcal-tab-btn.active {
    background: white;
    color: #2c5aa0;
}
.clubcal-tab-content {
    display: none;
    background: white;
    padding: 20px;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.clubcal-tab-content.active {
    display: block;
}

/* --- My Events Section --- */
.clubcal-my-events-search {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
}
.clubcal-my-events-search input[type="email"] {
    flex: 1;
    min-width: 250px;
    padding: 12px 16px;
    font-size: 14px;
    border: 2px solid #ddd;
    border-radius: 8px;
    outline: none;
}
.clubcal-my-events-search input[type="email"]:focus {
    border-color: #2c5aa0;
}
.clubcal-my-events-search button {
    padding: 12px 24px;
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.clubcal-my-events-search button:hover {
    background: #234a80;
}
.clubcal-my-events-options {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #666;
}
.clubcal-my-events-options input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

/* --- Event List View --- */
.clubcal-event-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.clubcal-event-card {
    display: flex;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}
.clubcal-event-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.clubcal-event-card.registered {
    border-left: 4px solid #2c5aa0;
}
.clubcal-event-card.waitlist {
    border-left: 4px solid #ff9800;
}
.clubcal-event-card-date {
    background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6b 100%);
    color: white;
    padding: 16px;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.clubcal-event-card-date .month {
    font-size: 12px;
    text-transform: uppercase;
    opacity: 0.9;
}
.clubcal-event-card-date .day {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
}
.clubcal-event-card-date .weekday {
    font-size: 11px;
    opacity: 0.8;
    margin-top: 4px;
}
.clubcal-event-card-content {
    flex: 1;
    padding: 16px;
}
.clubcal-event-card-category {
    display: inline-block;
    padding: 4px 10px;
    background: #f0f0f0;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
    text-transform: uppercase;
}
.clubcal-event-card-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
}
.clubcal-event-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 13px;
    color: #666;
}
.clubcal-event-card-status {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 90px;
    border-left: 1px solid #eee;
}
.clubcal-status-badge {
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
}
.clubcal-status-badge.confirmed {
    background: #e3f2fd;
    color: #1565c0;
}
.clubcal-status-badge.waitlist {
    background: #fff3e0;
    color: #e65100;
}
.clubcal-status-badge.past {
    background: #f3e5f5;
    color: #7b1fa2;
}

/* --- Responsive Layout - Tablet --- */
@media (max-width: 900px) {
    .clubcal-filter-bar {
        flex-wrap: wrap;
        gap: 10px;
    }
    .clubcal-filter-group {
        min-width: 120px;
    }
    .clubcal-action-btn {
        padding: 5px 8px;
        font-size: 11px;
    }
    .clubcalendar-widget .fc-toolbar {
        flex-wrap: wrap;
        gap: 8px;
    }
    .clubcalendar-widget .fc-toolbar-chunk:nth-child(2) {
        order: -1;
        width: 100%;
        margin-bottom: 8px;
    }
}

/* --- Responsive Layout - Mobile --- */
@media (max-width: 600px) {
    .clubcal-filter-bar {
        flex-direction: column;
        align-items: stretch;
    }
    .clubcal-filter-group {
        width: 100%;
        min-width: unset !important;
    }
    .clubcal-filter-group select {
        width: 100%;
    }
    .clubcal-view-toggle {
        width: 100%;
        justify-content: center;
    }
    .clubcal-view-btn {
        flex: 1;
    }
    .clubcal-clear-btn {
        width: 100%;
        margin-left: 0;
        margin-top: 8px;
    }
    .clubcal-filter-row {
        justify-content: center;
    }
    .clubcal-action-btn {
        padding: 6px 10px;
        font-size: 11px;
    }
    .clubcal-event-popup {
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
    }
    .clubcal-event-card {
        flex-direction: column;
    }
    .clubcal-event-card-date {
        flex-direction: row;
        gap: 10px;
        padding: 12px;
    }
    .clubcal-event-card-status {
        border-left: none;
        border-top: 1px solid #eee;
        flex-direction: row;
        gap: 10px;
    }
    .clubcal-my-events-search {
        flex-direction: column;
    }
    .clubcal-my-events-search input[type="email"] {
        width: 100%;
    }
    .clubcalendar-widget .fc-toolbar {
        flex-direction: column;
        gap: 10px;
    }
    .clubcalendar-widget .fc-toolbar-chunk {
        width: 100%;
        display: flex;
        justify-content: center;
    }
    .clubcalendar-widget .fc-toolbar-chunk:nth-child(2) {
        order: -1;
    }
    .clubcal-past-toggle {
        margin-left: 0 !important;
        justify-content: center;
    }
    .clubcalendar-widget .fc-col-header-cell-cushion {
        font-size: 11px;
    }
    .clubcalendar-widget .fc-daygrid-day-number {
        font-size: 12px;
    }
    .clubcal-event-time-row {
        font-size: 9px;
    }
    .clubcal-event-title-row {
        font-size: 10px;
    }
    .clubcal-tabs {
        flex-direction: column;
    }
    .clubcal-tab-btn {
        width: 100%;
        text-align: center;
    }
}
        `;

        const style = document.createElement('style');
        style.id = 'clubcalendar-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }


// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  CATEGORY B: DATA LAYER                                                   ║
// ║  Where data comes from                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: EVENT DATA ACCESS (API Integration)               [~12% of code]
// ═══════════════════════════════════════════════════════════════════════════
// Dependencies: fetch API (browser built-in)
// Stability: MEDIUM | Break risk: MEDIUM (breaks if API changes)
//
// This section handles all communication with the ClubCalendar backend API.
// Data is fetched from SQL query endpoints and transformed for FullCalendar.
//
// API ENDPOINTS (relative to CONFIG.apiBase):
//   /chatbot/api/query    - SQL query endpoint for events
//
// WHAT YOU MIGHT NEED TO CHANGE:
// - API endpoint paths if backend routes change
// - SQL queries if database schema changes
// - Data transformation if API response format changes
// ═══════════════════════════════════════════════════════════════════════════

    /** @type {Array} All loaded events */
    let allEvents = [];

    /** @type {Array} Filtered events for display */
    let filteredEvents = [];

    /** @type {Object} Current filter state - supports multiple active filters (AND logic) */
    let currentFilters = {
        interest: null,
        committee: null,
        time: 'upcoming',
        availability: null,
        timeOfDay: [],           // Can have multiple: ['morning', 'afternoon', 'evening', 'allday']
        memberAvailability: [],  // Can have multiple: ['public', 'available', 'limited', 'waitlist', 'unavailable']
        quickFilters: [],        // ['weekend', 'openings', 'free', 'afterhours', 'newbie']
        cost: null,              // 'free', 'under25', 'under50', 'under100', 'over100'
        showPast: false,         // Show past events
        pastMonths: 0            // Number of months back to show (0 = current only)
    };

    /** @type {Object|null} FullCalendar instance */
    let calendarInstance = null;

    /** @type {number} Timestamp of last data refresh (for debouncing) */
    let lastRefreshTime = 0;

    /** @type {number} Minimum seconds between auto-refreshes */
    const REFRESH_DEBOUNCE_SECONDS = 30;

    /** @type {Date|null} Earliest date for which we have events loaded */
    let earliestLoadedDate = null;

    /**
     * Detects API base URL from the script's src attribute or page location.
     *
     * @returns {string} Detected base URL
     */
    function detectApiBase() {
        // First try to detect from script src
        const scripts = document.getElementsByTagName('script');
        for (let s of scripts) {
            if (s.src && s.src.includes('clubcalendar-widget')) {
                return s.src.replace(/\/calendar\/.*$/, '');
            }
        }

        // Fall back to hostname detection
        if (window.location.hostname === 'mail.sbnewcomers.org') {
            return '';
        }

        return 'https://mail.sbnewcomers.org';
    }

    /**
     * Fetches events from the configured source.
     * Priority: eventsUrl (JSON file) > useLiveApi > SQLite API
     *
     * @param {number} pastMonths - Number of months back to include (0 = current only)
     * @returns {Promise<Array>} Array of event objects
     */
    async function fetchEvents(pastMonths = 0) {
        // Priority 1: JSON file URL (preferred, most portable)
        if (CONFIG.eventsUrl) {
            return fetchEventsFromJson(pastMonths);
        }

        // Priority 2: Live WA API
        if (CONFIG.useLiveApi) {
            return fetchEventsLive(pastMonths);
        }

        // Priority 3: SQLite API (legacy)
        return fetchEventsFromSqlite(pastMonths);
    }

    /**
     * Fetch events from a JSON file (events.json)
     * This is the preferred, most portable approach.
     *
     * @param {number} pastMonths - Number of months back to include (0 = current only)
     * @returns {Promise<Array>} Array of event objects
     */
    async function fetchEventsFromJson(pastMonths = 0) {
        try {
            const response = await fetch(CONFIG.eventsUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const events = data.events || [];

            // Filter past events based on selected months
            // Use start of day to include all events for today
            const now = new Date();
            const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today (midnight)
            if (pastMonths > 0) {
                cutoff.setMonth(cutoff.getMonth() - pastMonths);
            }

            return events
                .filter(event => new Date(event.start_date) >= cutoff)
                .map(event => mapJsonEventToInternal(event));
        } catch (error) {
            console.error('ClubCalendar: Failed to fetch events from JSON:', error);
            throw error;
        }
    }

    /**
     * Maps JSON file event format to internal event format.
     * JSON schema: { id, name, committee, start_date, end_date, location,
     *                description, registration_url, spots_available, is_full,
     *                confirmed_count, cost_category, good_for_newbies, tags, is_public }
     */
    function mapJsonEventToInternal(event) {
        // Map cost_category to minPrice for filtering
        const costMap = {
            'Free': 0,
            'Under $25': 12,
            '$25-50': 37,
            '$50-100': 75,
            'Over $100': 150
        };

        const minPrice = costMap[event.cost_category] ?? null;
        const isFree = event.cost_category === 'Free' || minPrice === 0;

        return {
            id: event.id,
            name: event.name,
            startDate: event.start_date,
            endDate: event.end_date,
            location: event.location,
            description: event.description,
            limit: event.spots_available !== null ? event.confirmed_count + event.spots_available : null,
            confirmed: event.confirmed_count,
            tags: Array.isArray(event.tags) ? event.tags.join(', ') : event.tags,
            status: event.is_full ? 'Full' : 'Open',
            minPrice: minPrice,
            maxPrice: minPrice,
            isFree: isFree ? 1 : 0,
            hasGuestTickets: event.is_public ? 1 : 0,
            registrationOpenDate: event.registration_open_date || null,
            registrationUrl: event.registration_url,
            committee: event.committee,
            costCategory: event.cost_category,
            goodForNewbies: event.good_for_newbies,
            spotsAvailable: event.spots_available,
            isFull: event.is_full
        };
    }

    /**
     * Fetch events from SQLite API (legacy approach)
     * @param {number} pastMonths - Number of months back to include (0 = current only)
     */
    async function fetchEventsFromSqlite(pastMonths = 0) {
        // Use date('now', 'start of day') to include all events for today
        const dateFilter = pastMonths > 0
            ? `date(StartDate) >= date('now', '-${pastMonths} months')`
            : "date(StartDate) >= date('now')";

        const sql = `SELECT
            Id, Name, StartDate, EndDate, Location,
            RegistrationsLimit, ConfirmedRegistrationsCount,
            Tags, Status, MinPrice, MaxPrice, IsFree,
            HasGuestTickets, RegistrationOpenDate
        FROM events
        WHERE ${dateFilter}
        AND (Status IS NULL OR Status NOT LIKE '%Cancelled%')
        AND Name NOT LIKE '%CANCELLED%'
        ORDER BY StartDate
        LIMIT 300`;

        try {
            const response = await fetch(`${CONFIG.apiBase}/chatbot/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.rows) {
                return data.rows.map(row => ({
                    id: row[0],
                    name: row[1],
                    startDate: row[2],
                    endDate: row[3],
                    location: row[4],
                    limit: row[5],
                    confirmed: row[6],
                    tags: row[7],
                    status: row[8],
                    minPrice: row[9],
                    maxPrice: row[10],
                    isFree: row[11],
                    hasGuestTickets: row[12],
                    registrationOpenDate: row[13]
                }));
            }

            return [];
        } catch (error) {
            console.error('ClubCalendar: Failed to fetch events from SQLite:', error);
            throw error;
        }
    }

    /**
     * Fetch events directly from WA API (live with 5-minute cache)
     * @param {boolean} includePast - Include past 14 days
     * @returns {Promise<Array>} Events array
     */
    async function fetchEventsLive(includePast = false) {
        try {
            const url = new URL(`${CONFIG.apiBase}/chatbot/api/wa-events`);
            if (includePast) {
                url.searchParams.set('include_past', 'true');
            }

            const response = await fetch(url.toString());

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.events) {
                // Map WA API format to widget format
                return data.events
                    .filter(e => !e.name.includes('CANCELLED'))
                    .map(event => ({
                        id: event.id,
                        name: event.name || event.title,
                        startDate: event.startDate || event.start,
                        endDate: event.endDate || event.end,
                        location: event.location || '',
                        limit: event.registrationsLimit,
                        confirmed: event.confirmedRegistrationsCount || 0,
                        tags: Array.isArray(event.tags) ? event.tags.join(',') : (event.tags || ''),
                        status: event.isEnabled ? 'Active' : 'Disabled',
                        minPrice: null,
                        maxPrice: null,
                        isFree: null,
                        hasGuestTickets: null,
                        registrationOpenDate: null,
                        registrationEnabled: event.registrationEnabled,
                        accessLevel: event.accessLevel
                    }));
            }

            return [];
        } catch (error) {
            console.error('ClubCalendar: Failed to fetch live events:', error);
            throw error;
        }
    }

    /**
     * Transforms ClubCalendar events into FullCalendar event format.
     *
     * @param {Array} events - Array of event objects
     * @returns {Array} Array of FullCalendar event objects
     */
    function transformEventsForCalendar(events) {
        return events.map(event => {
            const timeOfDay = deriveTimeOfDay(event.startDate, event.endDate);
            const availability = getAvailability(event);
            const memberAvailability = getMemberAvailability(event);

            return {
                id: event.id,
                title: getCleanTitle(event.name),
                start: event.startDate,
                end: event.endDate,
                classNames: [`clubcal-event-${timeOfDay}`],
                extendedProps: {
                    originalEvent: event,
                    category: extractCommittee(event.name),
                    timeOfDay: timeOfDay,
                    location: event.location,
                    availability: availability,
                    memberAvailability: memberAvailability,
                    isFree: event.isFree === 1 || event.minPrice === 0,
                    price: formatPrice(event),
                    tags: parseTags(event.tags)
                }
            };
        });
    }

    /**
     * Determines time-of-day category from event start time for color coding.
     * Morning: before 12pm (orange)
     * Afternoon: 12pm - 5pm (blue)
     * Evening: after 5pm (purple)
     * All-day: no specific time or spans multiple days (green)
     */
    function deriveTimeOfDay(startDate, endDate) {
        if (!startDate) return 'allday';

        const start = new Date(startDate);
        const hour = start.getHours();

        // Check if it's an all-day event (no time component or midnight start)
        const timeStr = startDate.toString();
        if (timeStr.includes('00:00:00') || timeStr.includes('T00:00')) {
            return 'allday';
        }

        // Morning: before noon
        if (hour < 12) {
            return 'morning';
        }
        // Afternoon: noon to 5pm
        if (hour < 17) {
            return 'afternoon';
        }
        // Evening: 5pm and later
        return 'evening';
    }

    /**
     * Extracts committee name from event title prefix.
     */
    function extractCommittee(name) {
        for (const [committee, prefixes] of Object.entries(COMMITTEE_KEYWORDS)) {
            for (const prefix of prefixes) {
                if (name.startsWith(prefix) || name.toUpperCase().startsWith(prefix.toUpperCase())) {
                    return committee;
                }
            }
        }

        const colonIdx = name.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30) {
            return name.substring(0, colonIdx).replace(/[*\-()]/g, '').trim();
        }

        return 'General';
    }

    /**
     * Gets clean event title without committee prefix.
     */
    function getCleanTitle(name) {
        const colonIdx = name.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30) {
            return name.substring(colonIdx + 1).trim();
        }
        return name;
    }

    /**
     * Calculates event availability.
     */
    function getAvailability(event) {
        if (!event.limit || event.limit === 0) {
            return { spots: null, status: 'unlimited' };
        }

        const spots = event.limit - (event.confirmed || 0);

        if (spots <= 0) {
            return { spots: 0, status: 'full' };
        } else if (spots <= 3) {
            return { spots, status: 'low' };
        } else {
            return { spots, status: 'available' };
        }
    }

    /**
     * Determines event availability status for the current member level.
     * Returns: 'public', 'available', 'limited', 'waitlist', 'unavailable'
     *
     * Ticket type rules:
     * - Newbie: can buy 'newbie' or 'newcomermember' tickets
     * - NewcomerMember: can buy 'newcomermember' tickets only
     * - Alumni: can buy 'alumni' tickets if available
     * - Guest: can buy 'guest' tickets if available
     * - null (public): can only see/buy public events with guest tickets
     *
     * @param {Object} event - Event object with tags, hasGuestTickets, limit, confirmed
     * @returns {Object} { status: string, label: string }
     */
    function getMemberAvailability(event) {
        const tags = parseTags(event.tags);
        const isPublic = tags.includes('public event') || tags.includes('public') || event.hasGuestTickets === 1;
        const memberLevel = CONFIG.memberLevel;
        const availability = getAvailability(event);

        // If event is full, it's waitlist regardless of member level
        if (availability.status === 'full') {
            return { status: 'waitlist', label: 'Waitlist' };
        }

        // Public/guest viewing (not logged in)
        if (!memberLevel) {
            if (isPublic) {
                if (availability.status === 'low') {
                    return { status: 'limited', label: 'Limited spots' };
                }
                return { status: 'public', label: 'Public event' };
            }
            return { status: 'unavailable', label: 'Members only' };
        }

        // Check ticket availability based on member level
        // Note: This is simplified - in production, would check actual ticket types from event data
        const eventName = event.name.toLowerCase();

        switch (memberLevel) {
            case 'Newbie':
                // Newbies can attend most events (newbie or newcomermember tickets)
                if (availability.status === 'low') {
                    return { status: 'limited', label: 'Limited spots' };
                }
                return { status: 'available', label: 'Available' };

            case 'NewcomerMember':
                // NewcomerMembers can attend events with newcomermember tickets
                if (availability.status === 'low') {
                    return { status: 'limited', label: 'Limited spots' };
                }
                return { status: 'available', label: 'Available' };

            case 'Alumni':
                // Alumni can only attend if alumni tickets are available
                // For now, assume alumni can attend public events
                if (isPublic) {
                    if (availability.status === 'low') {
                        return { status: 'limited', label: 'Limited spots' };
                    }
                    return { status: 'available', label: 'Available' };
                }
                return { status: 'unavailable', label: 'No alumni tickets' };

            case 'Guest':
                // Guests can only attend public events with guest tickets
                if (isPublic && event.hasGuestTickets === 1) {
                    if (availability.status === 'low') {
                        return { status: 'limited', label: 'Limited spots' };
                    }
                    return { status: 'public', label: 'Guest tickets available' };
                }
                return { status: 'unavailable', label: 'Members only' };

            default:
                // Unknown member level - treat as available if public
                if (isPublic) {
                    return { status: 'public', label: 'Public event' };
                }
                return { status: 'available', label: 'Available' };
        }
    }

    /**
     * Generates an ICS download URL for an event.
     * Uses the configured icsBaseUrl endpoint to create a properly
     * formatted ICS file with correct timezone handling.
     *
     * @param {Object} event - Event object with id, title, start, end, location
     * @returns {string} URL to download ICS file
     */
    function generateIcsUrl(event) {
        // Convert dates to ISO 8601 format
        let startDate = event.start || event.startDate;
        let endDate = event.end || event.endDate;

        // Handle Date objects - convert to ISO string
        if (startDate instanceof Date) {
            startDate = startDate.toISOString();
        }
        if (endDate instanceof Date) {
            endDate = endDate.toISOString();
        }

        const params = new URLSearchParams({
            id: event.id,
            title: event.title || event.name || 'Event',
            start: startDate,
            end: endDate,
            location: event.location || ''
        });
        return `${CONFIG.icsBaseUrl}?${params.toString()}`;
    }

    /**
     * Formats event price for display.
     */
    function formatPrice(event) {
        if (event.isFree === 1 || event.minPrice === 0) {
            return 'Free';
        }
        if (event.minPrice !== null && event.minPrice !== undefined) {
            if (event.minPrice === event.maxPrice || event.maxPrice === null) {
                return '$' + Math.round(event.minPrice);
            }
            return '$' + Math.round(event.minPrice) + '-$' + Math.round(event.maxPrice);
        }
        return '';
    }

    /**
     * Parses tags JSON string.
     */
    function parseTags(tagsStr) {
        if (!tagsStr || tagsStr === '[]') return [];
        try {
            return JSON.parse(tagsStr);
        } catch {
            return [];
        }
    }


// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  CATEGORY C: UI LAYER                                                     ║
// ║  How it all works together                                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: WIDGET INTEGRATION (Connects ClubCalendar data to FullCalendar)
// CATEGORY C: UI LAYER | ~47% of code | Dependencies: FullCalendar, jQuery
// Risk: MEDIUM-HIGH | Breaks if: Library APIs change, HTML structure assumptions fail
// ═══════════════════════════════════════════════════════════════════════════
//
// This section contains the "glue" code that:
// - Builds the HTML structure
// - Populates filter dropdowns
// - Initializes FullCalendar with our settings
// - Handles filter changes and event interactions
//
// WHAT YOU MIGHT NEED TO CHANGE:
// - HTML structure if layout redesign
// - Filter logic if new filter types added
// - FullCalendar options if display requirements change
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Loads external library dependencies (FullCalendar, jQuery).
     *
     * @param {Function} callback - Called when all dependencies ready
     */
    function loadDependencies(callback) {
        const dependencies = [
            {
                type: 'css',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.10/index.global.min.css',
                check: () => true // CSS always loads
            },
            {
                type: 'js',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
                check: () => window.jQuery
            },
            {
                type: 'js',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.10/index.global.min.js',
                check: () => window.FullCalendar
            }
        ];

        let loaded = 0;
        const total = dependencies.length;
        let fullCalendarFailed = false;

        function onLoad() {
            loaded++;
            if (loaded === total) {
                // Check if FullCalendar loaded successfully
                if (!window.FullCalendar) {
                    showFallback(new Error('FullCalendar library failed to load'));
                    return;
                }
                callback();
            }
        }

        dependencies.forEach(dep => {
            if (dep.check && dep.check()) {
                onLoad();
                return;
            }

            if (dep.type === 'css') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = dep.url;
                link.onload = onLoad;
                link.onerror = () => {
                    console.error('ClubCalendar: Failed to load CSS:', dep.url);
                    onLoad();
                };
                document.head.appendChild(link);
            } else {
                const script = document.createElement('script');
                script.src = dep.url;
                script.onload = onLoad;
                script.onerror = () => {
                    console.error('ClubCalendar: Failed to load JS:', dep.url);
                    if (dep.url.includes('fullcalendar')) {
                        fullCalendarFailed = true;
                    }
                    onLoad();
                };
                document.head.appendChild(script);
            }
        });
    }

    /**
     * Builds and inserts the widget HTML structure.
     *
     * @returns {boolean} True if successful
     */
    function buildWidget() {
        const container = document.querySelector(CONFIG.container);
        if (!container) {
            showFallback(new Error('Container not found: ' + CONFIG.container));
            return false;
        }

        let html = '<div class="clubcalendar-widget">';

        // Header
        if (CONFIG.showHeader) {
            html += `
                <div class="clubcalendar-header">
                    <div class="clubcal-header-row">
                        <h2>${escapeHtml(CONFIG.headerTitle)}</h2>
                        <span class="clubcal-help-icon">?
                            <div class="clubcal-help-tooltip">
                                <h4>How to Find Events</h4>

                                <div class="clubcal-help-section">
                                    <strong>Example: Finding a Weekend Show</strong>
                                    <p>To find a performing arts event this month on a weekend with openings:</p>
                                    <p>1. Select <b>Performing Arts</b> from Interest Area</p>
                                    <p>2. Click <b>Weekend</b> and <b>Has Openings</b> buttons</p>
                                    <p>3. Click any event to see details and register</p>
                                </div>

                                <div class="clubcal-help-section">
                                    <strong>Using Filters</strong>
                                    <p>Filters work together to narrow results. Click multiple buttons to combine them (e.g., Weekend + Free shows only free weekend events).</p>
                                    <p><b>To remove a filter:</b> Click a highlighted button again to turn it off.</p>
                                    <p><b>Clear All:</b> Removes all filters at once.</p>
                                </div>

                                <div class="clubcal-help-section">
                                    <strong>Filter Buttons</strong>
                                    <div class="clubcal-help-dots">
                                        <span class="clubcal-help-dot-item"><span class="dot" style="background:#e91e63"></span> Just Opened</span>
                                        <span class="clubcal-help-dot-item"><span class="dot" style="background:#009688"></span> Opening Soon</span>
                                        <span class="clubcal-help-dot-item"><span class="dot" style="background:#4caf50"></span> Has Openings</span>
                                        <span class="clubcal-help-dot-item"><span class="dot" style="background:#00bcd4"></span> Newbies Only</span>
                                        <span class="clubcal-help-dot-item"><span class="dot" style="background:#8bc34a"></span> Open to Public</span>
                                        <span class="clubcal-help-dot-item"><span class="dot" style="background:#9c27b0"></span> Weekend</span>
                                        <span class="clubcal-help-dot-item"><span class="dot" style="background:#ffc107"></span> Free</span>
                                    </div>
                                </div>

                                <div class="clubcal-help-section">
                                    <strong>Views</strong>
                                    <p><b>Calendar</b> – Monthly grid with colored dots showing event features.</p>
                                    <p><b>List</b> – Scrollable list with more detail visible.</p>
                                </div>

                                <div class="clubcal-help-section">
                                    <strong>Event Background = Time of Day</strong>
                                    <div style="display:flex; flex-direction:column; gap:4px; margin-top:6px;">
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span style="display:inline-block; width:80px; padding:4px 8px; border-radius:4px; font-size:10px; background:#fff3e0; color:#333; border-left:3px solid #ff9800;">Morning Event</span>
                                            <span style="font-size:10px; color:#666;">before noon</span>
                                        </div>
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span style="display:inline-block; width:80px; padding:4px 8px; border-radius:4px; font-size:10px; background:#e3f2fd; color:#333; border-left:3px solid #2196f3;">Afternoon Event</span>
                                            <span style="font-size:10px; color:#666;">noon – 5pm</span>
                                        </div>
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span style="display:inline-block; width:80px; padding:4px 8px; border-radius:4px; font-size:10px; background:#ede7f6; color:#333; border-left:3px solid #9c27b0;">Evening Event</span>
                                            <span style="font-size:10px; color:#666;">after 5pm</span>
                                        </div>
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span style="display:inline-block; width:80px; padding:4px 8px; border-radius:4px; font-size:10px; background:#e8f5e9; color:#333; border-left:3px solid #4caf50;">All Day Event</span>
                                            <span style="font-size:10px; color:#666;">no specific time</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </span>
                    </div>
                    <p>Discover events, find your next adventure</p>
                </div>
            `;
        }

        // Tabs (if My Events is enabled)
        if (CONFIG.showMyEvents) {
            html += `
                <div class="clubcal-tabs">
                    <button class="clubcal-tab-btn active" data-tab="find-events">Find Events</button>
                    <button class="clubcal-tab-btn" data-tab="my-events">My Events</button>
                </div>
            `;
        }

        // Find Events Tab Content
        const tabClass = CONFIG.showMyEvents ? 'clubcal-tab-content active' : '';
        html += `<div id="clubcal-tab-find-events" class="${tabClass}">`;

        // Filter bar
        if (CONFIG.showFilters) {
            html += '<div class="clubcal-filter-bar">';

            // View toggle first, then filters
            html += `
                <div class="clubcal-filter-group">
                    <div class="clubcal-view-toggle" style="background: #2c5aa0; padding: 4px;">
                        <button class="clubcal-view-btn active" data-view="dayGridMonth" style="font-weight: 600;">Calendar</button>
                        <button class="clubcal-view-btn" data-view="listMonth" style="font-weight: 600;">List</button>
                    </div>
                </div>
            `;

            // Interest filter and Cost filter side by side
            if (CONFIG.showActivityFilter) {
                html += `
                    <div class="clubcal-filter-group">
                        <label>Interest Area</label>
                        <select id="clubcal-filter-interest">
                            <option value="">All Interests</option>
                            <optgroup label="Food & Drink">
                                <option value="food">Food & Dining</option>
                                <option value="wine">Wine</option>
                                <option value="beer">Beer & Brewery</option>
                            </optgroup>
                            <optgroup label="Arts & Culture">
                                <option value="performing-arts">Performing Arts</option>
                                <option value="visual-arts">Visual Arts</option>
                                <option value="tours">Tours & History</option>
                            </optgroup>
                            <optgroup label="Outdoors & Active">
                                <option value="outdoors">Outdoors</option>
                                <option value="athletic">Athletic</option>
                                <option value="garden">Garden & Nature</option>
                            </optgroup>
                            <optgroup label="Learning & Wellness">
                                <option value="books">Books & Reading</option>
                                <option value="discussion">Discussion</option>
                                <option value="wellness">Wellness</option>
                            </optgroup>
                            <optgroup label="Social">
                                <option value="social">Social / Happy Hour</option>
                                <option value="games">Games</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="clubcal-filter-group">
                        <label>Committee</label>
                        <select id="clubcal-filter-committee">
                            <option value="">All Committees</option>
                            ${Object.keys(COMMITTEE_KEYWORDS).sort().map(c =>
                                `<option value="${c}">${c}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="clubcal-filter-group">
                        <label>Cost</label>
                        <select id="clubcal-filter-cost">
                            <option value="">Any Cost</option>
                            <option value="free">Free</option>
                            <option value="under25">Under $25</option>
                            <option value="under50">Under $50</option>
                            <option value="under100">Under $100</option>
                            <option value="over100">$100+</option>
                        </select>
                    </div>
                    <button class="clubcal-clear-btn" onclick="ClubCalendar.clearFilters()">Clear All</button>
                `;
            }

            html += '</div>'; // End filter bar
        }

        // Filter row - all on one line
        html += `
            <div class="clubcal-filter-row">
                <button class="clubcal-action-btn" data-filter="justopened"><span class="clubcal-filter-dot justopened"></span> Just Opened</button>
                <button class="clubcal-action-btn" data-filter="openingsoon"><span class="clubcal-filter-dot openingsoon"></span> Opening Soon</button>
                <button class="clubcal-action-btn" data-filter="openings"><span class="clubcal-filter-dot openings"></span> Openings for Any Member</button>
                <span style="color:#ccc; margin: 0 4px;">|</span>
                <button class="clubcal-action-btn" data-filter="weekend"><span class="clubcal-filter-dot weekend"></span> Weekend</button>
                <button class="clubcal-action-btn" data-filter="afterhours"><span class="clubcal-filter-dot afterhours"></span> After Hours</button>
                <button class="clubcal-action-btn" data-time="morning"><span class="clubcal-time-filter-dot morning"></span> Morning</button>
                <button class="clubcal-action-btn" data-time="afternoon"><span class="clubcal-time-filter-dot afternoon"></span> Afternoon</button>
                <button class="clubcal-action-btn" data-time="evening"><span class="clubcal-time-filter-dot evening"></span> Evening</button>
                <span style="color:#ccc; margin: 0 4px;">|</span>
                <button class="clubcal-action-btn" data-filter="free"><span class="clubcal-filter-dot free"></span> Free</button>
                <button class="clubcal-action-btn" data-filter="newbie"><span class="clubcal-filter-dot newbie"></span> Openings for Newbies</button>
                <button class="clubcal-action-btn" data-filter="public"><span class="clubcal-filter-dot public"></span> Open to Public</button>
                <button class="clubcal-action-btn" data-avail="limited"><span class="clubcal-avail-dot limited"></span> Few Spots Left</button>
            </div>
            <div id="clubcal-active-filters" class="clubcal-active-filters"></div>
        `;

        // Calendar container
        html += `
            <div class="clubcalendar-content" id="clubcalendar-content">
                <div class="clubcal-loading">Loading calendar...</div>
            </div>
        </div>`; // End Find Events tab content

        // My Events Tab Content
        if (CONFIG.showMyEvents) {
            html += `
            <div id="clubcal-tab-my-events" class="clubcal-tab-content">
                <div class="clubcal-my-events-search">
                    <input type="email" id="clubcal-member-email" placeholder="Enter your email address">
                    <button onclick="window.ClubCalendar.findMyEvents()">Look Up My Events</button>
                    <div class="clubcal-my-events-options" style="display: flex; align-items: center; gap: 6px;">
                        <label for="clubcal-my-events-past" style="color: #666; font-size: 13px;">Include past:</label>
                        <select id="clubcal-my-events-past" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 13px;">
                            <option value="0">None</option>
                            ${Array.from({length: CONFIG.pastEventsMonthsList || 6}, (_, i) => i + 1).map(m => `<option value="${m}"${m === 3 ? ' selected' : ''}>${m} month${m > 1 ? 's' : ''}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <p style="font-size: 13px; color: #666; margin-bottom: 15px;">
                    Enter your email to see events you're registered for and any waitlist positions.
                </p>
                <div id="clubcal-my-events-list">
                    <div class="clubcal-loading" style="display: none;">Loading your events...</div>
                    <div id="clubcal-my-events-results"></div>
                </div>
            </div>
            `;
        }

        html += '</div>'; // End widget container

        container.innerHTML = html;

        // Apply custom typography settings if configured
        const widgetEl = container.querySelector('.clubcalendar-widget') || container;
        if (CONFIG.fontFamily) {
            widgetEl.style.fontFamily = CONFIG.fontFamily;
        }
        if (CONFIG.baseFontSize) {
            widgetEl.style.fontSize = CONFIG.baseFontSize;
        }

        // Bind events
        bindFilterEvents();

        return true;
    }

    /**
     * Binds event listeners for filters and view toggle.
     */
    function bindFilterEvents() {
        const $ = window.jQuery;

        // Tab switching
        $('.clubcal-tab-btn').on('click', function() {
            const tab = $(this).data('tab');
            switchTab(tab);
        });

        // Filter dropdowns
        $('#clubcal-filter-interest, #clubcal-filter-time, #clubcal-filter-availability')
            .on('change', applyFilters);

        // View toggle buttons
        $('.clubcal-view-btn').on('click', function() {
            $('.clubcal-view-btn').removeClass('active');
            $(this).addClass('active');
            const view = $(this).data('view');
            if (calendarInstance) {
                calendarInstance.changeView(view);
            }
        });

        // Quick filter buttons
        $('.clubcal-quick-filter').on('click', function() {
            const filter = $(this).data('filter');
            quickFilter(filter);
        });

        // My Events email input - allow Enter key to submit
        $('#clubcal-member-email').on('keypress', function(e) {
            if (e.which === 13) {
                findMyEvents();
            }
        });

        // Action buttons (multiple can be active - AND logic)
        $('.clubcal-action-btn').on('click', function() {
            const $btn = $(this);
            $btn.toggleClass('active');

            // Handle different button types
            const filterVal = $btn.data('filter');
            const timeVal = $btn.data('time');
            const availVal = $btn.data('avail');

            if (filterVal) {
                // Quick filters (weekend, openings, free, afterhours)
                if ($btn.hasClass('active')) {
                    if (!currentFilters.quickFilters.includes(filterVal)) {
                        currentFilters.quickFilters.push(filterVal);
                    }
                } else {
                    currentFilters.quickFilters = currentFilters.quickFilters.filter(f => f !== filterVal);
                }
            } else if (timeVal) {
                // Time of day filters
                if ($btn.hasClass('active')) {
                    if (!currentFilters.timeOfDay.includes(timeVal)) {
                        currentFilters.timeOfDay.push(timeVal);
                    }
                } else {
                    currentFilters.timeOfDay = currentFilters.timeOfDay.filter(t => t !== timeVal);
                }
            } else if (availVal) {
                // Availability filters
                if ($btn.hasClass('active')) {
                    if (!currentFilters.memberAvailability.includes(availVal)) {
                        currentFilters.memberAvailability.push(availVal);
                    }
                } else {
                    currentFilters.memberAvailability = currentFilters.memberAvailability.filter(a => a !== availVal);
                }
            }

            filterAndRender();
        });

        // Cost filter dropdown
        $('#clubcal-filter-cost').on('change', function() {
            currentFilters.cost = $(this).val() || null;
            filterAndRender();
        });

        // Committee filter dropdown
        $('#clubcal-filter-committee').on('change', function() {
            currentFilters.committee = $(this).val() || null;
            filterAndRender();
        });
    }

    /**
     * Reloads events from API (needed when date range changes)
     */
    async function reloadEvents() {
        try {
            allEvents = await fetchEvents(currentFilters.pastMonths);
            filteredEvents = [...allEvents];

            // Update earliest loaded date based on loaded events
            if (allEvents.length > 0) {
                const dates = allEvents.map(e => new Date(e.startDate));
                earliestLoadedDate = new Date(Math.min(...dates));
            }

            filterAndRender();
        } catch (error) {
            showError('Failed to load events. Please try again.');
        }
    }

    /**
     * Switches between Find Events and My Events tabs.
     */
    function switchTab(tab) {
        const $ = window.jQuery;

        // Update tab buttons
        $('.clubcal-tab-btn').removeClass('active');
        $(`.clubcal-tab-btn[data-tab="${tab}"]`).addClass('active');

        // Update tab content
        $('.clubcal-tab-content').removeClass('active');
        $(`#clubcal-tab-${tab}`).addClass('active');
    }

    /**
     * Applies current filter settings and refreshes calendar.
     */
    function applyFilters() {
        const $ = window.jQuery;

        // Update dropdown filter values while preserving other filter state
        currentFilters.interest = $('#clubcal-filter-interest').val() || null;
        currentFilters.time = $('#clubcal-filter-time').val() || 'upcoming';
        currentFilters.availability = $('#clubcal-filter-availability').val() || null;

        filterAndRender();
    }

    /**
     * Handles quick filter button clicks.
     */
    function quickFilter(type) {
        const $ = window.jQuery;

        // Reset filters
        $('#clubcal-filter-interest').val('');
        $('#clubcal-filter-time').val('upcoming');
        $('#clubcal-filter-availability').val('');

        // Remove active class
        $('.clubcal-quick-filter').removeClass('active');

        if (type === 'this-weekend') {
            $('#clubcal-filter-time').val('weekend');
            $('[data-filter="this-weekend"]').addClass('active');
        } else if (type === 'has-openings') {
            $('#clubcal-filter-availability').val('available');
            $('[data-filter="has-openings"]').addClass('active');
        } else if (type === 'free') {
            $('#clubcal-filter-availability').val('free');
            $('[data-filter="free"]').addClass('active');
        }

        applyFilters();
    }

    /**
     * Clears all filters and resets calendar.
     */
    function clearFilters() {
        const $ = window.jQuery;

        $('#clubcal-filter-interest').val('');
        $('#clubcal-filter-committee').val('');
        $('#clubcal-filter-availability').val('');
        $('#clubcal-filter-cost').val('');
        $('.clubcal-quick-filter').removeClass('active');
        $('.clubcal-action-btn').removeClass('active');

        currentFilters = {
            interest: null,
            committee: null,
            time: 'upcoming',
            availability: null,
            timeOfDay: [],
            memberAvailability: [],
            quickFilters: [],
            cost: null,
            showPast: currentFilters.showPast,  // Keep past selection state
            pastMonths: currentFilters.pastMonths  // Keep past months selection
        };

        filterAndRender();
    }

    /**
     * Updates the active filters display showing current filter selections.
     */
    function updateActiveFiltersDisplay() {
        const container = document.getElementById('clubcal-active-filters');
        if (!container) return;

        const tags = [];

        // Interest
        if (currentFilters.interest) {
            const interestLabels = {
                'food': 'Food & Dining', 'wine': 'Wine', 'beer': 'Beer & Brewery',
                'performing-arts': 'Performing Arts', 'visual-arts': 'Visual Arts', 'tours': 'Tours',
                'outdoors': 'Outdoors', 'athletic': 'Athletic', 'garden': 'Garden',
                'books': 'Books', 'discussion': 'Discussion', 'wellness': 'Wellness',
                'social': 'Social', 'games': 'Games'
            };
            tags.push(`<span class="clubcal-active-filter-tag"><span class="clubcal-active-filter-label">Interest:</span> ${interestLabels[currentFilters.interest] || currentFilters.interest}</span>`);
        }

        // Committee
        if (currentFilters.committee) {
            tags.push(`<span class="clubcal-active-filter-tag"><span class="clubcal-active-filter-label">Committee:</span> ${currentFilters.committee}</span>`);
        }

        // Cost
        if (currentFilters.cost) {
            const costLabels = {
                'free': 'Free', 'under25': 'Under $25', 'under50': 'Under $50',
                'under100': 'Under $100', 'over100': '$100+'
            };
            tags.push(`<span class="clubcal-active-filter-tag"><span class="clubcal-active-filter-label">Cost:</span> ${costLabels[currentFilters.cost] || currentFilters.cost}</span>`);
        }

        // Quick filters
        const quickFilterLabels = {
            'weekend': 'Weekend', 'openings': 'Openings for Any Member', 'free': 'Free',
            'afterhours': 'After Hours', 'newbie': 'Openings for Newbies',
            'justopened': 'Just Opened', 'openingsoon': 'Opening Soon'
        };
        currentFilters.quickFilters.forEach(qf => {
            tags.push(`<span class="clubcal-active-filter-tag">${quickFilterLabels[qf] || qf}</span>`);
        });

        // Time of day
        const timeLabels = { 'morning': 'Morning', 'afternoon': 'Afternoon', 'evening': 'Evening' };
        currentFilters.timeOfDay.forEach(t => {
            tags.push(`<span class="clubcal-active-filter-tag">${timeLabels[t] || t}</span>`);
        });

        // Member availability
        const availLabels = { 'public': 'Guests Welcome', 'available': 'Spots Open', 'limited': 'Few Spots Left' };
        currentFilters.memberAvailability.forEach(a => {
            tags.push(`<span class="clubcal-active-filter-tag">${availLabels[a] || a}</span>`);
        });

        // Show count if filters active
        if (tags.length > 0) {
            tags.unshift(`<span class="clubcal-filter-count">${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''}</span>`);
        }

        container.innerHTML = tags.join('');
    }

    /**
     * Filters events based on current filter state.
     */
    function filterAndRender() {
        const now = new Date();
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

        const startOfNextWeek = new Date(endOfWeek);
        startOfNextWeek.setDate(endOfWeek.getDate() + 1);

        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        filteredEvents = allEvents.filter(event => {
            const eventDate = new Date(event.startDate);
            const eventHour = eventDate.getHours();
            const nameLower = event.name.toLowerCase();
            const availability = getAvailability(event);
            const memberAvail = getMemberAvailability(event);
            const timeOfDay = deriveTimeOfDay(event.startDate, event.endDate);
            const isFree = event.isFree === 1 || event.minPrice === 0;
            const dayOfWeek = eventDate.getDay();

            // CRITICAL: Always hide member-only events from non-members
            // This ensures anonymous/public users only see public events
            if (memberAvail.status === 'unavailable') return false;

            // Interest filter (from dropdown)
            if (currentFilters.interest) {
                const keywords = INTEREST_KEYWORDS[currentFilters.interest] || [];
                const matches = keywords.some(kw => nameLower.includes(kw.toLowerCase()));
                if (!matches) return false;
            }

            // Quick filters (AND logic - all must match)
            if (currentFilters.quickFilters.length > 0) {
                for (const qf of currentFilters.quickFilters) {
                    if (qf === 'weekend' && dayOfWeek !== 0 && dayOfWeek !== 6) return false;
                    if (qf === 'openings' && availability.status === 'full') return false;
                    if (qf === 'free' && !isFree) return false;
                    if (qf === 'afterhours') {
                        // After Hours = weekends OR after 5pm on weekdays
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        const isAfter5pmWeekday = dayOfWeek >= 1 && dayOfWeek <= 5 && eventHour >= 17;
                        if (!isWeekend && !isAfter5pmWeekday) return false;
                    }
                    if (qf === 'newbie') {
                        const eventTags = parseTags(event.tags);
                        const isNewbieFriendly = eventTags.some(t =>
                            t.toLowerCase().includes('newbie') ||
                            t.toLowerCase().includes('new member') ||
                            t.toLowerCase().includes('orientation')
                        );
                        if (!isNewbieFriendly) return false;
                    }
                    if (qf === 'justopened') {
                        // Just Opened = registration opened within the last 7 days
                        if (!event.registrationOpenDate) return false;
                        const regOpenDate = new Date(event.registrationOpenDate);
                        const sevenDaysAgo = new Date(now);
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        if (regOpenDate < sevenDaysAgo || regOpenDate > now) return false;
                    }
                    if (qf === 'openingsoon') {
                        // Opening Soon = registration opens within the next 7 days
                        if (!event.registrationOpenDate) return false;
                        const regOpenDate = new Date(event.registrationOpenDate);
                        const sevenDaysFromNow = new Date(now);
                        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                        if (regOpenDate <= now || regOpenDate > sevenDaysFromNow) return false;
                    }
                    if (qf === 'public') {
                        // Public events only = tagged as public or has guest tickets
                        const eventTags = parseTags(event.tags);
                        const isPublic = eventTags.some(t =>
                            t.toLowerCase() === 'public' ||
                            t.toLowerCase() === 'public event'
                        ) || event.hasGuestTickets === 1;
                        if (!isPublic) return false;
                    }
                }
            }

            // Time of day filters (OR logic within group, but AND with other groups)
            if (currentFilters.timeOfDay.length > 0) {
                if (!currentFilters.timeOfDay.includes(timeOfDay)) return false;
            }

            // Member availability filters (OR logic within group)
            if (currentFilters.memberAvailability.length > 0) {
                if (!currentFilters.memberAvailability.includes(memberAvail.status)) return false;
            }

            // Cost filter
            if (currentFilters.cost) {
                const price = event.minPrice || 0;
                if (currentFilters.cost === 'free' && !isFree) return false;
                if (currentFilters.cost === 'under25' && price >= 25) return false;
                if (currentFilters.cost === 'under50' && price >= 50) return false;
                if (currentFilters.cost === 'under100' && price >= 100) return false;
                if (currentFilters.cost === 'over100' && price < 100) return false;
            }

            // Committee filter (based on event name prefix)
            if (currentFilters.committee) {
                const prefixes = COMMITTEE_KEYWORDS[currentFilters.committee] || [];
                const matchesCommittee = prefixes.some(prefix =>
                    event.name.startsWith(prefix) ||
                    event.name.toLowerCase().startsWith(prefix.toLowerCase())
                );
                if (!matchesCommittee) return false;
            }

            return true;
        });

        // Update active filters display
        updateActiveFiltersDisplay();

        // Update calendar
        if (calendarInstance) {
            calendarInstance.removeAllEvents();
            calendarInstance.addEventSource(transformEventsForCalendar(filteredEvents));
        }
    }

    /**
     * Initializes the FullCalendar instance.
     */
    function initCalendar() {
        const calendarEl = document.getElementById('clubcalendar-content');
        calendarEl.innerHTML = '';

        calendarInstance = new FullCalendar.Calendar(calendarEl, {
            initialView: CONFIG.defaultView,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            dayHeaderFormat: window.innerWidth < 600 ? { weekday: 'short' } : { weekday: 'long' },  // Short names on mobile
            events: transformEventsForCalendar(filteredEvents),
            eventClick: handleEventClick,
            displayEventTime: false,  // We'll handle time display ourselves
            dayMaxEvents: false,  // Allow cells to expand
            datesSet: handleCalendarDatesChange,  // Detect navigation to past months
            eventContent: function(arg) {
                const props = arg.event.extendedProps;
                const originalEvent = props.originalEvent;
                const availability = props.availability;
                const isFree = props.isFree;
                const eventTags = props.tags || [];

                // Format time
                const startDate = new Date(originalEvent.startDate);
                const timeStr = startDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).toLowerCase();

                // Calculate which filter criteria this event matches
                const dayOfWeek = startDate.getDay();
                const eventHour = startDate.getHours();
                const dots = [];

                // Weekend (purple dot)
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    dots.push('<span class="clubcal-filter-dot weekend" title="Weekend"></span>');
                }
                // Has Openings (green dot)
                if (availability && availability.status !== 'full') {
                    dots.push('<span class="clubcal-filter-dot openings" title="Openings for Any Member"></span>');
                }
                // Free (yellow dot)
                if (isFree) {
                    dots.push('<span class="clubcal-filter-dot free" title="Free"></span>');
                }
                // After Hours (indigo dot) - weekends OR after 5pm on weekdays
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const isAfter5pmWeekday = dayOfWeek >= 1 && dayOfWeek <= 5 && eventHour >= 17;
                if (isWeekend || isAfter5pmWeekday) {
                    dots.push('<span class="clubcal-filter-dot afterhours" title="After Hours"></span>');
                }
                // Openings for Newbies (cyan dot)
                const isNewbieFriendly = eventTags.some(t =>
                    t.toLowerCase().includes('newbie') ||
                    t.toLowerCase().includes('new member') ||
                    t.toLowerCase().includes('orientation')
                );
                if (isNewbieFriendly) {
                    dots.push('<span class="clubcal-filter-dot newbie" title="Openings for Newbies"></span>');
                }

                // Just Opened (pink dot) - registration opened within last 7 days
                const now = new Date();
                let isJustOpened = false;
                let isOpeningSoon = false;
                if (originalEvent.registrationOpenDate) {
                    const regOpenDate = new Date(originalEvent.registrationOpenDate);
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    const sevenDaysFromNow = new Date(now);
                    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

                    isJustOpened = regOpenDate >= sevenDaysAgo && regOpenDate <= now;
                    isOpeningSoon = regOpenDate > now && regOpenDate <= sevenDaysFromNow;
                }
                if (isJustOpened) {
                    dots.push('<span class="clubcal-filter-dot justopened" title="Just Opened"></span>');
                }
                // Opening Soon (orange dot)
                if (isOpeningSoon) {
                    dots.push('<span class="clubcal-filter-dot openingsoon" title="Opening Soon"></span>');
                }

                // Shorten title - remove "(Registration Opens...)" and similar
                let shortTitle = arg.event.title
                    .replace(/\s*\(Registration Opens[^)]*\)/gi, '')
                    .replace(/\s*\(Registratio[^)]*\)/gi, '')
                    .replace(/\s*\(Opens[^)]*\)/gi, '')
                    .trim();

                const dotsHtml = dots.length > 0
                    ? `<span class="clubcal-dots-container" style="display:inline-flex;gap:2px;margin-left:4px;">${dots.join('')}</span>`
                    : '';

                // Check if we're in list view
                const isListView = arg.view.type === 'listMonth' || arg.view.type === 'listWeek' || arg.view.type === 'listDay';

                if (isListView) {
                    // List view: show badges with labels instead of dots
                    const badges = [];

                    // Price badge (always show, either "Free" or the cost)
                    const price = props.price;
                    if (isFree) {
                        badges.push('<span class="clubcal-badge free">Free</span>');
                    } else if (price) {
                        badges.push(`<span class="clubcal-badge" style="background:#f5f5f5;color:#333;">${price}</span>`);
                    }

                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                        badges.push('<span class="clubcal-badge weekend">Weekend</span>');
                    }
                    if (availability && availability.status !== 'full') {
                        badges.push('<span class="clubcal-badge openings">Openings for Any Member</span>');
                    }
                    if (isWeekend || isAfter5pmWeekday) {
                        badges.push('<span class="clubcal-badge afterhours">After Hours</span>');
                    }
                    if (isNewbieFriendly) {
                        badges.push('<span class="clubcal-badge newbie">Openings for Newbies</span>');
                    }
                    if (isJustOpened) {
                        badges.push('<span class="clubcal-badge justopened">Just Opened</span>');
                    }
                    if (isOpeningSoon) {
                        badges.push('<span class="clubcal-badge openingsoon">Opening Soon</span>');
                    }
                    const badgesHtml = badges.length > 0
                        ? `<span class="clubcal-badges-container">${badges.join('')}</span>`
                        : '';

                    // Include time in list view - use a badge style for readability
                    const listTimeStr = `<span class="clubcal-badge" style="background:rgba(0,0,0,0.15);color:inherit;font-weight:600;">${timeStr}</span>`;

                    return {
                        html: `<span class="clubcal-event-content-list">${listTimeStr}${shortTitle}${badgesHtml}</span>`
                    };
                }

                // Calendar view: time + dots on first line, title below
                return {
                    html: `
                        <div class="clubcal-event-content">
                            <div class="clubcal-event-time-row">${timeStr}${dotsHtml}</div>
                            <div class="clubcal-event-title-row">${shortTitle}</div>
                        </div>
                    `
                };
            },
            eventDidMount: function(info) {
                const props = info.event.extendedProps;
                const memberAvail = props.memberAvailability;
                info.el.title = `${info.event.title}\n${memberAvail.label}`;
            },
            height: 'auto',
            moreLinkClick: 'popover'
        });

        calendarInstance.render();

        // Force recalculate size after layout stabilizes (fixes initial narrow width)
        setTimeout(function() {
            if (calendarInstance) {
                calendarInstance.updateSize();
            }
        }, 100);

        // Add "Past events" dropdown to the calendar toolbar
        const toolbar = calendarEl.querySelector('.fc-toolbar');
        if (toolbar) {
            const maxMonths = CONFIG.pastEventsMonthsList || 6;
            const pastSelector = document.createElement('div');
            pastSelector.className = 'clubcal-past-selector';
            pastSelector.style.marginLeft = 'auto';
            pastSelector.style.display = 'flex';
            pastSelector.style.alignItems = 'center';
            pastSelector.style.gap = '6px';
            pastSelector.style.fontSize = '13px';

            let options = '<option value="0">Current only</option>';
            for (let i = 1; i <= maxMonths; i++) {
                options += `<option value="${i}">${i} month${i > 1 ? 's' : ''} back</option>`;
            }

            pastSelector.innerHTML = `
                <label for="clubcal-past-months" style="color: #666;">Show:</label>
                <select id="clubcal-past-months" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;">
                    ${options}
                </select>
            `;
            toolbar.appendChild(pastSelector);

            // Bind the change event
            pastSelector.querySelector('select').addEventListener('change', function() {
                const months = parseInt(this.value, 10);
                currentFilters.showPast = months > 0;
                currentFilters.pastMonths = months;
                reloadEvents();
            });
        }
    }

    /**
     * Handles calendar date navigation.
     * When user navigates to a month before our earliest loaded event,
     * automatically fetch more past events.
     */
    async function handleCalendarDatesChange(dateInfo) {
        const viewStart = dateInfo.start;

        // If we haven't set the earliest date yet, set it to start of today
        if (!earliestLoadedDate) {
            const now = new Date();
            earliestLoadedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        // Check if user navigated to a month before our earliest loaded events
        if (viewStart < earliestLoadedDate) {
            // Calculate how many months back we need to go
            const monthsDiff = (earliestLoadedDate.getFullYear() - viewStart.getFullYear()) * 12
                + (earliestLoadedDate.getMonth() - viewStart.getMonth()) + 1;

            // Update pastMonths in currentFilters and reload
            const newPastMonths = Math.max(currentFilters.pastMonths, monthsDiff);
            if (newPastMonths > currentFilters.pastMonths) {
                console.log(`ClubCalendar: Loading ${newPastMonths} months of past events for navigation`);
                currentFilters.pastMonths = newPastMonths;
                currentFilters.showPast = true;

                // Update the "Past events" dropdown if it exists
                const pastEventsDropdown = document.querySelector('#clubcal-past-events-select select');
                if (pastEventsDropdown) {
                    // Find the closest option value that covers our needs
                    const options = pastEventsDropdown.options;
                    for (let i = 0; i < options.length; i++) {
                        if (parseInt(options[i].value, 10) >= newPastMonths) {
                            pastEventsDropdown.value = options[i].value;
                            break;
                        }
                    }
                }

                // Reload events with the new range
                await reloadEvents();
            }
        }
    }

    /**
     * Handles click on calendar event.
     */
    function handleEventClick(info) {
        const event = info.event;
        const props = event.extendedProps;
        const originalEvent = props.originalEvent;

        showEventPopup({
            title: event.title,
            category: props.category,
            start: event.start,
            end: event.end,
            location: props.location,
            availability: props.availability,
            price: props.price,
            isFree: props.isFree,
            tags: props.tags,
            id: originalEvent.id
        });
    }

    /**
     * Shows event details popup with expandable sections.
     */
    function showEventPopup(event) {
        // Remove existing popup
        closeEventPopup();

        const startDate = new Date(event.start);
        const dateStr = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        const timeStr = startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });

        let availabilityHtml = '';
        if (event.availability.status === 'full') {
            availabilityHtml = '<span style="color: #c00;">Sold Out / Waitlist</span>';
        } else if (event.availability.status === 'low') {
            availabilityHtml = `<span style="color: #f90;">Only ${event.availability.spots} spots left!</span>`;
        } else if (event.availability.spots) {
            availabilityHtml = `<span style="color: #090;">${event.availability.spots} spots available</span>`;
        } else {
            availabilityHtml = '<span style="color: #090;">Open registration</span>';
        }

        const tagsHtml = event.tags.includes('public event') || event.tags.includes('public')
            ? '<span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:10px;font-size:11px;">Guests Welcome</span>'
            : '';

        const popupHtml = `
            <div class="clubcal-popup-overlay" onclick="window.ClubCalendar.closePopup()"></div>
            <div class="clubcal-event-popup">
                <div class="clubcal-event-popup-header">
                    <span class="clubcal-event-popup-category">${escapeHtml(event.category)}</span>
                    <h3>${escapeHtml(event.title)}</h3>
                </div>
                <div class="clubcal-event-popup-body">
                    <div class="clubcal-event-popup-meta">
                        <div class="clubcal-event-popup-meta-item">
                            <span>📅</span>
                            <strong>${dateStr}</strong>
                        </div>
                        <div class="clubcal-event-popup-meta-item">
                            <span>🕐</span>
                            <strong>${timeStr}</strong>
                        </div>
                        ${event.location && CONFIG.memberLevel ? `
                        <div class="clubcal-event-popup-meta-item">
                            <span>📍</span>
                            <strong>${escapeHtml(event.location)}</strong>
                        </div>
                        ` : ''}
                        <div class="clubcal-event-popup-meta-item">
                            <span>💰</span>
                            <strong>${event.price || 'See event page'}</strong>
                        </div>
                        <div class="clubcal-event-popup-meta-item">
                            <span>🎟️</span>
                            ${availabilityHtml}
                        </div>
                        ${tagsHtml ? `
                        <div class="clubcal-event-popup-meta-item">
                            ${tagsHtml}
                        </div>
                        ` : ''}
                    </div>

                    <!-- Expandable Sections (Members Only) -->
                    ${CONFIG.memberLevel ? `
                    <div class="clubcal-popup-sections">
                        <!-- Who's Registered Section - MEMBERS ONLY -->
                        <div class="clubcal-popup-section" id="clubcal-registrants-section">
                            <div class="clubcal-popup-section-header" onclick="window.ClubCalendar.toggleSection('registrants')">
                                <span>
                                    <span class="clubcal-section-icon">👥</span>
                                    Who's Registered?
                                    <span class="clubcal-registrants-count" id="clubcal-registrants-count"></span>
                                </span>
                                <span class="clubcal-section-arrow">▼</span>
                            </div>
                            <div class="clubcal-popup-section-content">
                                <div class="clubcal-popup-section-inner" id="clubcal-registrants-list">
                                    <div class="clubcal-registrants-loading">Loading registrants...</div>
                                </div>
                            </div>
                        </div>

                        <!-- Photo Gallery Section - MEMBERS ONLY -->
                        <div class="clubcal-popup-section" id="clubcal-gallery-section" style="display:none;">
                            <div class="clubcal-popup-section-header" onclick="window.ClubCalendar.toggleSection('gallery')">
                                <span>
                                    <span class="clubcal-section-icon">📷</span>
                                    Photo Gallery
                                    <span class="clubcal-gallery-count-badge" id="clubcal-gallery-count"></span>
                                </span>
                                <span class="clubcal-section-arrow">▼</span>
                            </div>
                            <div class="clubcal-popup-section-content">
                                <div class="clubcal-popup-section-inner" id="clubcal-gallery-content">
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="clubcal-event-popup-actions">
                        <a href="https://sbnewcomers.org/event-${event.id}" target="_blank" class="clubcal-btn clubcal-btn-primary">
                            View & Register
                        </a>
                        ${CONFIG.showAddToCalendar ? `
                        <button class="clubcal-btn clubcal-btn-calendar" onclick="window.ClubCalendar.downloadIcs('${generateIcsUrl(event)}', '${event.id}')">
                            📅 Add to Calendar
                        </button>
                        ` : ''}
                        <button class="clubcal-btn clubcal-btn-secondary" onclick="window.ClubCalendar.closePopup()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHtml);

        // Fetch registrants and photo info (MEMBERS ONLY)
        if (CONFIG.memberLevel) {
            fetchEventRegistrants(event.id);
            checkEventPhotos(event.id);
        }
    }

    /**
     * Toggles an expandable section in the popup.
     */
    function togglePopupSection(sectionId) {
        const section = document.getElementById(`clubcal-${sectionId}-section`);
        if (section) {
            section.classList.toggle('expanded');
        }
    }

    /**
     * Fetches registrants for an event.
     */
    async function fetchEventRegistrants(eventId) {
        const listEl = document.getElementById('clubcal-registrants-list');
        const countEl = document.getElementById('clubcal-registrants-count');
        if (!listEl) return;

        try {
            const response = await fetch(`${CONFIG.apiBase}/chatbot/api/event-registrants/${eventId}`);
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const registrants = data.registrants || [];

            if (countEl) {
                countEl.textContent = `(${registrants.length})`;
            }

            if (registrants.length === 0) {
                listEl.innerHTML = '<div class="clubcal-registrants-empty">No registrations yet</div>';
                return;
            }

            const html = registrants.map(r => {
                const initials = (r.firstName?.[0] || '') + (r.lastName?.[0] || '');
                const name = `${r.firstName || ''} ${r.lastName || ''}`.trim();
                const profileLink = r.contactId
                    ? `<a href="https://sbnewcomers.org/admin/contacts/${r.contactId}" target="_blank">${escapeHtml(name)}</a>`
                    : escapeHtml(name);

                return `
                    <div class="clubcal-registrant">
                        <div class="clubcal-registrant-avatar">${escapeHtml(initials.toUpperCase())}</div>
                        <div class="clubcal-registrant-name">${profileLink}</div>
                    </div>
                `;
            }).join('');

            listEl.innerHTML = `<div class="clubcal-registrants-list">${html}</div>`;

        } catch (error) {
            console.error('Failed to fetch registrants:', error);
            listEl.innerHTML = '<div class="clubcal-registrants-empty">Unable to load registrants</div>';
        }
    }

    /**
     * Checks if photos exist for an event.
     */
    async function checkEventPhotos(eventId) {
        const sectionEl = document.getElementById('clubcal-gallery-section');
        const contentEl = document.getElementById('clubcal-gallery-content');
        const countEl = document.getElementById('clubcal-gallery-count');
        if (!sectionEl || !contentEl) return;

        try {
            // Check photo tagging system for this event
            const response = await fetch(`${CONFIG.apiBase}/chatbot/api/event-photos/${eventId}`);
            if (!response.ok) throw new Error('No photos');

            const data = await response.json();
            const photoCount = data.photoCount || 0;

            if (photoCount > 0) {
                sectionEl.style.display = 'block';
                if (countEl) {
                    countEl.textContent = `(${photoCount} photos)`;
                }
                contentEl.innerHTML = `
                    <a href="${CONFIG.apiBase}/photos/event/${eventId}" target="_blank" class="clubcal-gallery-link">
                        <span>📷</span>
                        <span>View ${photoCount} Photo${photoCount !== 1 ? 's' : ''}</span>
                        <span class="clubcal-gallery-count">${photoCount}</span>
                    </a>
                `;
            }

        } catch (error) {
            // No photos available - keep section hidden
            console.log('No photos for event:', eventId);
        }
    }

    /**
     * Closes event popup.
     */
    function closeEventPopup() {
        const overlay = document.querySelector('.clubcal-popup-overlay');
        const popup = document.querySelector('.clubcal-event-popup');
        if (overlay) overlay.remove();
        if (popup) popup.remove();
    }

    /**
     * Escapes HTML special characters.
     */
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Shows error message (for non-fatal errors).
     */
    function showError(message) {
        const container = document.getElementById('clubcalendar-content');
        if (container) {
            container.innerHTML = `<div class="clubcal-error">${escapeHtml(message)}</div>`;
        }
    }

    /**
     * Shows fallback WA calendar on fatal error.
     * 1. Hides ClubCalendar container
     * 2. Shows pre-placed WA Calendar container if it exists
     * 3. Shows error message with events link if no fallback container
     */
    function showFallback(error) {
        console.error('ClubCalendar: Fatal error, activating fallback:', error);

        // Hide ClubCalendar container
        const clubCalContainer = document.querySelector(CONFIG.container);
        if (clubCalContainer) {
            clubCalContainer.style.display = 'none';
        }

        // Try to show fallback WA calendar container
        const fallbackContainer = document.getElementById(CONFIG.fallbackContainerId);
        if (fallbackContainer) {
            fallbackContainer.style.display = 'block';
            console.log('ClubCalendar: Fallback WA calendar activated');
            return;
        }

        // No fallback container - show error message with link
        console.log('ClubCalendar: No fallback container found, showing error message');
        if (clubCalContainer) {
            clubCalContainer.style.display = 'block';
            clubCalContainer.innerHTML = `
                <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #856404;">Calendar temporarily unavailable</h3>
                    <p style="margin: 0; color: #856404;">
                        <a href="${escapeHtml(CONFIG.fallbackEventsUrl)}" style="color: #856404; font-weight: 500;">View events list →</a>
                    </p>
                </div>
            `;
        }
    }


// ═══════════════════════════════════════════════════════════════════════════
// MY EVENTS FUNCTIONALITY
// Allows members to look up their registered events and waitlist positions
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Looks up events for a member by email address.
     * Shows both registered events and waitlist positions.
     */
    async function findMyEvents() {
        const emailInput = document.getElementById('clubcal-member-email');
        const pastMonthsSelect = document.getElementById('clubcal-my-events-past');
        const pastMonths = parseInt(pastMonthsSelect?.value || '3', 10);
        const resultsContainer = document.getElementById('clubcal-my-events-results');
        const email = emailInput?.value?.trim();

        if (!email) {
            alert('Please enter your email address');
            return;
        }

        // Show loading state
        resultsContainer.innerHTML = '<div class="clubcal-loading">Looking up your events...</div>';

        // Date filter: include past months based on dropdown selection
        const dateFilter = pastMonths > 0
            ? `datetime(e.StartDate) >= datetime('now', '-${pastMonths} months')`
            : "datetime(e.StartDate) >= datetime('now')";

        try {
            // Query for registered events
            const registeredResponse = await fetch(`${CONFIG.apiBase}/chatbot/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sql: `SELECT e.Id, e.Name, e.StartDate, e.EndDate, e.Location,
                            e.RegistrationsLimit, e.ConfirmedRegistrationsCount, e.Tags, e.Status,
                            e.MinPrice, e.MaxPrice, e.IsFree, e.HasGuestTickets, e.RegistrationOpenDate,
                            er.Status as RegistrationStatus
                        FROM events e
                        JOIN event_registrations er ON e.Id = er.EventId
                        JOIN contacts c ON er.ContactId = c.id
                        WHERE LOWER(c.email) = LOWER('${email.replace(/'/g, "''")}')
                        AND ${dateFilter}
                        ORDER BY e.StartDate
                        LIMIT 50`
                })
            });

            const registeredData = await registeredResponse.json();

            // Parse results
            let myEvents = [];

            if (registeredData.rows && registeredData.rows.length > 0) {
                myEvents = registeredData.rows.map(row => {
                    const registrationStatus = row[14];
                    const isWaitlist = registrationStatus && registrationStatus.toLowerCase().includes('waitlist');
                    const isPast = new Date(row[2]) < new Date();

                    return {
                        id: row[0],
                        name: row[1],
                        startDate: row[2],
                        endDate: row[3],
                        location: row[4],
                        limit: row[5],
                        confirmed: row[6],
                        tags: row[7],
                        status: row[8],
                        minPrice: row[9],
                        maxPrice: row[10],
                        isFree: row[11],
                        hasGuestTickets: row[12],
                        registrationOpenDate: row[13],
                        registrationStatus: registrationStatus,
                        isWaitlist: isWaitlist,
                        isPast: isPast
                    };
                });
            }

            // Render results
            renderMyEvents(myEvents, email);

        } catch (error) {
            console.error('ClubCalendar: Error finding events:', error);
            resultsContainer.innerHTML = `
                <div class="clubcal-error">
                    Error looking up your events. Please try again.
                </div>
            `;
        }
    }

    /**
     * Renders the My Events list.
     */
    function renderMyEvents(events, email) {
        const resultsContainer = document.getElementById('clubcal-my-events-results');

        if (events.length === 0) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3 style="margin-bottom: 8px; color: #333;">No events found</h3>
                    <p>We couldn't find any upcoming event registrations for ${escapeHtml(email)}</p>
                    <p style="font-size: 13px; margin-top: 15px;">
                        Make sure you're using the email address associated with your club membership.
                    </p>
                </div>
            `;
            return;
        }

        // Separate into categories
        const registered = events.filter(e => !e.isWaitlist && !e.isPast);
        const waitlist = events.filter(e => e.isWaitlist && !e.isPast);
        const past = events.filter(e => e.isPast);

        let html = '';

        // Summary
        html += `
            <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <strong>Found ${events.length} event${events.length !== 1 ? 's' : ''}</strong>
                ${registered.length > 0 ? ` - ${registered.length} registered` : ''}
                ${waitlist.length > 0 ? ` - ${waitlist.length} on waitlist` : ''}
                ${past.length > 0 ? ` - ${past.length} past` : ''}
            </div>
        `;

        // Registered events
        if (registered.length > 0) {
            html += '<h4 style="color: #1565c0; margin: 20px 0 12px;">Registered</h4>';
            html += '<div class="clubcal-event-list">';
            registered.forEach(event => {
                html += renderEventCard(event, 'registered');
            });
            html += '</div>';
        }

        // Waitlist events
        if (waitlist.length > 0) {
            html += '<h4 style="color: #e65100; margin: 20px 0 12px;">On Waitlist</h4>';
            html += '<div class="clubcal-event-list">';
            waitlist.forEach(event => {
                html += renderEventCard(event, 'waitlist');
            });
            html += '</div>';
        }

        // Past events
        if (past.length > 0) {
            html += '<h4 style="color: #7b1fa2; margin: 20px 0 12px;">Recent Events</h4>';
            html += '<div class="clubcal-event-list">';
            past.forEach(event => {
                html += renderEventCard(event, 'past');
            });
            html += '</div>';
        }

        resultsContainer.innerHTML = html;
    }

    /**
     * Renders a single event card for My Events list.
     */
    function renderEventCard(event, status) {
        const date = new Date(event.startDate);
        const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = date.getDate();
        const weekday = date.toLocaleString('en-US', { weekday: 'short' });
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const category = extractCommittee(event.name);
        const title = getCleanTitle(event.name);

        // Status badge
        let statusBadge = '';
        let cardClass = 'clubcal-event-card';
        if (status === 'registered') {
            statusBadge = '<span class="clubcal-status-badge confirmed">Registered</span>';
            cardClass += ' registered';
        } else if (status === 'waitlist') {
            statusBadge = '<span class="clubcal-status-badge waitlist">Waitlist</span>';
            cardClass += ' waitlist';
        } else if (status === 'past') {
            statusBadge = '<span class="clubcal-status-badge past">Attended</span>';
        }

        return `
            <div class="${cardClass}" onclick="window.open('https://sbnewcomers.org/event-${event.id}', '_blank')">
                <div class="clubcal-event-card-date">
                    <span class="month">${month}</span>
                    <span class="day">${day}</span>
                    <span class="weekday">${weekday}</span>
                </div>
                <div class="clubcal-event-card-content">
                    <span class="clubcal-event-card-category">${escapeHtml(category)}</span>
                    <div class="clubcal-event-card-title">${escapeHtml(title)}</div>
                    <div class="clubcal-event-card-meta">
                        <span>${time}</span>
                        ${event.location ? `<span>${escapeHtml(event.location)}</span>` : ''}
                    </div>
                </div>
                <div class="clubcal-event-card-status">
                    ${statusBadge}
                </div>
            </div>
        `;
    }


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: PUBLIC API
// CATEGORY C: UI LAYER | ~3% of code | Dependencies: Internal functions only
// Risk: LOW | Breaks if: Function signatures change in other sections
// ═══════════════════════════════════════════════════════════════════════════
//
// Functions exposed on window.ClubCalendar for external use.
// These can be called from Wild Apricot page scripts or browser console.
//
// USAGE EXAMPLES:
//   ClubCalendar.clearFilters()        - Reset all filters
//   ClubCalendar.refresh()             - Reload events from API
//   ClubCalendar.getFilters()          - Get current filter state
//   ClubCalendar.changeView('list')    - Switch calendar view
//   ClubCalendar.closePopup()          - Close event popup
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Public API for external interaction with the calendar.
     * @namespace ClubCalendar
     */
    window.ClubCalendar = {
        /** Initialize the calendar (called automatically) */
        init: init,

        /** Apply current filter values and refresh */
        applyFilters: applyFilters,

        /** Clear all filters */
        clearFilters: clearFilters,

        /** Find member's registered events and waitlist positions */
        findMyEvents: findMyEvents,

        /** Switch between tabs */
        switchTab: switchTab,

        /** Refresh calendar by refetching events */
        refresh: async function() {
            try {
                allEvents = await fetchEvents(currentFilters.pastMonths);
                filteredEvents = [...allEvents];
                filterAndRender();
                lastRefreshTime = Date.now();
                console.log('ClubCalendar: Events refreshed');
            } catch (error) {
                showError('Failed to refresh events. Please try again.');
            }
        },

        /** Refresh if data is stale (for visibility change handler) */
        refreshIfStale: async function() {
            const secondsSinceRefresh = (Date.now() - lastRefreshTime) / 1000;
            if (secondsSinceRefresh >= REFRESH_DEBOUNCE_SECONDS) {
                console.log('ClubCalendar: Tab visible, refreshing (last refresh ' + Math.round(secondsSinceRefresh) + 's ago)');
                await this.refresh();
            } else {
                console.log('ClubCalendar: Tab visible, skipping refresh (last refresh ' + Math.round(secondsSinceRefresh) + 's ago)');
            }
        },

        /** Change calendar view ('month', 'week', 'day', 'list') */
        changeView: function(view) {
            const viewMap = {
                'month': 'dayGridMonth',
                'week': 'timeGridWeek',
                'day': 'timeGridDay',
                'list': 'listMonth'
            };
            const fcView = viewMap[view] || view;
            if (calendarInstance) {
                calendarInstance.changeView(fcView);
            }
        },

        /** Close event popup */
        closePopup: closeEventPopup,

        /** Toggle expandable section in popup */
        toggleSection: togglePopupSection,

        /** Get current configuration */
        getConfig: () => ({ ...CONFIG }),

        /** Get current filter state */
        getFilters: () => ({ ...currentFilters }),

        /** Get loaded events count */
        getEventCount: () => filteredEvents.length,

        /** Download ICS file for an event */
        downloadIcs: async function(url, eventId) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch ICS');
                const icsContent = await response.text();

                // Create blob and trigger download
                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `sbnc-event-${eventId}.ics`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
            } catch (error) {
                console.error('ICS download failed:', error);
                alert('Failed to download calendar file. Please try again.');
            }
        }
    };


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: INITIALIZATION
// CATEGORY C: UI LAYER | ~4% of code | Dependencies: All previous sections
// Risk: LOW | Breaks if: Container element missing, script load order wrong
// ═══════════════════════════════════════════════════════════════════════════
//
// Main entry point that orchestrates setup.
// Auto-runs when DOM is ready.

    /**
     * Main initialization function.
     * 1. Injects CSS
     * 2. Loads external libraries
     * 3. Builds widget HTML
     * 4. Fetches events
     * 5. Initializes calendar
     */
    async function init() {
        injectStyles();

        loadDependencies(async function() {
            // Build widget HTML
            if (!buildWidget()) {
                return;
            }

            try {
                // Fetch events (start with current only, user can select past months)
                allEvents = await fetchEvents(0);
                filteredEvents = [...allEvents];
                lastRefreshTime = Date.now();

                // Track earliest loaded date for navigation
                if (allEvents.length > 0) {
                    const dates = allEvents.map(e => new Date(e.startDate));
                    earliestLoadedDate = new Date(Math.min(...dates));
                } else {
                    // Default to start of today if no events
                    const now = new Date();
                    earliestLoadedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                }

                // Initialize calendar
                initCalendar();

                // Set up visibility change handler for auto-refresh on tab focus
                setupVisibilityHandler();

            } catch (error) {
                showFallback(error);
            }
        });
    }

    /**
     * Sets up visibility change handler to refresh data when user returns to tab.
     * Refreshes if data is older than REFRESH_DEBOUNCE_SECONDS.
     */
    function setupVisibilityHandler() {
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                window.ClubCalendar.refreshIfStale();
            }
        });
        console.log('ClubCalendar: Visibility change handler installed (auto-refresh on tab focus)');
    }

    // Auto-initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

/* ╔═══════════════════════════════════════════════════════════════════════════╗
   ║                                                                           ║
   ║                         CLUBCALENDAR SHIM - END                                   ║
   ║                                                                           ║
   ╚═══════════════════════════════════════════════════════════════════════════╝ */

})();
