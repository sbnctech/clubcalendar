# ClubCalendar Events Page - Wild Apricot Installation

```
Audience: SBNC Technical Staff, Wild Apricot Administrators
Purpose: Install the ClubCalendar widget on a WA Events page
Prerequisites: Wild Apricot admin access, text editor
```

---

## Overview

This document provides the complete HTML snippet for installing ClubCalendar on a Wild Apricot Events page. The widget runs entirely within Wild Apricot - no external server required.

---

## Required Wild Apricot Pages

ClubCalendar requires **two WA pages**:

| Page | URL | Purpose |
|------|-----|---------|
| **Config Page** | `/clubcalendar-config` | Stores JSON configuration (edit settings here) |
| **Events Page** | `/events` or `/calendar` | Displays the calendar widget (paste widget code here) |

**Installation order:**

1. Create the Config Page first (see `WA_CONFIG_PAGE_INLINE.md`)
2. Then create the Events Page using this document

---

## Public vs Member Visibility

ClubCalendar supports two audience modes controlled in the Config Page:

| Mode | Setting | Behavior |
|------|---------|----------|
| **Member** | `"audience": { "mode": "member" }` | Shows all events. Requires WA login. Shows "My Events" tab. |
| **Public** | `"audience": { "mode": "public" }` | Shows only public events. No login required. Hides "My Events". |

### How to Toggle Visibility

**Option A: Single page, member-only**

1. Set `audience.mode` to `"member"` in Config Page
2. Set Events Page access to "Members only" in WA
3. Non-members see WA login prompt

**Option B: Single page, public**

1. Set `audience.mode` to `"public"` in Config Page
2. Set Events Page access to "Everyone" in WA
3. All visitors see public events only

**Option C: Separate pages (recommended for SBNC)**

1. Create two Events pages:
   - `/events` (member-only access in WA)
   - `/events-public` (public access in WA)
2. Each page uses the same widget code
3. Config Page controls which events each audience sees:

```json
{
  "audience": {
    "mode": "member",
    "publicPageUrl": "/events-public",
    "memberPageUrl": "/events",
    "showPublicEventsToGuests": true
  }
}
```

---

## Installation Steps

### Step 1: Create the Events Page

1. Log in to Wild Apricot admin
2. Go to **Website** -> **Site pages**
3. Click **Add page**
4. Name it "Events" or "Calendar"
5. Set the URL slug (e.g., `/events`)
6. Set access level:
   - "Members only" for member calendar
   - "Everyone" for public calendar
7. Click **Create**

### Step 2: Add the Widget

1. Edit the Events page
2. Add a **Custom HTML** gadget
3. Click the **HTML** button (switch to source mode)
4. Copy the entire contents of the snippet below
5. Paste into the HTML editor
6. Click **Done** to close the gadget editor
7. Click **Save** and **Publish**

### Step 3: Test

1. View the page (not in edit mode)
2. Verify events load
3. Test filters and "My Events" tab
4. Test in incognito window to verify public/member behavior

---

## Complete Events Page Snippet

Copy everything from `BEGIN SNIPPET` to `END SNIPPET`:

