# Customer Spending Insights Dashboard (React + TypeScript)

> Capitec UX Developer take-home assessment, Option 1  
> Implementation plan and development README  
> Stack: **React, TypeScript, Vite, Material UI, TanStack Query, Recharts, and a small Express mock API**  
> Status: **Planning**. Do not claim that planned functionality is implemented until it has been built and tested.

## 1. Project overview

Build a responsive financial analytics dashboard that helps a South African banking customer understand how much they spend, which categories consume the most money, how spending changes over time, and whether they are staying within monthly budgets.

The assessment requires a production-grade solution, a **public GitHub repository**, a **runnable Dockerfile**, and instructions to **build, run, and test** the application. The customer data is mocked. No real banking integration is required.

### Main customer questions

1. How much did I spend during the selected period?
2. Is that more or less than in the previous equivalent period?
3. What are my largest spending categories?
4. How has my spending changed across recent months?
5. Which transactions contributed to my spending?
6. Am I approaching or exceeding my monthly spending goals?

**Product principle:** Make financial information understandable at a glance. Fewer, well-executed interactions are preferable to unrelated features.

### What makes this a strong UX engineering submission

- Mobile-first layout with intentional desktop adaptation.
- Clear labels, sensible defaults, and meaningful comparisons.
- Fully functional filtering, pagination, sorting, charts, and transaction views.
- Consistent results backed by one deterministic source of mock transactions.
- Typed API contracts, predictable state, and reusable React components.
- Responsive loading, empty, and error states; keyboard and screen-reader support.
- Tests, code-quality checks, production Docker execution, and clear documentation.

### Scope boundaries

**Include:** overview, spending summary, categories, trends, transactions, period filters, monthly goal progress, and relevant feedback states.

**Do not build for this assessment:** sign-up or login, real bank accounts, payment functionality, loan simulation, branch locator, admin area, database, notifications, marketing landing pages, or unrelated dashboards.

The result is a **concept demonstration**, not an official Capitec product. Use original interface work and no unlicensed Capitec branding or customer data.

## 2. Why React is the recommended choice

The recruitment email explicitly allows any tools or frameworks the candidate normally uses. However, Capitec's published **UX Developers** role specifically mentions **React, TypeScript, MUI/MUI X or similar design systems, testing, Git and CI/CD**. React is therefore the more direct demonstration of the skills expected in this position.

Use React + Vite rather than adding a more complex framework for a one-screen, client-facing analytics application. Use Material UI with a deliberately customized theme rather than an unchanged component-library appearance.

| Concern | Choice | Why |
|---|---|---|
| Framework | React + Vite | Direct fit with role requirements and fast typed development |
| Language | Strict TypeScript | Explicit data contracts and safer refactoring |
| UI | Material UI (MUI) + custom theme | Role-aligned accessible components and design tokens |
| Charts | Recharts | Composable responsive charts for React |
| Data fetching | TanStack Query + typed `fetch` client | Loading, caching, retries and parameter-specific requests |
| Mock endpoints | Express 4 + TypeScript | Real HTTP endpoints, bundled with the UI for Docker |
| Validation | Zod for query parameters | Validate malformed dates, periods, sort keys, and limits |
| Unit tests | Vitest | Calculations and pure utilities |
| React component tests | React Testing Library with Vitest | Interactions and user-facing states |
| Browser tests | Playwright | End-to-end critical flows on mobile and desktop |
| Quality checks | ESLint, Prettier, TypeScript | Consistent code and early error detection |
| Continuous integration | GitHub Actions | Build and tests verified after each push |
| Container | Multi-stage Docker build with Node runtime | Reproducible production execution |

**Do not add Redux just because it is popular.** TanStack Query manages remote data; URL query parameters can store shareable filters; React state can handle temporary UI choices. Introduce a global client store only if a real need appears.

**Why a separate mock API?** The attachment lists actual HTTP endpoints. An Express server makes them directly testable with a browser, `curl`, and automated integration tests, unlike browser-only mock interception. During development Vite proxies `/api` to Express; in production the same Express process serves the built frontend and mock routes. This is one repository and **one runnable Docker container**, without any database.

## 3. Data contracts supplied with the assessment

The attached `CustomerSpendingInsightsEndpoints.md` is the API contract reference. It documents:

