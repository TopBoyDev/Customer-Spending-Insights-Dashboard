import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Matches Rand amounts regardless of the non-breaking spaces Intl uses. */
const rand = (text: string) => new RegExp(text.replace(/ /g, '\\s'));

const summary = (page: Page) => page.getByRole('region', { name: 'Spending summary' });
const transactions = (page: Page) => page.getByRole('region', { name: 'Transactions' });

async function amountsOnPage(page: Page): Promise<number[]> {
  const texts = await transactions(page).getByText(/^−R/).allInnerTexts();
  return texts.map((text) => Number(text.replace(/[^\d,]/g, '').replace(',', '.')));
}

test('loads the dashboard with headline metrics and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Spending Insights' })).toBeVisible();
  await expect(summary(page).getByText(rand('R 19 004,60'))).toBeVisible();
  await expect(summary(page).getByText('3,8% more than the previous 30 days')).toBeVisible();
  await expect(page.getByText('Demo data to 19 Oct 2026')).toBeVisible();
  await expect(transactions(page).getByText('Showing 1–10 of 45 transactions')).toBeVisible();
  expect(errors).toEqual([]);
});

test('changing the period updates figures and the URL', async ({ page }) => {
  await page.goto('/');
  await expect(summary(page).getByText(rand('R 19 004,60'))).toBeVisible();

  await page
    .getByRole('group', { name: 'Spending period' })
    .getByRole('button', { name: '7 days' })
    .click();

  await expect(page).toHaveURL(/\?period=7d$/);
  await expect(summary(page).getByText(rand('R 3 940,31'))).toBeVisible();
  await expect(summary(page).getByText('in the last 7 days')).toBeVisible();
  await expect(transactions(page).getByText('Showing 1–8 of 8 transactions')).toBeVisible();
});

test('filters by category, sorts by amount, paginates and survives a refresh', async ({ page }) => {
  await page.goto('/?period=90d');

  await page
    .getByRole('region', { name: 'Spending by category' })
    .getByRole('button', { name: /^Groceries:/ })
    .click();
  await expect(page).toHaveURL(/category=Groceries/);
  await expect(transactions(page).getByText('Category: Groceries')).toBeVisible();

  await transactions(page).getByRole('combobox', { name: 'Sort by' }).click();
  await page.getByRole('option', { name: 'Highest amount' }).click();
  await expect(page).toHaveURL(/sortBy=amount_desc/);

  const firstPage = await amountsOnPage(page);
  expect(firstPage).toHaveLength(10);
  expect(firstPage).toEqual([...firstPage].sort((a, b) => b - a));

  await transactions(page).getByRole('button', { name: 'Go to page 2' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(transactions(page).getByText(/^Showing 11–/)).toBeVisible();
  const secondPage = await amountsOnPage(page);
  expect(Math.max(...secondPage)).toBeLessThanOrEqual(Math.min(...firstPage));

  await page.reload();
  await expect(transactions(page).getByText(/^Showing 11–/)).toBeVisible();
  await expect(transactions(page).getByRole('combobox', { name: 'Sort by' })).toHaveText(
    'Highest amount',
  );
  await expect(transactions(page).getByText('Category: Groceries')).toBeVisible();
  expect(await amountsOnPage(page)).toEqual(secondPage);
});

test('falls back to defaults for invalid URL parameters', async ({ page }) => {
  await page.goto('/?period=forever&sortBy=random&page=-4');
  await expect(summary(page).getByText('in the last 30 days')).toBeVisible();
  await expect(transactions(page).getByText('Showing 1–10 of 45 transactions')).toBeVisible();
});

test('has no horizontal scrolling and passes automated accessibility checks', async ({ page }) => {
  await page.goto('/');
  await expect(transactions(page).getByText(/^Showing/)).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
});

test('a failing endpoint shows a helpful error without breaking other sections', async ({
  page,
}) => {
  let fail = true;
  await page.route('**/api/customers/*/spending/summary**', (route) =>
    fail
      ? route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { code: 'INTERNAL_ERROR', message: 'Service temporarily unavailable' },
          }),
        })
      : route.fallback(),
  );
  await page.goto('/');

  await expect(summary(page).getByText('Your spending summary could not be loaded')).toBeVisible({
    timeout: 15_000,
  });
  await expect(transactions(page).getByText('Showing 1–10 of 45 transactions')).toBeVisible();

  fail = false;
  await summary(page).getByRole('button', { name: 'Try again' }).click();
  await expect(summary(page).getByText(rand('R 19 004,60'))).toBeVisible();
});

test('an empty result offers to clear filters', async ({ page }) => {
  await page.route('**/api/customers/*/transactions**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        transactions: [],
        pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
      }),
    }),
  );
  await page.goto('/?period=7d&category=Entertainment');
  await expect(
    transactions(page).getByText('No Entertainment transactions in the last 7 days'),
  ).toBeVisible();

  await transactions(page).getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL(/\?period=7d$/);
});

test('core controls work with the keyboard alone', async ({ page }) => {
  await page.goto('/');
  await expect(summary(page).getByText(rand('R 19 004,60'))).toBeVisible();

  // Skip link is the first focusable element.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

  // Next stop is the period selector; activate "90 days" without a pointer.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '7 days' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '90 days' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/period=90d/);
  await expect(summary(page).getByText('in the last 90 days')).toBeVisible();

  // Selecting a category from the breakdown moves focus to the transactions heading.
  const dining = page
    .getByRole('region', { name: 'Spending by category' })
    .getByRole('button', { name: /^Dining:/ });
  await dining.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 2, name: 'Transactions' })).toBeFocused();
  await expect(transactions(page).getByText('Category: Dining')).toBeVisible();
});
