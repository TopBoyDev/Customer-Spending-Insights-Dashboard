/**
 * Lighthouse CI: audits the production build served by `npm start` using
 * Lighthouse's default mobile profile (simulated slow 4G, 4x CPU slowdown).
 * Budgets sit just below currently measured medians, so they catch
 * regressions rather than fail on run-to-run noise.
 * Reports are written to .lighthouseci/ (nothing is uploaded publicly).
 */
const url = (path) => `http://localhost:3000${path}`;

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'listening on',
      url: [url('/'), url('/?view=transactions'), url('/?view=trends')],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      // Judge the median run, not the best one, so budgets reflect typical performance.
      aggregationMethod: 'median-run',
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 650 }],
        // Transfer-size budgets (bytes, compressed).
        'resource-summary:script:size': ['error', { maxNumericValue: 320000 }],
        'resource-summary:font:size': ['error', { maxNumericValue: 80000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 450000 }],
        'resource-summary:third-party:count': ['error', { maxNumericValue: 0 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
