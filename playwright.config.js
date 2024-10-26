// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const config = require('./utils/config');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  timeout: 1800000,
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: config.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: config.IS_HEADLESS,
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: undefined
      }
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: null,
        deviceScaleFactor: undefined,
        headless: config.IS_HEADLESS
      }
    }
  ]
});
