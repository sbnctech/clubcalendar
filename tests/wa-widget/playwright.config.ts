import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright config for testing the live WA widget
 */
export default defineConfig({
  testDir: './',
  fullyParallel: false, // Run sequentially to avoid overwhelming the site
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [['list']],
  outputDir: '../../test-results/wa-widget-results',
  timeout: 60000,
  use: {
    baseURL: 'https://sbnc-website-redesign-playground.wildapricot.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
