# Event Countdown & Landing Page Generator (Portfolio Demo) — Comprehensive Implementation Plan (TDD)

Build a polished “micro‑SaaS style” tool that generates shareable, customizable countdown landing pages for events (weddings, product launches, conferences). The generator lives as a static demo inside the LocalByte LLC site repo and showcases design quality, accessibility-first implementation, and clean vanilla JavaScript engineering.

**Working product name (invented):** **LaunchClock**  
Tone: conversion-focused, modern, trustworthy, minimal.

## Confirmed Decisions (Client Provided)

- Demo slug/folder: `public/demos/launchclock/`
- Event time: treated as a **fixed moment** using epoch milliseconds (`ts`)
- Email signup: **demo-only** (localStorage), no external submissions
- v1 variety: **3 templates** and **4 palettes**

---

## Executive Summary

**Outcome:** a small, portfolio-worthy tool where a user fills out an event form, selects a template + palette, previews the landing page in real time, and copies a **shareable URL** that renders the same countdown page for anyone.  
**Quality bar:** fast (Lighthouse-friendly), accessible (WCAG-minded), responsive (320px+), and regression-protected via automated tests written first (strict TDD).

---

## Primary Goals (What “Done” Looks Like)

- Generator produces a valid, shareable link that reproduces the configured landing page (event details + template + colors).
- Countdown page updates smoothly every second, but does **not** spam screen readers.
- Keyboard + screen reader usability is excellent (labels, focus, error summaries, semantic structure).
- Looks like a real landing page someone could actually use (strong hierarchy, CTA-ready layout).
- Performance is strong on mobile (small JS/CSS, no heavy dependencies).
- Easy to showcase from `public/portfolio.html` via a new card that opens the demo in a new tab.

---

## Scope

### In Scope (v1 Must Have)

- **Generator**
  - Event form: name, date/time, optional description, optional CTA (label + URL).
  - Template selection (at least 3 distinct layouts).
  - Palette selection (curated palettes; optional “Custom” with validated hex).
  - Live preview (updates as user edits).
  - “Copy link” action with accessible success feedback.
  - Validation (required fields, date must be valid, CTA URL validation if provided).
- **Countdown landing page**
  - Displays event name + description + optional CTA button.
  - Real-time countdown (days/hours/minutes/seconds).
  - Expired state (“This event is live” / “Event started”) with graceful UI.
  - Social sharing actions (Copy link + platform share URLs; optionally Web Share API).
  - URL-based configuration (shareable without localStorage).
- **Non-functional**
  - Accessibility-first patterns + reduced motion support.
  - Responsive layouts for mobile/tablet/desktop.
  - Safe parsing/encoding of URL config (no `innerHTML`, sanitize inputs, strict allowlists).

### Out of Scope (Explicitly Not Doing)

- Accounts, authentication, server persistence, or “dashboard” for managing multiple pages.
- Sending reminder emails or scheduling notifications (static demo limitation).
- True social preview cards per event (Open Graph tags can’t be personalized client-side).
- Payments, analytics dashboards, CRM integrations.

---

## Constraints / Guardrails (Repo Conventions)

- **Vanilla HTML/CSS/JS** (no runtime frameworks, no bundler).
- **JS style:** IIFE, `var`, double quotes, progressive enhancement, minimal global scope.
- **CSS:** custom properties for colors, no hardcoded hex in CSS; dark mode compatible via `data-theme` patterns.
- **Accessibility:** semantic HTML, labels, skip link, visible focus, ARIA only where needed.
- **Motion:** respects `@media (prefers-reduced-motion: reduce)`.

---

## Deliverables (Concrete Artifacts)

- Demo app under: `public/demos/launchclock/`
  - `index.html` (generator + preview)
  - `countdown.html` (shareable landing page)
  - `404.html`
  - `assets/css/style.css`
  - `assets/js/*.js`
  - `README.md` (how to run demo + tests + demo disclaimer)
- Automated tests:
  - Unit tests for URL/config + time calculations (`node --test`)
  - E2E tests for core flows (Playwright)
- Portfolio integration:
  - Add a new card to `public/portfolio.html` linking to `demos/launchclock/index.html` (opens in new tab).
  - Add a thumbnail image under `public/assets/img/portfolio/`.

---

## Information Architecture (IA) / Pages

### `public/demos/launchclock/index.html` — Generator

- Hero/intro: “Create a countdown landing page in minutes.”
- Form panel (left/top on desktop; stacked on mobile).
- Live preview panel (right/bottom).
- “Share link” section with read-only URL field + Copy button.
- Template gallery thumbnails (radio options).
- Palette options (radio options).
- Footer disclaimer: “Demo by LocalByte LLC. Config is stored in the URL; no data leaves your browser.”