| Endpoint | Purpose | Key parameters |
|---|---|---|
| `GET /api/customers/:customerId/profile` | Customer profile and currency | Customer ID |
| `GET /api/customers/:customerId/spending/summary` | Period totals and previous-period comparison | `period=7d\|30d\|90d\|1y` |
| `GET /api/customers/:customerId/spending/categories` | Category amounts and percentages | `period`, optional `startDate`, `endDate` |
| `GET /api/customers/:customerId/spending/trends` | Monthly points | `months`, maximum 24 |
| `GET /api/customers/:customerId/transactions` | Paginated transaction history | `limit`, `offset`, `category`, `startDate`, `endDate`, `sortBy` |
| `GET /api/customers/:customerId/goals` | Monthly budgets and usage | Customer ID |
| `GET /api/customers/:customerId/filters` | Category and period options | Customer ID |

### Important contract decisions

1. **No live API base URL is supplied.** Implement mock Express routes that return the documented JSON shapes. Keep data-generation and response-shaping logic separate from route handlers, so handlers can later be replaced by upstream API calls.
2. **Use one source of truth.** The supplied example category counts total 53 while the summary states 47. Treat those snippets as illustrative payloads, **not** as mutually consistent fixture data. Generate a coherent dataset and calculate every endpoint response from it.
3. **Preset periods are the MVP.** The summary endpoint supports only period presets, while categories support custom dates. Use presets globally at first. An optional second-stage custom-range feature may extend the mock summary handler with `startDate`/`endDate` and document that extension. Never show a category range beside an unmatched summary range.
4. **The monthly trend has its own time scale.** `months` describes consecutive calendar months, not the selected 7-day or 30-day summary. Label it explicitly (for example, “Last 6 months”). Do not imply the global period filter changes monthly trend data if it does not.
5. **Goals are month-to-date.** A monthly goal must not be compared against a selected 7-day or 90-day spending figure. Give goal cards an explicit month label.
6. **Transactions in the supplied contract are outflows.** Store spending amounts as positive numbers in the API, then display them clearly as expenses in the interface. Do not invent income totals or cash-flow insights.
7. **Do not invent endpoint capabilities silently.** The transaction contract has category/date/sort/pagination filters but no free-text search parameter. Search is optional and would require a documented mock-only `q` extension.

### Mock customer and time model

- Use a clearly fictional customer ID such as `12345`.
- Currency: `ZAR`, formatted using `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })`.
- Include recognizable but non-sensitive South African merchant examples.
- Seed a sufficiently rich range of spending transactions spanning **at least 24 months**, including zero-spend and high-spend dates, to exercise all periods and trends.
- **Freeze a demo reference date** (for example, `2026-10-19`) for the submitted demo, and state “Demo data through 19 October 2026.” Make the same date injectable in tests. This makes screenshots, numbers, and tests reproducible.
- Use a seeded pseudo-random generator or committed deterministic fixture data. Do not generate different monetary totals on every request or page refresh.
- Keep the profile's lifetime `totalSpent` concept separate from a selected-period summary.

### Calculation rules

- `totalSpent = sum(filteredTransaction.amount)`.
- `transactionCount = filteredTransactions.length`.
- `averageTransaction = totalSpent / transactionCount`, or `0` when no transactions exist.
- `topCategory = category with the highest amount`, or an explicit empty/null state.
- `percentage = categoryAmount / totalSpent * 100`, or `0` when total is zero.
- Percentages may add to 99.9% or 100.1% due to rounding; calculate from unrounded values, then format for display.
- `spentChange = (current - previous) / previous * 100` when the previous total is nonzero; handle zero denominators explicitly and display “No comparable previous spending” rather than `Infinity%`.
- The previous period must be **the same length**, immediately preceding the current period.
- Sort transactions by an explicit, stable secondary key (for example, ID) if primary values tie.
- Define date filtering consistently in the **Africa/Johannesburg calendar timezone**, and use date boundaries without accidental UTC off-by-one errors.
- Goal percentage should be derived from that calendar month's spending, and warning/on-track/over-limit labels should follow documented thresholds.

## 4. Information architecture and design specification

### One primary dashboard screen

- `/`: customer overview and insights. React Router is unnecessary unless additional real routes are added.
- No separate marketing, account settings, or authentication flows.
- On smaller screens, sections become stacked cards. On wider screens, supporting panels can sit beside charts.
- Filter selections should be reflected in the URL where useful, for example `?period=30d&category=Groceries&sortBy=date_desc&page=1`.
- Unrecognized URL parameter values fall back to safe defaults.

