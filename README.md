# Customer Spending Insights Dashboard

A responsive dashboard that helps a banking customer understand **how much they spend, where it goes, how it changes over time and whether they are staying within their monthly budgets**.

Built with **React 18, TypeScript (strict), Material UI, TanStack Query and Recharts**, backed by a **TypeScript Express mock API** that implements every endpoint in the supplied contract ([docs/api-contract.md](docs/api-contract.md)). One Docker container serves both the UI and the API.

> **Take-home assessment (Software Engineer: UX Developer).** This is a concept demonstration, not an official banking product. The customer, merchants and transactions are fictional and generated deterministically.

| Desktop                                                                                  | Mobile                                                                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| <img src="docs/screenshots/desktop.png" alt="Dashboard on a desktop screen" width="560"> | <img src="docs/screenshots/mobile.png" alt="Dashboard on a phone screen" width="200"> |

---

## Quick start

### With Docker (recommended for reviewers)

```bash
docker build -t spending-insights .
docker run --rm -p 3000:3000 spending-insights
```

Open <http://localhost:3000>. The API is served from the same container, for example:

```bash
curl "http://localhost:3000/api/customers/12345/spending/summary?period=30d"
```

The image is a multi-stage build. The runtime stage holds only the compiled UI and one bundled server file (no `node_modules`), runs as the non-root `node` user, and has a `HEALTHCHECK` against `/api/health`.

### Locally

Requirements: **Node.js 20.19+** (22 LTS recommended; see `.nvmrc`) and npm.

```bash
npm ci
npm run dev        # UI on http://localhost:5173, mock API on http://localhost:3001 (proxied under /api)
```

Production build, run locally:

```bash
npm run build      # dist/ (React) + dist-server/index.cjs (Express)
npm start          # serves both on http://localhost:3000
```

## Testing and quality checks