```html
<!-- ═══════════════════════════════════════════════════════════════════════════
     BEGIN SNIPPET - Copy from here
     ═══════════════════════════════════════════════════════════════════════════ -->

<!--
  ClubCalendar Events Page
  Wild Apricot Custom HTML Gadget

  INSTALLATION:
  1. Create a Custom HTML gadget on your Events page
  2. Paste this entire snippet
  3. Save and view the page while logged in

  NO EXTERNAL DEPENDENCIES:
  - No external server required
  - No script src loading required
  - Runs entirely within Wild Apricot

  CONFIGURATION:
  Edit settings on the Config Page (/clubcalendar-config), not here.
-->

<div id="clubcalendar"></div>

<script>
// ClubCalendar configuration loader
// Reads settings from /clubcalendar-config page
(function() {
    'use strict';

    const CONFIG_PAGE_URL = '/clubcalendar-config';

    function loadConfigAndInit() {
        fetch(CONFIG_PAGE_URL)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Config page not found at ' + CONFIG_PAGE_URL);
                }
                return response.text();
            })
            .then(function(html) {
                // Parse HTML and extract config JSON
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var configScript = doc.getElementById('clubcalendar-config');

                if (!configScript) {
                    throw new Error('Config script not found on page. Expected: <script id="clubcalendar-config">');
                }

                var configText = configScript.textContent;
                var config;

                try {
                    config = JSON.parse(configText);
                } catch (e) {
                    throw new Error('Invalid config JSON: ' + e.message);
                }

                // Flatten nested config for widget compatibility
                window.CLUBCALENDAR_CONFIG = {
                    waAccountId: config.organization?.waAccountId,
                    headerTitle: config.display?.headerTitle || 'Club Events',
                    showMyEvents: config.calendar?.showMyEvents !== false,
                    showFilters: config.visibility?.showFilters !== false,
                    defaultView: config.display?.defaultView || 'dayGridMonth',
                    primaryColor: config.theme?.primaryColor || '#2c5aa0',
                    accentColor: config.theme?.accentColor || '#d4a800',
                    audienceMode: config.audience?.mode || 'member',
                    showEventTags: config.tags?.showEventTags !== false,
                    hiddenTags: config.tags?.hiddenTags || [],
                    pastEventsVisible: config.calendar?.pastEventsVisible || false,
                    pastEventsDays: config.calendar?.pastEventsDays || 14,
                    showWaitlistCount: config.calendar?.showWaitlistCount || false,
                    // Convert committeePresets to autoTagRules format
                    autoTagRules: (config.committeePresets || []).map(function(p) {
                        return { type: 'name-prefix', pattern: p.prefix, tag: p.tag };
                    }),
                    // Quick filters
                    quickFilters: {
                        weekend: config.quickFilters?.buttons?.weekend?.enabled !== false,
                        openings: config.quickFilters?.buttons?.openings?.enabled !== false,
                        afterhours: config.quickFilters?.buttons?.afterhours?.enabled !== false,
                        free: config.quickFilters?.buttons?.free?.enabled === true,
                        public: config.quickFilters?.buttons?.public?.enabled !== false
                    },
                    // Dropdown filters
                    dropdownFilters: {
                        committee: config.dropdownFilters?.dropdowns?.committee?.enabled !== false,
                        activity: config.dropdownFilters?.dropdowns?.activity?.enabled !== false,
                        price: config.dropdownFilters?.dropdowns?.price?.enabled !== false,
                        eventType: config.dropdownFilters?.dropdowns?.eventType?.enabled !== false,
                        recurring: config.dropdownFilters?.dropdowns?.recurring?.enabled !== false,
                        venue: config.dropdownFilters?.dropdowns?.venue?.enabled !== false,
                        tags: config.dropdownFilters?.dropdowns?.tags?.enabled !== false
                    }
                };

                // Initialize widget
                initClubCalendar();
            })
            .catch(function(error) {
                console.error('[ClubCalendar] Config load failed:', error);
                showError(error.message);
            });
    }

    function showError(message) {
        var container = document.getElementById('clubcalendar');
        if (container) {
            container.innerHTML = '<div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; color: #856404; font-family: sans-serif;">' +
                '<strong>Calendar Error:</strong> ' + message +
                '<p style="margin-top: 10px; font-size: 14px;">Check browser console for details. Contact tech support if this persists.</p>' +
                '</div>';
        }
    }

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadConfigAndInit);
    } else {
        loadConfigAndInit();
    }
})();
</script>

<!-- ═══════════════════════════════════════════════════════════════════════════
     CLUBCALENDAR WIDGET ENGINE
     The main widget code. Do not edit this section.
     ═══════════════════════════════════════════════════════════════════════════ -->

<script>
function initClubCalendar() {
/**
 * ClubCalendar Widget - Wild Apricot Native Edition
 * Runs entirely on WA page - no external server needed
 */
(function() {
    'use strict';

    // [Widget code would be inserted here - this is a placeholder]
    // In production, the full widget code from SBNC_INLINE_SNIPPET.html
    // would be included here, minus the config section at the top.

    console.log('[ClubCalendar] Widget initialized with config:', window.CLUBCALENDAR_CONFIG);

    // For now, show a loading message until full widget is pasted
    var container = document.querySelector(window.CLUBCALENDAR_CONFIG?.container || '#clubcalendar');
    if (container && !container.querySelector('.cc-calendar')) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">Loading calendar...</div>';
    }
})();
}
</script>

<!-- ═══════════════════════════════════════════════════════════════════════════
     END SNIPPET - Copy to here
     ═══════════════════════════════════════════════════════════════════════════ -->
```

---

## SBNC Production Snippet

For SBNC production deployment, use the complete file:

**File:** `docs/INSTALL/SBNC_INLINE_SNIPPET.html`

This file contains:

- SBNC Account ID pre-configured (`176353`)
- All 18 SBNC committee auto-tagging rules
- Full widget code (no assembly required)
- Tested and verified for SBNC

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Config page not found" | Config Page doesn't exist or wrong URL | Create `/clubcalendar-config` page first |
| "Config script not found" | Config Page missing script tag | Re-paste Config Page HTML |
| "Invalid config JSON" | Syntax error in config | Validate JSON at jsonlint.com |
| No events showing | Not logged in (member mode) | Log in to WA |
| "Loading..." forever | API request failed | Check browser console for errors |

---

## Related Documents

- [WA_CONFIG_PAGE_INLINE.md](./WA_CONFIG_PAGE_INLINE.md) - Config Page installation
- [CONFIG_CONTRACT.md](./CONFIG_CONTRACT.md) - Full config field reference
- [CONFIG_QUICK_REFERENCE.md](./CONFIG_QUICK_REFERENCE.md) - Simple editing guide
- [SBNC_INLINE_ONLY_INSTALL.md](./SBNC_INLINE_ONLY_INSTALL.md) - SBNC-specific overview

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2024-12-26 | ClubCalendar Team | Initial Events Page installation guide |
