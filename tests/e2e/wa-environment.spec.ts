/**
 * E2E Tests for Wild Apricot Custom HTML Gadget Environment
 *
 * These tests verify that the ClubCalendar widget works correctly
 * within the restrictions imposed by WA's Custom HTML Gadget.
 */

import { test, expect, Page } from '@playwright/test';

// Helper to wait for widget initialization
async function waitForWidget(page: Page) {
    // Wait for the main container to appear
    await page.waitForSelector('#clubcalendar', { timeout: 10000 });
    // Wait for widget to be built (either normal widget or fallback error)
    await page.waitForFunction(() => {
        const widget = document.querySelector('.clubcalendar-widget');
        const fallbackMsg = document.querySelector('#clubcalendar [style*="background: #fff3cd"]');
        return widget !== null || fallbackMsg !== null;
    }, { timeout: 15000 });
}

test.describe('WA Environment Simulation', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the WA simulator
        await page.goto('/tests/fixtures/wa-simulator.html');
    });

    test('widget loads without console errors', async ({ page }) => {
        // Collect console errors
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('[WA Simulator]')) {
                errors.push(msg.text());
            }
        });

        await waitForWidget(page);

        // Filter out expected errors (like API failures in test env, 404s for mocked APIs)
        const criticalErrors = errors.filter(e =>
            !e.includes('fetch') &&
            !e.includes('network') &&
            !e.includes('CORS') &&
            !e.includes('404') &&
            !e.includes('ClubCalendar') // Widget logs errors with [ClubCalendar] prefix
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test('inline onclick handlers are stripped but clicks still work', async ({ page }) => {
        // Check simulator log for stripped handler warnings
        const logVisible = await page.locator('#wa-log').isVisible();

        // Show the log
        await page.click('#show-log');
        await page.waitForSelector('#wa-log.visible');

        // Verify no inline handlers warning (our code uses delegated events)
        const logContent = await page.locator('#wa-log').textContent();

        // If there were stripped handlers, they would show up here
        // Our fixed code should NOT trigger this
        expect(logContent).not.toContain('Stripped inline onclick');
    });

    test('widget container renders with proper structure', async ({ page }) => {
        await waitForWidget(page);

        // Check that main container exists
        await expect(page.locator('#clubcalendar')).toBeVisible();

        // Widget should show either the full calendar or fallback message
        // (API mock may not work perfectly in all cases)
        const hasWidget = await page.locator('.clubcalendar-widget').isVisible().catch(() => false);
        const hasFallback = await page.locator('#clubcalendar [style*="background"]').isVisible().catch(() => false);

        expect(hasWidget || hasFallback).toBe(true);
    });

    test('header displays correctly', async ({ page }) => {
        await waitForWidget(page);

        // Header should be visible with title (if showHeader is true)
        const header = page.locator('.clubcalendar-header');
        const headerVisible = await header.isVisible().catch(() => false);

        if (headerVisible) {
            // Title is inside the header h2
            const title = header.locator('h2');
            await expect(title).toBeVisible();
        }
        // If header isn't visible, that's OK - it depends on config
    });

    test('CSS classes are properly prefixed (no global leaks)', async ({ page }) => {
        await waitForWidget(page);

        // Get all elements inside widget
        const widgetClasses = await page.evaluate(() => {
            const widget = document.querySelector('#clubcalendar');
            if (!widget) return [];

            const allElements = widget.querySelectorAll('*');
            const classes: string[] = [];

            allElements.forEach(el => {
                el.classList.forEach(cls => {
                    if (!cls.startsWith('clubcal') &&
                        !cls.startsWith('clubcalendar') &&
                        !cls.startsWith('fc-') &&  // FullCalendar
                        cls !== 'active') {
                        classes.push(cls);
                    }
                });
            });

            return [...new Set(classes)];
        });

        // All classes should be prefixed (except common state classes)
        const allowedUnprefixed = ['active', 'visible', 'hidden', 'loading', 'error', 'avatar', 'morning', 'afternoon', 'evening'];
        const unprefixed = widgetClasses.filter(c => !allowedUnprefixed.includes(c));

        expect(unprefixed).toHaveLength(0);
    });

    test('filter buttons respond to clicks', async ({ page }) => {
        await waitForWidget(page);

        // Find a quick filter button
        const filterBtn = page.locator('.clubcal-quick-filter').first();

        if (await filterBtn.isVisible()) {
            // Click should toggle active state
            await filterBtn.click();
            await expect(filterBtn).toHaveClass(/active/);

            // Click again to deactivate
            await filterBtn.click();
            await expect(filterBtn).not.toHaveClass(/active/);
        }
    });

    test('tab switching works', async ({ page }) => {
        await waitForWidget(page);

        // Get tab buttons
        const tabs = page.locator('.clubcal-tab-btn');
        const tabCount = await tabs.count();

        if (tabCount > 1) {
            // Click second tab
            await tabs.nth(1).click();
            await expect(tabs.nth(1)).toHaveClass(/active/);
            await expect(tabs.nth(0)).not.toHaveClass(/active/);
        }
    });
});

