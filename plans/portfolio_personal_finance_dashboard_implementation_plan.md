# Personal Finance Dashboard (Portfolio Demo) — Comprehensive Implementation Plan (TDD)

Build a polished, client-side personal finance dashboard (budgeting + expense tracking) that showcases LocalByte LLC’s UX, UI, and JavaScript engineering. All data stays private in the browser via `localStorage`.

## Executive Summary

**Outcome:** a production-quality, responsive dashboard where users can add transactions, set monthly budgets, visualize spending trends, and export data to CSV.  
**Quality bar:** accessible (WCAG-minded), fast (Lighthouse-friendly), and regression-protected via automated tests written first (strict TDD).

**Working product name (agent may refine):** **ClearLedger**  
Tone: calm, trustworthy, “modern fintech” without being gimmicky.

### Confirmed Decisions (Client Provided)

- The demo **seeds sample data by default** on first run (with reset option).
- v1 **supports both income and expense** transactions.
- v1 supports **both overall monthly budgets and per-category budgets**.
- Demo slug: `public/demos/finance-dashboard/`

## Primary Goals (What “Done” Looks Like)

- Feels like a real, usable budgeting tool (not a toy UI).
- Works at 320px+ with no broken layouts; scales cleanly to desktop.
- Core flows are fully keyboard accessible, with visible focus and clear validation.
- Charts are readable, accessible, and have text/table equivalents.
- Data persists across reloads (localStorage), with safe error handling for storage failures.
- Automated tests cover critical user journeys and key calculations.
- Easy to showcase from `public/portfolio.html` (opens demo in a new tab).

## Scope

### In Scope (Must Have)

