# Customer Spending Insights Dashboard

My submission for the Software Engineer: UX Developer take-home. It's a responsive dashboard that helps a banking customer answer four questions quickly: **how much did I spend, where did it go, how is it changing, and am I within my budgets?**

I built the front end in **React 18 and strict TypeScript** with **Material UI**, **TanStack Query** and **Recharts**. Behind it is a **TypeScript Express mock API** that implements every endpoint in the brief's contract ([docs/api-contract.md](docs/api-contract.md)). A single Docker container serves both.

> This is a concept demonstration for an assessment, not an official banking product. The customer, merchants and transactions are fictional and generated deterministically.

<img src="docs/screenshots/desktop-overview.png" alt="Overview tab on a desktop screen: total spent, category split, monthly budgets, monthly trend and recent transactions" width="820">

<img src="docs/screenshots/desktop-overview-dark.png" alt="Overview in dark mode" width="820">

| Transactions tab                                                                                                            | Phone: Overview                                                                                                  | Phone: Budgets (dark)                                                                             |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| <img src="docs/screenshots/desktop-transactions.png" alt="Transactions tab with filters, table and pagination" width="420"> | <img src="docs/screenshots/mobile-overview.png" alt="Overview on a phone with the floating tab bar" width="190"> | <img src="docs/screenshots/mobile-budgets.png" alt="Budgets on a phone in dark mode" width="190"> |

---

## Running it

### With Docker (quickest)

```bash
docker build -t spending-insights .
docker run --rm -p 3000:3000 spending-insights
```

Then open <http://localhost:3000>. The API is on the same origin, for example:

```bash
curl "http://localhost:3000/api/customers/12345/spending/summary?period=30d"
```

I kept the image small and locked down. It's a multi-stage build, and the final stage contains only the compiled UI and a single bundled server file (no `node_modules`). It runs as the non-root `node` user and has a health check on `/api/health`.

### Locally

You'll need **Node.js 20.19+** (I used 22 LTS; see `.nvmrc`) and npm.

```bash
npm ci
npm run dev        # UI on http://localhost:5173, API on http://localhost:3001 (proxied under /api)
```

To run the production build locally:

```bash
npm run build      # dist/ (React) + dist-server/index.cjs (Express)
npm start          # serves both on http://localhost:3000
```

### If something doesn't start

| Symptom                                                                                                  | What to do                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Port 3000 is already in use                                                                              | Map another host port: `docker run --rm -p 8080:3000 spending-insights` and open <http://localhost:8080>. Locally: `PORT=8080 npm start` (PowerShell: `$env:PORT=8080; npm start`).                                                                                                                                                                  |
| `localhost:3000` refuses to connect, but the container logs `listening on` and `/api/health` returns 200 | I hit this myself with Docker Engine running inside WSL (no Docker Desktop): WSL's localhost forwarding can stop working. Open the WSL address instead (`wsl hostname -I`, then `http://<that-ip>:3000`), or enable mirrored networking by adding `[wsl2]` and `networkingMode=mirrored` to `%USERPROFILE%\.wslconfig` and running `wsl --shutdown`. |
| `docker build` fails during `npm ci` with `ETIMEDOUT` or `ECONNRESET`                                    | A slow or unstable network. I made the install step retry and cache downloads, so re-running `docker build` picks up where it left off. Behind a corporate proxy: `docker build --build-arg HTTPS_PROXY=http://proxy:port -t spending-insights .`                                                                                                    |
| `permission denied ... /var/run/docker.sock` on Linux/WSL                                                | Prefix the commands with `sudo`, or add your user to the `docker` group (`sudo usermod -aG docker $USER`) and open a new shell.                                                                                                                                                                                                                      |
| The page loads but sections say "could not be loaded"                                                    | Check the API directly: `curl http://localhost:3000/api/health`. With `npm run dev`, both the API (3001) and Vite (5173) need to be running; `npm run dev` starts both.                                                                                                                                                                              |

---

## How I approached it

I treated the brief as a real product rather than a set of endpoints to wire up. Before designing anything, I asked what a customer actually needs from this screen. The answer is one clear number (what I spent), then the context to understand it. That shaped everything else:

- **One question per screen.** The **Overview** gives the headline numbers at a glance, and four focused sections (**Categories, Trends, Transactions, Budgets**) hold the detail. Each Overview card links to its section, so you only dig in when you want to. On desktop that's a sidebar; on phones, a bottom tab bar, like a banking app.
- **Numbers you can trust.** The example payloads in the brief don't agree with each other: the category counts add up to 53 while the summary says 47. So instead of hard-coding them, I generate one seeded ledger of about 1,000 transactions and compute every response from it. Totals then agree everywhere you look.
- **Honest, neutral language.** "3,8% more than the previous 30 days", always with the basis spelled out. I deliberately don't colour increases red: spending more isn't automatically bad, and a bank shouldn't imply it is.
- **Restraint over decoration.** Capitec blue is the only accent. It's used boldly on the sidebar, the total-spent card and the selected period, so the eye lands there first. Everything else is white and grey, and category colours only appear as small dots and chart marks.

## What's in it

- **Overview:** total spent for the period (the hero), the change against the previous equal-length period, transaction count, average transaction and top category. Below that: where the money went, monthly budgets at a glance, a six-month mini trend, and the latest transactions.
- **One period filter** (7 days, 30 days, 90 days, 1 year) shared by Overview, Categories and Transactions, so every number describes the same date range.
- **Categories:** a donut chart plus a breakdown of amount, share and transaction count. Choosing a category opens Transactions filtered to it.
- **Trends** (6, 12 or 24 months): monthly average, highest and lowest month, and a bar chart where the in-progress month is drawn lighter and left out of the average. A data table toggle means the information never depends on reading the chart.
- **Transactions:** category filter, four sort orders and pagination. On desktop it's a proper table. On phones, it's cards grouped by day when sorted by date, and a flat list with the date on each row when sorted by amount. The current page stays visible while the next one loads.
- **Budgets:** month-to-date totals, then a card per budget with its status in words ("On track", "Nearing limit", "Over budget") and a practical nudge: "R 886,27 left · about R 73,86 a day".
- **Everything lives in the URL** (`?view=transactions&period=90d&category=Groceries&sortBy=amount_desc&page=2`). Refresh keeps your place, the back button moves between sections, and any view can be bookmarked or shared. Invalid values fall back safely.
- **Light and dark mode.** Light is the default, and your choice is remembered on the device.
- **Failure handled per card.** Each card has its own loading skeleton, error with retry, and empty state. One failing endpoint never blanks the rest of the page.

## Design decisions

- **Depth instead of lines.** Cards have no borders; they float on soft shadows with a 20px radius, 24px of padding and 24px gaps throughout.
- **Modern controls.** Pill-shaped filters with an icon (with a hidden label for screen readers), a segmented period picker, compact change badges, and "View all" links in card headers.
- **Stat cards share one layout:** label and icon, value, then a footer pinned to the bottom, so cards in a row always line up.
- **Self-hosted Inter with tabular numerals**, so amounts align in columns and no request goes to a third party.
- **Tooltips only where they add information:** the full sentence behind a change badge, what a budget status means, the figures behind each bar segment, and labels for icon-only buttons.
- **Theming through CSS custom properties.** Each mode has its own palette, so switching re-themes every surface at once. Charts read concrete colours, because SVG attributes can't use CSS variables.

## Accessibility

I wanted this to work for everyone, not just pass a checklist:

- Usable from 360 px to 1440 px with no horizontal scrolling.
- Changing section behaves like changing page: the title updates, the view scrolls to the top, and focus moves to the new heading.
- Semantic landmarks and headings, a skip link, visible focus rings, labelled controls, and announced loading and result counts.
- Charts have text equivalents (a summary on the donut, takeaways and a data table on the trend). Status is always written in words, never shown by colour alone.
- `prefers-reduced-motion` turns off chart and UI animation.
- Automated WCAG 2.2 AA checks (axe) run on every section in both light and dark mode, and Lighthouse scores accessibility at 100.

## Architecture

```text
├── shared/            Contract types, category metadata and calendar-date helpers used by UI and API
├── server/
│   ├── data/          Seeded random generator, deterministic ledger, fictional customer and budgets
│   ├── utils/         Pure functions: periods, aggregation, % change, goals, sorting, pagination, rounding
│   ├── services/      insights-service: derives every response from one ledger and a reference date
│   ├── routes/        Thin handlers: validate (Zod) → call the service → JSON; client error intake
│   ├── validation.ts  Query-parameter schemas with readable error messages
│   ├── app.ts         Security headers, compression, /api router, static files and SPA fallback
│   └── index.ts       Config, listen, graceful shutdown
├── src/
│   ├── views/         One component per section (all except Overview are code-split)
│   ├── components/    Layout (sidebar, mobile bars), overview cards, transactions, shared states
│   ├── hooks/         URL-backed filter state; TanStack Query hooks
│   ├── services/      Typed API client, query defaults, error reporter
│   ├── i18n/          Typed English message catalogue, plural helper, provider
│   ├── theme/         Design tokens, light and dark palettes, MUI theme
│   └── utils/         en-ZA / ZAR / Africa/Johannesburg formatting, insight copy, accessibility helpers
├── tests/             unit, api, components, e2e, visual (with baselines), fixtures
└── Dockerfile, .github/workflows/ci.yml
```