### Recommended section order

1. **Header:** discreet project identifier, “Spending Insights”, fictional customer name, “Demo data” indicator, global period picker.
2. **Summary:** total spending as the strongest figure; number of transactions, average transaction and period comparison as supporting metrics.
3. **Category breakdown:** donut or horizontal bar chart, category list with exact Rand amounts and percentages.
4. **Trends:** clear chart title, month labels, legible tooltip values and a summary of notable changes.
5. **Transactions:** filter/sort controls, paginated table on desktop and readable cards on mobile.
6. **Spending goals:** compact, clearly labelled month-to-date budget progress.

### UX details worth spending time on

- **Hierarchy:** A customer should identify the headline total and comparison within a few seconds.
- **Density:** Keep a small number of meaningful metrics above the fold; avoid a screen filled with equally prominent cards.
- **Copy:** Prefer “You spent R4,250.75 in the last 30 days” over obscure labels or finance jargon.
- **Comparisons:** Describe both direction and basis: “12.5% more than the previous 30 days”. Spending increases are not automatically “bad”, so avoid value judgments.
- **Units:** Use Rand throughout; never mix a bare number with currency-formatted money.
- **Colour:** Use a restrained, original bank-inspired blue and neutral system with high contrast. Category colours require matching text/icons or a legend and must not carry meaning alone.
- **Loading:** Prefer per-section skeletons rather than blocking the entire screen if one request is slow.
- **Errors:** Show plain-language explanation and retry where a section cannot load. One failed widget must not erase other successful widgets.
- **Empty results:** “No transactions for this period” with a helpful action to reset filters.
- **Accessibility:** Visible keyboard focus, semantic headings, properly named inputs, accessible chart summaries or tables, reduced-motion respect, and contrast checked against WCAG 2.2 AA where practical.
- **Responsive:** Check approximately 360, 390, 768, 1024, and 1440 px. Verify no horizontal scrolling, clipped charts, or tiny touch targets.
- **Chart details:** Use labels and text equivalents, and make charts resize after container size changes. Tooltips should work by pointer; insights must remain available without hovering.
- **No decorative distractions:** Avoid splash screens, large hero imagery, unnecessary animations, or fake interactive controls.

## 5. Recommended project structure

Use `src/` for React UI and `server/` for the mock HTTP service. Share contract types across both sides:

```text
capitec-spending-insights/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── theme/theme.ts
│   ├── components/
│   │   ├── dashboard/DashboardHeader.tsx
│   │   ├── dashboard/PeriodSelector.tsx
│   │   ├── spending/SpendingSummary.tsx
│   │   ├── spending/MetricCard.tsx
│   │   ├── spending/CategoryBreakdown.tsx
│   │   ├── spending/SpendingTrend.tsx
│   │   ├── transactions/TransactionFilters.tsx
│   │   ├── transactions/TransactionTable.tsx
│   │   ├── transactions/TransactionCard.tsx
│   │   ├── goals/SpendingGoalCard.tsx
│   │   └── states/SectionState.tsx
│   ├── hooks/
│   │   ├── useDashboardFilters.ts
│   │   ├── useSpendingSummary.ts
│   │   ├── useSpendingCategories.ts
│   │   ├── useSpendingTrends.ts
│   │   ├── useTransactions.ts
│   │   └── useSpendingGoals.ts
│   ├── services/api-client.ts
│   └── utils/
│       ├── currency.ts
│       ├── dates.ts
│       └── insights.ts
├── server/
│   ├── index.ts
│   ├── routes/customer-routes.ts
│   ├── data/demo-ledger.ts
│   └── utils/
│       ├── analytics.ts
│       ├── period.ts
│       └── validators.ts
├── shared/types/
│   ├── customer.ts
│   ├── spending.ts
│   ├── transaction.ts
│   └── goal.ts
├── tests/unit/
├── tests/components/
├── tests/e2e/
├── public/
├── vite.config.ts
├── tsconfig.server.json
├── playwright.config.ts
├── package.json
├── package-lock.json
├── Dockerfile
├── .dockerignore
├── .gitignore
├── .github/workflows/ci.yml
└── README.md
```

