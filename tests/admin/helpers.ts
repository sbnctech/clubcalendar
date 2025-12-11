import { Page, Frame } from '@playwright/test';

/**
 * Waits for the admin iframe to fully load and hydrate.
 *
 * This helper function handles the complexity of waiting for:
 * 1. The page to navigate
 * 2. The iframe element to become visible
 * 3. The iframe content to load
 * 4. The admin UI to fully hydrate (readiness marker)
 *
 * @param page - Playwright Page instance
 * @param options - Optional configuration
 * @returns Promise<Frame> - The ready iframe Frame instance
 */
export async function waitForAdminFrame(
  page: Page,
  options: {
    timeout?: number;
    baseUrl?: string;
  } = {}
): Promise<Frame> {
  const { timeout = 15000, baseUrl = '/admin/test-wrapper' } = options;

  // Navigate to admin test wrapper page (contains iframe)
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  // Wait for iframe element to be visible
  const iframeLocator = page.locator('iframe#testFrame');
  await iframeLocator.waitFor({ state: 'visible', timeout });

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
    timeout
  });

  return frame;
}

/**
 * Waits for the admin page to load directly (without iframe wrapper).
 * Use this when testing the admin page standalone.
 *
 * @param page - Playwright Page instance
 * @param options - Optional configuration
 */
export async function waitForAdminPage(
  page: Page,
  options: {
    timeout?: number;
    baseUrl?: string;
  } = {}
): Promise<void> {
  const { timeout = 15000, baseUrl = '/admin/index.html' } = options;

  // Navigate to admin page
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  // Wait for the admin UI readiness marker
  await page.waitForSelector('[data-test-id="admin-root"]', {
    state: 'visible',
    timeout
  });
}

/**
 * Switches to a specific tab in the admin UI.
 *
 * @param frame - The Frame or Page containing the admin UI
 * @param tabName - The tab name ('setup', 'basic', 'advanced', 'css')
 */
export async function switchToTab(
  frame: Frame | Page,
  tabName: 'setup' | 'basic' | 'advanced' | 'css'
): Promise<void> {
  const tabButton = frame.locator(`[data-tab="${tabName}"]`);
  await tabButton.click();

  // Wait for tab content to become active
  const tabContent = frame.locator(`#tab-${tabName}`);
  await tabContent.waitFor({ state: 'visible' });
}

/**
 * Sets a form field value in the admin UI.
 *
 * @param frame - The Frame or Page containing the admin UI
 * @param fieldId - The ID of the form field
 * @param value - The value to set
 */
export async function setFieldValue(
  frame: Frame | Page,
  fieldId: string,
  value: string | boolean
): Promise<void> {
  const field = frame.locator(`#${fieldId}`);

  if (typeof value === 'boolean') {
    // Handle checkbox
    const isChecked = await field.isChecked();
    if (isChecked !== value) {
      await field.click();
    }
  } else {
    // Handle text input or select
    const tagName = await field.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === 'select') {
      await field.selectOption(value);
    } else {
      await field.fill(value);
    }
  }
}

/**
 * Gets a form field value from the admin UI.
 *
 * @param frame - The Frame or Page containing the admin UI
 * @param fieldId - The ID of the form field
 * @returns The field value
 */
export async function getFieldValue(
  frame: Frame | Page,
  fieldId: string
): Promise<string | boolean> {
  const field = frame.locator(`#${fieldId}`);
  const inputType = await field.getAttribute('type');

  if (inputType === 'checkbox') {
    return await field.isChecked();
  }

  return await field.inputValue();
}