- **Transactions**
  - Add transaction: date, type (**expense**/**income**), amount, category, optional note.
  - Transaction list with filtering by time range (This month / Last month / Custom).
  - Delete transaction (with “Undo” toast or confirm dialog).
  - Basic validation and friendly error messaging.
- **Budgets**
  - Monthly budget targets (**overall** + **per-category**).
  - Progress UI (spent vs budget, remaining, overspend state).
- **Insights**
  - Expense breakdown by category (bar chart).
  - Income vs expense trend over time for selected range (line chart, two series).
  - Summary cards: total expenses, total income, net, top category (expenses).
- **Export**
  - Export transactions to CSV (download).
- **Theme**
  - Dark/light mode toggle (using the repo’s existing `data-theme` convention + `localStorage` key if appropriate).
- **Non-functional**
  - Accessibility-first patterns (forms, tables, charts, focus management).
  - Performance: minimal JS, no unnecessary dependencies, responsive rendering.

### Out of Scope (Explicitly Not Doing)

- Bank integrations, Plaid, OAuth, or any external API calls.
- Multi-user support, accounts, authentication, or cloud sync.
- Advanced reporting (tax categories, attachments/receipts, recurring transactions).
- Complex imports (CSV import) unless explicitly requested.
- Financial advice language (avoid implying “advice”); this is a demo tool.

## Constraints / Guardrails (Match LocalByte Repo Conventions)

- Vanilla HTML/CSS/JS only (no runtime frameworks).
- JS uses IIFEs, `var`, and double quotes for strings.
- CSS uses custom properties for colors (no hardcoded hex), supports dark mode via `data-theme`.
- Motion respects `@media (prefers-reduced-motion: reduce)`.
- Accessibility: semantic landmarks, proper labels, minimal ARIA, keyboard support.

## Deliverables (Concrete Artifacts)

- Demo app under: `public/demos/finance-dashboard/`
  - Self-contained `assets/` so the demo styling is independent of the main site.
- Automated tests (recommended Playwright) + “how to run” docs.
- Portfolio integration:
  - Add a new portfolio card in `public/portfolio.html` linking to the demo (opens in a new tab).
  - Add a thumbnail image under `public/assets/img/portfolio/`.
- A short demo disclaimer (“Fictional demo tool; data stays in your browser.”) visible in the UI.

## Information Architecture (IA) / Pages

Keep this demo small but “real” by using a multi-page IA (still client-side, still static).

- `public/demos/finance-dashboard/index.html` — **Dashboard**
  - Summary cards, charts, budgets snapshot, recent transactions.
- `public/demos/finance-dashboard/transactions.html` — **Transactions**
  - Add transaction form + full list + filters.
- `public/demos/finance-dashboard/budgets.html` — **Budgets**
  - Set monthly budgets + progress by category/overall.
- `public/demos/finance-dashboard/settings.html` — **Settings**
  - Export CSV, reset data, theme toggle (if not global), “about/privacy” copy.
- `public/demos/finance-dashboard/404.html` — **404**

If scope needs tightening, collapse `budgets.html` into `index.html` and keep only `index.html`, `transactions.html`, `settings.html`.

## Data Model (localStorage)

All persisted data lives in a single JSON blob with versioning for safe migrations.

### Storage Keys

- `lb.financeDashboard` (suggested) — main persisted state
- `lb.financeDashboard.version` (optional if you prefer split versioning)

### State Shape (v1)

- `meta`
  - `schemaVersion`: number (`1`)
  - `createdAt`: ISO string
  - `updatedAt`: ISO string
- `settings`
  - `currency`: string (`"USD"`)
  - `weekStartsOn`: number (`0` Sunday default for US audiences)
  - `theme`: optional string (`"light"` / `"dark"`), or rely on existing site theme key
  - `seededOnce`: boolean (prevents auto-seed repeating after a reset)
  - `isSampleData`: boolean (current dataset is sample/demo data)
- `categories` (static list in code, not user-editable in v1)
  - Each category has: `id`, `label`, `type` (`"expense"` / `"income"`)
  - Example expense categories: `groceries`, `dining`, `rent`, `utilities`, `transport`, `health`, `shopping`, `entertainment`, `other`
  - Example income categories: `salary`, `freelance`, `refund`, `other-income`
- `transactions`
  - Array of:
    - `id`: string (stable, unique)
    - `date`: ISO date string (`YYYY-MM-DD`)
    - `amountCents`: integer (store cents to avoid float errors; always positive)
    - `type`: `"expense"` or `"income"` (required)
    - `categoryId`: string
    - `note`: string (optional)
    - `createdAt`: ISO string
    - `updatedAt`: ISO string
- `budgets`
  - Array of:
    - `id`: string
    - `month`: string (`YYYY-MM`)
    - `categoryId`: string or `"all"`
    - `limitCents`: integer

### Derived Data (Computed, Not Stored)

- Totals per range: expenses, income, net.
- Breakdown by category (expenses): totals + percent.
- Time series by day/week: aggregated totals (expenses + income) for the trend chart.
- Budget progress (expenses-only): spent vs limit for each budget row.

### Migration Strategy

- Always parse storage inside a try/catch.
- If schemaVersion mismatch:
  - Attempt migration functions `migrateV1ToV2` (future).
  - If migration fails, preserve raw value and reset to defaults with a banner explaining the reset.

## UX & Accessibility Requirements

### Global Layout

- Sticky header with app name + nav + theme toggle.
- Skip link to main content.
- Clear, consistent primary CTA (“Add transaction”).
- All interactive elements are reachable/usable via keyboard.

### Forms (Transactions, Budgets)

- Use `<label for>` for each input, with helpful hint text where needed.
- Validation:
  - Inline error messages linked via `aria-describedby`.
  - Error summary region at top on submit failure.
  - Focus moves to summary on failure; focus returns to relevant field on selection.
- Inputs:
  - Date uses `<input type="date">`.
  - Amount uses `<input inputmode="decimal">` with formatting on blur.
  - Category uses `<select>`.

### Tables & Lists

- Transactions list uses a semantic table on desktop and a card list pattern on mobile (same data, different layout).
- Table includes proper `<caption>` and scope attributes where appropriate.

### Charts (Accessible by Design)

- Render charts with inline SVG (preferred) to avoid heavy dependencies.
- Provide a text summary near each chart (e.g., “Top category: Groceries — $412 this month”).
- Provide an accessible data table (collapsible `<details>`) that mirrors chart values.
- Avoid relying on color alone; include labels, markers, and patterns where needed.

## Technical Approach & File Structure

### Recommended Demo Folder Layout

- `public/demos/finance-dashboard/`
  - `index.html`
  - `transactions.html`
  - `budgets.html`
  - `settings.html`
  - `404.html`
  - `assets/`
    - `css/`
      - `style.css`
    - `js/`
      - `app.js` (boot + routing per-page)
      - `state.js` (in-memory state + derived selectors)
      - `storage.js` (load/save/migrate/localStorage wrapper)
      - `transactions.js` (CRUD + validation)
      - `budgets.js` (CRUD + calculations)
      - `charts.js` (SVG chart rendering)
      - `csv.js` (export)
      - `seed.js` (sample dataset + seeding helpers)
    - `img/` (icons/illustrations if needed)

### Implementation Notes

- Keep business logic in pure functions (selectors/calculations) for unit testing.
- Keep DOM rendering functions deterministic and idempotent (render(state) pattern).
- Use event delegation where appropriate for performance and simpler listeners.
- Use `Intl.NumberFormat` for currency formatting; store cents internally.
- Ensure no page hard-crashes if storage is unavailable (private browsing / quotas).

## Testing Strategy (Strict TDD)

Even for a static site, automated tests are part of the portfolio-quality bar.

### Recommended Tooling

- **Playwright** for end-to-end UI tests, responsive checks, and basic a11y assertions.
- **Node’s built-in test runner** (`node --test`) for pure function tests (calculations, CSV export, date grouping).

If Playwright already exists from another demo, reuse it and add a new test folder for this demo.

### TDD Loop (Non-Negotiable)

For each user story:
1. Write failing tests (unit and/or e2e) describing the expected behavior.
2. Implement the minimal code to pass.
3. Refactor (clean up structure, remove duplication, improve performance) without behavior changes.
4. Run the full test suite before moving on.

### Minimum Test Matrix (Must Cover)

- App loads (all pages) with no console errors.
- First-run seeding:
  - Sample data appears on first run when storage is empty.
  - After reset-to-empty, the app stays empty on reload (no forced reseed).
- Transaction creation:
  - Valid submit creates transaction, persists, and appears in list.
  - Invalid submit shows accessible errors and does not persist.
  - Supports both income and expense; net summary updates correctly.
- Delete/undo flow:
  - Delete removes row; undo restores; state persists after reload.
- Date range filtering:
  - “This month” shows only matching rows.
  - Custom range includes boundaries correctly.
- Calculations:
  - Totals and category breakdowns match fixtures.
  - Budget progress calculation is correct across ranges and categories.
- Charts:
  - Correct number of bars/points render for given fixture.
  - Text/table equivalents reflect computed values.
- CSV export:
  - File content has correct headers and escaping (commas/quotes/newlines).
- A11y basics:
  - One `h1` per page, skip link present, focus visible, form labels exist.
- Responsive:
  - Key layouts pass at 360×800, 768×1024, 1280×720 viewports.

## User Stories + Acceptance Criteria (TDD Targets)

### Story 1 — Add a transaction

**As a user**, I can add an income or expense transaction with date, amount, category, and note so that I can track my finances.

**Acceptance Criteria**
- Submitting valid data adds the transaction to the list immediately.
- Transaction persists after refresh.
- Amount is stored as cents and displayed as formatted currency.
- Type is recorded and reflected in totals (income increases net; expense decreases net).
- Validation errors are announced and focusable when present.

### Story 2 — View and filter transactions

**As a user**, I can filter transactions by date range so I can review a specific period.

**Acceptance Criteria**
- “This month” and “Last month” filters work as expected.
- Custom range includes start/end dates (inclusive).
- The UI shows a clear empty state when no transactions match.

### Story 3 — Set a monthly budget and track progress

**As a user**, I can set a monthly budget and see progress so I can stay on target.

**Acceptance Criteria**
- Setting a budget persists and is visible on dashboard.
- Progress indicates remaining vs overspent with clear visuals and text.
- Overall budget works alongside category budgets (both can be active; no hidden coupling).

### Story 4 — Visualize spending

**As a user**, I can see category breakdown and trends so I can understand patterns quickly.

**Acceptance Criteria**
- Category chart matches computed totals.
- Trend chart shows aggregated values for the selected range.
- Each chart has a text summary and a table view.

### Story 5 — Export to CSV

**As a user**, I can export my transactions to a CSV file so I can use them elsewhere.

**Acceptance Criteria**
- Export generates a valid CSV with header row.
- Special characters in notes are correctly escaped.
- Export uses a sensible filename (e.g., `clearledger-transactions-YYYY-MM-DD.csv`).

### Story 6 — Reset / demo safety

**As a user**, I can reset the demo data so I can start over or remove seeded data.

**Acceptance Criteria**
- Reset requires confirmation and clearly explains what will be removed.
- After reset, the app returns to a valid empty state.

## Phased Implementation Plan (Agent-Executable)

Each phase includes **TDD tasks** and **Acceptance Criteria**. Do not start a phase until the previous phase is green.

### Phase 0 — Scaffold + Test Harness

**TDD first**
- [ ] Add Playwright smoke tests that assert each page loads and has the expected `<title>`.

**Implementation**
- [ ] Create the demo directory and empty pages:
  - [ ] `public/demos/finance-dashboard/index.html`
  - [ ] `public/demos/finance-dashboard/transactions.html`
  - [ ] `public/demos/finance-dashboard/budgets.html`
  - [ ] `public/demos/finance-dashboard/settings.html`
  - [ ] `public/demos/finance-dashboard/404.html`
- [ ] Create `assets/css/style.css` and placeholder `assets/js/*.js`.
- [ ] Add `public/demos/finance-dashboard/README.md`:
  - how to run locally (`make local`)
  - how to run tests
  - fictional/demo disclaimer

**Acceptance Criteria**
- Pages load via `http://localhost:9000/demos/finance-dashboard/`.
- Smoke tests run and pass.

### Phase 1 — Semantic UI Shell + Design Tokens

**TDD first**
- [ ] Tests: each page has one `h1`, a skip link, and landmarks (`header`, `nav`, `main`, `footer`).
- [ ] Tests: theme toggle button exists and is reachable by keyboard.

**Implementation**
- [ ] Build shared header/nav/footer (copied across pages).
- [ ] Establish CSS variables for light/dark themes in `assets/css/style.css`.
- [ ] Create responsive layout primitives (grid for cards, stacked sections on mobile).
- [ ] Add consistent empty states and loading states (even if local-only).

**Acceptance Criteria**
- Usable on mobile and desktop with visible focus styles.
- No layout overflow at 320px.

### Phase 2 — Storage + State (Foundation)

**TDD first (unit tests)**
- [ ] `storage.load()` returns defaults when empty.
- [ ] `storage.save()` persists and round-trips without losing data.
- [ ] Invalid/unknown storage value resets safely (with a recoverable path).
- [ ] If storage is empty and `seededOnce` is false, initial load produces a seeded sample dataset.

**Implementation**
- [ ] Implement `storage.js` with schema versioning and safe parsing.
- [ ] Implement `state.js` with:
  - selectors for totals, breakdowns, and trend series
  - deterministic pure functions for calculations
- [ ] Implement `seed.js` and auto-seed behavior:
  - If no stored state exists, seed sample data and mark `seededOnce=true`, `isSampleData=true`.
  - If the user resets to empty, keep `seededOnce=true` but set `isSampleData=false` and clear transactions/budgets.

**Acceptance Criteria**
- Refresh keeps data stable.
- No uncaught exceptions when localStorage is blocked (graceful UI banner).
- A new visitor sees a populated dashboard immediately (sample data seeded).

### Phase 3 — Transactions CRUD + Validation

**TDD first**
- [ ] E2E: add a transaction → appears in list → refresh → still present.
- [ ] E2E: invalid form shows accessible errors and does not persist.
- [ ] Unit: amount parsing and cents conversion (edge cases: `$1,234.56`, `12`, `12.3`).

**Implementation**
- [ ] Build transaction form (date, type, amount, category, note).
  - [ ] Render transactions list with delete action and confirmation/undo pattern.
  - [ ] Implement filters (This month / Last month / Custom range).

**Acceptance Criteria**
- Full transactions flow works with keyboard only.
- Empty states are clear (no “blank table” confusion).

### Phase 4 — Budgets + Progress UI

**TDD first**
- [ ] Unit: budget progress calculations (spent vs limit, remaining, overspent).
- [ ] E2E: set a budget → shows progress → refresh → persists.

**Implementation**
- [ ] Build budgets UI (overall + per-category).
- [ ] Show progress bars with text equivalents (“$240 of $500”).
- [ ] Define how “overall” vs “category” budgets relate (recommended: both are independent targets and can be active simultaneously).

**Acceptance Criteria**
- Budget display matches computed totals for the same period.

### Phase 5 — Insights + Charts (SVG)

**TDD first**
- [ ] Unit: category aggregation and time-series aggregation.
- [ ] E2E: chart updates when transactions are added/removed.

**Implementation**
- [ ] Implement `charts.js` to render:
  - category bar chart
  - trend line chart
- [ ] Add chart summaries and `<details>` table equivalents.

**Acceptance Criteria**
- Charts are legible at mobile sizes and still meaningful at desktop.
- Reduced-motion users are not forced into animated chart transitions.

### Phase 6 — CSV Export

**TDD first**
- [ ] Unit: CSV serialization escapes commas/quotes/newlines.
- [ ] E2E: export triggers download with correct filename pattern.

**Implementation**
- [ ] Build CSV export button and download logic.
- [ ] Include the filtered view option (export “current range”) if feasible; otherwise export all and clearly label.

**Acceptance Criteria**
- CSV opens cleanly in common spreadsheet tools.

### Phase 7 — Settings, Reset, Seed Data (Demo Polish)

**TDD first**
- [ ] E2E: reset-to-empty requires confirmation and clears transactions/budgets (without forcing a reseed on reload).
- [ ] E2E: first run seeds sample data automatically when storage is empty.
- [ ] E2E: “Load sample data” repopulates the demo state after reset-to-empty.

**Implementation**
- [ ] Add reset flow and clear explanation text.
- [ ] Reset behavior requirements:
  - Reset-to-empty clears transactions/budgets and sets `isSampleData=false`, but keeps `seededOnce=true` to avoid auto-reseeding.
  - (Optional) Provide “Clear all local data” for debugging, which removes everything (including `seededOnce`).
- [ ] Provide sample dataset controls:
  - auto-seed on first run (default)
  - “Load sample data” button (explicit re-seed)
  - banner/label indicating “Sample data” with a “Start fresh” action
  - sample includes a realistic month of mixed income + expenses + both overall and category budgets

**Acceptance Criteria**
- First-time visitors see meaningful charts and budget progress without creating data.
- Users can reset to an empty state and keep it empty on reload.

### Phase 8 — Accessibility, Performance, Responsiveness, and Portfolio Integration

**TDD / QA first**
- [ ] Playwright: run against multiple viewports.
- [ ] A11y checks: labels, heading order, focus management, color contrast spot checks.

**Implementation**
- [ ] Reduce CLS: reserve space for charts, avoid layout jumps.
- [ ] Optimize CSS/JS: remove unused styles, avoid heavy scripts, keep DOM rendering efficient.
- [ ] Add a portfolio card in `public/portfolio.html`:
  - link: `demos/finance-dashboard/index.html`
  - open in new tab: `target="_blank"` + `rel="noreferrer"`
  - include thumbnail in `public/assets/img/portfolio/`
  - include 2–3 bullet highlights (local-first, charts, export)

**Acceptance Criteria**
- Demo is “portfolio-ready”: fast, accessible, and feels intentional.
- Portfolio link opens the demo in a new tab and the demo has a clear disclaimer.

## Performance Requirements (Portfolio Bar)

- Avoid external JS libraries unless there’s a clear value justification.
- Keep demo JS and CSS small and cacheable.
- No obvious jank during filters or chart updates with ~200 transactions.
- Images (if any) must be optimized and include width/height attributes.

## Risks & Mitigations

- **localStorage unavailable/quota exceeded** → catch errors, show a non-blocking banner, keep app usable in “read-only” mode if needed.
- **Date/timezone edge cases** → store transaction dates as `YYYY-MM-DD` and treat them as local; test boundary days.
- **Float rounding issues** → store `amountCents` integer; unit test parsing/formatting.
- **Chart accessibility** → always provide text summary + table; don’t rely on color alone.
- **Scope creep** → keep to v1 features; log “future enhancements” but don’t implement.

## Portfolio Showcase (How This Appears on LocalByte’s Site)

Add a new card on `public/portfolio.html` (in the existing `.grid`) with:

- Title: “ClearLedger — Personal Finance Dashboard (Demo)”
- One-line value prop: “Local-first budgeting dashboard with charts and CSV export.”
- Highlights list:
  - “Client-side state + localStorage persistence”
  - “Accessible SVG data visualizations”
  - “Mobile-first dashboard layout”
- CTA link: “Open demo” → `demos/finance-dashboard/index.html` (new tab)
- Thumbnail: `public/assets/img/portfolio/finance-dashboard.png` (or similar)

## Confirmed Requirements (Resolved)

1. Seed sample data by default on first run: **Yes**
2. Support income transactions in v1: **Yes**
3. Budgets in v1: **Both overall + per-category**
4. Demo directory slug: **`public/demos/finance-dashboard/`**
