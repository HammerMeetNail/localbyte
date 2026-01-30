# Local Coffee Shop Website (Portfolio Demo) — Comprehensive Implementation Plan (TDD)

Build a polished, fictional local coffee shop website that demonstrates LocalByte LLC’s design + development quality and is suitable to feature on `localbytellc.com/portfolio`.

## Executive Summary

**Outcome:** a production-ready, mobile-first small-business website (multi-page) with tasteful motion, an interactive menu filter, a reservation/order inquiry form, location + hours with map embed, and an Instagram-style feed (with a no-API fallback).  
**Quality bar:** accessible (WCAG-minded), fast (Lighthouse-friendly), and regression-protected via automated tests written first (TDD).

## Primary Goals (What “Done” Looks Like)

- Looks and feels like a real, premium local coffee shop brand (not a template).
- Works on mobile → tablet → desktop; no broken layouts at 320px.
- Interactive features are keyboard accessible and respect `prefers-reduced-motion`.
- No “fake” dead-ends: forms validate, submit flow provides clear feedback, and map/location links work.
- Automated tests cover the critical user journeys and prevent regressions.
- Easy to showcase: one link from `public/portfolio.html` + one screenshot thumbnail.

## Scope

### In Scope (Must Have)

- **Pages**
  - Home (`index.html`): hero + story + highlights + CTA.
  - Menu (`menu.html`): filterable menu with categories.
  - Visit (`visit.html`): hours + location + embedded map + contact actions.
  - Order/Reserve (`order.html`): reservation / order inquiry form with validation + confirmation state.
  - 404 (`404.html`): friendly fallback + link home.
- **Features**
  - Hero “parallax-like” motion (progressive, reduced-motion safe).
  - Menu filtering by category with accessible controls and URL state (shareable filter).
  - Form handling: client-side validation, success state, and spam-honeypot field.
  - Map embed (Google Maps iframe) + fallback link.
  - Instagram-style feed integration with graceful fallback (no credentials required).
- **Non-Functional**
  - Accessibility: skip link, focus states, semantic landmarks, ARIA only where needed.
  - Performance: optimized images, minimal JS, lazy-loading where appropriate.
  - SEO: metadata + basic LocalBusiness schema.

### Out of Scope (Explicitly Not Doing)

- Real payment processing / ecommerce checkout.
- Real-time inventory.
- True Instagram API integration requiring auth/refresh tokens (we’ll design an upgrade path).

## Constraints / Guardrails (Match LocalByte Style)

- Vanilla HTML/CSS/JS; no runtime frameworks.
- Keep JS in IIFEs, use `var`, and prefer progressive enhancement.
- Ensure motion respects `@media (prefers-reduced-motion: reduce)`.
- Avoid hardcoded colors; use CSS custom properties.
- Ensure all images have appropriate `alt`; decorative SVG uses `aria-hidden="true"` + `focusable="false"`.

## Deliverables (Concrete Artifacts)

- Demo site implemented under a dedicated folder (recommended):
  - `public/demos/coffee-shop/` (own `assets/` so the demo design stays independent from LocalByte site styles).
- Automated test suite (recommended Playwright) + clear “how to run” docs.
- Portfolio integration:
  - Add a portfolio card in `public/portfolio.html` linking to the demo.
  - Add a thumbnail image under `public/assets/img/portfolio/`.
- Short case-study blurb (1–2 paragraphs) for the portfolio card and/or a dedicated case-study page.

## Brand + Content (Fictional)

Create a fictional brand that feels local and credible.

**Chosen brand (agent may refine):**
- Name: “Cedar & Steam Coffee”
- Vibe: warm, craft, neighborhood; not rustic kitsch
- Differentiators: seasonal pours, pastries, community events, fast pickup
- Location: pick a believable neighborhood/city (fictional or generic) and keep it consistent.

**Copy guidelines**
- Short, scannable, benefit-driven.
- CTAs: “Order ahead”, “Reserve a table”, “Get directions”.
- Avoid lorem ipsum; use real-sounding microcopy.

## Information Architecture & UX Requirements

### Global Header/Footer
- Header: logo + primary nav + prominent CTA (Order/Reserve).
- Mobile nav: accessible toggle, traps no focus, closes on outside click + Escape.
- Footer: hours summary, address, phone, socials, small disclaimer (“Fictional demo site by LocalByte LLC”).

### Home (`index.html`)
- Hero: large brand statement + CTA buttons + visually rich background.
- Highlights: 3 cards (e.g., “Seasonal specials”, “Order ahead”, “Community nights”).
- “Featured items” preview (3 menu items linking to `menu.html`).
- Social proof block (fictional reviews) with clear “fictional demo” note.

### Menu (`menu.html`)
- Filter controls as a button group:
  - “All”, “Coffee”, “Tea”, “Pastries”, “Seasonal”.
  - Keyboard: Tab to controls; Enter/Space activates.
  - ARIA: `aria-pressed` on filter buttons.
- Each menu item card:
  - Name, short description, dietary tags, price.
  - Optional “Add to order inquiry” (adds to a client-side summary on `order.html`).