### Why I built it this way

- **Calculations stay on the server.** The browser never downloads the whole ledger to work out four numbers; the UI only formats data and decides how to show it.
- **Thin route handlers.** Each handler validates input, calls the service and returns JSON. To switch to a real upstream API, I'd replace `insights-service` with an HTTP client that has the same interface; the routes and UI wouldn't change.
- **Money in integer cents**, converted to Rand only at the response boundary, so totals never drift.
- **Timezone-correct dates.** Transactions are stored as UTC instants but filtered and grouped by the Africa/Johannesburg calendar day. A food delivery at 00:30 SAST counts on that local day, not the previous UTC one.
- **A frozen demo clock.** The data runs to **19 October 2026** (override with `DEMO_REFERENCE_DATE`), so screenshots, numbers and tests are reproducible.
- **No global store.** TanStack Query owns server state, with query keys that include every parameter, so quick filter changes can't mix up responses. The URL owns filter state. Redux wouldn't add anything here.
- **Sensible retries.** Network and 5xx errors retry with backoff; 4xx errors don't, because retrying an invalid request won't help.
- **Vendor-neutral error reporting.** The error boundary and global error handlers send reports to `POST /api/client-errors`. The server validates them, limits size and rate per client, and logs a structured JSON line. I kept it first-party so there's no third-party account and the Content Security Policy stays strict. A hosted service like Sentry could sit behind `reportError()` without touching any call sites.
- **Internationalisation-ready.** All copy lives in `src/i18n/en.ts`. Messages that take values are typed functions, so a new language has to provide every message with the right parameters, and the compiler checks it. Plurals use `Intl.PluralRules`. Only English ships today.
- **Performance.** The detail sections and every chart are code-split, which keeps the chart library off the Overview's critical path. `index.html` also paints a branded loading screen before any JavaScript runs.

### Where I extended the contract

All seven endpoints keep the shapes in the brief. Where the contract was silent, I made these additions and documented them rather than changing things quietly:

| Change                                                                                                              | Why                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `GET /transactions?period=7d\|30d\|90d\|1y` (optional, mutually exclusive with `startDate`/`endDate`)               | The transaction list uses exactly the same server-resolved range as the summary, with no duplicated date logic |
| `spentChange` / `transactionChange` may be `null`                                                                   | When there's nothing to compare against, the UI says so instead of showing `Infinity%`                         |
| `topCategory` may be `null`                                                                                         | No spending in the period                                                                                      |
| Goal `status` adds `exceeded` (> 100 %) alongside `on_track` (< 80 %) and `warning` (80–100 %)                      | A budget can be overspent                                                                                      |
| `category` filter is case-insensitive; unknown categories return 400                                                | Friendlier input, clear errors                                                                                 |
| `GET /api/health`, `GET /api/meta` (`dataAsOf`, `timezone`, `currency`)                                             | Container health check, and lets the UI label the demo date and the in-progress month                          |
| Errors: `{ "error": { "code", "message", "details?": [{ "field", "message" }] } }` with 400 / 404 / 413 / 429 / 500 | One consistent, safe error shape that never leaks stack traces                                                 |
| `POST /api/client-errors` (202, no body)                                                                            | Receives browser error reports; validated, 16 kB limit, rate-limited per client                                |

Only customer `12345` exists; any other ID returns 404.

---

## Testing

I tested at every level, because a dashboard about someone's money has to be right, not just look right.

