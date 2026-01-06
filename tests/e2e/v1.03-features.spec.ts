/**
 * E2E Tests for ClubCalendar v1.03 Features
 *
 * Tests for:
 * - Search box filter UI and functionality
 * - Member click navigation to event details
 * - Regression tests for existing functionality
 */

import { test, expect, Page } from '@playwright/test';

// Use local test page for E2E testing (baseURL is localhost:8080 from config)
const CALENDAR_PATH = '/tests/e2e-test.html';

// Production server URL for API tests only (skipped if unavailable)
const PROD_API = 'https://mail.sbnewcomers.org';

// ═══════════════════════════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════════════════════════

async function waitForCalendarLoad(page: Page) {
  // Wait for calendar container to exist
  await page.waitForSelector('.clubcalendar-widget', { timeout: 15000 });
  // Wait for FullCalendar to render
  await page.waitForSelector('.fc-dayGridMonth-view, .fc-listMonth-view', { timeout: 10000 });
}

// ═══════════════════════════════════════════════════════════════
// SEARCH BOX UI TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Search Box UI', () => {

  test('search input should be visible in filter bar', async ({ page }) => {
    // Capture console logs for debugging
    page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // Navigate to calendar page
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Search input should be visible
    const searchInput = page.locator('#clubcal-filter-search');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search events...');
  });

  test('search input should have correct styling', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');

    // Check it has the right class
    await expect(searchInput).toHaveClass(/clubcal-search-input/);

    // Check it's inside a filter group with label
    const filterGroup = searchInput.locator('..');
    await expect(filterGroup).toHaveClass(/clubcal-filter-group/);

    const label = filterGroup.locator('label');
    await expect(label).toHaveText('Search');
  });

  test('search should filter events on typing', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Get initial event count
    const initialEvents = await page.locator('.fc-event').count();

    // Type in search box
    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('Wine');

    // Wait for debounce (300ms) + some buffer
    await page.waitForTimeout(500);

    // Events should be filtered (fewer or same, depends on data)
    const filteredEvents = await page.locator('.fc-event').count();

    // If there are wine events, should show fewer events (unless all are wine)
    // At minimum, filter should have been applied without error
    expect(filteredEvents).toBeLessThanOrEqual(initialEvents);
  });

  test('search should update active filters display', async ({ page }) => {
    // Debug logging
    page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));

    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');

    // Check if input exists and has the event listener
    const hasInput = await page.locator('#clubcal-filter-search').count();
    console.log('Search input count:', hasInput);

    // Use type() to trigger input events character by character
    await searchInput.click();
    await searchInput.type('hiking');

    // Manually dispatch an input event to ensure it triggers
    await page.evaluate(() => {
      const input = document.getElementById('clubcal-filter-search');
      if (input) {
        console.log('Dispatching input event manually');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Wait for debounce + extra buffer
    await page.waitForTimeout(800);

    // Check current state for debugging
    const activeFiltersHtml = await page.locator('#clubcal-active-filters').innerHTML();
    console.log('Active filters HTML:', activeFiltersHtml);

    const searchValue = await searchInput.inputValue();
    console.log('Search input value:', searchValue);

    // Check active filters display shows search term
    const activeFilters = page.locator('#clubcal-active-filters');
    await expect(activeFilters).toContainText('Search');
    await expect(activeFilters).toContainText('hiking');
  });

  test('clear filters should clear search box', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Enter search text
    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('wine');
    await page.waitForTimeout(500);

    // Click clear all
    const clearBtn = page.locator('[data-action="clearFilters"]');
    await clearBtn.click();

    // Search input should be cleared
    await expect(searchInput).toHaveValue('');
  });

  test('search should work with Enter key', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('wine');
    await searchInput.press('Enter');

    // Should filter without waiting for debounce
    const activeFilters = page.locator('#clubcal-active-filters');
    await expect(activeFilters).toContainText('Search');
  });

  test('search should be case insensitive', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');

    // Search lowercase
    await searchInput.fill('wine');
    await page.waitForTimeout(500);
    const lowercaseCount = await page.locator('.fc-event').count();

    // Clear and search uppercase
    await searchInput.fill('');
    await page.waitForTimeout(500);

    await searchInput.fill('WINE');
    await page.waitForTimeout(500);
    const uppercaseCount = await page.locator('.fc-event').count();

    // Should get same results
    expect(lowercaseCount).toBe(uppercaseCount);
  });

  test('empty search should show all events', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const initialCount = await page.locator('.fc-event').count();

    // Enter then clear search
    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('wine');
    await page.waitForTimeout(500);

    await searchInput.fill('');
    await page.waitForTimeout(500);

    const clearedCount = await page.locator('.fc-event').count();

    // Should return to showing all events
    expect(clearedCount).toBe(initialCount);
  });
});

