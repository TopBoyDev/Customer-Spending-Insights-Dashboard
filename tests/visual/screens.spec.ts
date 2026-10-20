import { expect, test, type Page } from '@playwright/test';

const VIEWS = ['overview', 'categories', 'trends', 'transactions', 'budgets'] as const;
const MODES = ['light', 'dark'] as const;

/** Waits until data, lazy chunks, charts and the web font have all settled. */
async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  await expect(page.locator('.MuiSkeleton-root')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

for (const mode of MODES) {
  for (const view of VIEWS) {
    test(`${view} (${mode})`, async ({ page }) => {
      await page.addInitScript((colorMode) => {
        localStorage.setItem('si-color-mode', colorMode);
      }, mode);
      await page.goto(`/?view=${view}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`${view}-${mode}.png`);
    });
  }
}

test('transactions filtered and sorted by amount (light)', async ({ page }) => {
  await page.goto('/?view=transactions&period=90d&category=Groceries&sortBy=amount_desc');
  await settle(page);
  await expect(page).toHaveScreenshot('transactions-filtered-light.png');
});

test('error state (light)', async ({ page }) => {
  await page.route('**/api/customers/*/spending/summary**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Service unavailable' } }),
    }),
  );
  await page.goto('/');
  await expect(page.getByText('Your spending summary could not be loaded')).toBeVisible({
    timeout: 15_000,
  });
  await settle(page);
  await expect(page).toHaveScreenshot('overview-error-light.png');
});
