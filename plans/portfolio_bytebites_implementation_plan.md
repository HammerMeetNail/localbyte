# Recipe Book with Search & Filtering (Portfolio Demo) — Comprehensive Implementation Plan (TDD)

Build a polished, content-rich recipe collection demo that showcases LocalByte LLC’s design and front-end engineering: instant search, multi-facet filtering, favorites, print-friendly recipes, ingredient scaling, and a step-by-step cooking mode. Everything runs client-side (static hosting friendly) and follows this repo’s vanilla HTML/CSS/JS conventions.

**Working product name (invented):** **ByteBites Recipe Book**  
**Demo folder/slug:** `public/demos/bytebites/`  
Tone: warm, modern, editorial, “cookbook-quality” UI with fast interactions.

---

## Confirmed Decisions (Client Provided)

- Demo folder/slug: `public/demos/bytebites/`
- Seeded dataset size (v1): 10–12 recipes (no specific cuisine/diet preferences; include a balanced variety)
- Routing (v1): single template page `recipes/recipe.html?id=...` (plus `cook.html?id=...`)
- Search semantics (v1): **any token** (OR) matching by default
- Filter persistence (v1): persist search + filters via `localStorage`
- Ingredient scaling display (v1): cookbook-style **fractions when sensible**, otherwise short decimals
- Cooking mode (v1): include **jump to step** UI

---

## Executive Summary

**Outcome:** a small “recipe hub” website that feels real: browse recipe cards, search instantly, filter by cuisine/diet/time/difficulty, favorite recipes (localStorage), open a recipe detail page, scale ingredients by servings, print cleanly, and cook hands-free with a focused step-by-step mode.

**Quality bar:** Lighthouse-friendly performance, accessibility-first patterns, and responsive design from 320px up—backed by automated tests written first (strict TDD).

---

## Primary Goals (Definition of Done)

- **Search + filtering feels instant** (no jank) on a mid-range mobile device.
- **Favorites persist** via `localStorage` with graceful failure handling (private mode / blocked storage).
- **Recipe detail pages are printable** and still readable in dark mode.
- **Ingredient scaling is trustworthy** (repeatable, predictable rounding, clear units).
- **Cooking mode is distraction-free** and fully keyboard accessible.
- **Accessibility**: semantic structure, proper labels, visible focus, non-color indicators, reduced-motion support.
- **Portfolio-ready**: includes a compelling thumbnail + card on `public/portfolio.html` that opens the demo in a new tab.

---

## Scope

### In Scope (v1 Must Have)

- Browseable recipe library (cards with image, time, difficulty, tags)
- Instant search (title + ingredient + tag keyword matching)
- Filtering facets:
  - Cuisine (single-select)
  - Dietary restrictions (multi-select)
  - Cook time (max minutes)
  - Difficulty (single-select)
- Favorites system (localStorage) with “Favorites only” view/toggle
- Recipe detail view:
  - Ingredients + steps
  - Ingredient scaling by servings
  - Print-friendly layout (`@media print`)
  - Structured data (schema.org Recipe, JSON-LD)
- Step-by-step cooking mode:
  - One step at a time + next/previous controls
  - Progress indicator
  - Keyboard support (arrows, Enter/Space on buttons, Esc to exit)
- Performance + responsiveness + accessibility requirements (see below)

### Out of Scope (Explicitly Not Doing)

- User accounts, syncing, or backend persistence
- User-submitted recipes / uploads
- Payments, ads, affiliate links, or real ecommerce flows
- Full nutrition calculations or allergen guarantees
- Ingredient unit conversion (metric↔imperial) unless explicitly requested

---

## Constraints / Guardrails (Repo Conventions)

- **Vanilla HTML/CSS/JS** only; no runtime frameworks or bundlers.
- **JavaScript style:** IIFE, `var`, double quotes, progressive enhancement, minimal globals.
- **CSS:** color via custom properties; avoid hardcoded hex/rgb (except transparent overlays as needed).
- **Accessibility-first:** semantic HTML, correct label/field associations, ARIA only when necessary.
- **Motion:** respect `prefers-reduced-motion`.
- **Theme:** demo must look good in both light and dark themes (`data-theme` approach).

---

## User Stories + Acceptance Criteria (v1)