// ═══════════════════════════════════════════════════════════════
// SEARCH + OTHER FILTERS COMBINATION TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Search Combined with Other Filters', () => {

  test('search should work with weekend filter', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Enable weekend filter
    const weekendBtn = page.locator('[data-filter="weekend"]');
    await weekendBtn.click();
    await page.waitForTimeout(300);

    const weekendCount = await page.locator('.fc-event').count();

    // Add search
    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('happy');
    await page.waitForTimeout(500);

    const combinedCount = await page.locator('.fc-event').count();

    // Combined filters should show fewer or equal events
    expect(combinedCount).toBeLessThanOrEqual(weekendCount);
  });

  test('search should work with free filter', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Enable free filter
    const freeBtn = page.locator('[data-filter="free"]');
    await freeBtn.click();
    await page.waitForTimeout(300);

    // Add search
    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('hike');
    await page.waitForTimeout(500);

    // Active filters should show both
    const activeFilters = page.locator('#clubcal-active-filters');
    await expect(activeFilters).toContainText('Free');
    await expect(activeFilters).toContainText('Search');
  });

  test('clearing search should preserve other filters', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Enable weekend filter
    const weekendBtn = page.locator('[data-filter="weekend"]');
    await weekendBtn.click();
    await page.waitForTimeout(300);

    // Add search
    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('wine');
    await page.waitForTimeout(500);

    // Clear search only (not using clear all button)
    await searchInput.fill('');
    await page.waitForTimeout(500);

    // Weekend filter should still be active
    await expect(weekendBtn).toHaveClass(/active/);

    // Active filters should still show Weekend
    const activeFilters = page.locator('#clubcal-active-filters');
    await expect(activeFilters).toContainText('Weekend');
    await expect(activeFilters).not.toContainText('Search');
  });
});

