# ClubCalendar Config Page - Wild Apricot Installation

```
Audience: SBNC Technical Staff, Wild Apricot Administrators
Purpose: Install and maintain the ClubCalendar configuration page
Prerequisites: Wild Apricot admin access, basic JSON familiarity
```

---

## Overview

The Config Page stores all ClubCalendar settings in a JSON format. The Events Page reads this configuration on load. Edit settings here - not in the Events Page code.

**Key benefits of separate config:**

- Change settings without touching widget code
- Validation feedback shows errors immediately
- Reference documentation built into the page
- Easy rollback (revert config, not widget)

---

## Installation Steps

### Step 1: Create the Config Page

1. Log in to Wild Apricot admin
2. Go to **Website** -> **Site pages**
3. Click **Add page**
4. Name: `ClubCalendar Config`
5. URL slug: `/clubcalendar-config` (exact match required)
6. Access: **Everyone (public)** - config must be readable by the widget
7. Click **Create**

### Step 2: Add the Config HTML

1. Edit the Config page
2. Add a **Custom HTML** gadget
3. Click the **HTML** button (switch to source mode)
4. Copy the entire contents of the snippet below
5. Paste into the HTML editor
6. Click **Done** to close the gadget editor
7. Click **Save** and **Publish**

### Step 3: Verify

1. View the page (not in edit mode)
2. Look for green "Configuration Valid" box
3. If red errors appear, fix the JSON issues listed

---

## How Validation Works

When you view the Config Page, it automatically validates the JSON:

| Status | Display | Meaning |
|--------|---------|---------|
| Valid | Green box with checkmark | Configuration is correct |
| Warnings | Yellow box | Non-critical issues (optional fields) |
| Errors | Red box | Must fix before widget works |

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Unexpected token }" | Trailing comma | Remove comma before closing `}` |
| "Unexpected token ," | Missing value | Add value after the colon |
| "waAccountId is required" | Missing account ID | Add your WA Account ID |
| "must be a hex color" | Invalid color format | Use format `#RRGGBB` |
| "looks like a credential" | Security check | Remove any passwords/secrets |

---

## How to Edit Safely

### DO:

