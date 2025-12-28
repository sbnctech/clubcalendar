# ClubCalendar (WA) - Config Page Inline Snippet (SBNC)

## Instructions

Purpose
- This is the Custom HTML gadget content for the configuration page.
- It publishes the configuration JSON that the Events page fetches.
- Edit only the JSON inside:
  <script id="clubcalendar-config" type="application/json"> ... </script>

Where it goes in Wild Apricot
- Website -> Pages -> (create) "ClubCalendar Config" page
- Set URL: /clubcalendar-config
- Add gadget: Custom HTML
- Paste the full HTML snippet below
- Save and Publish

Security / visibility
- Recommended: make this page admin-only if WA allows it.
- If it must be public, the JSON must not contain secrets (it should not).

Paste this into the Config page Custom HTML gadget

    <!--
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║  SBNC ClubCalendar Configuration Reference Page                              ║
    ║  Wild Apricot Custom HTML Gadget                                             ║
    ╠══════════════════════════════════════════════════════════════════════════════╣
    ║                                                                              ║
    ║  PURPOSE: This page documents the configuration for the SBNC calendar.       ║
    ║  The ACTUAL config lives in the events page widget code, NOT here.          ║
    ║                                                                              ║
    ║  NO EXTERNAL SERVER DEPENDENCIES                                             ║
    ║  - No mail.sbnewcomers.org required                                         ║
    ║  - Runs entirely within Wild Apricot                                        ║
    ║                                                                              ║
    ║  INSTALLATION:                                                               ║
    ║  1. Create a WA page at /clubcalendar-config (optional reference page)      ║
    ║  2. Paste this ENTIRE file into a Custom HTML gadget                        ║
    ║  3. Save the page                                                           ║
    ║                                                                              ║
    ║  CONTRACT VERSION: 2.0.0 (2024-12)                                          ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    -->
    
    <style>
        .config-page {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .config-page h1 {
            color: #2c5aa0;
            border-bottom: 3px solid #d4a800;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .config-page h2 {
            color: #2c5aa0;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        .config-page h3 {
            color: #444;
            margin-top: 20px;
        }
        .config-page code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
        }
        .config-page pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.5;
        }
        .config-page pre .comment { color: #6a9955; }
        .config-page pre .key { color: #9cdcfe; }
        .config-page pre .string { color: #ce9178; }
        .config-page pre .number { color: #b5cea8; }
        .config-page pre .boolean { color: #569cd6; }
        .config-page table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .config-page th, .config-page td {
            padding: 10px 12px;
            text-align: left;
            border: 1px solid #dee2e6;
        }
        .config-page th {
            background: #e9ecef;
            font-weight: 600;
        }
        .config-page tr:nth-child(even) {
            background: #f8f9fa;
        }
        .config-page .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
        }
        .config-page .badge-required { background: #dc3545; color: white; }
        .config-page .badge-optional { background: #6c757d; color: white; }
        .config-page .badge-default { background: #28a745; color: white; }
        .config-page .alert {
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .config-page .alert-info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
        }
        .config-page .alert-warning {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
        }
        .config-page .alert-success {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
        }
    </style>
    
    <div class="config-page">
    
    <h1>SBNC ClubCalendar Configuration Reference</h1>
    
    <div class="alert alert-info">
        <strong>Configuration Location:</strong> The calendar configuration lives in the
        <code>window.CLUBCALENDAR_CONFIG</code> object at the top of the Events page widget code.
        This reference page documents all available options.
    </div>
    
    <div class="alert alert-success">
        <strong>No External Dependencies:</strong> This widget runs entirely within Wild Apricot.
        No external server, no mail.sbnewcomers.org, no external script loading required.
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════════════════
         COMPLETE CONFIG EXAMPLE
         ═══════════════════════════════════════════════════════════════════════════ -->
    
    <h2>Complete Configuration Example</h2>
    
    <p>Copy this into your events page widget, customizing values as needed:</p>
    
    <pre><span class="comment">// SBNC ClubCalendar Configuration</span>
    <span class="comment">// Last updated: December 2024 | Contract v2.0.0</span>
    
    window.CLUBCALENDAR_CONFIG = {
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// CREDENTIALS (Auto-detected on WA pages)</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">waAccountId</span>: <span class="string">'176353'</span>,        <span class="comment">// SBNC Account ID (auto-detected)</span>
        <span class="comment">// waClientId: null,            // Only for external hosting</span>
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// DISPLAY</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">headerTitle</span>: <span class="string">'SBNC Events'</span>,
        <span class="key">showHeader</span>: <span class="boolean">true</span>,
        <span class="key">showFilters</span>: <span class="boolean">true</span>,
        <span class="key">showMyEvents</span>: <span class="boolean">true</span>,
        <span class="key">defaultView</span>: <span class="string">'dayGridMonth'</span>,  <span class="comment">// 'dayGridMonth' | 'timeGridWeek' | 'listMonth'</span>
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// THEME</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">primaryColor</span>: <span class="string">'#2c5aa0'</span>,     <span class="comment">// SBNC Blue</span>
        <span class="key">accentColor</span>: <span class="string">'#d4a800'</span>,      <span class="comment">// SBNC Gold</span>
        <span class="key">stylePreset</span>: <span class="string">'default'</span>,      <span class="comment">// 'default' | 'compact' | 'minimal'</span>
        <span class="key">autoTheme</span>: <span class="boolean">true</span>,             <span class="comment">// Auto-detect theme from WA page</span>
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// QUICK FILTER BUTTONS</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">quickFilters</span>: {
            <span class="key">weekend</span>: <span class="boolean">true</span>,           <span class="comment">// "Weekend" button</span>
            <span class="key">openings</span>: <span class="boolean">true</span>,          <span class="comment">// "Has Openings" button</span>
            <span class="key">afterhours</span>: <span class="boolean">true</span>,        <span class="comment">// "After Hours" button</span>
            <span class="key">public</span>: <span class="boolean">true</span>,            <span class="comment">// "Public Events" button</span>
            <span class="key">free</span>: <span class="boolean">false</span>              <span class="comment">// "Free" button (disabled by default)</span>
        },
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// DROPDOWN FILTERS</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">dropdownFilters</span>: {
            <span class="key">committee</span>: <span class="boolean">true</span>,         <span class="comment">// Committee dropdown</span>
            <span class="key">activity</span>: <span class="boolean">true</span>,          <span class="comment">// Activity type dropdown</span>
            <span class="key">price</span>: <span class="boolean">true</span>,             <span class="comment">// Price filter dropdown</span>
            <span class="key">eventType</span>: <span class="boolean">true</span>,         <span class="comment">// Event type dropdown</span>
            <span class="key">recurring</span>: <span class="boolean">true</span>,         <span class="comment">// Recurring events dropdown</span>
            <span class="key">venue</span>: <span class="boolean">true</span>,             <span class="comment">// Venue dropdown</span>
            <span class="key">tags</span>: <span class="boolean">true</span>               <span class="comment">// Tags dropdown</span>
        },
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// TAGS</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">showEventTags</span>: <span class="boolean">true</span>,         <span class="comment">// Show tag badges on events</span>
        <span class="key">hiddenTags</span>: [],              <span class="comment">// Tags to hide from display</span>
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// CALENDAR DISPLAY</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">showEventDots</span>: <span class="boolean">true</span>,         <span class="comment">// Show dots on dates with events</span>
        <span class="key">pastEventsVisible</span>: <span class="boolean">false</span>,    <span class="comment">// Show past events</span>
        <span class="key">pastEventsDays</span>: <span class="number">14</span>,          <span class="comment">// Days of past events to show</span>
        <span class="key">showWaitlistCount</span>: <span class="boolean">false</span>,    <span class="comment">// Show waitlist count (extra API calls)</span>
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// TITLE PARSING (for "Committee: Event Title" format)</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">titleParsing</span>: {
            <span class="key">enabled</span>: <span class="boolean">true</span>,            <span class="comment">// Parse "Prefix: Title" format</span>
            <span class="key">separator</span>: <span class="string">':'</span>,           <span class="comment">// Character separating prefix from title</span>
            <span class="key">maxSeparatorPosition</span>: <span class="number">30</span>, <span class="comment">// How far into title to look for separator</span>
            <span class="key">defaultCategory</span>: <span class="string">'General'</span>, <span class="comment">// Category when no prefix found</span>
            <span class="key">stripChars</span>: <span class="string">'*-()'</span>       <span class="comment">// Characters to strip from prefix</span>
        },
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// AUTO-TAGGING RULES (SBNC Activity Committees)</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">autoTagRules</span>: [
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Happy Hikers:'</span>, tag: <span class="string">'committee:happy-hikers'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Games!:'</span>, tag: <span class="string">'committee:games'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Wine Appreciation:'</span>, tag: <span class="string">'committee:wine'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Epicurious:'</span>, tag: <span class="string">'committee:epicurious'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'TGIF:'</span>, tag: <span class="string">'committee:tgif'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Cycling:'</span>, tag: <span class="string">'committee:cycling'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Golf:'</span>, tag: <span class="string">'committee:golf'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Performing Arts:'</span>, tag: <span class="string">'committee:performing-arts'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Local Heritage:'</span>, tag: <span class="string">'committee:local-heritage'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Wellness:'</span>, tag: <span class="string">'committee:wellness'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Garden:'</span>, tag: <span class="string">'committee:garden'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Arts:'</span>, tag: <span class="string">'committee:arts'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Current Events:'</span>, tag: <span class="string">'committee:current-events'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Pop-Up:'</span>, tag: <span class="string">'committee:popup'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Beer Lovers:'</span>, tag: <span class="string">'committee:beer'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Out to Lunch:'</span>, tag: <span class="string">'committee:out-to-lunch'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Afternoon Book:'</span>, tag: <span class="string">'committee:book-clubs'</span> },
            { type: <span class="string">'name-prefix'</span>, pattern: <span class="string">'Evening Book:'</span>, tag: <span class="string">'committee:book-clubs'</span> }
        ],
    
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="comment">// FALLBACK (if widget fails to load)</span>
        <span class="comment">// ═══════════════════════════════════════════════════════════════</span>
        <span class="key">fallbackContainerId</span>: <span class="string">'wa-fallback'</span>,  <span class="comment">// ID of backup container</span>
        <span class="key">fallbackEventsUrl</span>: <span class="string">'/events'</span>         <span class="comment">// URL to link if no fallback</span>
    };</pre>
    
    <!-- ═══════════════════════════════════════════════════════════════════════════
         FIELD REFERENCE TABLES
         ═══════════════════════════════════════════════════════════════════════════ -->
    
    <h2>Configuration Field Reference</h2>
    
    <h3>Credentials</h3>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>waAccountId</code></td>
                <td>string</td>
                <td><span class="badge badge-default">auto-detect</span></td>
                <td>Wild Apricot Account ID. Auto-detected from WA page context.</td>
            </tr>
            <tr>
                <td><code>waClientId</code></td>
                <td>string</td>
                <td><code>null</code></td>
                <td>Only needed for external hosting (not WA inline). Leave null.</td>
            </tr>
            <tr>
                <td><code>container</code></td>
                <td>string</td>
                <td><code>"#clubcalendar"</code></td>
                <td>CSS selector for the calendar mount point.</td>
            </tr>
        </tbody>
    </table>
    
    <h3>Display Settings</h3>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>headerTitle</code></td>
                <td>string</td>
                <td><code>"Club Events"</code></td>
                <td>Title shown at top of calendar.</td>
            </tr>
            <tr>
                <td><code>showHeader</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show/hide the header bar.</td>
            </tr>
            <tr>
                <td><code>showFilters</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show/hide the filter panel.</td>
            </tr>
            <tr>
                <td><code>showMyEvents</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show "My Events" tab for logged-in members.</td>
            </tr>
            <tr>
                <td><code>defaultView</code></td>
                <td>string</td>
                <td><code>"dayGridMonth"</code></td>
                <td>Initial calendar view. Options: <code>dayGridMonth</code>, <code>timeGridWeek</code>, <code>listMonth</code></td>
            </tr>
        </tbody>
    </table>
    
    <h3>Theme Settings</h3>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>primaryColor</code></td>
                <td>string</td>
                <td><code>"#2c5aa0"</code></td>
                <td>Primary accent color (hex format).</td>
            </tr>
            <tr>
                <td><code>accentColor</code></td>
                <td>string</td>
                <td><code>"#d4a800"</code></td>
                <td>Secondary accent color (hex format).</td>
            </tr>
            <tr>
                <td><code>stylePreset</code></td>
                <td>string</td>
                <td><code>"default"</code></td>
                <td>Visual style preset. Options: <code>default</code>, <code>compact</code>, <code>minimal</code></td>
            </tr>
            <tr>
                <td><code>autoTheme</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Auto-detect theme from WA page elements.</td>
            </tr>
            <tr>
                <td><code>cssVars</code></td>
                <td>object</td>
                <td><code>{}</code></td>
                <td>Custom CSS variable overrides.</td>
            </tr>
            <tr>
                <td><code>customCSS</code></td>
                <td>string</td>
                <td><code>""</code></td>
                <td>Raw CSS to inject (highest priority).</td>
            </tr>
        </tbody>
    </table>
    
    <h3>Quick Filters (Toggle Buttons)</h3>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>quickFilters.weekend</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show "Weekend" filter button.</td>
            </tr>
            <tr>
                <td><code>quickFilters.openings</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show "Has Openings" filter button.</td>
            </tr>
            <tr>
                <td><code>quickFilters.afterhours</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show "After Hours" filter button.</td>
            </tr>
            <tr>
                <td><code>quickFilters.public</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show "Public Events" filter button.</td>
            </tr>
            <tr>
                <td><code>quickFilters.free</code></td>
                <td>boolean</td>
                <td><code>false</code></td>
                <td>Show "Free" filter button (disabled by default).</td>
            </tr>
        </tbody>
    </table>
    
    <h3>Dropdown Filters</h3>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>dropdownFilters.committee</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show Committee dropdown.</td>
            </tr>
            <tr>
                <td><code>dropdownFilters.activity</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show Activity dropdown.</td>
            </tr>
            <tr>
                <td><code>dropdownFilters.price</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show Price dropdown.</td>
            </tr>
            <tr>
                <td><code>dropdownFilters.eventType</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show Event Type dropdown.</td>
            </tr>
            <tr>
                <td><code>dropdownFilters.recurring</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show Recurring dropdown.</td>
            </tr>
            <tr>
                <td><code>dropdownFilters.venue</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show Venue dropdown.</td>
            </tr>
            <tr>
                <td><code>dropdownFilters.tags</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show Tags dropdown.</td>
            </tr>
        </tbody>
    </table>
    
    <h3>Tag Settings</h3>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>showEventTags</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show tag badges on events.</td>
            </tr>
            <tr>
                <td><code>hiddenTags</code></td>
                <td>array</td>
                <td><code>[]</code></td>
                <td>Tags to hide from display (array of strings).</td>
            </tr>
        </tbody>
    </table>
    
    <h3>Calendar Display</h3>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>showEventDots</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Show dots on calendar dates with events.</td>
            </tr>
            <tr>
                <td><code>pastEventsVisible</code></td>
                <td>boolean</td>
                <td><code>false</code></td>
                <td>Show past events.</td>
            </tr>
            <tr>
                <td><code>pastEventsDays</code></td>
                <td>number</td>
                <td><code>14</code></td>
                <td>Days of past events to show (when enabled).</td>
            </tr>
            <tr>
                <td><code>showWaitlistCount</code></td>
                <td>boolean</td>
                <td><code>false</code></td>
                <td>Show waitlist count for sold-out events. Note: Requires extra API calls.</td>
            </tr>
        </tbody>
    </table>
    
    <h3>Title Parsing</h3>
    <p>Configure how event titles like "Happy Hikers: Morning Walk" are parsed.</p>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>titleParsing.enabled</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Enable "Prefix: Title" parsing.</td>
            </tr>
            <tr>
                <td><code>titleParsing.separator</code></td>
                <td>string</td>
                <td><code>":"</code></td>
                <td>Character separating prefix from title.</td>
            </tr>
            <tr>
                <td><code>titleParsing.maxSeparatorPosition</code></td>
                <td>number</td>
                <td><code>30</code></td>
                <td>How far into title to look for separator.</td>
            </tr>
            <tr>
                <td><code>titleParsing.defaultCategory</code></td>
                <td>string</td>
                <td><code>"General"</code></td>
                <td>Category when no prefix found.</td>
            </tr>
            <tr>
                <td><code>titleParsing.stripChars</code></td>
                <td>string</td>
                <td><code>"*-()"</code></td>
                <td>Characters to strip from prefix.</td>
            </tr>
        </tbody>
    </table>
    
    <h3>Auto-Tagging Rules</h3>
    <p>Automatically add tags to events based on their title.</p>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>type</code></td>
                <td>string</td>
                <td><code>name-prefix</code> or <code>name-contains</code></td>
            </tr>
            <tr>
                <td><code>pattern</code></td>
                <td>string</td>
                <td>Text to match in event title (include the colon for prefixes).</td>
            </tr>
            <tr>
                <td><code>tag</code></td>
                <td>string</td>
                <td>Tag to add when matched. Format: <code>category:value</code></td>
            </tr>
        </tbody>
    </table>
    
    <h3>Fallback Settings</h3>
    <p>What to show if the widget fails to load.</p>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>fallbackContainerId</code></td>
                <td>string</td>
                <td><code>"wa-fallback"</code></td>
                <td>ID of pre-placed WA Calendar container to show on error.</td>
            </tr>
            <tr>
                <td><code>fallbackEventsUrl</code></td>
                <td>string</td>
                <td><code>"/events"</code></td>
                <td>URL to link to if no fallback container exists.</td>
            </tr>
        </tbody>
    </table>
    
    <h3>Advanced Settings</h3>
    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>memberConfig</code></td>
                <td>object</td>
                <td><code>{}</code></td>
                <td>Config overrides for logged-in members.</td>
            </tr>
            <tr>
                <td><code>publicConfig</code></td>
                <td>object</td>
                <td><code>{}</code></td>
                <td>Config overrides for public/guest view.</td>
            </tr>
        </tbody>
    </table>
    
    <!-- ═══════════════════════════════════════════════════════════════════════════
         TROUBLESHOOTING
         ═══════════════════════════════════════════════════════════════════════════ -->
    
    <h2>Troubleshooting</h2>
    
    <table>
        <thead>
            <tr>
                <th>Symptom</th>
                <th>Cause</th>
                <th>Fix</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>"Not logged in" error</td>
                <td>User not authenticated</td>
                <td>Must be logged into Wild Apricot</td>
            </tr>
            <tr>
                <td>No events displayed</td>
                <td>API request failed or no events</td>
                <td>Check browser console for errors</td>
            </tr>
            <tr>
                <td>Filters not working</td>
                <td>Config not loaded before script</td>
                <td>Ensure config script comes first</td>
            </tr>
            <tr>
                <td>Styling issues</td>
                <td>CSS conflicts with WA theme</td>
                <td>Adjust colors or set <code>autoTheme: false</code></td>
            </tr>
            <tr>
                <td>Calendar not showing</td>
                <td>Container ID mismatch</td>
                <td>Ensure <code>&lt;div id="clubcalendar"&gt;&lt;/div&gt;</code> exists</td>
            </tr>
        </tbody>
    </table>
    
    <!-- ═══════════════════════════════════════════════════════════════════════════
         VERSION INFO
         ═══════════════════════════════════════════════════════════════════════════ -->
    
    <h2>Version Information</h2>
    
    <table>
        <tbody>
            <tr>
                <td><strong>Widget Version</strong></td>
                <td>2.0.0 (WA Native Edition)</td>
            </tr>
            <tr>
                <td><strong>Contract Version</strong></td>
                <td>2.0.0</td>
            </tr>
            <tr>
                <td><strong>Last Updated</strong></td>
                <td>December 2024</td>
            </tr>
            <tr>
                <td><strong>External Dependencies</strong></td>
                <td>None</td>
            </tr>
        </tbody>
    </table>
    
    <div class="alert alert-warning">
        <strong>Security Note:</strong> Never add API keys, passwords, or credentials to this configuration.
        All authentication happens automatically through the Wild Apricot session.
    </div>
    
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════════════════
         INLINE VALIDATION (runs on page load)
         ═══════════════════════════════════════════════════════════════════════════ -->
    
    <script>
    (function() {
        'use strict';
    
        // No validation needed on this reference page
        // The actual widget does validation when it loads
    
        // Just show a helpful status message
        const statusDiv = document.getElementById('config-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="
                    background: #e8f5e9;
                    border: 1px solid #4caf50;
                    border-radius: 8px;
                    padding: 16px 20px;
                ">
                    <strong style="color: #2e7d32;">✓ Configuration Reference Page</strong>
                    <p style="margin: 8px 0 0 0; color: #333;">
                        This page documents all available configuration options.
                        The actual configuration lives in the Events page widget code.
                    </p>
                </div>
            `;
        }
    })();
    </script>
    

Editing rules (operator-safe)
- Change values only; do not delete the script tag.
- If JSON becomes invalid, the Events page will show a config load error.
