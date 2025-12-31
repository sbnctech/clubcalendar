/**
 * Playwright configuration for certification/buddy tests
 *
 * These tests run against live external sites, not localhost.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: false,  // Run sequentially to avoid rate limiting
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,  // Single worker for live site tests
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report-certification' }],
  ],
  timeout: 60000,  // 60 second timeout for live site tests
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile testing is handled within tests using setViewportSize
    // to avoid duplicate test runs
  ],
  // No webServer - tests run against live external sites
});