Keep calculations on the server/mock service side where possible. Avoid fetching thousands of transactions just to compute four metric cards in the browser. Keep formatting and display decisions in the UI layer.

---

## PHASE 1: Initialize and establish engineering standards

**Outcome:** Clean, runnable React app with TypeScript, a coherent MUI theme, and source control.

### Tasks

1. Create the app:

   ```bash
   npm create vite@latest capitec-spending-insights -- --template react-ts
   cd capitec-spending-insights
   npm install
   ```

2. Use a supported Node.js LTS release (Node 22 is a suitable pinned target for this project); record the chosen runtime in `.nvmrc` and Docker.
3. Add Material UI, Recharts, a typed data client and a small mock API. A practical installation starting point is:

   ```bash
   npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
   npm install @tanstack/react-query recharts zod express@4
   npm install -D @types/express@4 tsx tsup concurrently
   npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test prettier
   ```

4. Create `src/theme/theme.ts` using MUI `createTheme`. Set primary blue, background, surface, text, border, semantic feedback colours, spacing, border radius and typography. Wrap the app in `ThemeProvider`, `CssBaseline` and `QueryClientProvider` inside `src/main.tsx`.
5. Prefer MUI components such as `Card`, `Stack`, `Grid`, `Select`, `Table`, `Skeleton`, `Alert`, `Button` and `LinearProgress`. Style with the MUI `sx` prop or theme overrides; avoid uncontrolled combinations of styling systems.
6. Create `server/index.ts` for an Express 4 API. In development run it on port **3001**. Configure Vite to proxy `/api` to `http://localhost:3001` to avoid browser cross-origin configuration.
7. In production have Express serve the built `dist/` directory and respond to the documented `/api` paths. Reserve the `/api` prefix **before** the static-file fallback. Use port **3000** for the production server.
8. Add npm scripts resembling:

   ```json
   {
     "dev": "concurrently -k \"npm:dev:api\" \"npm:dev:web\"",
     "dev:api": "tsx watch server/index.ts",
     "dev:web": "vite",
     "build": "tsc -b && vite build && tsup server/index.ts --format esm --platform node --target node22 --out-dir dist-server",
     "start": "node dist-server/index.js",
     "typecheck": "tsc -b --pretty false",
     "lint": "eslint .",
     "test": "vitest run",
     "test:e2e": "playwright test"
   }
   ```

   Keep the Vite-generated TypeScript configurations, and add `tsconfig.server.json` referenced by the root TypeScript project so server code is also checked. Vite's `preview` command can preview static assets, but the **`start`** script should be the production smoke test because it exercises Express and the API.
9. Add ESLint and Prettier with non-conflicting rules. The Vite React TypeScript template may already supply ESLint; extend it instead of replacing it blindly.
10. Initialize Git; commit `package-lock.json`, `.gitignore`, and a first README. Do not commit `.env`, tokens, or build outputs.

### Done when

- [ ] `npm install` succeeds from a clean checkout.
- [ ] The empty app runs using `npm run dev`.
- [ ] The design system has clear tokens and a readable light theme.
- [ ] Type-check and lint commands can be executed.
- [ ] A first commit exists with no generated build output or secrets.

---

## PHASE 2: Build the mock API and deterministic financial data

**Outcome:** Every endpoint from the provided contract works without a real bank backend.

### Tasks

1. Define TypeScript interfaces for `CustomerProfile`, `SpendingSummary`, `CategorySummary`, `MonthlyTrend`, `Transaction`, `PaginatedTransactions`, `SpendingGoal`, and `FiltersResponse`.
2. Implement one deterministic expense ledger using fictional customer data and a frozen demo clock.
3. Implement pure functions for periods, category aggregation, monthly aggregation, percentage change, goals, sorting, filtering, and pagination.
4. Implement the seven Express GET handlers in `server/routes/customer-routes.ts`. Keep handlers thin: validate input, call a pure data service, return typed JSON.
5. Validate query input: known periods, valid `YYYY-MM-DD`, start before end, max 24 months, `limit` between 1 and 100, nonnegative integer offset, and recognized sort order.
6. Return documented errors such as HTTP 400 for invalid parameters and HTTP 404 for unknown customer IDs. Never return a server stack trace as public error text.
7. Add development-only controls or test fixtures for no-data/error/slow-response states; ensure these are not exposed as insecure or confusing public controls.

### Example endpoint acceptance cases

