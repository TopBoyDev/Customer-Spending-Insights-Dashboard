import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4174);

/**
 * Visual regression suite. Screenshots differ subtly between operating
 * systems (fonts, anti-aliasing), so baselines are generated and compared
 * only inside the pinned Playwright Docker image; see `npm run
 * test:visual:docker` and the CI "visual" job. Baselines carry no platform
 * suffix because they always come from that one environment.
 */
export default defineConfig({
  testDir: 'tests/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    timezoneId: 'Africa/Johannesburg',
    locale: 'en-ZA',
    // The app disables chart and UI animations under reduced motion.
    contextOptions: { reducedMotion: 'reduce' },
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
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { PORT: String(PORT) },
  },
});
