/**
 * ClubCalendar Widget - Wild Apricot Native Edition
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This version runs ENTIRELY on the Wild Apricot page with NO external server.
 * It fetches event data directly from the WA API using the logged-in user's session.
 *
 * REQUIREMENTS:
 * - Must be embedded on a Wild Apricot page
 * - User must be logged in to WA
 * - WA Account ID must be configured
 * - Client ID must be obtained from WA admin settings
 *
 * FEATURES:
 * - Direct WA API integration (no external server)
 * - Auto-detects logged-in user for "My Events"
 * - All filtering and transformation runs client-side
 * - Same UI as the playground version
 *
 * @version 2.0.0 - WA Native Edition
 * @author ClubCalendar
 */

(function() {
    'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Default configuration - override via window.CLUBCALENDAR_CONFIG
     */
    const DEFAULT_CONFIG = {
        container: '#clubcalendar',
        waAccountId: null,              // REQUIRED: Your WA Account ID
        waClientId: null,               // REQUIRED: Your WA API Client ID
        defaultView: 'dayGridMonth',
        showFilters: true,
        showHeader: true,
        headerTitle: 'Club Events',
        showMyEvents: true,
        pastEventsVisible: false,
        pastEventsDays: 14,
        futureMonthsLimit: 3,
        primaryColor: '#2c5aa0',
        accentColor: '#d4a800',
        // Auto-tagging rules (same format as sync.py config)
        autoTagRules: [
            { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
            { type: 'name-prefix', pattern: 'Games!:', tag: 'committee:games' },
            { type: 'name-prefix', pattern: 'Wine Appreciation:', tag: 'committee:wine' },
            { type: 'name-prefix', pattern: 'Epicurious:', tag: 'committee:epicurious' },
            { type: 'name-prefix', pattern: 'TGIF:', tag: 'committee:tgif' },
            { type: 'name-prefix', pattern: 'Cycling:', tag: 'committee:cycling' },
            { type: 'name-prefix', pattern: 'Golf:', tag: 'committee:golf' },
            { type: 'name-prefix', pattern: 'Performing Arts:', tag: 'committee:performing-arts' },
            { type: 'name-prefix', pattern: 'Local Heritage:', tag: 'committee:local-heritage' },
            { type: 'name-prefix', pattern: 'Wellness:', tag: 'committee:wellness' },
            { type: 'name-prefix', pattern: 'Garden:', tag: 'committee:garden' },
            { type: 'name-prefix', pattern: 'Arts:', tag: 'committee:arts' },
            { type: 'name-prefix', pattern: 'Current Events:', tag: 'committee:current-events' },
            { type: 'name-prefix', pattern: 'Pop-Up:', tag: 'committee:popup' },
            { type: 'name-prefix', pattern: 'Beer Lovers:', tag: 'committee:beer' },
            { type: 'name-prefix', pattern: 'Out to Lunch:', tag: 'committee:out-to-lunch' },
            { type: 'name-prefix', pattern: 'Afternoon Book:', tag: 'committee:book-clubs' },
            { type: 'name-prefix', pattern: 'Evening Book:', tag: 'committee:book-clubs' },
            { type: 'name-contains', pattern: 'hike', tag: 'activity:outdoors' },
            { type: 'name-contains', pattern: 'wine', tag: 'activity:wine' },
            { type: 'name-contains', pattern: 'game', tag: 'activity:games' }
        ]
    };

    let CONFIG = Object.assign({}, DEFAULT_CONFIG, window.CLUBCALENDAR_CONFIG || {});

    // State
    let allEvents = [];
    let filteredEvents = [];
    let currentUser = null;
    let myRegistrations = [];
    let calendarInstance = null;

    let currentFilters = {
        committee: null,
        time: 'upcoming',
        availability: null,
        timeOfDay: [],
        quickFilters: [],
        showPast: false,
        pastMonths: 0
    };


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: WILD APRICOT API CLIENT
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * WA API wrapper - uses session cookie authentication for logged-in users
     */
    const WaApi = {
        /**
         * Make an API call to Wild Apricot
         * Uses the logged-in user's session cookie for authentication
         */
        async call(endpoint, options = {}) {
            const url = `/sys/api/v2/accounts/${CONFIG.waAccountId}${endpoint}`;

            const headers = {
                'Accept': 'application/json',
                ...options.headers
            };

            // Add clientId header for session-based auth
            if (CONFIG.waClientId) {
                headers['clientId'] = CONFIG.waClientId;
            }

            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`WA API error: ${response.status} ${response.statusText}`);
            }

            return response.json();
        },

        /**
         * Get the currently logged-in user's contact info
         */
        async getCurrentUser() {
            try {
                const user = await this.call('/contacts/me');
                return user;
            } catch (error) {
                console.warn('ClubCalendar: Could not get current user (not logged in?)', error);
                return null;
            }
        },

        /**
         * Fetch all upcoming events
         * @param {number} includePastDays - Days of past events to include
         */
        async getEvents(includePastDays = 0) {
            const startDate = new Date();
            if (includePastDays > 0) {
                startDate.setDate(startDate.getDate() - includePastDays);
            }

            const dateFilter = startDate.toISOString().split('T')[0];

            let allEvents = [];
            let pageUrl = `/events?$filter=StartDate ge ${dateFilter}&$sort=StartDate asc`;

            while (pageUrl) {
                const data = await this.call(pageUrl);

                if (data.Events) {
                    allEvents = allEvents.concat(data.Events);
                    pageUrl = data.ResultNextPageUrl ?
                        data.ResultNextPageUrl.replace(/^.*\/v2\.2\/accounts\/\d+/, '') :
                        null;
                } else if (Array.isArray(data)) {
                    allEvents = allEvents.concat(data);
                    pageUrl = null;
                } else {
                    pageUrl = null;
                }
            }

            return allEvents;
        },

        /**
         * Get registrations for a specific contact
         * @param {number} contactId - The contact's ID
         */
        async getContactRegistrations(contactId) {
            try {
                // Get event registrations for this contact
                const data = await this.call(`/eventregistrations?contactId=${contactId}&includeWaitList=true`);
                return data.EventRegistrations || data || [];
            } catch (error) {
                console.warn('ClubCalendar: Could not fetch registrations', error);
                return [];
            }
        },

        /**
         * Get event details including registration info
         */
        async getEventDetails(eventId) {
            return this.call(`/events/${eventId}`);
        }
    };


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: EVENT TRANSFORMATION (ported from sync.py)
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Apply auto-tagging rules to an event (same logic as sync.py)
     */
    function applyAutoTags(event, rules) {
        const autoTags = [];
        const eventName = (event.Name || '').toLowerCase();

        for (const rule of rules) {
            const pattern = (rule.pattern || '').toLowerCase();
            const tag = rule.tag;

            if (!pattern || !tag) continue;

            let matched = false;

            if (rule.type === 'name-prefix') {
                matched = eventName.startsWith(pattern);
            } else if (rule.type === 'name-contains') {
                matched = eventName.includes(pattern);
            } else if (rule.type === 'name-suffix') {
                matched = eventName.endsWith(pattern);
            }

            if (matched) {
                autoTags.push(tag);
            }
        }

        return autoTags;
    }

    /**
     * Derive time-of-day tag from event start time (same logic as sync.py)
     */
    function deriveTimeOfDay(startDateStr) {
        try {
            const startDt = new Date(startDateStr);
            const hour = startDt.getHours();

            if (hour < 12) {
                return 'time:morning';
            } else if (hour < 17) {
                return 'time:afternoon';
            } else {
                return 'time:evening';
            }
        } catch (e) {
            return null;
        }
    }

    /**
     * Derive availability tag from registration data (same logic as sync.py)
     */
    function deriveAvailability(event) {
        const limit = event.RegistrationsLimit;
        const confirmed = event.ConfirmedRegistrationsCount || 0;

        if (limit === null || limit === undefined || limit === 0) {
            return 'availability:open';
        }

        const spots = limit - confirmed;

        if (spots <= 0) {
            return 'availability:full';
        } else if (spots <= 5) {
            return 'availability:limited';
        } else {
            return 'availability:open';
        }
    }

    /**
     * Check if event is on a weekend (same logic as sync.py)
     */
    function isWeekend(startDateStr) {
        try {
            const startDt = new Date(startDateStr);
            const day = startDt.getDay();
            return day === 0 || day === 6; // Sunday = 0, Saturday = 6
        } catch (e) {
            return false;
        }
    }

    /**
     * Transform WA API event to ClubCalendar format (same logic as sync.py)
     */
    function transformEvent(waEvent) {
        // Get existing WA tags
        let waTags = waEvent.Tags || [];
        if (typeof waTags === 'string') {
            waTags = waTags.split(',').map(t => t.trim()).filter(t => t);
        }

        // Apply auto-tagging rules
        const autoTags = applyAutoTags(waEvent, CONFIG.autoTagRules);

        // Derive additional tags
        const startDate = waEvent.StartDate || '';

        const timeTag = deriveTimeOfDay(startDate);
        if (timeTag) autoTags.push(timeTag);

        const availTag = deriveAvailability(waEvent);
        autoTags.push(availTag);

        if (isWeekend(startDate)) {
            autoTags.push('day:weekend');
        }

        // Combine all tags (deduplicated)
        const allTags = [...new Set([...waTags, ...autoTags])];

        // Calculate spots available
        const limit = waEvent.RegistrationsLimit;
        const confirmed = waEvent.ConfirmedRegistrationsCount || 0;
        const spotsAvailable = (limit === null || limit === undefined) ? null : Math.max(0, limit - confirmed);

        // Build transformed event
        return {
            id: waEvent.Id,
            name: waEvent.Name || '',
            startDate: startDate,
            endDate: waEvent.EndDate || '',
            location: waEvent.Location || '',
            description: waEvent.Details?.DescriptionHtml || '',
            url: waEvent.Url || (typeof window !== 'undefined' ? `${window.location.origin}/event-${waEvent.Id}` : `/event-${waEvent.Id}`),
            registrationUrl: waEvent.RegistrationUrl || '',
            tags: allTags,
            tagsString: allTags.join(', '),
            spotsAvailable: spotsAvailable,
            limit: limit,
            confirmed: confirmed,
            isFull: spotsAvailable === 0,
            registrationEnabled: waEvent.RegistrationEnabled !== false,
            accessLevel: waEvent.AccessLevel || 'Public',
            // Additional fields for filtering
            minPrice: null, // WA doesn't expose this in basic event list
            isFree: null,
            hasGuestTickets: waEvent.AccessLevel === 'Public' ? 1 : 0
        };
    }


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: DATA FETCHING
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Fetch and transform all events from WA API
     */
    async function fetchEvents(pastDays = 0) {
        const waEvents = await WaApi.getEvents(pastDays);

        // Filter out cancelled events and transform
        return waEvents
            .filter(e => !(e.Name || '').toUpperCase().includes('CANCELLED'))
            .map(e => transformEvent(e));
    }

    /**
     * Fetch current user and their registrations
     */
    async function fetchCurrentUserAndRegistrations() {
        currentUser = await WaApi.getCurrentUser();

        if (currentUser && currentUser.Id) {
            const registrations = await WaApi.getContactRegistrations(currentUser.Id);
            myRegistrations = registrations;
            return { user: currentUser, registrations };
        }

        return { user: null, registrations: [] };
    }


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: FILTERING LOGIC
// ═══════════════════════════════════════════════════════════════════════════

    const FILTER_RULES = {
        weekend: {
            id: 'weekend',
            label: 'Weekend',
            criteria: (event) => {
                const date = new Date(event.startDate);
                const day = date.getDay();
                return day === 0 || day === 6;
            }
        },
        openings: {
            id: 'openings',
            label: 'Has Openings',
            criteria: (event) => {
                return event.spotsAvailable === null || event.spotsAvailable > 0;
            }
        },
        free: {
            id: 'free',
            label: 'Free',
            criteria: (event) => {
                return event.isFree === 1 || event.minPrice === 0 ||
                       event.tags.includes('cost:free');
            }
        },
        afterhours: {
            id: 'afterhours',
            label: 'After Hours',
            criteria: (event) => {
                const date = new Date(event.startDate);
                const day = date.getDay();
                const hour = date.getHours();
                const isWeekend = day === 0 || day === 6;
                const isAfter5pmWeekday = day >= 1 && day <= 5 && hour >= 17;
                return isWeekend || isAfter5pmWeekday;
            }
        },
        newbie: {
            id: 'newbie',
            label: 'Newbie Friendly',
            criteria: (event) => {
                return event.tags.some(t =>
                    t.toLowerCase().includes('newbie') ||
                    t.toLowerCase().includes('beginner')
                );
            }
        }
    };

    /**
     * Apply filters to events
     */
    function applyFilters() {
        filteredEvents = allEvents.filter(event => {
            // Time filter
            const eventDate = new Date(event.startDate);
            const now = new Date();

            if (currentFilters.time === 'upcoming' && eventDate < now) {
                return false;
            }

            // Quick filters (OR logic within, AND with other filters)
            if (currentFilters.quickFilters.length > 0) {
                const matchesAnyQuickFilter = currentFilters.quickFilters.some(filterId => {
                    const rule = FILTER_RULES[filterId];
                    return rule && rule.criteria(event);
                });
                if (!matchesAnyQuickFilter) return false;
            }

            // Committee filter
            if (currentFilters.committee) {
                const hasCommitteeTag = event.tags.some(t =>
                    t.toLowerCase().includes(`committee:${currentFilters.committee.toLowerCase()}`)
                );
                if (!hasCommitteeTag) return false;
            }

            // Availability filter
            if (currentFilters.availability === 'open') {
                if (event.spotsAvailable !== null && event.spotsAvailable <= 0) {
                    return false;
                }
            }

            return true;
        });

        updateDisplay();
    }


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: UI RENDERING
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Extract committee name from event title prefix
     */
    function extractCommittee(name) {
        const colonIdx = name.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30) {
            return name.substring(0, colonIdx).replace(/[*\-()]/g, '').trim();
        }
        return 'General';
    }

    /**
     * Get clean event title without committee prefix
     */
    function getCleanTitle(name) {
        const colonIdx = name.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30) {
            return name.substring(colonIdx + 1).trim();
        }
        return name;
    }

    /**
     * Derive time-of-day category for color coding
     */
    function getTimeOfDayClass(startDate) {
        if (!startDate) return 'allday';

        const date = new Date(startDate);
        const hour = date.getHours();

        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }

    /**
     * Transform events for FullCalendar
     */
    function transformEventsForCalendar(events) {
        return events.map(event => {
            const timeOfDay = getTimeOfDayClass(event.startDate);

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
                    spotsAvailable: event.spotsAvailable,
                    isFull: event.isFull,
                    tags: event.tags
                }
            };
        });
    }

    /**
     * Update the calendar display
     */
    function updateDisplay() {
        if (calendarInstance) {
            const calendarEvents = transformEventsForCalendar(filteredEvents);
            calendarInstance.removeAllEvents();
            calendarInstance.addEventSource(calendarEvents);
        }

        // Update results count
        const countEl = document.getElementById('clubcal-results-count');
        if (countEl) {
            countEl.textContent = `Showing ${filteredEvents.length} of ${allEvents.length} events`;
        }
    }

    /**
     * Inject CSS styles
     */
    function injectStyles() {
        if (document.getElementById('clubcalendar-wa-styles')) return;

        const css = `
/* ClubCalendar WA Native Styles */
.clubcalendar-widget {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #333;
    line-height: 1.5;
    width: 100%;
}

.clubcalendar-header {
    padding: 15px 0;
    margin-bottom: 15px;
    border-bottom: 2px solid ${CONFIG.primaryColor};
}

.clubcalendar-header h2 {
    margin: 0;
    color: ${CONFIG.primaryColor};
    font-size: 24px;
    font-weight: 600;
}

.clubcal-user-info {
    background: #e3f2fd;
    padding: 10px 15px;
    border-radius: 6px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.clubcal-user-info .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${CONFIG.primaryColor};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.clubcal-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}

.clubcal-tab-btn {
    padding: 12px 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: #666;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
}

.clubcal-tab-btn:hover {
    color: ${CONFIG.primaryColor};
}

.clubcal-tab-btn.active {
    color: ${CONFIG.primaryColor};
    border-bottom-color: ${CONFIG.primaryColor};
}

.clubcal-tab-content {
    display: none;
}

.clubcal-tab-content.active {
    display: block;
}

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

.clubcal-quick-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;
    margin-top: 12px;
    width: 100%;
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

.clubcal-quick-filter:hover,
.clubcal-quick-filter.active {
    background: ${CONFIG.primaryColor};
    color: white;
    border-color: ${CONFIG.primaryColor};
}

.clubcal-results-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;
    color: #666;
}

.clubcalendar-content {
    min-height: 400px;
}

/* Event colors by time of day */
.clubcal-event-morning {
    background-color: #ff9800 !important;
    border-color: #f57c00 !important;
}

.clubcal-event-afternoon {
    background-color: #42a5f5 !important;
    border-color: #1e88e5 !important;
}

.clubcal-event-evening {
    background-color: #5c6bc0 !important;
    border-color: #3949ab !important;
}

.clubcal-event-allday {
    background-color: #66bb6a !important;
    border-color: #43a047 !important;
}

/* My Events styles */
.clubcal-my-events-auto {
    padding: 20px;
    text-align: center;
    color: #666;
}

.clubcal-event-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.clubcal-event-card {
    display: flex;
    align-items: stretch;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
}

.clubcal-event-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-color: ${CONFIG.primaryColor};
}

.clubcal-event-card-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
    background: ${CONFIG.primaryColor};
    color: white;
    min-width: 70px;
}

.clubcal-event-card-date .month {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
}

.clubcal-event-card-date .day {
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
}

.clubcal-event-card-date .weekday {
    font-size: 11px;
    margin-top: 2px;
}

.clubcal-event-card-content {
    flex: 1;
    padding: 12px 15px;
}

.clubcal-event-card-category {
    font-size: 11px;
    color: ${CONFIG.primaryColor};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.clubcal-event-card-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 4px 0;
}

.clubcal-event-card-meta {
    font-size: 13px;
    color: #666;
}

.clubcal-event-card-meta span {
    margin-right: 15px;
}

.clubcal-event-card-status {
    display: flex;
    align-items: center;
    padding: 0 15px;
}

.clubcal-status-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.clubcal-status-badge.confirmed {
    background: #e8f5e9;
    color: #2e7d32;
}

.clubcal-status-badge.waitlist {
    background: #fff3e0;
    color: #e65100;
}

.clubcal-status-badge.past {
    background: #f3e5f5;
    color: #7b1fa2;
}

.clubcal-loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.clubcal-error {
    text-align: center;
    padding: 40px;
    color: #c62828;
    background: #ffebee;
    border-radius: 8px;
}

.clubcal-login-required {
    text-align: center;
    padding: 40px;
    background: #fff3e0;
    border-radius: 8px;
    color: #e65100;
}
`;

        const style = document.createElement('style');
        style.id = 'clubcalendar-wa-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    /**
     * Build the widget HTML
     */
    function buildWidgetHTML() {
        const userDisplay = currentUser ? `
            <div class="clubcal-user-info">
                <div class="avatar">${(currentUser.FirstName || 'U')[0]}</div>
                <span>Welcome, ${currentUser.FirstName || 'Member'}!</span>
            </div>
        ` : '';

        return `
            <div class="clubcalendar-widget">
                ${CONFIG.showHeader ? `
                    <div class="clubcalendar-header">
                        <h2>${CONFIG.headerTitle}</h2>
                    </div>
                ` : ''}

                ${userDisplay}

                ${CONFIG.showMyEvents ? `
                    <div class="clubcal-tabs">
                        <button class="clubcal-tab-btn active" data-tab="find-events">Find Events</button>
                        <button class="clubcal-tab-btn" data-tab="my-events">My Events</button>
                    </div>
                ` : ''}

                <div id="clubcal-tab-find-events" class="clubcal-tab-content active">
                    ${CONFIG.showFilters ? `
                        <div class="clubcal-filter-bar">
                            <div class="clubcal-quick-filters">
                                <button class="clubcal-quick-filter" data-filter="weekend">Weekend</button>
                                <button class="clubcal-quick-filter" data-filter="openings">Has Openings</button>
                                <button class="clubcal-quick-filter" data-filter="afterhours">After Hours</button>
                                <button class="clubcal-quick-filter" data-filter="free">Free</button>
                            </div>
                        </div>
                    ` : ''}

                    <div class="clubcal-results-bar">
                        <span id="clubcal-results-count">Loading events...</span>
                    </div>

                    <div id="clubcalendar-content" class="clubcalendar-content"></div>
                </div>

                ${CONFIG.showMyEvents ? `
                    <div id="clubcal-tab-my-events" class="clubcal-tab-content">
                        <div id="clubcal-my-events-results" class="clubcal-my-events-auto">
                            <div class="clubcal-loading">Loading your events...</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render My Events section (auto-loaded, no email required)
     */
    function renderMyEvents() {
        const container = document.getElementById('clubcal-my-events-results');
        if (!container) return;

        if (!currentUser) {
            container.innerHTML = `
                <div class="clubcal-login-required">
                    <h3>Login Required</h3>
                    <p>Please log in to see your registered events.</p>
                </div>
            `;
            return;
        }

        if (myRegistrations.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3 style="margin-bottom: 8px; color: #333;">No events found</h3>
                    <p>You're not registered for any upcoming events.</p>
                    <p style="font-size: 13px; margin-top: 15px;">
                        Browse the "Find Events" tab to discover events you might enjoy!
                    </p>
                </div>
            `;
            return;
        }

        // Process registrations and match with events
        const now = new Date();
        const myEvents = myRegistrations
            .map(reg => {
                // Find matching event
                const event = allEvents.find(e => e.id === reg.Event?.Id);
                if (!event) return null;

                const eventDate = new Date(event.startDate);
                const isPast = eventDate < now;
                const isWaitlist = reg.Status?.toLowerCase().includes('waitlist');

                return {
                    ...event,
                    registrationStatus: reg.Status,
                    isWaitlist,
                    isPast
                };
            })
            .filter(e => e !== null)
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        // Separate into categories
        const registered = myEvents.filter(e => !e.isWaitlist && !e.isPast);
        const waitlist = myEvents.filter(e => e.isWaitlist && !e.isPast);
        const past = myEvents.filter(e => e.isPast);

        let html = `
            <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <strong>Found ${myEvents.length} event${myEvents.length !== 1 ? 's' : ''}</strong>
                ${registered.length > 0 ? ` - ${registered.length} registered` : ''}
                ${waitlist.length > 0 ? ` - ${waitlist.length} on waitlist` : ''}
                ${past.length > 0 ? ` - ${past.length} past` : ''}
            </div>
        `;

        if (registered.length > 0) {
            html += '<h4 style="color: #1565c0; margin: 20px 0 12px;">Registered</h4>';
            html += '<div class="clubcal-event-list">';
            registered.forEach(event => {
                html += renderEventCard(event, 'registered');
            });
            html += '</div>';
        }

        if (waitlist.length > 0) {
            html += '<h4 style="color: #e65100; margin: 20px 0 12px;">On Waitlist</h4>';
            html += '<div class="clubcal-event-list">';
            waitlist.forEach(event => {
                html += renderEventCard(event, 'waitlist');
            });
            html += '</div>';
        }

        if (past.length > 0) {
            html += '<h4 style="color: #7b1fa2; margin: 20px 0 12px;">Recent Events</h4>';
            html += '<div class="clubcal-event-list">';
            past.forEach(event => {
                html += renderEventCard(event, 'past');
            });
            html += '</div>';
        }

        container.innerHTML = html;
    }

    /**
     * Render a single event card
     */
    function renderEventCard(event, status) {
        const date = new Date(event.startDate);
        const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = date.getDate();
        const weekday = date.toLocaleString('en-US', { weekday: 'short' });
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const category = extractCommittee(event.name);
        const title = getCleanTitle(event.name);

        let statusBadge = '';
        if (status === 'registered') {
            statusBadge = '<span class="clubcal-status-badge confirmed">Registered</span>';
        } else if (status === 'waitlist') {
            statusBadge = '<span class="clubcal-status-badge waitlist">Waitlist</span>';
        } else if (status === 'past') {
            statusBadge = '<span class="clubcal-status-badge past">Attended</span>';
        }

        return `
            <div class="clubcal-event-card" onclick="window.open('${event.url}', '_blank')">
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

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.clubcal-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                // Update tab buttons
                document.querySelectorAll('.clubcal-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update tab content
                document.querySelectorAll('.clubcal-tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`clubcal-tab-${tab}`).classList.add('active');

                // Render My Events on tab switch if needed
                if (tab === 'my-events') {
                    renderMyEvents();
                }
            });
        });

        // Quick filters
        document.querySelectorAll('.clubcal-quick-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                btn.classList.toggle('active');

                if (btn.classList.contains('active')) {
                    if (!currentFilters.quickFilters.includes(filter)) {
                        currentFilters.quickFilters.push(filter);
                    }
                } else {
                    currentFilters.quickFilters = currentFilters.quickFilters.filter(f => f !== filter);
                }

                applyFilters();
            });
        });
    }

    /**
     * Initialize FullCalendar
     */
    function initCalendar() {
        const calendarEl = document.getElementById('clubcalendar-content');
        if (!calendarEl) return;

        calendarInstance = new FullCalendar.Calendar(calendarEl, {
            initialView: CONFIG.defaultView,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listMonth'
            },
            events: transformEventsForCalendar(filteredEvents),
            eventClick: function(info) {
                const event = info.event.extendedProps.originalEvent;
                if (event && event.url) {
                    window.open(event.url, '_blank');
                }
            },
            eventDidMount: function(info) {
                // Add tooltip on hover
                const event = info.event.extendedProps.originalEvent;
                if (event) {
                    info.el.title = `${event.name}\n${event.location || ''}\n${event.spotsAvailable !== null ? `${event.spotsAvailable} spots available` : ''}`;
                }
            }
        });

        calendarInstance.render();
    }

    /**
     * Load FullCalendar library
     */
    function loadFullCalendar() {
        return new Promise((resolve, reject) => {
            if (window.FullCalendar) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

    /**
     * Main initialization function
     */
    async function init() {
        try {
            // Validate config
            if (!CONFIG.waAccountId) {
                throw new Error('waAccountId is required in CLUBCALENDAR_CONFIG');
            }

            // Inject styles
            injectStyles();

            // Load FullCalendar
            await loadFullCalendar();

            // Get container
            const container = document.querySelector(CONFIG.container);
            if (!container) {
                throw new Error(`Container not found: ${CONFIG.container}`);
            }

            // Show loading state
            container.innerHTML = '<div class="clubcal-loading">Loading ClubCalendar...</div>';

            // Fetch current user and events in parallel
            const [userResult, events] = await Promise.all([
                fetchCurrentUserAndRegistrations(),
                fetchEvents(CONFIG.pastEventsVisible ? CONFIG.pastEventsDays : 0)
            ]);

            currentUser = userResult.user;
            myRegistrations = userResult.registrations;
            allEvents = events;
            filteredEvents = [...events];

            // Build and render UI
            container.innerHTML = buildWidgetHTML();

            // Setup event listeners
            setupEventListeners();

            // Initialize calendar
            initCalendar();

            // Apply initial filters
            applyFilters();

            console.log('ClubCalendar WA Native initialized:', {
                user: currentUser?.Email,
                events: allEvents.length,
                registrations: myRegistrations.length
            });

        } catch (error) {
            console.error('ClubCalendar initialization error:', error);

            const container = document.querySelector(CONFIG.container);
            if (container) {
                container.innerHTML = `
                    <div class="clubcal-error">
                        <h3>Error Loading Calendar</h3>
                        <p>${escapeHtml(error.message)}</p>
                        <p style="font-size: 12px; margin-top: 10px;">
                            Make sure you're logged in and the waAccountId is configured correctly.
                        </p>
                    </div>
                `;
            }
        }
    }


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

    window.ClubCalendar = {
        init: init,
        refresh: async function() {
            allEvents = await fetchEvents(CONFIG.pastEventsVisible ? CONFIG.pastEventsDays : 0);
            filteredEvents = [...allEvents];
            applyFilters();
        },
        getUser: () => currentUser,
        getEvents: () => allEvents,
        getFilters: () => currentFilters,
        clearFilters: function() {
            currentFilters.quickFilters = [];
            currentFilters.committee = null;
            currentFilters.availability = null;
            document.querySelectorAll('.clubcal-quick-filter').forEach(b => b.classList.remove('active'));
            applyFilters();
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