```text
GET /api/customers/12345/profile
GET /api/customers/12345/spending/summary?period=30d
GET /api/customers/12345/spending/categories?period=30d
GET /api/customers/12345/spending/trends?months=6
GET /api/customers/12345/transactions?limit=20&offset=0&sortBy=date_desc
GET /api/customers/12345/goals
GET /api/customers/12345/filters
```

### Done when

- [ ] Seven GET routes work locally and return the documented response shapes.
- [ ] Totals and transaction counts agree across related endpoints for identical filters.
- [ ] Pagination and sorting are deterministic.
- [ ] Invalid query parameters return understandable errors.
- [ ] The same requests return the same demo data after restart.
- [ ] Unit tests cover zero-spend, first period, date boundaries, percentage change and period comparisons.

---

## PHASE 3: Create the responsive dashboard shell

**Outcome:** Attractive, usable structure with realistic layout before charts are implemented.

### Tasks

1. Build the header, page container, responsive grid, reusable metric card, and section wrappers.
2. Use design tokens rather than hardcoding colours in every component.
3. Introduce global period selection (`7d`, `30d`, `90d`, `1y`), defaulting to `30d`.
4. Synchronize the selected period with the URL query parameter and validate unknown values.
5. Build skeleton, empty, error and retry components with readable text.
6. Establish typography hierarchy; total spent should be the most prominent financial figure.
7. Design the mobile layout intentionally: stacked cards and transaction cards, not compressed desktop content.

### Done when

- [ ] The header and sections display correctly at 360 px and 1440 px.
- [ ] Global period selection updates the URL.
- [ ] No fixed-width element causes horizontal scrolling.
- [ ] All interactive elements show keyboard focus and have accessible names.
- [ ] Empty/error/loading states are visually consistent.

---

## PHASE 4: Implement spending analytics

**Outcome:** Summary, categories and trends display real calculations from mocked endpoints.

### Tasks

1. Create a typed API client using `fetch`. Wrap endpoints in TanStack Query hooks with query keys that include customer ID and filter parameters, for example `['summary', customerId, period]`.
2. Build summary cards: total, transaction count, average, top category, and previous-period change.
3. Format Rand values and comparison percentages consistently; explain the comparison period.
4. Build the category chart with a text legend showing name, Rand amount, percentage and transaction count.
5. Build a trend chart with readable month labels, tooltip values and an always-visible text takeaway.
6. Build responsive Recharts components (`ResponsiveContainer`, `LineChart`, `PieChart` or `BarChart`) and provide accessible text or table alternatives. Use `React.lazy` only if a measured bundle-size benefit justifies it.
7. Keep the trends' `months` control independent from the preset period picker, unless a clearly documented linking behavior is designed.
8. Pass TanStack Query's `AbortSignal` into `fetch` and use parameter-based query keys so rapidly changing periods cannot mix data from different filters. Use explicit retry behavior for failed requests.

### Done when

- [ ] Changing `7d`, `30d`, `90d`, and `1y` updates summary and category insights together.
- [ ] Charts remain readable on narrow screens.
- [ ] Every chart has a text equivalent and a sensible empty-data state.
- [ ] There are no browser console errors, failed component boundaries, or unexplained fetch errors.
- [ ] All figures match the associated endpoint JSON.

---

## PHASE 5: Transactions and monthly goals

**Outcome:** Customers can investigate spending, not merely look at charts.

### Transactions tasks

1. Show date, merchant, category, description, amount, and payment method when helpful.
2. Use a semantic table on wide screens; switch to grouped transaction cards on small screens.
3. Add category filters and sort choices: newest, oldest, highest amount, lowest amount.
4. Add pagination with page count, a visible result range, disabled previous/next states, and reset to page 1 after filter changes.
5. Synchronize filters, sorting and current page with URL parameters.
6. Support empty results without showing a broken table. Provide “Clear filters”.
7. Optional: add search only after documenting a mock-only `q` extension to the given endpoint. Do not imply the original spec supports it.

### Goals tasks

1. Display goal category, budget, month-to-date spent, remaining amount and percentage used.
2. Use accessible progress components with numeric labels.
3. Differentiate on-track, approaching-limit and exceeded-limit states using text and not colour alone.
4. Make clear that goals are read-only. There is no endpoint for creating or editing them.

### Done when

