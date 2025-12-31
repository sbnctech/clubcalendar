/**
 * ClubCalendar Builder E2E Tests
 *
 * Tests the full builder workflow in a browser.
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';

const BUILDER_URL = 'https://mail.sbnewcomers.org/calendar/builder/';
const LOCAL_BUILDER_URL = 'file://' + path.resolve(__dirname, '../../deploy/builder/index.html');

// Use local file for testing to avoid network issues
const TEST_URL = LOCAL_BUILDER_URL;

test.describe('Builder UI Navigation', () => {
  test('should load builder page', async ({ page }) => {
    await page.goto(TEST_URL);
    await expect(page.locator('h1')).toContainText('ClubCalendar Builder');
  });

  test('should show 5 steps', async ({ page }) => {
    await page.goto(TEST_URL);
    const steps = page.locator('.step');
    await expect(steps).toHaveCount(5);
  });

  test('should start on step 1 (Organization)', async ({ page }) => {
    await page.goto(TEST_URL);
    await expect(page.locator('.step.active')).toContainText('Organization');
    await expect(page.locator('.section.active h2')).toContainText('Organization Details');
  });

  test('should navigate to step 2 when clicking Next', async ({ page }) => {
    await page.goto(TEST_URL);

    // Fill required fields
    await page.fill('#orgName', 'Test Club');
    await page.fill('#orgShortName', 'TC');
    await page.fill('#waAccountId', '123456');

    // Click next
    await page.click('button:has-text("Next: Appearance")');

    await expect(page.locator('.step.active')).toContainText('Appearance');
  });

  test('should validate required fields before advancing', async ({ page }) => {
    await page.goto(TEST_URL);

    // Try to advance without filling fields
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('required');
      await dialog.accept();
    });

    await page.click('button:has-text("Next: Appearance")');

    // Should still be on step 1
    await expect(page.locator('.step.active')).toContainText('Organization');
  });

  test('should allow going back to previous step', async ({ page }) => {
    await page.goto(TEST_URL);

    // Fill and advance
    await page.fill('#orgName', 'Test Club');
    await page.fill('#orgShortName', 'TC');
    await page.fill('#waAccountId', '123456');
    await page.click('button:has-text("Next: Appearance")');

    // Go back
    await page.click('button:has-text("Back")');

    await expect(page.locator('.step.active')).toContainText('Organization');
  });
});

test.describe('Builder Form Fields', () => {
  test('should sync color picker with text input', async ({ page }) => {
    await page.goto(TEST_URL);

    // Fill required and advance to Appearance
    await page.fill('#orgName', 'Test Club');
    await page.fill('#orgShortName', 'TC');
    await page.fill('#waAccountId', '123456');
    await page.click('button:has-text("Next: Appearance")');

    // Change color via text input
    await page.fill('#primaryColorText', '#ff0000');
    await page.locator('#primaryColorText').blur();

    // Color picker should update (checking the value attribute)
    const colorValue = await page.locator('#primaryColor').inputValue();
    expect(colorValue.toLowerCase()).toBe('#ff0000');
  });

  test('should add auto-tag rules', async ({ page }) => {
    await page.goto(TEST_URL);

    // Navigate to Committee Rules step
    await page.fill('#orgName', 'Test Club');
    await page.fill('#orgShortName', 'TC');
    await page.fill('#waAccountId', '123456');
    await page.click('button:has-text("Next: Appearance")');
    await page.click('button:has-text("Next: Filters")');
    await page.click('button:has-text("Next: Committee Rules")');

    // Should have one empty rule by default
    const rules = page.locator('.rule-item');
    await expect(rules).toHaveCount(1);

    // Add another rule
    await page.click('button:has-text("Add Rule")');
    await expect(rules).toHaveCount(2);
  });

  test('should remove auto-tag rules', async ({ page }) => {
    await page.goto(TEST_URL);

    // Navigate to Committee Rules step
    await page.fill('#orgName', 'Test Club');
    await page.fill('#orgShortName', 'TC');
    await page.fill('#waAccountId', '123456');
    await page.click('button:has-text("Next: Appearance")');
    await page.click('button:has-text("Next: Filters")');
    await page.click('button:has-text("Next: Committee Rules")');

    // Add a rule then remove it
    await page.click('button:has-text("Add Rule")');
    const rules = page.locator('.rule-item');
    await expect(rules).toHaveCount(2);

    // Remove the first rule
    await page.locator('.rule-item').first().locator('button').click();
    await expect(rules).toHaveCount(1);
  });
});

test.describe('Builder Package Generation', () => {
  test('should show summary on final step', async ({ page }) => {
    await page.goto(TEST_URL);

    // Fill out form
    await page.fill('#orgName', 'Example Newcomers Club');
    await page.fill('#orgShortName', 'ENC');
    await page.fill('#waAccountId', '999999');
    await page.fill('#headerTitle', 'ENC Events');

    // Navigate through all steps
    await page.click('button:has-text("Next: Appearance")');
    await page.click('button:has-text("Next: Filters")');
    await page.click('button:has-text("Next: Committee Rules")');
    await page.click('button:has-text("Next: Generate")');

    // Check summary shows correct info
    await expect(page.locator('.summary-grid')).toContainText('Example Newcomers Club');
    await expect(page.locator('.summary-grid')).toContainText('ENC');
    await expect(page.locator('.summary-grid')).toContainText('999999');
  });

  test('should update package filename preview', async ({ page }) => {
    await page.goto(TEST_URL);

    await page.fill('#orgName', 'Test Club');
    await page.fill('#orgShortName', 'MYORG');
    await page.fill('#waAccountId', '123456');

    // Navigate to generate step
    await page.click('button:has-text("Next: Appearance")');
    await page.click('button:has-text("Next: Filters")');
    await page.click('button:has-text("Next: Committee Rules")');
    await page.click('button:has-text("Next: Generate")');

    // Check filename shows org name
    await expect(page.locator('.pkg-name').first()).toContainText('MYORG');
  });

  test('should trigger download on generate', async ({ page }) => {
    await page.goto(TEST_URL);

    // Fill out complete form
    await page.fill('#orgName', 'Download Test Club');
    await page.fill('#orgShortName', 'DTC');
    await page.fill('#waAccountId', '123456');

    await page.click('button:has-text("Next: Appearance")');
    await page.click('button:has-text("Next: Filters")');
    await page.click('button:has-text("Next: Committee Rules")');
    await page.click('button:has-text("Next: Generate")');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click generate
    await page.click('button:has-text("Generate & Download")');

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('ClubCalendar_DTC_Package.zip');

    // Save and verify ZIP contents
    const downloadPath = path.join(__dirname, 'downloads', download.suggestedFilename());
    await download.saveAs(downloadPath);

    const zip = new AdmZip(downloadPath);
    const entries = zip.getEntries().map(e => e.entryName);

    expect(entries).toContain('ClubCalendar_DTC_EVENTS_PAGE.html');
    expect(entries).toContain('INSTALLATION.md');
    expect(entries).toContain('config.json');
    expect(entries).toContain('OPERATOR_CHECKLIST.md');
    expect(entries).toContain('README.md');
    expect(entries.some(e => e.includes('certification-tests/'))).toBe(true);

    // Clean up
    fs.unlinkSync(downloadPath);
  });
});

test.describe('Builder Configuration Presets', () => {
  test('should load SBNC preset', async ({ page }) => {
    await page.goto(TEST_URL);

    // Click preset dropdown
    await page.click('button:has-text("Load Preset")');
    await page.click('.preset-item:has-text("SBNC")');

    await expect(page.locator('#orgName')).toHaveValue('Santa Barbara Newcomers Club');
    await expect(page.locator('#waAccountId')).toHaveValue('176353');
    await expect(page.locator('#headerTitle')).toHaveValue('SBNC Events');
  });

  test('should load Example preset', async ({ page }) => {
    await page.goto(TEST_URL);

    await page.click('button:has-text("Load Preset")');
    await page.click('.preset-item:has-text("Example")');

    await expect(page.locator('#orgName')).toHaveValue('Example Newcomers Club');
    await expect(page.locator('#waAccountId')).toHaveValue('123456');
  });

  test('should save configuration', async ({ page }) => {
    await page.goto(TEST_URL);

    await page.fill('#orgName', 'Save Test');
    await page.fill('#orgShortName', 'ST');
    await page.fill('#waAccountId', '111111');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Save Config")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('clubcalendar-config-st.json');
  });

  test('should load configuration file', async ({ page }) => {
    await page.goto(TEST_URL);

    // Create a test config
    const testConfig = {
      organizationName: 'Loaded Club',
      organizationShortName: 'LC',
      waAccountId: '222222',
      headerTitle: 'LC Events'
    };

    // Set up file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("Load Config")');
    const fileChooser = await fileChooserPromise;

    // Create a buffer with the config JSON
    const configJson = JSON.stringify(testConfig);
    await fileChooser.setFiles({
      name: 'test-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(configJson)
    });

    // Verify fields were populated
    await expect(page.locator('#orgName')).toHaveValue('Loaded Club');
    await expect(page.locator('#orgShortName')).toHaveValue('LC');
    await expect(page.locator('#waAccountId')).toHaveValue('222222');
    await expect(page.locator('#headerTitle')).toHaveValue('LC Events');
  });
});