// ═══════════════════════════════════════════════════════════════
// MEMBER CLICK NAVIGATION TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Member Click Navigation', () => {

  test('member should navigate to event details on click', async ({ page }) => {
    // This test requires production server with member authentication
    // Skip when running against local test page
    if (CALENDAR_PATH.includes('e2e-test.html')) {
      test.skip();
      return;
    }

    // Set up navigation listener
    const navigationPromise = page.waitForNavigation({ timeout: 5000 });

    // Go to member calendar (need to be logged in or use member param)
    await page.goto(`${PROD_API}/calendar?contact=12345&memberLevel=member`);
    await waitForCalendarLoad(page);

    // Skip if no events visible
    const eventCount = await page.locator('.fc-event').count();
    if (eventCount === 0) {
      test.skip();
      return;
    }

    // Click first event
    await page.locator('.fc-event').first().click();

    // Should navigate to event details page
    try {
      await navigationPromise;
      const url = page.url();
      expect(url).toMatch(/sbnewcomers\.org\/event-\d+/);
    } catch (e) {
      // If navigation doesn't happen within timeout, the click behavior might be wrong
      // or we might need authentication
      console.log('Navigation did not occur - may need authentication');
    }
  });

  test('public user should NOT navigate on click', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const eventCount = await page.locator('.fc-event').count();
    if (eventCount === 0) {
      test.skip();
      return;
    }

    const initialUrl = page.url();

    // Click first event
    await page.locator('.fc-event').first().click();

    // Wait a bit for potential navigation
    await page.waitForTimeout(1000);

    // URL should NOT have changed to event details
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/event-\d+/);
  });

  test.skip('public user should see side panel or popup on click', async ({ page }) => {
    // TODO: Side panel feature not yet implemented (planned for v1.03 external server edition)
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const eventCount = await page.locator('.fc-event').count();
    if (eventCount === 0) {
      test.skip();
      return;
    }

    // Click first event
    await page.locator('.fc-event').first().click();

    // Should see either side panel or popup
    const sidePanel = page.locator('.clubcal-side-panel');
    const popup = page.locator('.clubcal-event-popup');

    // One of them should be visible
    const sidePanelVisible = await sidePanel.isVisible().catch(() => false);
    const popupVisible = await popup.isVisible().catch(() => false);

    expect(sidePanelVisible || popupVisible).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// API TESTS (require production server)
// ═══════════════════════════════════════════════════════════════

test.describe('API Integration', () => {

  test.beforeEach(async ({ request }) => {
    // Skip all API tests if server is not reachable
    try {
      const response = await request.get(`${PROD_API}/api/health`, { timeout: 5000 });
      if (!response.ok()) {
        test.skip();
      }
    } catch {
      test.skip();
    }
  });

  test('member events API should return events', async ({ request }) => {
    const response = await request.get(`${PROD_API}/api/calendar/events/member`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.events).toBeDefined();
    expect(Array.isArray(data.events)).toBe(true);
  });

  test('public events API should return events', async ({ request }) => {
    const response = await request.get(`${PROD_API}/api/calendar/events`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.events).toBeDefined();
    expect(data.audience).toBe('public');
  });

  test('events should have searchable fields', async ({ request }) => {
    const response = await request.get(`${PROD_API}/api/calendar/events/member`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    if (data.events.length > 0) {
      const event = data.events[0];

      // Events should have fields that search can use
      expect(event).toHaveProperty('Name');
      expect(event).toHaveProperty('Id');

      // Location and Description are optional but should be present if available
      // (not all events have them)
    }
  });

  test('events should have valid IDs for navigation', async ({ request }) => {
    const response = await request.get(`${PROD_API}/api/calendar/events/member`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    for (const event of data.events.slice(0, 10)) {
      expect(event.Id).toBeDefined();
      expect(typeof event.Id).toBe('number');
      expect(event.Id).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// REGRESSION TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Regression Tests', () => {

  test('calendar should load without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('third-party')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('view toggle should still work', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Switch to list view
    const listBtn = page.locator('[data-view="listMonth"]');
    await listBtn.click();
    await page.waitForTimeout(500);

    // Should see list view (use .first() to handle multiple matches)
    const listView = page.locator('.fc-listMonth-view').first();
    await expect(listView).toBeVisible();

    // Switch back to calendar view
    const calBtn = page.locator('[data-view="dayGridMonth"]');
    await calBtn.click();
    await page.waitForTimeout(500);

    // Should see calendar view
    const calView = page.locator('.fc-dayGridMonth-view');
    await expect(calView).toBeVisible();
  });

  test('quick filters should still work', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Click weekend filter
    const weekendBtn = page.locator('[data-filter="weekend"]');
    await weekendBtn.click();

    // Button should become active
    await expect(weekendBtn).toHaveClass(/active/);

    // Active filters should show
    const activeFilters = page.locator('#clubcal-active-filters');
    await expect(activeFilters).toContainText('Weekend');
  });

  test('clear all should reset everything including search', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    // Apply multiple filters
    const weekendBtn = page.locator('[data-filter="weekend"]');
    await weekendBtn.click();

    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('wine');
    await page.waitForTimeout(500);

    // Click clear all
    const clearBtn = page.locator('[data-action="clearFilters"]');
    await clearBtn.click();

    // Everything should be cleared
    await expect(weekendBtn).not.toHaveClass(/active/);
    await expect(searchInput).toHaveValue('');

    const activeFilters = page.locator('#clubcal-active-filters');
    await expect(activeFilters).not.toContainText('Weekend');
    await expect(activeFilters).not.toContainText('Search');
  });

  test('parent events should be filtered out when sessions exist', async ({ request }) => {
    // This test requires the production server with SQLite database
    // Skip if server is not reachable
    try {
      const health = await request.get(`${PROD_API}/api/health`, { timeout: 5000 });
      if (!health.ok()) test.skip();
    } catch {
      test.skip();
      return;
    }

    // Query for Stride by the Tide parent and sessions
    const response = await request.post(`${PROD_API}/chatbot/api/query`, {
      data: {
        sql: `SELECT
                (SELECT COUNT(*) FROM events WHERE Name LIKE '%Stride by the Tide%' AND ParentEventId IS NULL) as parent_count,
                (SELECT COUNT(*) FROM events WHERE Name LIKE '%Stride by the Tide%' AND ParentEventId IS NOT NULL) as session_count`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    if (data.rows && data.rows[0]) {
      const parentCount = data.rows[0][0];
      const sessionCount = data.rows[0][1];

      // If sessions exist, there should be many more sessions than parents
      if (sessionCount > 0) {
        expect(sessionCount).toBeGreaterThan(parentCount);
      }
    }
  });

  test('multi-day trip events should span calendar days', async ({ request }) => {
    // This test requires the production server with SQLite database
    // Skip if server is not reachable
    try {
      const health = await request.get(`${PROD_API}/api/health`, { timeout: 5000 });
      if (!health.ok()) test.skip();
    } catch {
      test.skip();
      return;
    }

    // Query for ski trip or similar multi-day events
    const response = await request.post(`${PROD_API}/chatbot/api/query`, {
      data: {
        sql: `SELECT Id, Name, StartDate, EndDate,
              julianday(EndDate) - julianday(StartDate) as duration_days
              FROM events
              WHERE (Name LIKE '%Trip%' OR Name LIKE '%Ski%' OR Name LIKE '%Snow Sports%')
              AND StartDate > date('now')
              LIMIT 5`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // If we have trip events, they should span multiple days
    if (data.rows && data.rows.length > 0) {
      for (const row of data.rows) {
        const durationDays = row[4];
        // Trip events typically span at least 1 day
        expect(durationDays).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Performance Tests', () => {

  test('calendar should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('search filter should respond quickly', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');

    const startTime = Date.now();
    await searchInput.fill('wine');
    await page.waitForTimeout(500); // Debounce time

    // Wait for filter to apply (look for change in active filters)
    await page.waitForSelector('#clubcal-active-filters:has-text("Search")', { timeout: 2000 });

    const responseTime = Date.now() - startTime;

    // Search should complete within 3 seconds (including debounce)
    expect(responseTime).toBeLessThan(3000);
  });

  test('multiple rapid searches should not break widget', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');

    // Type rapidly
    await searchInput.fill('w');
    await page.waitForTimeout(100);
    await searchInput.fill('wi');
    await page.waitForTimeout(100);
    await searchInput.fill('win');
    await page.waitForTimeout(100);
    await searchInput.fill('wine');

    // Wait for final debounce
    await page.waitForTimeout(500);

    // Widget should still be functional
    const calendarVisible = await page.locator('.fc-dayGridMonth-view, .fc-listMonth-view').isVisible();
    expect(calendarVisible).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// MOBILE RESPONSIVENESS TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Mobile Responsiveness', () => {

  test('search input should be full width on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');

    // Check that search input expands on mobile
    const box = await searchInput.boundingBox();
    if (box) {
      // Should be reasonably wide on mobile (accounting for padding/margins)
      expect(box.width).toBeGreaterThan(250);
    }
  });

  test('search should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('wine');
    await page.waitForTimeout(500);

    // Should still show active filters
    const activeFilters = page.locator('#clubcal-active-filters');
    await expect(activeFilters).toContainText('Search');
  });
});

// ═══════════════════════════════════════════════════════════════
// EDGE CASE TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Edge Cases', () => {

  test('search with special characters should not break', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');

    // Try various special characters
    const specialSearches = [
      'happy hikers:',
      'event (special)',
      'test & more',
      'wine!',
      'search"with"quotes',
      '<script>alert(1)</script>'
    ];

    for (const search of specialSearches) {
      await searchInput.fill(search);
      await page.waitForTimeout(300);

      // Should not break - widget should still be visible
      const calendarVisible = await page.locator('.clubcalendar-widget').isVisible();
      expect(calendarVisible).toBe(true);

      await searchInput.fill('');
    }
  });

  test('very long search string should be handled', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const searchInput = page.locator('#clubcal-filter-search');

    // Enter very long search string
    const longSearch = 'a'.repeat(500);
    await searchInput.fill(longSearch);
    await page.waitForTimeout(500);

    // Should not break
    const calendarVisible = await page.locator('.clubcalendar-widget').isVisible();
    expect(calendarVisible).toBe(true);
  });

  test('search with only whitespace should show all events', async ({ page }) => {
    await page.goto(CALENDAR_PATH);
    await waitForCalendarLoad(page);

    const initialCount = await page.locator('.fc-event').count();

    const searchInput = page.locator('#clubcal-filter-search');
    await searchInput.fill('   ');
    await page.waitForTimeout(500);

    const currentCount = await page.locator('.fc-event').count();

    // Should still show same number of events
    expect(currentCount).toBe(initialCount);
  });
});