- [ ] Sorting and category filtering work, including together.
- [ ] Pagination never shows duplicates or missing records caused by unstable sorting.
- [ ] Refreshing a filtered URL restores the intended view.
- [ ] Mobile transaction cards are legible without horizontal scroll.
- [ ] Goal totals are based on calendar-month spending, not selected summary period.

---

## PHASE 6: Reliability, accessibility, and automated testing

**Outcome:** The submission demonstrates engineering judgment beyond a polished screenshot.

### Unit tests (Vitest)

Test at least:

- Currency and percentage formatting.
- Date boundaries in Africa/Johannesburg and leap-year/month boundaries.
- Category aggregation and rounding.
- Equal-length comparison periods.
- Previous spending equal to zero.
- Zero transactions and zero totals.
- Goal warning/exceeded thresholds.
- Sorting ties, pagination offsets, and maximum limit.
- Invalid date, invalid period, invalid customer and invalid query parameters.

### Component tests

Use **React Testing Library** and `@testing-library/user-event`; assert what a customer can see and operate rather than internal implementation details. Supply `ThemeProvider` and a fresh test `QueryClientProvider` in the test wrapper.

- Summary renders loading, success, error and empty states.
- Period picker changes the value and accessible label.
- Category legend matches chart totals.
- Transaction sort and filter controls have associated labels and update results.
- The retry button actually triggers a new request.
- Goal progress shows a readable textual status.

### End-to-end tests (Playwright)

1. Visit dashboard, verify headline metrics and absence of console errors.
2. Change from 30 days to 7 days; verify figures and URL change appropriately.
3. Filter transactions to Groceries, sort by amount, paginate and verify order.
4. Refresh the page and verify filters persist through the URL.
5. Visit with a mobile viewport and use the controls without horizontal scrolling.
6. Verify an empty result set and an API error produce helpful interface states.
7. Run at least one keyboard-only flow; augment accessibility automation with `@axe-core/playwright` if time permits.

### Manual quality assurance

- Test Chrome, Firefox and one mobile browser if available.
- Audit at 360, 390, 768, 1024, and 1440 px.
- Verify focus indicators, contrast, screen-reader announcements and interactive chart alternatives.
- Check reduced motion, zoom to 200%, and slow-network behavior.
- Run browser performance and accessibility audits. Fix critical issues; document genuine limitations.

### Done when

- [ ] All automated tests pass reliably (no random or time-sensitive failures).
- [ ] No known broken critical user flow remains.
- [ ] Empty/loading/error states have been manually inspected.
- [ ] Financial calculations are correct for edge cases.
- [ ] The page is keyboard usable and informative without chart colour or hover.

---

## PHASE 7: Docker, continuous integration and reproducible setup

**Outcome:** A reviewer can clone the public repository and run the complete dashboard and mock endpoints without extra services.

### Dockerfile

Use a multi-stage build: Vite compiles the React frontend into `dist/`, and `tsup` compiles the TypeScript Express server into `dist-server/`. The final Node container serves both UI and mock API. A starting point is:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/dist-server ./dist-server
USER node
EXPOSE 3000
CMD ["node", "dist-server/index.js"]
```

Ensure Express binds to `0.0.0.0` and reads `PORT` (defaulting to 3001 in development and 3000 in production). Mount the API routes before `express.static` and the React single-page fallback. Keep `dist`, `dist-server`, `node_modules`, `.git`, local `.env` files, coverage and screenshots out of the Docker build context through `.dockerignore`.

### Container verification

```bash
docker build -t capitec-spending-insights .
docker run --rm -p 3000:3000 capitec-spending-insights
```

Open `http://localhost:3000` and test `http://localhost:3000/api/customers/12345/spending/summary?period=30d`. **Both UI and endpoint must work from the same container.**

### Continuous integration

Create `.github/workflows/ci.yml`. On each push and pull request:

1. Check out repository.
2. Set up the same pinned Node version with npm cache.
3. Run `npm ci`.
4. Run `npm run typecheck` and `npm run lint`.
5. Run `npm run test` in non-watch mode.
6. Run `npm run build`.
7. Install Playwright browsers and run the end-to-end suite, if included in the workflow.
8. Optionally build the Docker image as a separate verification step.

### Done when