### US1 — Browse Recipes
**As a visitor**, I can scan recipe cards with key metadata to decide what to open.

Acceptance criteria:
- Cards show title, short description, cook time, difficulty, and tags.
- Card images have `alt`, fixed `width`/`height`, and `loading="lazy"` where appropriate.
- Cards are keyboard accessible (link focus visible; no “click-only” affordances).

### US2 — Search Recipes
**As a visitor**, I can type in a search field and instantly see matching recipes.

Acceptance criteria:
- Search matches on title, tags, and ingredient names (case-insensitive).
- Updates are debounced and don’t lag while typing.
- Result count updates in a screen-reader-friendly way (no noisy announcements on every keystroke).
- “No results” state is helpful and suggests clearing filters.

### US3 — Filter Recipes
**As a visitor**, I can filter recipes by cuisine/diet/cook time/difficulty.

Acceptance criteria:
- Filters are keyboard-operable and properly labeled.
- Active filters are visible and removable (clear-all + per-filter clear).
- Filter state reflects in the UI consistently, including after refresh.

### US4 — Favorite Recipes
**As a visitor**, I can favorite recipes and later view favorites.

Acceptance criteria:
- Favorite toggles use `aria-pressed` and a non-color indicator.
- Favorites persist in `localStorage` under a namespaced key.
- A “Favorites only” mode shows only favorites and clearly indicates it’s enabled.

### US5 — View and Print a Recipe
**As a visitor**, I can open a recipe detail view and print it cleanly.

Acceptance criteria:
- Detail view has a clear heading hierarchy and semantic sections.
- Print view hides navigation/filter UI and prints ingredients/steps legibly.
- Print output includes recipe title and source (“ByteBites demo by LocalByte LLC”).

### US6 — Scale Ingredients
**As a cook**, I can change servings and ingredient amounts update predictably.

Acceptance criteria:
- Default servings match the recipe base.
- Scaling factor is applied consistently to all scalable ingredients.
- Display formatting is sensible (fractions for common denominators or short decimals; clear rounding rules).
- Non-scalable items (e.g., “to taste”) remain unchanged.

### US7 — Step-by-Step Cooking Mode
**As a cook**, I can follow one instruction at a time with simple controls.

Acceptance criteria:
- Large, high-contrast step text and big tap targets.
- Next/previous buttons + keyboard navigation work.
- Progress indicator (e.g., “Step 3 of 8”) updates correctly.
- Exiting cooking mode returns focus to the invoking control on the recipe page (or provides a clear back link).

---

## Information Architecture (IA) / Pages

Proposed under `public/demos/bytebites/`:

- `index.html` — Browse + search + filters + favorites-only toggle
- `recipes/` (folder)
  - `recipe.html` (single template page using `?id=` routing)
- `cook.html` — Cooking mode (loads recipe by `?id=`)
- `404.html` — Friendly not found + link back to `index.html`
- `README.md` — Demo purpose, privacy note, and test instructions

Navigation:
- Minimal header with “Back to Portfolio” link to `../../portfolio.html`
- Optional “Home” link to `../../index.html`

---

## Data Model (Client-Side)

> Use a single source of truth for recipes to avoid drift.

### Recipe object (canonical)

Required fields (v1):
- `id` (string, URL-safe slug)
- `title`
- `description`
- `image` (path + alt text)
- `cuisine` (single)
- `dietTags` (array, e.g., `"vegetarian"`, `"gluten-free"`)
- `difficulty` (`"easy" | "medium" | "hard"`)
- `prepMinutes`, `cookMinutes` (numbers)
- `servings` (base servings number)
- `tags` (array, e.g., `"weeknight"`, `"meal-prep"`)
- `ingredients` (array of items; see below)
- `steps` (array of strings or structured steps)

Ingredient item shape (v1):
- `amount` (number or `null` for “to taste”)
- `unit` (string, e.g., `"g"`, `"tbsp"`, `"cup"`, `"clove"`)
- `name` (string, e.g., `"garlic"`)
- `note` (optional string, e.g., `"minced"`)
- `scalable` (boolean; default `true`)

Computed fields:
- `totalMinutes = prepMinutes + cookMinutes`

### Favorites