| Command                 | What it runs                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run typecheck`     | `tsc -b` across the UI, server, shared and test projects (strict mode, `noUncheckedIndexedAccess`) |
| `npm run lint`          | ESLint, including `typescript-eslint`, React Hooks and `jsx-a11y`; zero warnings allowed           |
| `npm run format:check`  | Prettier                                                                                           |
| `npm test`              | Vitest: unit, API (Supertest) and component (React Testing Library) tests                          |
| `npm run test:coverage` | The same, with V8 coverage                                                                         |
| `npm run test:e2e`      | Playwright against the production build, on desktop (1440 px) and mobile (Pixel 7) Chromium        |
| `npm run verify`        | typecheck, lint, format, test and build in one go                                                  |

The first time you run end-to-end tests, install the browser with `npx playwright install chromium`. `test:e2e` builds the app and starts the production server itself. Set `E2E_SKIP_BUILD=1` if you have already run `npm run build`.

**What is covered**

- **Unit:** date boundaries in Africa/Johannesburg (including UTC instants that fall on the next local day), leap years, equal-length previous periods, percentage change with a zero denominator, rounding (`1.005 → 1.01`), category tie-breaking, zero-spend months, goal thresholds (79.99 / 80 / 100 / 100.01 %), stable sorting, pagination without gaps or duplicates, URL-filter parsing and fallbacks, currency/percentage/date formatting, and trend insights.
- **Data consistency:** for every period, summary total = category total = transaction count, percentages sum to about 100 %, and the dataset is identical on every generation.
- **API:** every endpoint's response shape, defaults, filtering, sorting and pagination; 400s for each invalid parameter; 404s for unknown customers and routes; no stack traces leaked; `Cache-Control: no-store` and security headers.
- **Components:** loading, success, error with retry (which really re-requests), and empty states; labelled filter controls; category rows; accessible goal progress; one failing endpoint not breaking other sections. Tests render against the real mock API on an ephemeral port, with per-test overrides for failures.
- **End-to-end:** first load with no console errors; period change updates figures and URL; category filter → sort → paginate → refresh restores the view; invalid URL parameters fall back to defaults; no horizontal scroll; **axe-core WCAG 2.2 AA scan with zero serious/critical violations**; API failure and recovery; empty results with "Clear filters"; a keyboard-only flow.

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs all of the above on every push and pull request, then builds the Docker image and smoke-tests the running container.

---

## Features

- **Spending summary.** The selected period's total is the dominant figure ("You spent R 19 004,60 in the last 30 days"), with a neutral comparison to the previous equal-length period, plus transaction count, average transaction and top category.
- **Global period filter** (7 days / 30 days / 90 days / 1 year) drives the summary, category breakdown and transactions together, so the numbers on screen always describe the same date range.
- **Spending by category.** A donut chart plus a list with exact Rand amounts, percentages and transaction counts. Selecting a category filters the transactions, scrolls to them and moves keyboard focus there.
- **Monthly trend** (6 / 12 / 24 months), labelled as independent of the period filter. The in-progress month is drawn lighter and excluded from the average. Plain-language takeaways (average, highest/lowest month, latest month-on-month change) and a toggleable data table mean the insight never depends on reading the chart or hovering.
- **Transactions.** Category filter, four sort orders and pagination. A semantic table on desktop; day-grouped cards on mobile, which are not grouped when sorting by amount. An announced "Showing 11–20 of 132" status. The current page stays visible while the next one loads.
- **Monthly budgets.** Month-to-date progress for each goal, stating "On track" / "Nearing limit" / "Over budget" in text and icon (not colour alone), plus the amount left or over and the days remaining.
- **Shareable state.** Period, trend range, category, sort and page are kept in the URL (`?period=90d&category=Groceries&sortBy=amount_desc&page=2`). Defaults are omitted, and invalid values fall back safely.
- **Resilient sections.** Each section has its own skeleton, error-with-retry and empty state. A failing endpoint never blanks the rest of the page. An error boundary catches unexpected rendering failures.

## Architecture

```text
├── shared/                 Contract types, category metadata and calendar-date helpers used by both sides
├── server/
│   ├── data/               Seeded PRNG, deterministic ledger generator, fictional customer and budgets
│   ├── utils/              Pure functions: periods, aggregation, % change, goals, sorting, pagination, rounding
│   ├── services/           insights-service: derives every endpoint response from one ledger + reference date
│   ├── routes/             Thin Express handlers: validate (Zod) → call service → JSON
│   ├── validation.ts       Query-parameter schemas with readable messages
│   ├── app.ts              Security headers, compression, /api router, static files + SPA fallback
│   └── index.ts            Config, listen, graceful shutdown
├── src/
│   ├── components/         dashboard/, spending/, goals/, transactions/, states/, common/
│   ├── hooks/              useDashboardFilters (URL state), useInsightsQueries (TanStack Query)
│   ├── services/           Typed fetch client with ApiError; QueryClient defaults
│   ├── theme/              Design tokens and MUI theme
│   └── utils/              Formatting (en-ZA, ZAR, Africa/Johannesburg), insight copy, accessibility helpers
├── tests/                  unit/, api/, components/, e2e/, fixtures/
└── Dockerfile, .github/workflows/ci.yml
```

**Key decisions**

- **One source of truth.** The contract's example payloads are illustrative and not mutually consistent (for example, the category counts add up to 53 while the summary says 47). Rather than hard-coding them, the server generates one seeded ledger of about 1,000 transactions from July 2024 to the demo date and computes every response from it. That guarantees totals agree across endpoints.
- **Money in integer cents** on the server, converted to Rand only at the response boundary, so sums never drift.
- **A frozen demo clock.** The data runs to **19 October 2026** (`DEMO_REFERENCE_DATE` overrides it). Screenshots, numbers and tests are therefore reproducible, and the UI shows "Demo data to 19 Oct 2026".
- **Timezone-correct calendar logic.** Transactions are stored as UTC instants. All filtering and grouping uses the Africa/Johannesburg calendar date (for example, a delivery at 00:30 SAST counts on that local day, not the previous UTC day).
- **Server-side calculations.** The browser never downloads the whole ledger to compute four metrics. The UI only formats data and decides how to present it.
- **Service/handler separation.** Route handlers are a few lines each. To use a real upstream API, swap `insights-service` for an HTTP client with the same interface; the routes and UI stay unchanged.
- **No global client store.** TanStack Query owns server state, with query keys that include every parameter (so fast filter changes can never mix responses). The URL owns filter state, and React state handles the rest. Redux would add nothing here.
- **Retry policy.** Network and 5xx errors retry with backoff; 4xx errors do not.

### API contract extensions

All seven contract endpoints keep their documented shapes. Where the contract was silent, these additions are documented here rather than made silently:

| Change                                                                                                  | Why                                                                                                                                |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `GET /transactions?period=7d\|30d\|90d\|1y` (optional, mutually exclusive with `startDate`/`endDate`)   | Lets the transaction list use exactly the same server-resolved range as the summary, without the client re-implementing date logic |
| `spentChange` / `transactionChange` may be `null`                                                       | The previous period had nothing to compare with; the UI says so instead of showing `Infinity%`                                     |
| `topCategory` may be `null`                                                                             | No spending in the period                                                                                                          |
| Goal `status` adds `exceeded` (> 100 %) alongside `on_track` (< 80 %) and `warning` (80–100 %)          | A budget can be overspent                                                                                                          |
| `category` filter is case-insensitive; unknown categories return 400                                    | Friendlier input, explicit errors                                                                                                  |
| `GET /api/health`, `GET /api/meta` (`dataAsOf`, `timezone`, `currency`)                                 | Container health check; lets the UI label the demo date and the in-progress month                                                  |
| Errors: `{ "error": { "code", "message", "details?": [{ "field", "message" }] } }` with 400 / 404 / 500 | Consistent, safe error bodies                                                                                                      |

Only customer `12345` exists. Other IDs return 404.

## UX and accessibility

- Mobile-first layout, checked from 360 px to 1440 px with no horizontal scrolling. The period selector sits in a sticky header so it is always reachable.
- Plain-language copy with the comparison basis spelled out ("3,8% more than the previous 30 days"). Increases are not coloured red, because spending more is not automatically bad.
- Rand formatted with `Intl.NumberFormat('en-ZA', { currency: 'ZAR' })` everywhere. Expenses are shown as debits (−R 262,38).
- Semantic landmarks and headings, labelled `section` regions, a skip link, visible focus rings, labelled form controls, and announced loading and result-count status.
- Charts: the donut has a text summary and a full list equivalent; the trend has written takeaways and a data table. Contract category colours appear only as tints and swatches next to text, never as text colour (several are too light for text contrast).
- `prefers-reduced-motion` disables chart and UI animations.

## Configuration

| Variable              | Default                                     | Purpose                                                            |
| --------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `PORT`                | `3000` in production, `3001` in development | Server port                                                        |
| `HOST`                | `0.0.0.0`                                   | Bind address                                                       |
| `DEMO_REFERENCE_DATE` | `2026-10-19`                                | Last day of demo data                                              |
| `API_LATENCY_MS`      | `0`                                         | Development only: artificial API delay for checking loading states |
| `VITE_CUSTOMER_ID`    | `12345`                                     | Build-time customer ID used by the UI                              |

No secrets, databases or external services are required.

## Known limitations and next steps

- **No authentication.** A real deployment would put the API behind the bank's identity provider and derive the customer from the session, never from the URL.
- **Budgets are read-only** because the contract has no write endpoints.
- **Preset periods only in the UI.** The categories endpoint supports custom date ranges, but the summary endpoint does not, so exposing custom ranges would show mismatched numbers. Extending the summary endpoint would be the next step.
- **No free-text transaction search**, because the contract has no search parameter.
- **Single light theme.** Dark mode would be a straightforward theme-token extension.
- **Next with more time:** visual regression snapshots, Lighthouse CI budgets, error reporting (for example Sentry) from the error boundary, and i18n of copy.