- [ ] A clean Docker build succeeds using the committed lockfile.
- [ ] The container serves both dashboard and mock API endpoints.
- [ ] The app works without local `.env` secrets, databases, or external mock services.
- [ ] CI is green on the final public branch.
- [ ] The final README commands have been executed from a clean checkout.

---

## PHASE 8: Submission polish and interview preparation

**Outcome:** The repository is easy to evaluate and every major design choice can be defended.

### Final README sections to update with real implementation details

1. Project description and screenshots (desktop and mobile).
2. Tech stack and reasons for React, TypeScript and MUI.
3. Requirements: Node version, npm, optional Docker.
4. Quick start: `npm ci`, `npm run dev`, URL.
5. Test commands: type-check, lint, unit/component, end-to-end.
6. Production build: `npm run build`, `npm run start` (start serves both the React app and API).
7. Docker build and run commands, including endpoint smoke tests.
8. Features with an honest description of what is actually implemented.
9. Architecture and folder structure.
10. Mock-data approach, demo clock and API contract deviations.
11. Accessibility, performance and testing decisions.
12. Trade-offs and known limitations, even if small.

### Review checklist

- [ ] Repository is **public** and accessible without signing in.
- [ ] Repository name and README identify this as a **take-home assessment/demo**, not an official banking service.
- [ ] There are no fake green badges, unimplemented buttons, misleading metrics, or claims of production deployment without evidence.
- [ ] Git history shows sensible development progress rather than one unexplained generated code dump.
- [ ] No private credentials, personal details, bank secrets, or real customer data are committed.
- [ ] Tests, lint, type-check, build and Docker all pass.
- [ ] The candidate can explain component boundaries, performance, data consistency, accessibility and test choices.

### Likely interview discussion questions

- Why React, TypeScript and Material UI for this role?
- Why use Vite and a small Express mock API rather than a full production backend?
- How would you change the mock endpoints to consume live APIs?
- How does the dashboard avoid inconsistent numbers when changing filters?
- What happens when the previous period has zero spending?
- Why are budgets based on the calendar month rather than the selected period?
- How do screen-reader and keyboard users understand charts?
- What are the critical tests, and what would you add with more time?
- How would authentication, personally identifiable information, monitoring and secure caching work in a real banking environment?
- What trade-offs did you make to stay within the assessment time limit?

## 6. Suggested order if the deadline is immediate

The previously discussed delivery target was **20 October 2026**. If that remains firm and implementation has not yet begun, do not attempt every optional feature before core functionality works.

**First:** Phase 1 + Phase 2 (a runnable app and consistent endpoint contract).  
**Second:** Phase 3 + essential Phase 4 (responsive shell, period selection, summary, categories).  
**Third:** Phase 5 essentials (transactions with category/sort/pagination; monthly goals).  
**Fourth:** Phase 6 critical tests and error states.  
**Fifth:** Phase 7 Docker and clean-checkout commands, followed by final README and repository checks.

**Defer if necessary:** free-text search, custom dates, animated chart transitions, extra dashboard pages, theme switching, additional chart types and elaborate filtering interactions.

A genuinely production-grade application from scratch by tomorrow is ambitious. If the date was formally promised and sufficient time remains unavailable, seek an extension proactively instead of shipping unverified code.

## 7. Working agreements for implementation

- Implement **one phase at a time**, and verify its “Done when” conditions before starting the next.
- Keep UI components focused on presentation; do not bury business calculations inside templates.
- Commit after each coherent feature and after tests pass.
- Do not add dependencies without a concrete need.
- Do not silently change the supplied endpoint response shapes.
- Treat demo transactions as fake data everywhere, including screenshots and documentation.
- Prioritize clear UX, working behavior, correct calculations, and repeatable builds over feature count.

## 8. Primary technical references

- [Vite React and TypeScript project setup](https://vite.dev/guide/)
- [Material UI documentation](https://mui.com/material-ui/getting-started/)
- [TanStack Query for React](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Recharts documentation](https://recharts.org/)
- [Express documentation](https://expressjs.com/)
- [React Testing Library documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [Docker and Node.js guidance](https://docs.docker.com/guides/nodejs/)
- Provided assessment attachment: `CustomerSpendingInsightsEndpoints.md`

---

**Definition of success:** A reviewer can clone the public GitHub repository, follow the README, run the dashboard in Docker, explore accurate and intuitive mocked spending insights on a phone or desktop, and see credible evidence of thoughtful frontend engineering.