- URL state:
  - `?category=coffee` preselects Coffee on load.

### Visit (`visit.html`)
- Hours displayed as a semantic table or definition list.
- Address + “Get directions” (map link).
- Embedded map iframe with `title` attribute; provide a text fallback link near it.
- Contact actions: `tel:` and `mailto:` links.

### Order/Reserve (`order.html`)
- Single form with a switch:
  - Reservation: date, time, party size, name, phone/email.
  - Order inquiry: pickup time, items, notes, contact fields.
- Validation:
  - Required fields with inline error messages.
  - Accessible error summary at top on submit.
- Success state:
  - Replace form with confirmation content + “Start over” button.
- Spam protection:
  - Honeypot input hidden visually but present in markup.

### 404 (`404.html`)
- Friendly messaging + quick nav back to key pages.

## Technical Approach (No Build Step)

### Suggested File/Folder Layout

```
public/demos/coffee-shop/
  index.html
  menu.html
  visit.html
  order.html
  404.html
  assets/
    css/style.css
    js/app.js
    js/menu.js
    js/order.js
    data/menu.json
    data/instagram.json
    img/...
```

### Data Sources
- `menu.json`: canonical list of menu items + categories + tags.
- `instagram.json`: a small curated set of “posts” (image + caption + link). This avoids API keys while still demonstrating an integration pattern.

### Progressive Enhancement
- Base content is visible without JS where feasible (menu items can be server-rendered in HTML with JS enhancing filtering).
- If dynamic rendering from JSON is chosen, include a “noscript” message and ensure the page still provides contact/order paths.

## Testing Strategy (TDD-First)

Use an automated test runner even for a static site. Recommended: **Playwright** for behavior + accessibility + visual checks.

### Test Levels

1. **Smoke tests**: pages load, no console errors.
2. **Behavior tests**: filters, nav, form validation, success state.
3. **Accessibility checks**: core pages have no obvious violations (axe-based).
4. **Visual regression** (optional but strong for a portfolio demo): stable screenshots at key viewports.

### TDD Loop (Non-Negotiable)

For each user story:
1. Write failing test(s) describing the behavior.
2. Implement the minimal code to pass.
3. Refactor for clarity/performance without changing behavior.
4. Re-run the full suite and only then move on.

### Minimum Test Matrix (Must Cover)

- Navigation
  - Mobile menu opens/closes; Escape closes; click outside closes.
  - Active link state is correct per page.
- Hero motion
  - Parallax effect changes position on scroll.
  - With reduced motion enabled, parallax is disabled.
- Menu filtering
  - Filter buttons update visible items.
  - `?category=` preselects a filter.
  - `aria-pressed` updates correctly.
- Order/Reserve form
  - Required fields show errors on submit.
  - Valid submit shows success state and clears errors.
  - Honeypot blocks submission (test fills honeypot and expects rejection).
- Visit page map
  - Iframe present with `title`.
  - “Get directions” link exists and uses an address query.
- Instagram feed
  - Feed renders N items from `instagram.json`.
  - If fetch fails, fallback UI is shown.

## Phased Implementation Plan (Agent-Executable)

Each phase includes **Acceptance Criteria** and **TDD tasks**. Do not start a phase until the previous phase’s acceptance criteria pass.

### Phase 0 — Project Setup + Test Harness

- [ ] Create `public/demos/coffee-shop/` scaffold with empty pages and assets folders.
- [ ] Add a Playwright test setup (recommended at repo root):
  - [ ] `package.json` with `test` script.
  - [ ] `playwright.config.*` configured to run against the local server.
  - [ ] `tests/coffee-shop/*.spec.*` initial smoke tests.
- [ ] Add developer docs:
  - [ ] `public/demos/coffee-shop/README.md` (how to run demo + tests, asset credits, fictional disclaimer).

**Acceptance Criteria**
- A local server can serve the demo pages.
- Smoke tests run and pass (even if they only assert 200 + title).

### Phase 1 — Semantic HTML Skeleton + Global Styles

**TDD first**
- [ ] Test: each page has a single `h1`, includes skip link, and has semantic landmarks (`header`, `nav`, `main`, `footer`).
- [ ] Test: no major console errors on load.

**Implementation**
- [ ] Build header/footer components and copy across pages.
- [ ] Establish CSS design tokens in `assets/css/style.css`:
  - [ ] color variables (light + dark optional)
  - [ ] typography scale
  - [ ] spacing scale
  - [ ] focus styles
- [ ] Implement responsive grid utilities used by sections.

**Acceptance Criteria**
- All pages are navigable and readable at 320px and 1280px.
- Keyboard-only navigation is usable (visible focus, logical tab order).

### Phase 2 — Home Page Hero + Reduced-Motion-Safe Parallax

**TDD first**
- [ ] Test: scrolling changes hero background/layer transform.
- [ ] Test: with reduced motion enabled, transform remains static.

**Implementation**
- [ ] Implement parallax as a subtle transform on a hero layer (not full-screen jank).
- [ ] Gate motion behind `prefers-reduced-motion` and avoid work when hero is offscreen.
- [ ] Add micro-interactions (button hover, subtle reveal) respecting reduced motion.