### `public/demos/launchclock/countdown.html` — Landing Page

- Event header (name, date/time, description).
- Countdown module (D/H/M/S cards).
- Optional CTA button (e.g., RSVP / Learn More).
- Social share row (Copy link + LinkedIn/X/Facebook + Email).
- Footer with a subtle “Made by LocalByte LLC” link back to portfolio (non-distracting).

### `public/demos/launchclock/404.html`

- Friendly not-found message + link to generator.

---

## Data Model

This demo is primarily **URL-config driven** (shareable). Optional localStorage can be used only for convenience (e.g., remembering the last-used template), but the landing page must render correctly with URL alone.

### URL Configuration Contract (v1)

Use query parameters with strict validation + sensible defaults.

**Required**
- `name`: event name (string, 1–60 chars)
- `ts`: event timestamp in milliseconds since epoch (integer)

**Optional**
- `desc`: short description (string, 0–180 chars)
- `tpl`: template id (enum: `minimal` | `bold` | `elegant`)
- `pal`: palette id (enum: `teal` | `plum` | `sunset` | `slate`)
- `ctaLabel`: string (0–24 chars)
- `ctaUrl`: absolute URL (`https://...`) (only if label present)

**Why `ts` as epoch ms:** removes timezone ambiguity and avoids fragile datetime parsing across browsers.

### Derived State (Computed, Not Stored)

- Remaining time parts: `{days, hours, minutes, seconds}` computed from `Date.now()` and `ts`.
- Expired flag: `now >= ts`.
- Accessible date display: `Intl.DateTimeFormat` formatting for the viewer’s locale.

---

## UX, Accessibility, and Responsiveness Requirements

### Generator form requirements

- Every input has a `<label for>`, with helper text where needed.
- Validation behavior:
  - On submit / copy link attempt, show an error summary at top if invalid.
  - Inline errors appear next to fields; fields referenced via `aria-describedby`.
  - Focus moves to error summary on failure; users can jump to first invalid field.
- “Copy link” feedback:
  - Use a status region (`role="status"`) to announce “Link copied”.
  - Provide fallback if Clipboard API not available (select text + instruct “Press Ctrl/Cmd+C”).

### Countdown module accessibility

- Do **not** use `aria-live` updating every second (screen reader spam).
- Present values in semantic groups (e.g., list of four “time cards”).
- Provide a static SR-friendly sentence like:
  - “Countdown to {Event Name}. Event date: {formatted date}.”
  - Optionally add a “Refresh remaining time” button for assistive tech users (manual update).

### Responsiveness

- Mobile-first; layout must not break at 320px width.
- Generator uses a single-column flow on mobile; becomes two columns on desktop.
- Landing page maintains readable type scale and button sizes (44px min touch targets).

### Performance targets

- No external JS libraries for the demo’s core features.
- Keep demo JS total ideally under ~30–50KB unminified and CSS under ~30KB (guideline).
- Avoid large images; prefer CSS patterns/gradients and lightweight inline SVG.
- Timer uses a single `setInterval` (1s) and avoids layout thrash (update text only).

---

## Technical Approach & File Structure

### Recommended Demo Folder Layout

```
public/demos/launchclock/
  index.html
  countdown.html
  404.html
  README.md
  assets/
    css/style.css
    js/
      app.js         # shared helpers + init hooks
      url.js         # parse/serialize + validation (pure functions)
      time.js        # countdown calculations (pure functions)
      templates.js   # template + palette registry + applyTheme()
      generator.js   # form binding + live preview + share link generation
      countdown.js   # render from URL + run timer + expired state
    img/             # optional small illustrations or patterns
```

### Implementation notes (agent guidelines)

- Prefer **pure functions** for:
  - parsing + validating query params
  - formatting dates
  - calculating remaining time parts
  - building share URLs
  These are easy to unit test (`node --test`).
- DOM updates:
  - Use `textContent`, not `innerHTML`.
  - Cache DOM references; update only the nodes that change.
- Theme/palette:
  - Apply palette via CSS variables on a root container element (e.g., `--demo-accent`, `--demo-bg`, `--demo-ink`).
  - Ensure curated palettes meet contrast expectations for key text pairs; adjust palette tokens if needed during implementation.

---

## Testing Strategy (Strict TDD)

Even though this is a static site demo, automated tests are a portfolio-quality requirement.

### Tooling (recommended)

- **Unit tests:** Node built-in runner (`node --test`) for pure functions.
- **E2E tests:** Playwright for page flows, responsive checks, and basic accessibility assertions.
- **A11y checks (recommended):** `@axe-core/playwright` for quick “no obvious violations” scanning on key pages.

### Non-negotiable TDD workflow

