# ClubCalendar v1.04 - Client-Side Member API Edition

## Strategic Direction

**Public pages**: Use Wild Apricot's native event widget (no customization needed)

**Member pages**: Use ClubCalendar with client-side WA Member API

This eliminates:
- External server dependency for members
- iframe architecture
- CORS concerns
- Server maintenance overhead

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Wild Apricot (sbnewcomers.org)                                                 │
│                                                                                 │
│  ┌─────────────────────────┐     ┌─────────────────────────────────────────────┐
│  │  /events (public page)  │     │  /member-events (members-only page)        │
│  │  WA Native Widget       │     │  ClubCalendar Widget (inline)              │
│  │  No customization       │     │  Fetches from Member API                   │
│  └─────────────────────────┘     └────────────────┬────────────────────────────┘
│                                                   │
│                                                   ▼
│                                   ┌───────────────────────────────┐
│                                   │  /sys/api/publicview/v1/     │
│                                   │  accounts/176353/events       │
│                                   │  (WA Member API)              │
│                                   │  - Same-origin, no CORS       │
│                                   │  - Requires logged-in user    │
│                                   │  - Returns member-level data  │
│                                   └───────────────────────────────┘
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key Differences from v1.03 (External Server)

| Aspect | v1.03 External Server | v1.04 Client-Side |
|--------|----------------------|-------------------|
| Data source | mail.sbnewcomers.org/api/events | /sys/api/publicview/v1/ |
| Architecture | iframe embedding external page | Inline script on WA page |
| Authentication | None (cached data) | WA session cookie (automatic) |
| CSS integration | Isolated in iframe | Inherits from WA Custom CSS |
| Server dependency | Requires mail server | None |
| Audience | Public or member | Members only |
| Rate limits | Our server handles | WA API limits (60/min) |

## API Endpoint

**Member API for Events**:
```
GET /sys/api/publicview/v1/accounts/176353/events
```

**Required Headers**:
```javascript
headers: {
    'clientId': 'YOUR_API_APPLICATION_ID'  // From WA API settings
}
```

**Response Format** (WA API):
```json
{
  "Events": [
    {
      "Id": 12345,
      "Name": "Happy Hikers: Morning Trail Walk",
      "StartDate": "2026-01-15T09:00:00",
      "EndDate": "2026-01-15T11:00:00",
      "Location": "Arroyo Burro Beach",
      "RegistrationsLimit": 20,
      "ConfirmedRegistrationsCount": 15,
      "AccessLevel": "Restricted",
      "Tags": ["hiking", "outdoors"],
      "RegistrationEnabled": true
    }
  ]
}
```

## Implementation

### 1. Data Fetching

Replace `fetchEventsFromJson()` with `fetchEventsFromMemberApi()`:

```javascript
async function fetchEventsFromMemberApi(pastMonths = 0) {
    const accountId = CONFIG.waAccountId;
    const clientId = CONFIG.waClientId;

    // Calculate date range
    const startDate = pastMonths > 0
        ? new Date(Date.now() - pastMonths * 30 * 24 * 60 * 60 * 1000)
        : new Date();

    const url = `/sys/api/publicview/v1/accounts/${accountId}/events` +
        `?$filter=StartDate ge '${startDate.toISOString()}'` +
        `&$orderBy=StartDate`;

    const response = await fetch(url, {
        headers: { 'clientId': clientId }
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // User not logged in - show login prompt
            throw new Error('LOGIN_REQUIRED');
        }
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return (data.Events || []).map(mapWaEventToInternal);
}
```

### 2. Event Mapping

Map WA API response to internal format:

```javascript
function mapWaEventToInternal(event) {
    const limit = event.RegistrationsLimit;
    const confirmed = event.ConfirmedRegistrationsCount || 0;

    let availability = 'unlimited';
    if (limit !== null && limit > 0) {
        const remaining = limit - confirmed;
        if (remaining <= 0) availability = 'full';
        else if (remaining <= 3) availability = 'limited';
        else availability = 'available';
    }

    return {
        id: event.Id,
        name: event.Name || '',
        startDate: event.StartDate,
        endDate: event.EndDate,
        location: event.Location || '',
        limit: limit,
        confirmed: confirmed,
        tags: Array.isArray(event.Tags) ? event.Tags.join(',') : '',
        status: event.RegistrationEnabled ? 'Active' : 'Disabled',
        registrationEnabled: event.RegistrationEnabled,
        accessLevel: event.AccessLevel,
        availability: availability,
        registrationUrl: event.RegistrationUrl || `https://sbnewcomers.org/event-${event.Id}`
    };
}
```

### 3. Configuration

```javascript
window.CLUBCALENDAR_CONFIG = {
    waAccountId: '176353',
    waClientId: 'YOUR_CLIENT_ID',  // From WA API settings
    useClientSideApi: true,        // Enable client-side fetching
    headerTitle: 'Club Events',

    // Member-only features
    showMyEvents: true,
    showRegistrantCount: true,
    showWaitlist: true,

    // Quick filters
    quickFilters: {
        weekend: true,
        openings: true,
        afterhours: true,
        public: true
    },

    // Auto-tagging rules (same as before)
    autoTagRules: [
        { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
        // ... etc
    ]
};
```

## CSS Integration

### How It Works

Since the widget runs directly on the WA page (no iframe), CSS custom properties defined in WA Custom CSS are automatically inherited.

### CSS Variables to Add to WA Custom CSS

Copy this block into **Wild Apricot > Settings > Site > Custom CSS**:

```css
/* ============================================================
   ClubCalendar Custom CSS Variables
   Add this block to WA Custom CSS to customize ClubCalendar
   ============================================================ */

:root {
    /* Primary brand colors - match your WA theme */
    --clubcal-primary: #2c5aa0;
    --clubcal-primary-dark: #1e3d6b;
    --clubcal-primary-hover: #234a80;
    --clubcal-accent: #d4a800;

    /* Time-of-day colors (calendar event blocks) */
    --clubcal-morning: #FFD54F;      /* Yellow - morning events */
    --clubcal-afternoon: #F5A623;    /* Carrot orange - afternoon */
    --clubcal-evening: #37474F;      /* Dark gray - evening */
    --clubcal-allday: #66bb6a;       /* Green - all-day events */

    /* Quick filter dot colors */
    --clubcal-dot-weekend: #9c27b0;
    --clubcal-dot-openings: #4caf50;
    --clubcal-dot-free: #ffc107;
    --clubcal-dot-afterhours: #5c6bc0;
    --clubcal-dot-public: #8bc34a;
    --clubcal-dot-justopened: #e91e63;
    --clubcal-dot-openingsoon: #009688;
    --clubcal-dot-newbie: #00bcd4;

    /* Availability status colors */
    --clubcal-avail-available: #2196f3;
    --clubcal-avail-limited: #ff9800;
    --clubcal-avail-waitlist: #f44336;
    --clubcal-avail-unavailable: #9e9e9e;
}
```

### Variables Inherited from WA Theme

These don't need to be defined - they inherit from WA's existing styles:

- Text colors (body text color)
- Background colors (page background)
- Font family (WA site font)
- Border radius preferences

## My Events Integration

For "My Events" tab to show the user's registrations:

```javascript
async function fetchMyRegistrations() {
    const accountId = CONFIG.waAccountId;
    const clientId = CONFIG.waClientId;

    const url = `/sys/api/publicview/v1/accounts/${accountId}/contacts/me/eventregistrations`;

    const response = await fetch(url, {
        headers: { 'clientId': clientId }
    });

    if (!response.ok) {
        console.warn('Could not fetch registrations:', response.status);
        return [];
    }

    const data = await response.json();
    return (data.EventRegistrations || []).map(r => r.Event.Id);
}
```

## Error Handling

### Not Logged In

```javascript
if (error.message === 'LOGIN_REQUIRED') {
    showLoginPrompt();
    return;
}

function showLoginPrompt() {
    container.innerHTML = `
        <div class="clubcal-login-required">
            <h3>Members Only</h3>
            <p>Please log in to view the full event calendar.</p>
            <a href="/Sys/Login" class="clubcal-login-btn">Log In</a>
        </div>
    `;
}
```

### API Rate Limiting

WA API limit: 60 requests/minute

ClubCalendar's usage pattern:
- Initial load: 1 request
- Navigation/filter changes: 0 requests (client-side filtering)
- Manual refresh: 1 request (throttled to once per 30 seconds)
- My Events tab: 1 request (cached for 5 minutes)

Typical session: 2-5 requests total - well under limits.

## Files

| File | Purpose |
|------|---------|
| `widget-member.html` | Complete widget for WA Custom HTML gadget |
| `INSTALLATION.md` | Step-by-step deployment instructions |
| `CSS_VARIABLES.txt` | Pasteable CSS for WA Custom CSS |
| `config.json` | SBNC-specific configuration |

## Testing

1. **Authentication**: Verify widget shows login prompt when not logged in
2. **Data fetching**: Verify events load from Member API
3. **My Events**: Verify user's registrations are highlighted
4. **CSS inheritance**: Verify colors match WA theme
5. **Error handling**: Verify graceful degradation on API errors