**Acceptance Criteria**
- Motion is smooth on modern devices and disabled for reduced-motion users.
- No CLS spikes from hero media loading (reserve image dimensions).

### Phase 3 — Menu Page + Filter UI

**TDD first**
- [ ] Test: category buttons filter menu items correctly.
- [ ] Test: `aria-pressed` updates correctly.
- [ ] Test: `?category=` selects initial filter and updates UI.

**Implementation**
- [ ] Decide rendering approach:
  - [ ] Preferred: render menu items in HTML; JS enhances filtering.
  - [ ] Alternate: render from `menu.json` (add `noscript` guidance).
- [ ] Implement filter logic and keep it readable/testable.
- [ ] Add “dietary tags” styling and accessible labeling.

**Acceptance Criteria**
- Filtering works on mobile and desktop; no horizontal scroll.
- Menu remains usable with JS disabled (preferred path).

### Phase 4 — Order/Reserve Form + Validation + Confirmation

**TDD first**
- [ ] Test: required fields show inline errors and an error summary.
- [ ] Test: valid input shows confirmation and resets state.
- [ ] Test: honeypot submission is rejected.

**Implementation**
- [ ] Implement form modes (reservation vs order inquiry) with clear toggles.
- [ ] Implement accessible validation messaging:
  - [ ] `aria-invalid`, `aria-describedby` pointing at error text.
  - [ ] error summary links to invalid fields.
- [ ] Implement demo-only confirmation state (replace form content; no network calls).
- [ ] Optional: persist draft form values in `sessionStorage` (nice UX).

**Acceptance Criteria**
- Form can be completed fully with keyboard only.
- Validation messages are readable and specific (not generic “invalid”).

### Phase 5 — Visit Page (Hours + Map + Contact)

**TDD first**
- [ ] Test: hours are present and parseable (table/definitions exist).
- [ ] Test: map iframe has a `title`.
- [ ] Test: “Get directions” link exists and points to a map query.

**Implementation**
- [ ] Build hours component with holiday note (fictional).
- [ ] Embed map + add clear fallback link under it.
- [ ] Add contact actions (`tel:` / `mailto:`).

**Acceptance Criteria**
- Visit page provides at least 2 ways to get directions (embed + link).

### Phase 6 — Instagram-Style Feed (No-API Fallback)

**TDD first**
- [ ] Test: feed renders items from `instagram.json`.
- [ ] Test: if fetch fails, fallback gallery shows instead.

**Implementation**
- [ ] Render a grid of images + captions with accessible link text.
- [ ] If “real integration” is desired later, document the swap:
  - [ ] replace `instagram.json` generation with a serverless function or build-time fetch.

**Acceptance Criteria**
- Feed displays consistently without third-party widgets.
- No broken layout when images fail to load (use aspect-ratio).

### Phase 7 — Polish Pass (A11y, Performance, Visual QA)

**TDD / QA**
- [ ] Add axe checks per page (or a subset if time-boxed).
- [ ] Optional: add snapshot tests for key pages at 3 viewports (mobile/tablet/desktop).
- [ ] Run Lighthouse manually (or via CI) and fix the top issues:
  - [ ] compress/resize images
  - [ ] ensure text contrast passes
  - [ ] avoid large JS payloads

**Acceptance Criteria**
- No critical accessibility violations in automated checks.
- Lighthouse targets (reasonable for static):
  - Performance 90+
  - Accessibility 95+
  - Best Practices 95+
  - SEO 90+

### Phase 8 — Showcase on LocalByte Portfolio

- [ ] Add a new portfolio card in `public/portfolio.html`:
  - [ ] Title: “Local Coffee Shop (Concept)”
  - [ ] 1–2 sentence blurb + 3 bullets of outcomes
  - [ ] Link to demo path (`demos/coffee-shop/index.html`) and open in a new tab (`target="_blank"` + `rel="noreferrer"`).
- [ ] Add a thumbnail screenshot to `public/assets/img/portfolio/`.
- [ ] Optional: add a short “case study” page under `public/` (e.g., `coffee-shop-case-study.html`) and link it from the portfolio card.

**Acceptance Criteria**
- Portfolio page clearly labels this as a “concept/demo” and links work.
- Demo loads quickly and feels aligned with LocalByte quality bar.

## Risks & Mitigations

- **Instagram API complexity** → Use curated JSON now; document upgrade path.
- **Parallax performance on mobile** → Keep subtle, disable for reduced motion, and stop updates when offscreen.
- **Form “submission” without backend** → Implement a demo confirmation flow; optionally integrate Netlify Forms when deployed.
- **Asset licensing** → Use self-created SVG/illustrations or properly licensed photos with attribution in README.

## Confirmed Decisions

- Demo location: `public/demos/coffee-shop/`
- Coffee shop name: agent-invented (use “Cedar & Steam Coffee” unless a better name emerges during design)
- Portfolio link behavior: open in a new tab
- Order/reserve submission: demo-only confirmation (no backend/network)
