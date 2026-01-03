# v1.03 to v1.04 Modifications

This document describes the code changes needed to convert ClubCalendar from external server (v1.03) to client-side Member API (v1.04).

## Summary of Changes

1. **Add new config options**: `useClientSideApi`, `waClientId`
2. **Add new fetch function**: `fetchEventsFromMemberApi()`
3. **Modify fetch priority**: Check client-side API first
4. **Update My Events**: Use Member API instead of email lookup
5. **Add login detection**: Check for WA session
6. **Update version number**: 1.02 → 1.04

## Change 1: Configuration (lines 41-155)

### Add to CLUBCALENDAR_CONFIG:

```javascript
window.CLUBCALENDAR_CONFIG = {
    waAccountId: '176353',
    waClientId: 'YOUR_CLIENT_ID',      // NEW: Required for client-side API
    useClientSideApi: true,             // NEW: Enable client-side fetching
    // eventsUrl removed - not needed for client-side
    headerTitle: 'Club Events',
    // ... rest unchanged
};
```

## Change 2: DEFAULT_CONFIG (around line 362)

### Add new defaults:

```javascript
const DEFAULT_CONFIG = {
    container: '#clubcalendar',
    waAccountId: '',                    // NEW
    waClientId: '',                     // NEW
    useClientSideApi: false,            // NEW: Use WA Member API directly
    eventsUrl: '',
    // ... rest unchanged
};
```

## Change 3: fetchEvents() function (around line 2401)

### Replace the fetch priority:

```javascript
async function fetchEvents(pastMonths = 0) {
    // NEW Priority 1: Client-side WA Member API
    if (CONFIG.useClientSideApi && CONFIG.waAccountId && CONFIG.waClientId) {
        return fetchEventsFromMemberApi(pastMonths);
    }

    // Priority 2: JSON file URL
    if (CONFIG.eventsUrl) {
        return fetchEventsFromJson(pastMonths);
    }

    // Priority 3: Live WA API (external server)
    if (CONFIG.useLiveApi) {
        return fetchEventsLive(pastMonths);
    }

    // Priority 4: SQLite API (legacy)
    return fetchEventsFromSqlite(pastMonths);
}
```

## Change 4: Add fetchEventsFromMemberApi() (after line 2448)

### New function:

```javascript
/**
 * Fetch events directly from WA Member API (client-side).
 * Requires logged-in user and waClientId configuration.
 *
 * @param {number} pastMonths - Number of months back to include (0 = current only)
 * @returns {Promise<Array>} Array of event objects
 */
async function fetchEventsFromMemberApi(pastMonths = 0) {
    const accountId = CONFIG.waAccountId;
    const clientId = CONFIG.waClientId;

    if (!accountId || !clientId) {
        throw new Error('waAccountId and waClientId required for client-side API');
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (pastMonths > 0) {
        startDate.setMonth(startDate.getMonth() - pastMonths);
    }

    // Build API URL with OData filter
    const dateStr = startDate.toISOString().split('T')[0];
    const url = `/sys/api/publicview/v1/accounts/${accountId}/events` +
        `?$filter=StartDate ge datetime'${dateStr}'` +
        `&$orderby=StartDate`;

    try {
        const response = await fetch(url, {
            headers: { 'clientId': clientId }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('LOGIN_REQUIRED');
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const events = data.Events || [];

        return events
            .filter(e => !e.Name || !e.Name.includes('CANCELLED'))
            .map(event => mapMemberApiEventToInternal(event));

    } catch (error) {
        console.error('ClubCalendar: Failed to fetch from Member API:', error);
        throw error;
    }
}

/**
 * Maps WA Member API event format to internal event format.
 */
function mapMemberApiEventToInternal(event) {
    const limit = event.RegistrationsLimit;
    const confirmed = event.ConfirmedRegistrationsCount || 0;
    const spotsAvailable = limit ? limit - confirmed : null;
    const isFull = limit ? confirmed >= limit : false;

    // Determine availability
    let availability = 'unlimited';
    if (limit !== null && limit > 0) {
        const remaining = limit - confirmed;
        if (remaining <= 0) availability = 'full';
        else if (remaining <= 3) availability = 'limited';
        else availability = 'available';
    }

    // Parse tags
    let tagsStr = '';
    if (Array.isArray(event.Tags)) {
        tagsStr = event.Tags.map(t => t.Name || t).join(', ');
    }

    // Check if public
    const isPublic = tagsStr.toLowerCase().includes('public') ||
                     event.AccessLevel === 'Public';

    // Parse description
    let description = '';
    if (event.Details && event.Details.DescriptionHtml) {
        description = event.Details.DescriptionHtml;
    }

    return {
        id: event.Id,
        name: event.Name || '',
        startDate: event.StartDate,
        endDate: event.EndDate,
        location: event.Location || '',
        limit: limit,
        confirmed: confirmed,
        tags: tagsStr,
        status: event.RegistrationEnabled !== false ? 'Active' : 'Disabled',
        minPrice: null,
        maxPrice: null,
        isFree: null,
        hasGuestTickets: null,
        registrationOpenDate: null,
        registrationEnabled: event.RegistrationEnabled,
        accessLevel: event.AccessLevel,
        availability: availability,
        spotsAvailable: spotsAvailable,
        isFull: isFull,
        isPublic: isPublic,
        eventUrl: event.Url || `https://sbnewcomers.org/event-${event.Id}`,
        description: description
    };
}
```

## Change 5: My Events functionality (around line 4600)

### Replace loadMyEvents function:

```javascript
/**
 * Load user's event registrations from WA Member API.
 * Uses /contacts/me endpoint which returns current user's data.
 */
