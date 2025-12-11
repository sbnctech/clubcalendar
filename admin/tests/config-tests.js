/**
 * ClubCalendar Admin Configuration Tests
 *
 * To run: Open admin/index.html in browser, then in console type:
 *   await ClubCalendarTests.runAll()
 *
 * Or run individual suites:
 *   await ClubCalendarTests.run('Default Values')
 */

window.ClubCalendarTests = (function() {
    const results = {
        passed: 0,
        failed: 0,
        skipped: 0,
        details: []
    };

    function reset() {
        results.passed = 0;
        results.failed = 0;
        results.skipped = 0;
        results.details = [];
    }

    function assert(suite, testName, condition, message = '') {
        const passed = Boolean(condition);
        if (passed) {
            results.passed++;
            console.log(`  ✓ ${testName}`);
        } else {
            results.failed++;
            console.log(`  ✗ ${testName}${message ? ': ' + message : ''}`);
        }
        results.details.push({ suite, testName, passed, message });
        return passed;
    }

    function assertEqual(suite, testName, actual, expected) {
        const passed = actual === expected;
        if (passed) {
            results.passed++;
            console.log(`  ✓ ${testName}`);
        } else {
            results.failed++;
            console.log(`  ✗ ${testName}: expected "${expected}", got "${actual}"`);
        }
        results.details.push({ suite, testName, passed, message: passed ? '' : `expected "${expected}", got "${actual}"` });
        return passed;
    }

    function getEl(id) {
        return document.getElementById(id);
    }

    function getValue(id) {
        const el = getEl(id);
        if (!el) return undefined;
        if (el.type === 'checkbox') return el.checked;
        return el.value;
    }

    function setValue(id, value) {
        const el = getEl(id);
        if (!el) return false;
        if (el.type === 'checkbox') {
            el.checked = value;
        } else {
            el.value = value;
        }
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================================================
    // TEST SUITES
    // ========================================================================

    const suites = {
        'Elements Exist': async function() {
            const elements = [
                // Setup tab
                'eventsJsonUrl', 'icsBaseUrl', 'hostingGoogle', 'hostingServer',
                // Display tab
                'widgetTitle', 'defaultView', 'weekStartsOn', 'containerSelector',
                'showEventDots', 'showEventCount', 'showTimeInTitle', 'showRegistrationStatus', 'hidePastEvents',
                'showFilterBar', 'showQuickFilters', 'showSearchBox', 'defaultFilter',
                'eventClickBehavior', 'openLinksNewTab', 'showAddToCalendar',
                'enableMapDirections', 'mapProvider',
                // CSS tab
                'inheritTheme', 'colorPrimary', 'colorAccent', 'colorHeaderBg', 'colorHeaderText',
                'fontFamily', 'headerFontSize', 'bodyFontSize', 'labelFontSize', 'customCss'
            ];

            elements.forEach(id => {
                assert('Elements Exist', `#${id}`, getEl(id) !== null);
            });
        },

        'Default Values': async function() {
            // Clear localStorage and reload defaults
            localStorage.removeItem('clubcalendar-config');
            localStorage.removeItem('clubcalendar-filters');
            localStorage.removeItem('clubcalendar-quickfilters');
            loadConfig();
            await sleep(50);

            const defaults = {
                widgetTitle: 'Club Events',
                defaultView: 'dayGridMonth',
                weekStartsOn: '0',
                containerSelector: '#clubcalendar',
                showEventDots: true,
                showEventCount: false,
                showTimeInTitle: true,
                showRegistrationStatus: true,
                hidePastEvents: false,
                showFilterBar: true,
                showQuickFilters: true,
                showSearchBox: true,
                defaultFilter: '',
                eventClickBehavior: 'popup',
                openLinksNewTab: true,
                showAddToCalendar: true,
                enableMapDirections: true,
                mapProvider: 'both',
                inheritTheme: true
            };

            Object.keys(defaults).forEach(id => {
                assertEqual('Default Values', `#${id} = ${defaults[id]}`, getValue(id), defaults[id]);
            });
        },

        'buildConfig Basic': async function() {
            setValue('widgetTitle', 'Test Calendar');
            setValue('eventsJsonUrl', 'https://example.com/events.json');
            setValue('weekStartsOn', '1');
            setValue('containerSelector', '#mycalendar');
            await sleep(50);

            const config = buildConfig();

            assertEqual('buildConfig Basic', 'title', config.title, 'Test Calendar');
            assertEqual('buildConfig Basic', 'eventsUrl', config.eventsUrl, 'https://example.com/events.json');
            assertEqual('buildConfig Basic', 'weekStartsOn', config.weekStartsOn, 1);
            assertEqual('buildConfig Basic', 'container', config.container, '#mycalendar');

            // Reset
            setValue('widgetTitle', 'Club Events');
            setValue('eventsJsonUrl', '');
            setValue('weekStartsOn', '0');
            setValue('containerSelector', '#clubcalendar');
        },

        'buildConfig Display Options': async function() {
            setValue('showEventDots', false);
            setValue('showEventCount', true);
            setValue('showTimeInTitle', false);
            setValue('showRegistrationStatus', false);
            setValue('hidePastEvents', true);
            await sleep(50);

            const config = buildConfig();

            assertEqual('buildConfig Display Options', 'showEventDots', config.display.showEventDots, false);
            assertEqual('buildConfig Display Options', 'showEventCount', config.display.showEventCount, true);
            assertEqual('buildConfig Display Options', 'showTimeInTitle', config.display.showTimeInTitle, false);
            assertEqual('buildConfig Display Options', 'showRegistrationStatus', config.display.showRegistrationStatus, false);
            assertEqual('buildConfig Display Options', 'hidePastEvents', config.display.hidePastEvents, true);

            // Reset
            setValue('showEventDots', true);
            setValue('showEventCount', false);
            setValue('showTimeInTitle', true);
            setValue('showRegistrationStatus', true);
            setValue('hidePastEvents', false);
        },

        'buildConfig Filter Bar': async function() {
            setValue('showFilterBar', false);
            setValue('showQuickFilters', false);
            setValue('showSearchBox', false);
            setValue('defaultFilter', 'weekend');
            await sleep(50);

            const config = buildConfig();

            assertEqual('buildConfig Filter Bar', 'show', config.filterBar.show, false);
            assertEqual('buildConfig Filter Bar', 'showQuickFilters', config.filterBar.showQuickFilters, false);
            assertEqual('buildConfig Filter Bar', 'showSearchBox', config.filterBar.showSearchBox, false);
            assertEqual('buildConfig Filter Bar', 'defaultFilter', config.filterBar.defaultFilter, 'weekend');

            // Reset
            setValue('showFilterBar', true);
            setValue('showQuickFilters', true);
            setValue('showSearchBox', true);
            setValue('defaultFilter', '');
        },

        'buildConfig Behavior': async function() {
            setValue('eventClickBehavior', 'navigate');
            setValue('openLinksNewTab', false);
            setValue('showAddToCalendar', false);
            await sleep(50);

            const config = buildConfig();

            assertEqual('buildConfig Behavior', 'eventClickBehavior', config.behavior.eventClickBehavior, 'navigate');
            assertEqual('buildConfig Behavior', 'openLinksNewTab', config.behavior.openLinksNewTab, false);
            assertEqual('buildConfig Behavior', 'showAddToCalendar', config.behavior.showAddToCalendar, false);

            // Reset
            setValue('eventClickBehavior', 'popup');
            setValue('openLinksNewTab', true);
            setValue('showAddToCalendar', true);
        },

        'buildConfig Maps': async function() {
            setValue('enableMapDirections', false);
            setValue('mapProvider', 'google');
            await sleep(50);

            const config = buildConfig();

            assertEqual('buildConfig Maps', 'enabled', config.maps.enabled, false);
            assertEqual('buildConfig Maps', 'provider', config.maps.provider, 'google');

            // Reset
            setValue('enableMapDirections', true);
            setValue('mapProvider', 'both');
        },

        'buildConfig ICS': async function() {
            setValue('icsBaseUrl', 'https://example.com/ics.php');
            await sleep(50);

            const config = buildConfig();

            assertEqual('buildConfig ICS', 'icsBaseUrl', config.icsBaseUrl, 'https://example.com/ics.php');

            // Reset
            setValue('icsBaseUrl', '');
        },

        'buildConfig CSS': async function() {
            setValue('inheritTheme', false);
            await sleep(50);
            setValue('colorPrimary', '#ff0000');
            setValue('colorHeaderBg', '#00ff00');
            setValue('fontFamily', 'georgia');
            setValue('headerFontSize', '28');
            setValue('customCss', '.test { color: red; }');
            await sleep(50);

            const config = buildConfig();

            assertEqual('buildConfig CSS', 'inheritTheme', config.css.inheritTheme, false);
            assertEqual('buildConfig CSS', 'colors.primary', config.css.colors.primary, '#ff0000');
            assertEqual('buildConfig CSS', 'colors.headerBg', config.css.colors.headerBg, '#00ff00');
            assertEqual('buildConfig CSS', 'typography.fontFamily', config.css.typography.fontFamily, 'Georgia, serif');
            assertEqual('buildConfig CSS', 'typography.headerSize', config.css.typography.headerSize, '28px');
            assertEqual('buildConfig CSS', 'custom', config.css.custom, '.test { color: red; }');

            // Reset
            setValue('inheritTheme', true);
            setValue('colorPrimary', '#2c5aa0');
            setValue('colorHeaderBg', '#2c5aa0');
            setValue('fontFamily', 'inherit');
            setValue('headerFontSize', '24');
            setValue('customCss', '');
        },

        'Save and Load Config': async function() {
            const testTitle = 'SaveTest_' + Date.now();
            setValue('widgetTitle', testTitle);
            setValue('showEventDots', false);
            setValue('weekStartsOn', '1');
            setValue('defaultFilter', 'free');
            await sleep(50);

            saveConfig();

            // Change values
            setValue('widgetTitle', 'Changed');
            setValue('showEventDots', true);
            setValue('weekStartsOn', '0');
            setValue('defaultFilter', '');
            await sleep(50);

            // Verify changed
            assertEqual('Save and Load Config', 'title changed', getValue('widgetTitle'), 'Changed');

            // Load saved config
            loadConfig();
            await sleep(50);

            // Verify restored
            assertEqual('Save and Load Config', 'title restored', getValue('widgetTitle'), testTitle);
            assertEqual('Save and Load Config', 'showEventDots restored', getValue('showEventDots'), false);
            assertEqual('Save and Load Config', 'weekStartsOn restored', getValue('weekStartsOn'), '1');
            assertEqual('Save and Load Config', 'defaultFilter restored', getValue('defaultFilter'), 'free');

            // Cleanup
            localStorage.removeItem('clubcalendar-config');
            setValue('widgetTitle', 'Club Events');
            setValue('showEventDots', true);
            setValue('weekStartsOn', '0');
            setValue('defaultFilter', '');
        },

        'Tab Navigation': async function() {
            const tabs = ['setup', 'basic', 'advanced', 'css'];

            for (const tab of tabs) {
                const btn = document.querySelector(`[data-tab="${tab}"]`);
                const content = getEl(`tab-${tab}`);

                if (btn && content) {
                    btn.click();
                    await sleep(50);

                    assert('Tab Navigation', `"${tab}" button activates`, btn.classList.contains('active'));
                    assert('Tab Navigation', `"${tab}" content shows`, content.classList.contains('active'));
                } else {
                    assert('Tab Navigation', `"${tab}" elements exist`, false);
                }
            }
        },

        'Hosting Toggle': async function() {
            // Switch to setup tab
            document.querySelector('[data-tab="setup"]')?.click();
            await sleep(50);

            const googleCard = getEl('googleSetupCard');
            const serverCard = getEl('serverSetupCard');

            selectHostingOption('google');
            await sleep(50);

            assert('Hosting Toggle', 'Google card visible', googleCard?.style.display !== 'none');
            assert('Hosting Toggle', 'Server card hidden (Google)', serverCard?.style.display === 'none');

            selectHostingOption('server');
            await sleep(50);

            assert('Hosting Toggle', 'Server card visible', serverCard?.style.display !== 'none');
            assert('Hosting Toggle', 'Google card hidden (Server)', googleCard?.style.display === 'none');

            // Reset
            selectHostingOption('google');
        },

        'Quick Filters Default': async function() {
            const quickFiltersList = getEl('quickFiltersList');

            assert('Quick Filters Default', 'List container exists', quickFiltersList !== null);

            if (quickFiltersList) {
                const count = quickFiltersList.children.length;
                assert('Quick Filters Default', 'Has 6 default quick filters', count === 6);

                // Check for expected filter labels
                const html = quickFiltersList.innerHTML;
                assert('Quick Filters Default', 'Has "Openings" filter', html.includes('Openings for Any Member'));
                assert('Quick Filters Default', 'Has "Weekend" filter', html.includes('Weekend'));
                assert('Quick Filters Default', 'Has "Free" filter', html.includes('Free'));
                assert('Quick Filters Default', 'Has "Public Welcome" filter', html.includes('Public Welcome'));
            }
        },

        'Embed Code Generation': async function() {
            setValue('eventsJsonUrl', 'https://test.com/events.json');
            setValue('widgetTitle', 'Embed Test');
            setValue('weekStartsOn', '1');
            setValue('showEventDots', false);
            setValue('icsBaseUrl', 'https://test.com/ics.php');
            await sleep(50);

            showEmbedCode();
            await sleep(50);

            const embedCode = getEl('embedCode')?.textContent || '';

            assert('Embed Code Generation', 'Contains eventsUrl', embedCode.includes('https://test.com/events.json'));
            assert('Embed Code Generation', 'Contains headerTitle', embedCode.includes('Embed Test'));
            assert('Embed Code Generation', 'Contains weekStartsOn', embedCode.includes('weekStartsOn'));
            assert('Embed Code Generation', 'Contains display options', embedCode.includes('showEventDots'));
            assert('Embed Code Generation', 'Contains icsBaseUrl', embedCode.includes('https://test.com/ics.php'));
            assert('Embed Code Generation', 'Contains script tag', embedCode.includes('<script'));
            assert('Embed Code Generation', 'Contains container div', embedCode.includes('id="clubcalendar"'));

            closeEmbedModal();

            // Reset
            setValue('eventsJsonUrl', '');
            setValue('widgetTitle', 'Club Events');
            setValue('weekStartsOn', '0');
            setValue('showEventDots', true);
            setValue('icsBaseUrl', '');
        },

        'Color Picker Sync': async function() {
            // Switch to CSS tab and disable inheritance
            document.querySelector('[data-tab="css"]')?.click();
            await sleep(50);
            setValue('inheritTheme', false);
            await sleep(100);

            const picker = getEl('colorPrimary');
            const hex = getEl('colorPrimaryHex');

            if (picker && hex) {
                // Change picker
                picker.value = '#123456';
                picker.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(50);

                assertEqual('Color Picker Sync', 'Hex syncs from picker', hex.value, '#123456');

                // Change hex
                hex.value = '#abcdef';
                hex.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(50);

                assertEqual('Color Picker Sync', 'Picker syncs from hex', picker.value, '#abcdef');
            } else {
                assert('Color Picker Sync', 'Color inputs exist', false);
            }

            // Reset
            setValue('inheritTheme', true);
        }
    };

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    async function run(suiteName) {
        reset();
        console.log(`\n━━━ Running: ${suiteName} ━━━`);

        if (suites[suiteName]) {
            await suites[suiteName]();
        } else {
            console.log(`Unknown suite: ${suiteName}`);
            return;
        }

        printSummary();
        return results;
    }

    async function runAll() {
        reset();
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║       ClubCalendar Admin Configuration Tests             ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        for (const [name, fn] of Object.entries(suites)) {
            console.log(`\n━━━ ${name} ━━━`);
            await fn();
        }

        printSummary();
        return results;
    }

    function printSummary() {
        const total = results.passed + results.failed + results.skipped;
        const status = results.failed === 0 ? '✓ ALL PASSED' : '✗ FAILURES';

        console.log('\n══════════════════════════════════════════════════════════');
        console.log(`${status}: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped (${total} total)`);
        console.log('══════════════════════════════════════════════════════════\n');
    }

    function list() {
        console.log('\nAvailable test suites:');
        Object.keys(suites).forEach(name => {
            console.log(`  - ${name}`);
        });
        console.log('\nUsage:');
        console.log('  await ClubCalendarTests.runAll()');
        console.log('  await ClubCalendarTests.run("Suite Name")');
    }

    return {
        run,
        runAll,
        list,
        results: () => results
    };
})();

console.log('ClubCalendar Tests loaded. Run: await ClubCalendarTests.runAll()');