For each user story:
1. Write failing test(s) that define expected behavior.
2. Implement minimal code to pass.
3. Refactor (improve structure, reduce duplication, performance tweaks).
4. Run the full suite before starting the next story.

### Minimum test matrix (must cover)

**Unit**
- `parseConfig(search)` accepts valid params and returns normalized config.
- Invalid config yields structured errors (field + message).
- `buildShareUrl(config)` round-trips: build → parse reproduces same config.
- Countdown calculations:
  - Handles future and past timestamps correctly.
  - Correct boundary behavior at exact second transitions.

**E2E**
- Generator loads with default sample values and renders preview.
- Editing event name updates preview and share link.
- Copy link button works (or fallback path shows instructions).
- Opening generated `countdown.html?...` renders correct event info + template.
- Countdown decrements (can mock time or wait 2 seconds and assert change).
- Expired event displays “event started” UI.
- Social share links are present and include encoded current URL.
- Basic a11y: one `h1`, labels exist, skip link works, focus visible.
- Responsive: smoke at `360×800`, `768×1024`, `1280×720`.

---

## User Stories + Acceptance Criteria (TDD Targets)

### Story 1 — Generate a shareable countdown link

**As a user**, I can enter event details and generate a shareable URL so others can view the countdown page.

**Acceptance Criteria**
- Event name + date/time are required; missing fields show accessible errors.
- Generated URL includes all required configuration and loads successfully in a new tab.
- The countdown page renders the same values shown in the generator preview.

### Story 2 — Choose templates and palettes

**As a user**, I can pick a template and color palette to match the event style.

**Acceptance Criteria**
- At least 3 templates produce visibly distinct layouts.
- Switching template/palette updates the preview immediately.
- The chosen template/palette is encoded in the share URL and applied on the landing page.

### Story 3 — Countdown updates reliably

**As a visitor**, I see an accurate, real-time countdown so I know how long remains.

**Acceptance Criteria**
- Countdown updates every second without noticeable jitter.
- When the event time is reached, UI switches to an “event started” state.
- No screen reader announcement spam (no per-second `aria-live`).

### Story 4 — Social sharing

**As a visitor**, I can share the landing page via copy/share buttons.

**Acceptance Criteria**
- Copy link works or provides a clear fallback.
- Share links include the current URL and a sensible share message.
- If `navigator.share` is available, “Share…” uses it (optional enhancement).

### Story 5 — Optional email signup (demo-safe)

**As a visitor**, I can sign up for reminders so the organizer can gauge interest.

**Acceptance Criteria**
- Signup form is accessible (label, validation, success message).
- The behavior is clearly labeled as “demo” if it does not send real emails.
- Demo signups are stored locally (localStorage) and can be cleared by the user.

---

## Phased Milestones (Agent-Executable, Test-First)

Each phase has explicit acceptance criteria. Do not proceed until criteria pass.

### Phase 0 — Scaffold + Test Harness

**TDD tasks (write first)**
- Add smoke E2E test: generator and countdown pages load without console errors.

**Implementation tasks**
- Create `public/demos/launchclock/` skeleton pages and `assets/` folders.
- Add test tooling at repo root if not already present:
  - `package.json` with scripts for unit + e2e tests
  - Playwright config that runs against `make local` (or `python3 -m http.server 9000 --directory public`)

**Acceptance Criteria**
- `make local` serves the demo pages.
- Tests run in CI-like mode locally and pass (even if only smoke assertions).

### Phase 1 — Semantic HTML + Base Styling

**TDD tasks (write first)**
- Assert each page has landmarks, skip link, and a single `h1`.
- Assert form inputs have labels on the generator.

**Implementation tasks**
- Implement semantic structure for generator and landing page.
- Create demo design tokens in `public/demos/launchclock/assets/css/style.css`:
  - spacing scale, type scale, component styles, focus styles
  - light + dark-ready variables and template/palette variables

**Acceptance Criteria**
- Pages are readable and usable at 320px and 1280px.
- Keyboard navigation is smooth with visible focus.

### Phase 2 — URL Config + Validation (Unit-Test Driven)

**TDD tasks (write first)**
- Unit tests for `parseConfig`, `validateConfig`, and `buildShareUrl`.
- Unit tests for rejection of invalid values (missing `name`, invalid `ts`, invalid palette/template).

**Implementation tasks**
- Implement `assets/js/url.js` as pure functions + structured error output.
- Implement `assets/js/time.js` for countdown calculation + formatting helpers.

**Acceptance Criteria**
- Unit tests cover all config edge cases and pass.
- Countdown page shows a helpful error state when URL is invalid, with a link back to generator.

### Phase 3 — Generator: Live Preview + Share Link (E2E-Test Driven)