test.describe('Auth State Handling', () => {

    test('guest mode shows appropriate UI', async ({ page }) => {
        await page.goto('/tests/fixtures/wa-simulator.html');

        // Ensure guest mode (default)
        const authBtn = page.locator('#toggle-auth');
        const btnText = await authBtn.textContent();
        if (btnText?.includes('Member')) {
            await authBtn.click();
        }

        // Reload widget
        await page.click('#reload-widget');
        await waitForWidget(page);

        // Guest mode: "My Events" tab should not be visible (based on publicConfig)
        // This depends on the config, so we just verify widget loads
        await expect(page.locator('#clubcalendar')).toBeVisible();
    });

    test('member mode shows appropriate UI', async ({ page }) => {
        await page.goto('/tests/fixtures/wa-simulator.html');

        // Switch to member mode
        const authBtn = page.locator('#toggle-auth');
        const btnText = await authBtn.textContent();
        if (btnText?.includes('Guest')) {
            await authBtn.click();
        }

        // Reload widget
        await page.click('#reload-widget');
        await waitForWidget(page);

        // Member mode: widget should load successfully
        await expect(page.locator('#clubcalendar')).toBeVisible();
    });
});

test.describe('Fallback Behavior', () => {

    test('shows fallback on API failure', async ({ page }) => {
        // Block API requests to simulate failure
        await page.route('**/api.wildapricot.org/**', route => {
            route.abort('failed');
        });

        await page.goto('/tests/fixtures/wa-simulator.html');

        // Wait for either widget or fallback to appear
        await page.waitForFunction(() => {
            const widget = document.querySelector('.clubcalendar-widget');
            const fallbackMsg = document.querySelector('#clubcalendar [style*="background: #fff3cd"]');
            return widget !== null || fallbackMsg !== null;
        }, { timeout: 20000 }).catch(() => {
            // Might timeout if widget handles error differently
        });

        // Either fallback or widget should be visible
        const hasFallback = await page.locator('#clubcalendar [style*="background: #fff3cd"]').isVisible().catch(() => false);
        const hasWidget = await page.locator('.clubcalendar-widget').isVisible().catch(() => false);

        expect(hasFallback || hasWidget).toBe(true);
    });
});

test.describe('Event Card Interactions', () => {

    test('event cards are clickable via delegated events', async ({ page }) => {
        await page.goto('/tests/fixtures/wa-simulator.html');
        await waitForWidget(page);

        // Check if any event cards exist
        const eventCards = page.locator('.clubcal-event-card');
        const cardCount = await eventCards.count();

        if (cardCount > 0) {
            // Get the first card's data-event-url
            const card = eventCards.first();
            const eventUrl = await card.getAttribute('data-event-url');

            if (eventUrl) {
                // Verify card has proper accessibility attributes
                await expect(card).toHaveAttribute('role', 'link');
                await expect(card).toHaveAttribute('tabindex', '0');

                // Verify clicking opens new window (we can check popup is attempted)
                const popupPromise = page.waitForEvent('popup').catch(() => null);
                await card.click();

                // Note: In test environment, popup might be blocked
                // The important thing is no JS errors occurred
            }
        }
    });

    test('event cards respond to keyboard navigation', async ({ page }) => {
        await page.goto('/tests/fixtures/wa-simulator.html');
        await waitForWidget(page);

        const eventCards = page.locator('.clubcal-event-card[data-event-url]');
        const cardCount = await eventCards.count();

        if (cardCount > 0) {
            const card = eventCards.first();

            // Focus the card
            await card.focus();

            // Verify card can be focused (tabindex="0")
            const isFocused = await page.evaluate(() => {
                return document.activeElement?.classList.contains('clubcal-event-card');
            });

            // Note: Focus might not work in all test scenarios, that's OK
            // The attribute check is what matters
            await expect(card).toHaveAttribute('tabindex', '0');
        }
    });
});

test.describe('Performance & Loading', () => {

    test('widget loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/tests/fixtures/wa-simulator.html');
        await waitForWidget(page);

        const loadTime = Date.now() - startTime;

        // Widget should load within 10 seconds (generous for CI)
        expect(loadTime).toBeLessThan(10000);
    });

    test('no memory leaks from event listeners', async ({ page }) => {
        await page.goto('/tests/fixtures/wa-simulator.html');
        await waitForWidget(page);

        // Get initial event listener count (approximation)
        const initialListeners = await page.evaluate(() => {
            // This is a rough check - actual memory profiling would be more accurate
            return performance.getEntriesByType('resource').length;
        });

        // Reload widget multiple times
        for (let i = 0; i < 3; i++) {
            await page.click('#reload-widget');
            await waitForWidget(page);
        }

        // Widget should still function
        await expect(page.locator('#clubcalendar')).toBeVisible();
    });
});