- Storage key: `lb.bytebites.favorites`
- Value: JSON array of recipe IDs (deduped)
- Safety: always wrap `localStorage` reads/writes in `try/catch`

### Filter persistence (confirmed)

- Storage key: `lb.bytebites.filters`
- Value: JSON for selected filters + search query (include a small `version` field; if parsing fails, reset safely)

---

## UX / Accessibility Requirements (Non-Negotiable)

- **Skip link** at top of each page.
- **Visible focus** for all interactive elements; no focus traps.
- **Labels**: every input has an associated `<label>`; group facets in `<fieldset><legend>`.
- **Announcements**: result count uses a polite live region but is throttled (e.g., announce after debounce).
- **Icons**: decorative SVG uses `aria-hidden="true"` and `focusable="false"`.
- **Tap targets**: minimum ~44px where possible for mobile.
- **Reduced motion**: disable/limit animations when `prefers-reduced-motion: reduce`.
- **Color contrast**: meet WCAG AA for text; use non-color cues for selected/favorited state.

---

## Performance + Responsiveness Requirements

- **Responsive layouts**: 320–720px mobile, 720–1024px tablet, 1024px+ desktop.
- **Image performance**:
  - Use appropriately sized images (avoid huge originals).
  - Always include `width`/`height` attributes to reduce CLS.
  - `loading="lazy"` for offscreen images on the list page.
- **JS performance**:
  - Avoid heavy libraries; keep logic O(n) for small datasets.
  - Debounce search input (e.g., 100–200ms).
  - Use event delegation where reasonable.
- **CSS performance**:
  - Use CSS Grid for cards; avoid expensive box-shadow stacks.
  - Prefer transitions on `transform`/`opacity`.

---

## Technical Approach

### Proposed file structure

```
public/demos/bytebites/
  index.html
  cook.html
  404.html
  recipes/
    recipe.html            # ?id= routing template
  assets/
    css/
      style.css
    js/
      core.js              # pure functions (testable)
      storage.js           # localStorage wrapper
      data.js              # seeded recipe dataset
      index.js             # browse/search/filter/favorites UI
      recipe.js            # recipe detail UI + scaling + JSON-LD
      cook.js              # cooking mode UI
    img/
      recipes/             # optimized thumbnails/hero images (small set)
  README.md
```

Notes:
- Keep demo CSS isolated under `public/demos/bytebites/assets/css/style.css`.
- Reuse the site’s theme mechanism:
  - Include the small inline “load theme from localStorage” snippet in `<head>`.
  - Optionally reuse `../../assets/js/theme.js` if including a theme toggle UI; otherwise just honor `data-theme` so the demo matches the user’s chosen theme.

### Rendering strategy (recommended for v1)

- **Seeded dataset** in `assets/js/data.js` as a JS array (no network fetch needed).
- Use a single template detail page (`recipes/recipe.html?id=...`) to avoid generating many files.
- Generate **schema.org Recipe JSON-LD** on page load from the recipe object (insert a `<script type="application/ld+json">` node).

### Search strategy

- Build a normalized “search text” per recipe:
  - `title + tags + ingredient names + cuisine + dietTags`
- Implement:
  - `normalizeText(str)` → lowercase, trim, collapse whitespace
  - `recipeMatchesQuery(recipe, query)` → token includes-any (OR) matching by default
- Debounce input; update results count after debounce completes.

### Filtering strategy

- Implement a single predicate:
  - `recipeMatchesFilters(recipe, filters)` where `filters` includes cuisine, dietTags, maxMinutes, difficulty, favoritesOnly.
- Order operations for efficiency:
  1) quick numeric filters (time)
  2) exact-match facets (cuisine/difficulty)
  3) tag arrays (dietTags)
  4) search match

### Favorites strategy

- `storage.js` provides:
  - `safeGet(key)` / `safeSet(key, value)` / `safeRemove(key)`
  - `loadFavorites()` / `toggleFavorite(id)`
- UI:
  - Favorite toggle button on each card and on recipe page
  - Use `aria-pressed="true|false"` + text label (`"Save"`/`"Saved"`)

### Ingredient scaling strategy

- Provide servings input (`type="number" inputmode="numeric"`) with min/max and step.
- Scaling function:
  - `scaleAmount(amount, factor)` with rounding rules:
    - For small decimals, convert to common fractions (1/2, 1/3, 1/4, 2/3, 3/4) when close.
    - Otherwise use up to 2 decimal places and trim trailing zeros.