async function loadMyEventsFromApi() {
    if (!CONFIG.useClientSideApi || !CONFIG.waAccountId || !CONFIG.waClientId) {
        // Fall back to existing behavior if not using client-side API
        return null;
    }

    const accountId = CONFIG.waAccountId;
    const clientId = CONFIG.waClientId;

    const url = `/sys/api/publicview/v1/accounts/${accountId}/contacts/me/eventregistrations`;

    try {
        const response = await fetch(url, {
            headers: { 'clientId': clientId }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return { error: 'LOGIN_REQUIRED' };
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const registrations = data.EventRegistrations || [];

        return registrations.map(reg => ({
            eventId: reg.Event ? reg.Event.Id : null,
            eventName: reg.Event ? reg.Event.Name : 'Unknown',
            eventDate: reg.Event ? reg.Event.StartDate : null,
            status: reg.Status || 'Registered',
            isWaitlist: (reg.Status || '').toLowerCase().includes('waitlist')
        })).filter(r => r.eventId);

    } catch (error) {
        console.error('ClubCalendar: Failed to load My Events:', error);
        return { error: error.message };
    }
}
```

## Change 6: Login detection (in init function, around line 4911)

### Add login check for client-side API:

```javascript
async function init() {
    injectStyles();

    loadDependencies(async function() {
        if (!buildWidget()) {
            return;
        }

        try {
            // For client-side API, verify user is logged in
            if (CONFIG.useClientSideApi) {
                const loginCheck = await checkLoginStatus();
                if (!loginCheck.loggedIn) {
                    showLoginRequired();
                    return;
                }
                // Update member level from API response
                if (loginCheck.memberLevel) {
                    CONFIG.memberLevel = loginCheck.memberLevel;
                }
            }

            allEvents = await fetchEvents(0);
            // ... rest unchanged
        } catch (error) {
            if (error.message === 'LOGIN_REQUIRED') {
                showLoginRequired();
            } else {
                showFallback(error);
            }
        }
    });
}

/**
 * Check if user is logged in by calling /contacts/me
 */
async function checkLoginStatus() {
    if (!CONFIG.waAccountId || !CONFIG.waClientId) {
        return { loggedIn: false };
    }

    try {
        const url = `/sys/api/publicview/v1/accounts/${CONFIG.waAccountId}/contacts/me`;
        const response = await fetch(url, {
            headers: { 'clientId': CONFIG.waClientId }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                loggedIn: true,
                memberLevel: data.MembershipLevel ? data.MembershipLevel.Name : 'Member',
                email: data.Email
            };
        }
        return { loggedIn: false };
    } catch (e) {
        return { loggedIn: false };
    }
}

/**
 * Show login required message
 */
function showLoginRequired() {
    const container = document.querySelector(CONFIG.container);
    if (container) {
        container.innerHTML = `
            <div class="clubcal-login-required" style="
                text-align: center;
                padding: 60px 20px;
                background: var(--clubcal-info-bg, #e3f2fd);
                border-radius: 8px;
                margin: 20px 0;
            ">
                <h2 style="color: var(--clubcal-primary, #2c5aa0); margin-bottom: 16px;">
                    Members Only
                </h2>
                <p style="color: var(--clubcal-text-muted, #666); margin-bottom: 24px;">
                    Please log in to view the club calendar and your event registrations.
                </p>
                <a href="/Sys/Login" style="
                    display: inline-block;
                    padding: 12px 32px;
                    background: var(--clubcal-primary, #2c5aa0);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                ">Log In</a>
            </div>
        `;
    }
}
```

## Change 7: Version number

Update the version comment at top of file:
```
*  Version: 1.04
*  Generated: 2026-01-03
```

## Testing Checklist

After applying changes:

- [ ] Widget loads for logged-in member
- [ ] "Login Required" shown for anonymous visitor
- [ ] Events load from Member API
- [ ] Filters work (time of day, committee, availability)
- [ ] "My Events" tab shows user's registrations
- [ ] Clicking event goes to WA event page
- [ ] Popup shows event details
- [ ] Auto-refresh works on tab focus
