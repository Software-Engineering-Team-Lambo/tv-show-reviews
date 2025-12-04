import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for E2E tests.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      // CI: use production server (already built); Locally: use dev server
      command: process.env.CI ? 'npm run start:prod' : 'npm run dev',
      cwd: '../api',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        ...process.env,
        // Locally: use .env.test; CI: env vars are already set
        ...(process.env.CI ? {} : { DOTENV_CONFIG_PATH: '.env.test' }),
      },
    },
    {
      // CI: use preview server (serves built files); Locally: use dev server
      command: process.env.CI ? 'npm run preview' : 'npm run dev',
      url: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],

  /* Timeout for each test */
  timeout: 30000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
  },
})
