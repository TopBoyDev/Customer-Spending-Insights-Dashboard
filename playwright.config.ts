import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4173);
const isCI = Boolean(process.env.CI);

/**
 * End-to-end tests run against the production build served by the Express
 * server, i.e. exactly what the Docker image runs. Set E2E_SKIP_BUILD=1 when
 * `npm run build` has already been run (as CI does).
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    timezoneId: 'Africa/Johannesburg',
    locale: 'en-ZA',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: process.env.E2E_SKIP_BUILD ? 'npm run start' : 'npm run build && npm run start',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    env: { NODE_ENV: 'production', PORT: String(PORT) },
  },
});