- Ingredient display:
  - Never scale ingredients with `amount === null` or `scalable === false`.
  - Keep unit/name/note stable and readable.

### Cooking mode strategy

- Dedicated `cook.html?id=...`:
  - Pull recipe from `data.js` by id.
  - Render a single step view with next/prev buttons.
  - Maintain current step index in URL hash (optional) for refresh resilience.
- Accessibility:
  - Ensure heading identifies the recipe and current step.
  - Focus management: focus the step container on step change (optional, with care) or keep focus on buttons and update nearby text.

---

## Test Strategy — Strict TDD

This repo currently has no automated tests; add a lightweight dev-only harness and follow Red → Green → Refactor for every milestone.

### Tooling (recommended)

- Unit tests: `node --test` (Node’s built-in test runner)
- E2E tests: Playwright (dev dependency)
- Optional a11y checks: `axe-core` via Playwright injection (dev dependency)

### Making browser code testable (without violating repo conventions)

- Put all pure functions into `public/demos/bytebites/assets/js/core.js`.
- `core.js` is written as an IIFE and exposes functions for tests via a minimal conditional export:
  - If `module.exports` exists (Node), export a plain object of functions.
  - Otherwise, attach a single namespace on `window` (e.g., `window.ByteBitesCore`) used by demo scripts.

### Unit tests (write first)

Create unit tests that cover:
- Text normalization (whitespace, punctuation handling decisions)
- Query matching (tokenization rules; includes-any OR default)
- Filter predicate correctness (diet tags, time, difficulty, cuisine)
- Favorites store behavior (dedupe, toggle, failure handling)
- Ingredient scaling math and formatting (rounding, fractions, “to taste”)
- URL parsing/validation for `?id=` routing (invalid → 404 redirect or message)

### E2E tests (write first per flow)

Playwright tests should cover:
- `index.html`: search narrows results; clear resets; filters combine correctly.
- Favorites: toggle on card persists after reload; favorites-only view works.
- `recipes/recipe.html`: loads by id; scaling updates displayed amounts; print button triggers `window.print` (stubbed) and print CSS hides nav.
- `cook.html`: step navigation works; keyboard shortcuts; exit/back returns.
- Basic a11y smoke checks: presence of labels, skip link, focus-visible on interactive elements.

### TDD loop per milestone

For each feature:
1) Write/extend failing unit test(s) for logic.
2) Write/extend failing e2e test(s) for user-visible behavior.
3) Implement the smallest change to pass.
4) Refactor (remove duplication, simplify, keep IIFE/var/double quotes).
5) Re-run unit + e2e tests before moving on.

---

## Phased Milestones (Agent-Executable)

### Phase 0 — Scaffold + Baseline Quality

Deliverables:
- Create `public/demos/bytebites/` structure and minimal pages.
- Add demo CSS with a small set of layout tokens (spacing, radius, shadows) using CSS variables.
- Add minimal JS entrypoints (empty IIFEs) for index/recipe/cook to establish structure.
- Add test harness scaffolding (package.json + Playwright config) without implementing features.

Tests (first):
- One smoke unit test for `normalizeText`.
- One smoke e2e test that `index.html` loads and has an H1 + search input label.

### Phase 1 — Seeded Recipes + Browse UI

Deliverables:
- `data.js` with a small but varied seed set (proposed 10–12 recipes).
- `index.html` renders recipe cards from data with image, metadata, and “View recipe” links.
- Responsive grid layout + skeleton/loading states (optional).

Tests (first):
- Unit: validate recipe schema shape (required fields present).
- E2E: list page renders N cards; card link routes to recipe detail by `?id=`.

### Phase 2 — Search + Filtering

Deliverables:
- Search input + debounce + results count + empty state.
- Filter UI with semantic `<fieldset>` groups and clear actions.
- Combined filter logic (search + facets).

Tests (first):
- Unit: `recipeMatchesQuery` and `recipeMatchesFilters` with representative fixtures.
- E2E: apply multiple filters; verify correct cards remain; clear all restores.

### Phase 3 — Favorites

