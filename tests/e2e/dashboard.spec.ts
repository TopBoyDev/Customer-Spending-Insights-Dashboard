import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Matches Rand amounts regardless of the non-breaking spaces Intl uses. */
const rand = (text: string) => new RegExp(text.replace(/ /g, '\\s'));

const summary = (page: Page) => page.getByRole('region', { name: 'Spending summary' });
const transactions = (page: Page) => page.getByRole('region', { name: 'Transactions' });
const heading = (page: Page, name: string) => page.getByRole('heading', { level: 1, name });

/** Desktop shows a tab list; phones show a bottom bar of links. Both live in the same nav. */
async function openTab(page: Page, name: string) {
  const nav = page.getByRole('navigation', { name: 'Dashboard sections' });
  await nav.getByRole('tab', { name }).or(nav.getByRole('link', { name })).click();
  await expect(heading(page, name)).toBeVisible();
}

async function amountsOnPage(page: Page): Promise<number[]> {
  // While the next page loads, the previous page stays visible; wait until it is replaced.
  await expect(
    transactions(page).getByRole('progressbar', { name: 'Loading more transactions' }),
  ).toHaveCount(0);
  await page.waitForLoadState('networkidle');
  const texts = await transactions(page).getByText(/^−R/).allInnerTexts();
  return texts.map((text) => Number(text.replace(/[^\d,]/g, '').replace(',', '.')));
}

const VIEWS = ['Overview', 'Categories', 'Trends', 'Transactions', 'Budgets'];

test('loads the overview with headline metrics and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(heading(page, 'Overview')).toBeVisible();
  await expect(page).toHaveTitle('Overview · Spending Insights');
  await expect(summary(page).getByText(rand('R 19 004,60'))).toBeVisible();
  await expect(summary(page).getByText('3,8% more than the previous 30 days')).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Monthly budgets' }).getByText('Over budget'),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Recent transactions' }).getByText(/^−R/),
  ).toHaveCount(5);
  expect(errors).toEqual([]);
});

test('every tab is reachable from the navigation and keeps one focus per screen', async ({
  page,
}) => {
  await page.goto('/');
  for (const name of VIEWS.slice(1)) {
    await openTab(page, name);
    await expect(page).toHaveURL(new RegExp(`view=${name.toLowerCase()}`));
    await expect(page).toHaveTitle(`${name} · Spending Insights`);
  }
  // The browser back button returns to the previous tab.
  await page.goBack();
  await expect(heading(page, 'Transactions')).toBeVisible();
});

test('overview cards link to their detail tabs', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View categories' }).click();
  await expect(heading(page, 'Categories')).toBeVisible();
  await expect(
    page.getByRole('img', { name: /Donut chart of spending by category/ }),
  ).toBeVisible();
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
  await expect(summary(page).getByText(/last 7 days/)).toBeVisible();

  // The period is shared across tabs.
  await openTab(page, 'Transactions');
  await expect(transactions(page).getByText('Showing 1–8 of 8 transactions')).toBeVisible();
});

test('category → transactions: filter, sort, paginate and survive a refresh', async ({ page }) => {
  await page.goto('/?view=categories&period=90d');

  await page
    .getByRole('region', { name: 'Breakdown' })
    .getByRole('button', { name: /^Groceries:/ })
    .click();
  await expect(heading(page, 'Transactions')).toBeVisible();
  await expect(page).toHaveURL(/view=transactions.*category=Groceries/);
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
  await expect(heading(page, 'Transactions')).toBeVisible();
  await expect(transactions(page).getByText(/^Showing 11–/)).toBeVisible();
  await expect(transactions(page).getByRole('combobox', { name: 'Sort by' })).toHaveText(
    'Highest amount',
  );
  expect(await amountsOnPage(page)).toEqual(secondPage);
});

test('falls back to defaults for invalid URL parameters', async ({ page }) => {
  await page.goto('/?view=admin&period=forever&sortBy=random&page=-4');
  await expect(heading(page, 'Overview')).toBeVisible();
  await expect(summary(page).getByText(/last 30 days/)).toBeVisible();
});

for (const name of VIEWS) {
  test(`${name}: no horizontal scrolling and no serious accessibility violations`, async ({
    page,
  }) => {
    await page.goto(`/?view=${name.toLowerCase()}`);
    await expect(heading(page, name)).toBeVisible();
    await page.waitForLoadState('networkidle');

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
}

test('a failing endpoint shows a helpful error without breaking other cards', async ({ page }) => {
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
  await expect(
    page.getByRole('region', { name: 'Recent transactions' }).getByText(/^−R/),
  ).toHaveCount(5);

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
  await page.goto('/?view=transactions&period=7d&category=Entertainment');
  await expect(
    transactions(page).getByText('No Entertainment transactions in the last 7 days'),
  ).toBeVisible();

  await transactions(page).getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL(/\?view=transactions&period=7d$/);
});

test('core controls work with the keyboard alone', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Keyboard flow is covered on the desktop layout');
  await page.goto('/');
  await expect(summary(page).getByText(rand('R 19 004,60'))).toBeVisible();

  // Skip link is the first focusable element.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

  // Next is the tab list: arrow keys move between tabs, Enter opens one.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tab', { name: 'Overview' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Trends' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(heading(page, 'Trends')).toBeFocused();
  await expect(page).toHaveURL(/view=trends/);

  // Change the trend range without a pointer.
  await page.getByRole('button', { name: '24 months' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/months=24/);
  await expect(page.getByText('Month-by-month spending over the last 24 months.')).toBeVisible();
});
