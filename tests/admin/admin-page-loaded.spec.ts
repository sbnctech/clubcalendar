import { test, expect, Page, Frame } from '@playwright/test';

/**
 * Waits for the admin iframe to fully load and hydrate.
 *
 * @param page - Playwright Page instance
 * @returns Promise<Frame> - The ready iframe Frame instance
 */
async function waitForAdminFrame(page: Page): Promise<Frame> {
  // Navigate to admin test wrapper page (contains iframe)
  await page.goto('/admin/test-wrapper', { waitUntil: 'domcontentloaded' });

  // Wait for iframe element to be visible
  const iframeLocator = page.locator('iframe#testFrame');
  await iframeLocator.waitFor({ state: 'visible', timeout: 10000 });

  // Get the iframe element handle and retrieve the Frame
  const iframeElement = await iframeLocator.elementHandle();
  if (!iframeElement) {
    throw new Error('Could not get iframe element handle');
  }

  const frame = await iframeElement.contentFrame();
  if (!frame) {
    throw new Error('Could not get content frame from iframe');
  }

  // Wait for iframe to finish loading
  await frame.waitForLoadState('domcontentloaded');

  // Wait for the admin UI readiness marker
  await frame.waitForSelector('[data-test-id="admin-root"]', {
    state: 'visible',
    timeout: 15000
  });

  return frame;
}

/**
 * Enters a valid events JSON URL to enable other tabs.
 * The tabs are disabled until a valid URL is entered.
 *
 * @param frame - The Frame containing the admin UI
 */
async function completeSetup(frame: Frame): Promise<void> {
  // Enter a sample events JSON URL to enable other tabs
  const eventsUrlInput = frame.locator('#eventsJsonUrl');
  await eventsUrlInput.fill('https://example.com/events.json');

  // Trigger the input event to enable tabs
  await eventsUrlInput.dispatchEvent('input');

  // Wait for tabs to become enabled
  await frame.waitForSelector('[data-tab="basic"]:not(.disabled)', { timeout: 5000 });
}

test.describe('Admin Page', () => {
  test('Admin page loaded', async ({ page }) => {
    // Wait for admin frame to be fully ready
    const frame = await waitForAdminFrame(page);

    // Assert the iframe's body is visible
    const body = frame.locator('body');
    await expect(body).toBeVisible();

    // Assert admin header element exists
    const header = frame.locator('[data-test-id="admin-header"]');
    await expect(header).toBeVisible();
  });

  test('Admin page has required form elements', async ({ page }) => {
    const frame = await waitForAdminFrame(page);

    // Verify events URL input exists on setup tab
    const eventsUrlInput = frame.locator('#eventsJsonUrl');
    await expect(eventsUrlInput).toBeVisible();

    // Complete setup to enable other tabs
    await completeSetup(frame);

    // Switch to basic tab to verify widgetTitle
    const basicTab = frame.locator('[data-tab="basic"]');
    await basicTab.click();
    await frame.waitForSelector('#tab-basic.active', { timeout: 5000 });

    const widgetTitleInput = frame.locator('#widgetTitle');
    await expect(widgetTitleInput).toBeVisible();

    const saveButton = frame.locator('button:has-text("Save Configuration")');
    await expect(saveButton).toBeVisible();
  });

  test('Tab navigation works', async ({ page }) => {
    const frame = await waitForAdminFrame(page);

    // Complete setup to enable other tabs
    await completeSetup(frame);

    // Click each tab and verify content appears
    const tabs = ['setup', 'basic', 'advanced', 'css'];

    for (const tab of tabs) {
      const tabButton = frame.locator(`[data-tab="${tab}"]`);
      await tabButton.click();

      const tabContent = frame.locator(`#tab-${tab}`);
      await expect(tabContent).toHaveClass(/active/);
    }
  });

  test('Saved configurations UI elements exist', async ({ page }) => {
    const frame = await waitForAdminFrame(page);

    // Verify saved configurations bar elements
    const configSelect = frame.locator('#savedConfigSelect');
    await expect(configSelect).toBeVisible();

    const saveAsButton = frame.locator('button:has-text("Save As...")');
    await expect(saveAsButton).toBeVisible();

    // Delete button should be hidden initially (no config selected)
    const deleteButton = frame.locator('#deleteConfigBtn');
    await expect(deleteButton).toBeHidden();
  });
});

export { waitForAdminFrame };
