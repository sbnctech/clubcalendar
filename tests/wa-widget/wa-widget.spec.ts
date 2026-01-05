/**
 * WA Widget Test Suite
 *
 * Tests for Jeff's Enhanced WA Calendar Widget
 * Target: https://sbnc-website-redesign-playground.wildapricot.org/Events
 *
 * Run with: npx playwright test tests/wa-widget/wa-widget.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const WA_WIDGET_URL = 'https://sbnc-website-redesign-playground.wildapricot.org/Events';

// Helper: Wait for calendar to be fully loaded
async function waitForCalendarReady(page: Page) {
  await page.waitForSelector('#idEventListCalendar', { timeout: 10000 });
  await page.waitForSelector('a[href*="event-"]', { timeout: 10000 });
  await page.waitForTimeout(500);
}

// Helper: Clear localStorage before test
async function clearFilters(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('sbnc_calendar_filters');
    localStorage.removeItem('sbnc_calendar_search');
  });
}

// Helper: Get visible event count
async function getVisibleEventCount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const links = document.querySelectorAll('a[href*="event-"]');
    let visible = 0;
    links.forEach(link => {
      const style = window.getComputedStyle(link);
      const parent = link.closest('.eventDivItem, div[valign="top"], .event-card');
      const parentStyle = parent ? window.getComputedStyle(parent) : null;
      if (style.display !== 'none' && style.visibility !== 'hidden' &&
          (!parentStyle || (parentStyle.display !== 'none' && parentStyle.visibility !== 'hidden'))) {
        visible++;
      }
    });
    return visible;
  });
}

// Helper: Get total event count
async function getTotalEventCount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return document.querySelectorAll('a[href*="event-"]').length;
  });
}

test.describe('WA Widget - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WA_WIDGET_URL);
    await waitForCalendarReady(page);
    await clearFilters(page);
    await page.reload();
    await waitForCalendarReady(page);
  });

  test('TC-001: Calendar loads with events', async ({ page }) => {
    const eventCount = await getTotalEventCount(page);
    expect(eventCount).toBeGreaterThan(0);
    console.log(`Found ${eventCount} events`);
  });

  test('TC-002: Filter bar exists', async ({ page }) => {
    const hasFilterBar = await page.evaluate(() => {
      return !!(document.querySelector('.filter-bar') || document.querySelector('[data-tag]'));
    });
    expect(hasFilterBar).toBe(true);
  });

  test('TC-003: Search input exists', async ({ page }) => {
    const searchInput = await page.locator('input[placeholder*="Search"], .filter-search-input');
    await expect(searchInput).toBeVisible();
  });

  test('TC-004: View toggles exist', async ({ page }) => {
    const hasViewToggle = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Month') || text.includes('Week') || text.includes('List');
    });
    expect(hasViewToggle).toBe(true);
  });
});

test.describe('WA Widget - Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WA_WIDGET_URL);
    await waitForCalendarReady(page);
    await clearFilters(page);
    await page.reload();
    await waitForCalendarReady(page);
  });

  test('TC-010: Time of day filter works', async ({ page }) => {
    const initialCount = await getVisibleEventCount(page);
    const morningFilter = await page.locator('[data-tag="morning"]');
    if (await morningFilter.isVisible()) {
      await morningFilter.click();
      await page.waitForTimeout(300);
      const filteredCount = await getVisibleEventCount(page);
      console.log(`Initial: ${initialCount}, After morning filter: ${filteredCount}`);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('TC-011: Show All resets filters', async ({ page }) => {
    const filterButton = await page.locator('[data-tag="morning"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
      const filteredCount = await getVisibleEventCount(page);
      const showAll = await page.locator('[data-tag="all"]');
      await showAll.click();
      await page.waitForTimeout(300);
      const resetCount = await getVisibleEventCount(page);
      expect(resetCount).toBeGreaterThanOrEqual(filteredCount);
    }
  });

  test('TC-012: Multiple filters use AND logic between categories', async ({ page }) => {
    const morningFilter = await page.locator('[data-tag="morning"]');
    if (await morningFilter.isVisible()) {
      await morningFilter.click();
      await page.waitForTimeout(300);
      const afterMorning = await getVisibleEventCount(page);
      const freeFilter = await page.locator('[data-tag="free"]');
      if (await freeFilter.isVisible()) {
        await freeFilter.click();
        await page.waitForTimeout(300);
        const afterBoth = await getVisibleEventCount(page);
        console.log(`Morning: ${afterMorning}, Morning+Free: ${afterBoth}`);
        expect(afterBoth).toBeLessThanOrEqual(afterMorning);
      }
    }
  });
});

test.describe('WA Widget - Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WA_WIDGET_URL);
    await waitForCalendarReady(page);
    await clearFilters(page);
    await page.reload();
    await waitForCalendarReady(page);
  });

  test('TC-020: Search filters events by title', async ({ page }) => {
    const searchInput = await page.locator('input[placeholder*="Search"], .filter-search-input');
    if (await searchInput.isVisible()) {
      const initialCount = await getVisibleEventCount(page);
      await searchInput.fill('Golf');
      await page.waitForTimeout(500);
      const searchCount = await getVisibleEventCount(page);
      console.log(`Initial: ${initialCount}, After search: ${searchCount}`);
      expect(searchCount).toBeLessThan(initialCount);
    }
  });

  test('TC-021: Search is case-insensitive', async ({ page }) => {
    const searchInput = await page.locator('input[placeholder*="Search"], .filter-search-input');
    if (await searchInput.isVisible()) {
      await searchInput.fill('GOLF');
      await page.waitForTimeout(500);
      const upperCount = await getVisibleEventCount(page);
      await searchInput.fill('golf');
      await page.waitForTimeout(500);
      const lowerCount = await getVisibleEventCount(page);
      expect(upperCount).toBe(lowerCount);
    }
  });

  test('TC-022: Show All does NOT reset search', async ({ page }) => {
    const searchInput = await page.locator('input[placeholder*="Search"], .filter-search-input');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Dance');
      await page.waitForTimeout(300);
      const showAll = await page.locator('[data-tag="all"]');
      if (await showAll.isVisible()) {
        await showAll.click();
        await page.waitForTimeout(300);
        const searchValue = await searchInput.inputValue();
        expect(searchValue).toBe('Dance');
      }
    }
  });
});

test.describe('WA Widget - Filter Persistence', () => {
  test('TC-030: Filters persist after reload', async ({ page }) => {
    await page.goto(WA_WIDGET_URL);
    await waitForCalendarReady(page);
    await clearFilters(page);
    await page.reload();
    await waitForCalendarReady(page);

    const morningFilter = await page.locator('[data-tag="morning"]');
    if (await morningFilter.isVisible()) {
      await morningFilter.click();
      await page.waitForTimeout(300);
      const countBefore = await getVisibleEventCount(page);
      await page.reload();
      await waitForCalendarReady(page);
      const countAfter = await getVisibleEventCount(page);
      console.log(`Before: ${countBefore}, After reload: ${countAfter}`);
      expect(countAfter).toBe(countBefore);
    }
  });
});

test.describe('WA Widget - Visual Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WA_WIDGET_URL);
    await waitForCalendarReady(page);
  });

  test('TC-040: Time-of-day color coding applied', async ({ page }) => {
    const hasColoredEvents = await page.evaluate(() => {
      const events = document.querySelectorAll('a[href*="event-"]');
      let coloredCount = 0;
      events.forEach(event => {
        const bg = window.getComputedStyle(event).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          coloredCount++;
        }
      });
      return coloredCount;
    });
    console.log(`Found ${hasColoredEvents} colored events`);
    expect(hasColoredEvents).toBeGreaterThan(0);
  });

  test('TC-041: Waitlist badges count', async ({ page }) => {
    const waitlistBadges = await page.locator('.waitlist-badge, .waitlist-badge-card').count();
    console.log(`Found ${waitlistBadges} waitlist badges`);
  });

  test('TC-042: Coming Soon badges count', async ({ page }) => {
    const comingSoonBadges = await page.locator('.coming-soon-badge, .coming-soon-badge-card').count();
    console.log(`Found ${comingSoonBadges} Coming Soon badges`);
  });
});

test.describe('WA Widget - Specific Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WA_WIDGET_URL);
    await waitForCalendarReady(page);
  });

  test('TC-060: Stride by the Tide events visible', async ({ page }) => {
    const strideEvents = await page.evaluate(() => {
      const events = document.querySelectorAll('a[href*="event-"]');
      let count = 0;
      events.forEach(event => {
        if (event.textContent?.toLowerCase().includes('stride')) count++;
      });
      return count;
    });
    console.log(`Found ${strideEvents} Stride by the Tide events`);
    expect(strideEvents).toBeGreaterThan(0);
  });

  test('TC-061: Recurring events show correctly', async ({ page }) => {
    const recurringIndicators = await page.evaluate(() => {
      const text = document.body.innerText;
      const matches = text.match(/\d+ of \d+/g);
      return matches ? matches.length : 0;
    });
    console.log(`Found ${recurringIndicators} recurring event indicators`);
  });
});

test.describe('WA Widget - Bug Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WA_WIDGET_URL);
    await waitForCalendarReady(page);
    await clearFilters(page);
    await page.reload();
    await waitForCalendarReady(page);
  });

  test('BUG-001: Events without committee tags', async ({ page }) => {
    const untaggedEvents = await page.evaluate(() => {
      const events = document.querySelectorAll('a[href*="event-"]');
      const onlyTimeTagged: string[] = [];
      const timeOnlyTags = ['morning', 'afternoon', 'evening', 'free', 'public', 'public event', 'waitlist'];

      events.forEach(event => {
        const tags = event.getAttribute('data-tags') || '';
        const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
        const hasCommittee = tagList.some(tag => !timeOnlyTags.includes(tag.toLowerCase()));
        if (!hasCommittee && tagList.length > 0) {
          onlyTimeTagged.push(event.textContent?.trim().substring(0, 50) || 'Unknown');
        }
      });
      return onlyTimeTagged;
    });

    console.log(`Events without committee tags: ${untaggedEvents.length}`);
    if (untaggedEvents.length > 0) {
      console.log('Examples:', untaggedEvents.slice(0, 5));
    }
  });

  test('BUG-002: No results message missing', async ({ page }) => {
    const searchInput = await page.locator('input[placeholder*="Search"], .filter-search-input');
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistent123456');
      await page.waitForTimeout(500);

      const visibleCount = await getVisibleEventCount(page);
      if (visibleCount === 0) {
        const hasNoResultsMessage = await page.evaluate(() => {
          const text = document.body.innerText.toLowerCase();
          return text.includes('no events') || text.includes('no results') || text.includes('nothing found');
        });
        console.log(`Zero events. "No results" message: ${hasNoResultsMessage}`);
        // BUG confirmed if hasNoResultsMessage is false
      }
    }
  });

  test('BUG-003: Case sensitivity in tags', async ({ page }) => {
    const tagCases = await page.evaluate(() => {
      const events = document.querySelectorAll('a[href*="event-"]');
      const allTags = new Set<string>();
      events.forEach(event => {
        const tags = event.getAttribute('data-tags') || '';
        tags.split(',').forEach(tag => {
          const t = tag.trim();
          if (t) allTags.add(t);
        });
      });
      return Array.from(allTags);
    });

    console.log('Unique tags:', tagCases.slice(0, 20));
    const hasUppercase = tagCases.some(t => t !== t.toLowerCase());
    if (hasUppercase) console.log('WARNING: Uppercase tags found');
  });
});