Deliverables:
- Favorite toggles on cards and in recipe detail.
- Favorites-only toggle (and optional “Favorites” quick view).
- Resilient storage wrapper with graceful fallback UI if storage unavailable.

Tests (first):
- Unit: `toggleFavorite`, storage read/write failure cases (mocked).
- E2E: favorite persists after reload; favorites-only filters list.

### Phase 4 — Recipe Detail + Scaling + JSON-LD + Print Styles

Deliverables:
- `recipe.html` (template) renders:
  - Title, summary, times, diet tags, ingredients list, steps list
  - Servings control that scales ingredients
  - “Print recipe” control
- Inject JSON-LD Recipe schema from the recipe object.
- Print stylesheet rules that produce clean output.

Tests (first):
- Unit: scaling factor/formatting; JSON-LD builder produces required fields.
- E2E: scaling changes amounts; print hides non-print UI (assert via CSS media emulation if feasible).

### Phase 5 — Cooking Mode

Deliverables:
- `cook.html` loads recipe by id and presents:
  - step text, progress, next/prev controls
  - step list drawer for jump-to-step navigation
- Keyboard shortcuts and clear “Exit” affordance.

Tests (first):
- Unit: step navigation boundary logic.
- E2E: next/prev works; keyboard shortcuts work; exit returns to recipe page.

### Phase 6 — Polish (Performance, A11y, Responsiveness)

Deliverables:
- Audit and refine focus states, contrast, and tap targets.
- Reduced-motion overrides for transitions.
- Image optimization pass (ensure sizes are reasonable).
- Microcopy and empty states improved.
- Add a short `README.md` describing features, privacy (localStorage only), and demo disclaimers.

Tests (first):
- E2E: basic a11y smoke checks; no console errors.

### Phase 7 — Portfolio Integration (Opens in New Tab)

Deliverables:
- Add a new portfolio card in `public/portfolio.html` linking to `demos/bytebites/index.html` with:
  - `target="_blank"` and `rel="noreferrer"`
  - clear label like “ByteBites Recipe Book (Demo)”
  - 2–3 bullet highlights (Search/Filters, Favorites, Print/Cooking Mode)
- Add thumbnail: `public/assets/img/portfolio/bytebites.png` (optimized; fixed width/height attrs used in markup).

Tests:
- E2E (optional): portfolio page contains link and opens correct URL in new tab (assert `href` and `target`).

---

## Risks / Mitigations

- **Scope creep (too many recipes/features):** cap v1 to a small, high-quality set (10–12) and only core interactions.
- **Ingredient scaling edge cases:** constrain ingredient data format; use a clear rounding/fraction policy and test it heavily.
- **Filter UI complexity:** keep facets small and predictable; provide “Clear all”.
- **localStorage failures:** wrap all access in `try/catch`; show non-blocking warning and keep app usable.
- **Image bloat:** use a small number of optimized images; consider tasteful placeholders for the rest.
- **Accessibility regressions:** bake in Playwright + axe smoke checks early; use semantic elements by default.

---

## Portfolio Showcase (How It Will Be Highlighted)

Add a new demo card to `public/portfolio.html`:

- **Title:** ByteBites Recipe Book (Demo)
- **One-liner:** “A fast recipe library with instant search, smart filters, favorites, and cooking mode.”
- **Bullets:** “Facet filtering”, “Ingredient scaling + print styles”, “Accessible step-by-step cooking UI”
- **Link:** `demos/bytebites/index.html` (open in a new tab using `target="_blank"` and `rel="noreferrer"`)
- **Thumbnail:** `public/assets/img/portfolio/bytebites.png`

---

## Clarifications (Resolved)

1) **Name/slug:** keep **ByteBites** and `public/demos/bytebites/`.
2) **Recipe count + variety:** 10–12 seeded recipes; include a balanced variety of cuisines + diet tags.
3) **Routing choice:** single template page (`recipes/recipe.html?id=...`) for maintainability (data drives pages; no duplicated HTML).
4) **Search semantics:** default to **any token** (OR) matching for broader results.
5) **Filter persistence:** persist search/filters across refresh via `localStorage` (`lb.bytebites.filters`).
6) **Scaling display:** use cookbook-style fractions when sensible, with decimal fallback.
7) **Cooking mode extras:** include a “jump to step” list in v1.