**TDD tasks (write first)**
- E2E test: editing fields updates preview text.
- E2E test: clicking “Copy link” produces a URL that loads the correct countdown page.

**Implementation tasks**
- Bind form inputs to in-memory draft config (no storage required).
- Render preview using the same rendering function used by the landing page (avoid drift).
- Implement copy-to-clipboard with fallback selection behavior.

**Acceptance Criteria**
- Generator reliably produces a working share link across templates/palettes.
- Validation prevents creating invalid URLs.

### Phase 4 — Countdown Page: Timer + Expired State + Sharing

**TDD tasks (write first)**
- E2E test: countdown value changes after 2 seconds.
- E2E test: expired timestamp renders “event started” UI.
- E2E test: social share links include encoded URL.

**Implementation tasks**
- Implement countdown rendering + interval update; stop interval when expired.
- Implement share controls:
  - Copy link
  - X/LinkedIn/Facebook/Email share URLs
  - Optional `navigator.share` enhancement

**Acceptance Criteria**
- Timer is accurate and does not cause layout jank.
- Sharing works on mobile and desktop (with graceful fallback).

### Phase 5 — Templates + Palette Polish + Reduced Motion

**TDD tasks (write first)**
- E2E test: switching templates changes layout class and visible structure.
- E2E test: `prefers-reduced-motion` disables any nonessential animation.

**Implementation tasks**
- Implement 3+ templates with distinct layouts and typography treatment.
- Implement 4 curated palettes (no custom palette in v1).
- Add optional subtle motion (e.g., gentle background gradient shift) gated by reduced motion.

**Acceptance Criteria**
- Templates look genuinely different and professional.
- Reduced motion users get a stable, comfortable UI.

### Phase 6 — Email Signup (Demo-only)

**TDD tasks (write first)**
- E2E test: invalid email shows error; valid email shows success state.

**Implementation tasks**
- Implement demo-only signup:
  - Store signups in localStorage (e.g., `lb.launchclock.signups`) with a max length cap (e.g., last 50).
  - Clearly label “Demo only — no emails are sent.”
  - Provide a “Clear demo signups” action.

**Acceptance Criteria**
- Form is accessible and clearly communicates demo behavior.

### Phase 7 — Portfolio Integration + Documentation

**TDD tasks (write first)**
- E2E test: `public/portfolio.html` contains a link to the demo with `target="_blank"` and `rel="noreferrer"`.

**Implementation tasks**
- Add a new `.portfolio-card` to `public/portfolio.html` linking to:
  - `demos/launchclock/index.html` (open in a new tab)
- Add thumbnail image:
  - `public/assets/img/portfolio/launchclock.png` (1200×675 recommended)
- Add `public/demos/launchclock/README.md`:
  - how to run locally
  - how share links work
  - known limitations (social previews, emails if not real)
  - accessibility notes

**Acceptance Criteria**
- Portfolio page shows the new card and opens the demo in a new tab.
- Demo is presentable and self-explanatory without guidance.

---

## Risks & Mitigations

- **Timezone confusion:** using `datetime-local` can be ambiguous.  
  **Mitigation:** convert creator’s input to epoch ms (`ts`) and store that in the URL; show formatted date/time on landing page; document behavior.
- **URL length:** long descriptions/labels can bloat URLs.  
  **Mitigation:** enforce length limits; keep templates/palettes as short ids; optional “description max 180 chars”.
- **XSS/injection via query params:** dangerous if inserted as HTML.  
  **Mitigation:** use strict validation + `textContent` only; allowlist template/palette ids; enforce length limits; validate CTA URLs (`https://`).
- **Clipboard API availability:** not available in all contexts.  
  **Mitigation:** fallback selection + instructions; always show the URL in a read-only field.
- **Accessibility pitfalls with live timers:** aria-live spam.  
  **Mitigation:** avoid per-second announcements; provide static descriptive text and optional manual refresh.
- **Social share URLs change over time:** platforms adjust endpoints.  
  **Mitigation:** isolate share URL builders; easy to update; provide Copy link as primary share path.

---

## Portfolio Showcase (How it will be featured on localbytellc.com)

- Add a new card to `public/portfolio.html`:
  - Title: “LaunchClock — Countdown Landing Pages”
  - Summary: “Shareable event countdown pages generated in-browser.”
  - Bullets: “URL-based personalization”, “Template + palette theming”, “Accessible, responsive UI”
  - Primary link: `demos/launchclock/index.html` with `target="_blank"` and `rel="noreferrer"` so it opens in a new tab.
- Add a thumbnail at `public/assets/img/portfolio/launchclock.png` (matching the existing 1200×675 portfolio imagery style).

---

## Remaining Clarification (Please Confirm)

- CTA button: **include in v1**, and restrict CTA URLs to **`https://` only**.