- Always edit in HTML mode (not visual editor)
- Validate at [JSONLint.com](https://jsonlint.com) before pasting
- Make one change at a time
- Save a backup before major changes
- View the page after saving to check validation

### DON'T:

- Edit in the visual editor (corrupts JSON)
- Add trailing commas after the last item
- Use single quotes (JSON requires double quotes)
- Add comments in JSON (not supported)
- Put passwords or API keys in config

### Example: Safe Editing Workflow

```
1. View Config Page
2. Note current validation status (should be green)
3. Edit page -> Open Custom HTML gadget -> HTML mode
4. Make your change
5. Optional: Paste JSON into JSONLint.com to validate
6. Save the gadget
7. Save and Publish the page
8. View the page (not edit mode)
9. Verify green "Configuration Valid" status
10. If red errors, undo your change and try again
```

---

## Complete Config Page Snippet

Copy everything from `BEGIN SNIPPET` to `END SNIPPET`:

```html
<!-- ═══════════════════════════════════════════════════════════════════════════
     BEGIN SNIPPET - Copy from here
     ═══════════════════════════════════════════════════════════════════════════ -->

<!--
  ClubCalendar Configuration Page
  Wild Apricot Custom HTML Gadget

  INSTALLATION:
  1. Create a new WA page at /clubcalendar-config
  2. Add a Custom HTML gadget
  3. Paste this ENTIRE file
  4. Save the page

  The calendar widget reads config from this page.
  Edit the JSON below to customize calendar behavior.
-->

<!-- CONFIGURATION JSON
     Edit the values below to customize your calendar.
     The widget reads this configuration on page load. -->

<script id="clubcalendar-config" type="application/json">
{
    "_comment": "ClubCalendar Configuration - Edit values below",
    "_version": "1.0.0",

    "organization": {
        "waAccountId": "YOUR_ACCOUNT_ID",
        "name": "Your Club Name",
        "timezone": "America/Los_Angeles",
        "websiteUrl": "https://yourclub.wildapricot.org"
    },

    "display": {
        "headerTitle": "Club Events",
        "showHeader": true,
        "defaultView": "dayGridMonth",
        "stylePreset": "default"
    },

    "audience": {
        "mode": "member",
        "publicPageUrl": "/events-public",
        "memberPageUrl": "/events",
        "showPublicEventsToGuests": true
    },

    "theme": {
        "primaryColor": "#2c5aa0",
        "accentColor": "#d4a800",
        "fontFamily": "inherit"
    },

    "calendar": {
        "showEventDots": true,
        "showMyEvents": true,
        "pastEventsVisible": false,
        "pastEventsDays": 14,
        "showWaitlistCount": false
    },

    "quickFilters": {
        "enabled": true,
        "buttons": {
            "weekend": { "enabled": true, "label": "Weekend" },
            "openings": { "enabled": true, "label": "Has Openings" },
            "afterhours": { "enabled": true, "label": "After Hours" },
            "public": { "enabled": true, "label": "Public Events" },
            "free": { "enabled": false, "label": "Free" }
        }
    },

    "dropdownFilters": {
        "enabled": true,
        "dropdowns": {
            "committee": {
                "enabled": true,
                "label": "Committee",
                "placeholder": "All Committees"
            },
            "activity": {
                "enabled": true,
                "label": "Activity",
                "placeholder": "All Activities"
            },
            "price": {
                "enabled": true,
                "label": "Price",
                "placeholder": "Any Price"
            },
            "eventType": {
                "enabled": true,
                "label": "Event Type",
                "placeholder": "All Types"
            },
            "recurring": {
                "enabled": true,
                "label": "Recurring",
                "placeholder": "All Events"
            },
            "venue": {
                "enabled": true,
                "label": "Venue",
                "placeholder": "All Venues"
            },
            "tags": {
                "enabled": true,
                "label": "Tags",
                "placeholder": "All Tags"
            }
        }
    },

    "tags": {
        "showEventTags": true,
        "hiddenTags": [],
        "allowedTags": null
    },

    "committeePresets": [
    ],

    "labels": {
        "noEvents": "No events found matching your filters.",
        "loading": "Loading events...",
        "error": "Unable to load events. Please try again.",
        "myEvents": "My Events",
        "allEvents": "All Events"
    },

    "visibility": {
        "showFilters": true,
        "showSearch": true,
        "showViewToggle": true,
        "showPrintButton": false,
        "showExportButton": false,
        "showShareButton": false
    },

    "advanced": {
        "debugMode": false,
        "cacheMinutes": 5,
        "maxEventsPerPage": 50,
        "enableAnalytics": false
    }
}
</script>

<!-- VALIDATION STATUS BOX
     Shows config validation results on page load. -->

<div id="config-status" style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 900px;
    margin: 20px auto;
"></div>

<!-- CONFIGURATION REFERENCE
     Human-readable documentation of all fields. -->

<div id="config-docs" style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 900px;
    margin: 30px auto;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
">
    <h2 style="margin-top: 0; color: #2c5aa0;">ClubCalendar Configuration Reference</h2>
    <p style="color: #666;">
        This page contains the configuration for the ClubCalendar widget.
        Edit the JSON above to customize calendar behavior.
    </p>

    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

    <h3 style="color: #333;">Required: Organization Settings</h3>
    <ul style="color: #333;">
        <li><strong>waAccountId</strong> - Your Wild Apricot Account ID (find in WA Admin - Settings - Account)</li>
        <li><strong>timezone</strong> - IANA timezone (e.g., "America/Los_Angeles")</li>
    </ul>

    <h3 style="color: #333;">Audience Mode</h3>
    <ul style="color: #333;">
        <li><strong>"member"</strong> - All events visible (requires login)</li>
        <li><strong>"public"</strong> - Only public events visible (no login)</li>
    </ul>

    <h3 style="color: #333;">Quick Filters (Toggle Buttons)</h3>
    <p style="color: #666;">Set enabled: false to hide a filter button.</p>
    <ul style="color: #333;">
        <li><strong>weekend</strong> - Show only weekend events</li>
        <li><strong>openings</strong> - Show events with available spots</li>
        <li><strong>afterhours</strong> - Show events after 5 PM</li>
        <li><strong>public</strong> - Show public events only</li>
        <li><strong>free</strong> - Show free events only</li>
    </ul>

    <h3 style="color: #333;">Theme Colors</h3>
    <p style="color: #666;">
        Use hex color codes (e.g., #2c5aa0).
    </p>

    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

    <p style="color: #999; font-size: 13px;">
        <strong>Need help?</strong> See the full documentation in the ClubCalendar repository.
    </p>
</div>

<!-- VALIDATION SCRIPT
     Runs on page load to validate the configuration.
     Shows errors/warnings but does not block. -->

<script>
(function() {
    'use strict';

    function isHexColor(value) {
        if (typeof value !== 'string') return false;
        return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
    }

    function isValidTimezone(tz) {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            return true;
        } catch (e) {
            return false;
        }
    }

    function validateConfig(config) {
        var errors = [];
        var warnings = [];
        var info = [];

        if (typeof config === 'string') {
            try {
                config = JSON.parse(config);
            } catch (e) {
                errors.push('Invalid JSON: ' + e.message);
                return { valid: false, errors: errors, warnings: warnings, info: info };
            }
        }

        if (!config || typeof config !== 'object') {
            errors.push('Configuration must be a JSON object.');
            return { valid: false, errors: errors, warnings: warnings, info: info };
        }

        // Organization
        if (!config.organization) {
            errors.push('organization section is required.');
        } else {
            if (!config.organization.waAccountId || config.organization.waAccountId === 'YOUR_ACCOUNT_ID') {
                errors.push('organization.waAccountId is required. Find it in WA Admin - Settings - Account.');
            } else if (!/^\d+$/.test(config.organization.waAccountId)) {
                errors.push('organization.waAccountId must contain only numbers.');
            }

            if (config.organization.timezone) {
                if (!isValidTimezone(config.organization.timezone)) {
                    errors.push('organization.timezone is not valid. Example: "America/Los_Angeles"');
                } else {
                    info.push('Timezone: ' + config.organization.timezone);
                }
            } else {
                warnings.push('organization.timezone not set. Using browser timezone.');
            }
        }

        // Display
        if (config.display) {
            var validViews = ['dayGridMonth', 'timeGridWeek', 'listMonth'];
            if (config.display.defaultView && validViews.indexOf(config.display.defaultView) === -1) {
                errors.push('display.defaultView must be one of: ' + validViews.join(', '));
            }
            if (config.display.headerTitle) {
                info.push('Header: "' + config.display.headerTitle + '"');
            }
        }

        // Theme
        if (config.theme) {
            if (config.theme.primaryColor && !isHexColor(config.theme.primaryColor)) {
                errors.push('theme.primaryColor must be a hex color like "#2c5aa0"');
            }
            if (config.theme.accentColor && !isHexColor(config.theme.accentColor)) {
                errors.push('theme.accentColor must be a hex color like "#d4a800"');
            }
        }

        // Audience
        if (config.audience && config.audience.mode) {
            var validModes = ['public', 'member'];
            if (validModes.indexOf(config.audience.mode) === -1) {
                errors.push('audience.mode must be "public" or "member"');
            } else {
                info.push('Audience: ' + config.audience.mode);
            }
        }

        // Security check
        var forbiddenKeys = ['apikey', 'apisecret', 'token', 'password', 'secret', 'credential'];
        function checkSecrets(obj, path) {
            if (!obj || typeof obj !== 'object') return;
            for (var key in obj) {
                var lowerKey = key.toLowerCase();
                for (var i = 0; i < forbiddenKeys.length; i++) {
                    if (lowerKey.indexOf(forbiddenKeys[i]) !== -1) {
                        errors.push('Security: "' + path + '.' + key + '" looks like a credential. Remove it!');
                    }
                }
                if (typeof obj[key] === 'object') {
                    checkSecrets(obj[key], path + '.' + key);
                }
            }
        }
        checkSecrets(config, 'config');

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            info: info
        };
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function displayStatus(result) {
        var container = document.getElementById('config-status');
        if (!container) return;

        var html = '';

        if (result.valid && result.warnings.length === 0) {
            html = '<div style="padding: 15px 20px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; color: #155724;">' +
                '<strong>Configuration Valid</strong>' +
                '<p style="margin: 10px 0 0 0; font-size: 14px;">' +
                result.info.map(function(i) { return '- ' + i; }).join('<br>') +
                '</p></div>';
        } else {
            var sections = [];

            if (result.errors.length > 0) {
                sections.push('<div style="padding: 15px 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; color: #721c24; margin-bottom: 10px;">' +
                    '<strong>Configuration Errors</strong>' +
                    '<ul style="margin: 10px 0 0 0; padding-left: 20px;">' +
                    result.errors.map(function(e) { return '<li>' + escapeHtml(e) + '</li>'; }).join('') +
                    '</ul></div>');
            }

            if (result.warnings.length > 0) {
                sections.push('<div style="padding: 15px 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; color: #856404; margin-bottom: 10px;">' +
                    '<strong>Warnings</strong>' +
                    '<ul style="margin: 10px 0 0 0; padding-left: 20px;">' +
                    result.warnings.map(function(w) { return '<li>' + escapeHtml(w) + '</li>'; }).join('') +
                    '</ul></div>');
            }

            if (result.valid && result.info.length > 0) {
                sections.push('<div style="padding: 15px 20px; background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; color: #0c5460;">' +
                    '<strong>Configuration Summary</strong>' +
                    '<ul style="margin: 10px 0 0 0; padding-left: 20px;">' +
                    result.info.map(function(i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') +
                    '</ul></div>');
            }

            html = sections.join('');
        }

        container.innerHTML = html;
    }

    function init() {
        var configScript = document.getElementById('clubcalendar-config');
        if (!configScript) {
            displayStatus({
                valid: false,
                errors: ['Configuration script tag not found. Expected: <script id="clubcalendar-config" type="application/json">'],
                warnings: [],
                info: []
            });
            return;
        }

        var configText = configScript.textContent;
        var result = validateConfig(configText);
        displayStatus(result);

        if (result.valid) {
            try {
                window.CLUBCALENDAR_PAGE_CONFIG = JSON.parse(configText);
            } catch (e) {
                // Already caught in validateConfig
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
</script>

<style>
    #config-docs code {
        background: #e9ecef;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 13px;
    }
</style>

<!-- ═══════════════════════════════════════════════════════════════════════════
     END SNIPPET - Copy to here
     ═══════════════════════════════════════════════════════════════════════════ -->
```

---

## SBNC Production Config

For SBNC, use the pre-configured file:

**File:** `docs/INSTALL/ClubCalendar_SBNC_CONFIG_PAGE_FULL.html`

This includes:

- SBNC Account ID (`176353`)
- All 18 SBNC committee presets
- SBNC color scheme
- Full validation and reference docs

---

## Quick Reference: Common Edits

### Change the header title

```json
"display": {
    "headerTitle": "My Club Events"
}
```

### Hide a filter button

```json
"quickFilters": {
    "buttons": {
        "free": { "enabled": false }
    }
}
```

### Change to public mode

```json
"audience": {
    "mode": "public"
}
```

### Add a committee preset

```json
"committeePresets": [
    { "prefix": "Book Club:", "tag": "committee:book-club", "displayName": "Book Club" }
]
```

---

## Related Documents

- [WA_EVENTS_PAGE_INLINE.md](./WA_EVENTS_PAGE_INLINE.md) - Events Page installation
- [CONFIG_CONTRACT.md](./CONFIG_CONTRACT.md) - Full config field reference
- [ClubCalendar_SBNC_INSTALLATION.md](./ClubCalendar_SBNC_INSTALLATION.md) - SBNC installation guide

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2024-12-26 | ClubCalendar Team | Initial Config Page installation guide |