| Command                      | What it runs                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`          | `tsc -b` across UI, server, shared code and tests (strict, `noUncheckedIndexedAccess`)                      |
| `npm run lint`               | ESLint with `typescript-eslint`, React Hooks and `jsx-a11y`; zero warnings allowed                          |
| `npm run format:check`       | Prettier                                                                                                    |
| `npm test`                   | Vitest: unit, API (Supertest) and component (React Testing Library) tests                                   |
| `npm run test:coverage`      | The same, with coverage                                                                                     |
| `npm run test:e2e`           | Playwright against the production build, on desktop (1440 px) and mobile (Pixel 7)                          |
| `npm run verify`             | Typecheck, lint, format, tests and build in one go                                                          |
| `npm run test:lighthouse`    | Lighthouse CI against the production build, with performance, accessibility, best-practice and size budgets |
| `npm run test:visual:docker` | Visual regression: every section in light and dark, desktop and mobile, compared with committed screenshots |
| `npm run test:visual:update` | Regenerates the visual baselines after an intentional UI change                                             |

Notes:

- The first time you run end-to-end tests, install the browser with `npx playwright install chromium`. `test:e2e` builds the app and starts the server itself; set `E2E_SKIP_BUILD=1` if you've already built.
- `test:lighthouse` needs Chrome; set `CHROME_PATH` to Playwright's Chromium if you don't have it installed. Reports go to `.lighthouseci/`.
- I run the visual suite only inside `mcr.microsoft.com/playwright:v1.64.1-noble`, because fonts render slightly differently on each operating system. The scripts mount the repo and keep the container's Linux `node_modules` separate from yours.

**What the tests cover**

- **Calculations and dates:** Johannesburg day boundaries (including UTC times that fall on the next local day), leap years, equal-length comparison periods, percentage change with a zero denominator, rounding (`1.005 → 1.01`), ties, zero-spend months, budget thresholds (79.99 / 80 / 100 / 100.01 %), stable sorting, and pagination without gaps or duplicates.
- **Consistency:** for every period, the summary total, category total and transaction count agree; percentages add up to about 100 %; and the generated data is identical on every run.
- **API:** every endpoint's shape, defaults, filtering, sorting and pagination; a 400 for each invalid parameter; 404s for unknown customers and routes; no leaked stack traces; `Cache-Control: no-store` and security headers; and the error-report endpoint's validation, size limit and rate limit.
- **Components:** loading, success, error-with-retry and empty states; labelled controls; accessible budget progress; one failing endpoint leaving other cards intact; navigation updating the URL, title and focus; and copy coming from the i18n catalogue.
- **End-to-end:** no console errors on load; every section reachable, including with the back button; the period filter applying across sections; category → filtered transactions → sort → paginate → refresh restoring the view; safe fallbacks for bad URLs; **no horizontal scroll and zero serious accessibility violations on every section, in both themes**; API failure and recovery; "Clear filters" on empty results; a keyboard-only flow; dark mode persisting across reloads; and a real browser error reaching the server through the CSP.
- **Visual regression:** 12 screenshots per device (every section in light and dark, a filtered list, and an error state) on desktop and mobile, at a 0.2 % pixel tolerance.
- **Lighthouse budgets** (median of three runs on Lighthouse's mobile profile: slow 4G, 4× CPU slowdown): accessibility 100, best practices ≥ 95, performance ≥ 70, LCP ≤ 4 s, total blocking time ≤ 650 ms, CLS ≤ 0.1, ≤ 320 kB of compressed JavaScript, and no third-party requests. When I last measured, performance was 82 (Overview), 91 (Transactions) and 82 (Trends).

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs all of this on every push and pull request (Lighthouse and visual regression as separate jobs that upload their reports), then builds the Docker image and smoke-tests the running container.

## Configuration

| Variable              | Default                                     | Purpose                                                            |
| --------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `PORT`                | `3000` in production, `3001` in development | Server port                                                        |
| `HOST`                | `0.0.0.0`                                   | Bind address                                                       |
| `DEMO_REFERENCE_DATE` | `2026-10-19`                                | Last day of demo data                                              |
| `API_LATENCY_MS`      | `0`                                         | Development only: artificial API delay for checking loading states |
| `VITE_CUSTOMER_ID`    | `12345`                                     | Build-time customer ID used by the UI                              |

There are no secrets, databases or external services to set up.

## Known limitations

These are deliberate boundaries for an assessment, and I'd be happy to talk through how I'd handle each in production:

- **No authentication.** In production the API would sit behind the bank's identity provider, and the customer would come from the session, never the URL.
- **Budgets are read-only**, because the contract has no endpoints for creating or editing them.
- **Preset periods only.** The categories endpoint accepts custom date ranges, but the summary endpoint doesn't, so offering custom ranges in the UI would show mismatched numbers.
- **No free-text search**, because the transactions endpoint has no search parameter.
- **Error reports are logged, not stored or alerted on.** In production they would flow from the structured logs into the bank's monitoring.
- **English only.** The i18n structure is ready, but additional languages deserve professional translation rather than machine-generated copy.
