# Disjointed Cleanup Implementation Plan (Outcome-Forward + 6x6)

Goal: make the site feel cleaner and more cohesive by (1) standardizing layout/components across pages, (2) tightening copy using a "six words, six lines" constraint, and (3) reducing visual noise/one-off effects on the homepage.

This plan is written to be executed by an agentic AI. Check off items as you complete them.

## Guardrails

- Tech: vanilla HTML/CSS/JS only (no build tools).
- Maintain accessibility: semantic headings, focus states, ARIA, keyboard nav.
- Maintain theme toggle + mobile menu behavior (`public/assets/js/theme.js`).
- Keep styles in `public/assets/css/style.css` (remove inline styles where possible).
- Outcome-forward messaging: minimize/avoid "AI" as the lead; emphasize results, clarity, trust, and next step.

## Copy System: "6 Words, 6 Lines"

Apply to the intro of each major section (hero + each section header):

- Line 1: headline (<= 6 words)
- Line 2: subhead (<= 6 words)
- Lines 3-6: up to 4 bullets (<= 6 words each)

Notes:
- Prefer noun/verb phrases; avoid clauses.
- Prefer scannable bullets over paragraphs.
- One primary CTA per page (secondary link optional).

## Phase 0: Baseline + Inventory

- [ ] Create a local baseline preview (`make local` or `python3 -m http.server 9000 --directory public`) and visually note the current disjointed areas (home vs inner pages).
- [x] Inventory inconsistencies to fix:
  - [x] Homepage one-off effects/components not used elsewhere (`public/index.html`, `public/assets/css/style.css`).
  - [x] Footer markup differs on homepage vs other pages (`public/index.html` vs `public/services.html` et al).
  - [x] Inline styles exist and should be moved to CSS (`public/index.html`, `public/pricing.html`).
  - [x] Lead capture mismatch: Formspree placeholder on home vs Netlify form on contact (`public/index.html`, `public/contact.html`).

Acceptance:
- You can describe, in 3-5 bullets, what feels visually/structurally inconsistent today and where it lives in code.

## Phase 1: Homepage Restructure (Reduce Competing Priorities)

Primary objective: fewer competing actions; clearer narrative flow.

- [x] Update `public/index.html` to a simpler section stack (target 4-5 blocks total):
  - [x] Hero (short 6x6 copy) + primary CTA (contact) + optional secondary (pricing).
  - [x] Services (3 cards) but tighten copy to be short and outcome-forward.
  - [x] Proof (portfolio teaser: 2 cards + link to `portfolio.html`).
  - [x] Process (4 steps) but make the step descriptions <= 6 words.
  - [x] Final CTA (short 6x6 + button).
- [x] Remove the homepage quick-contact form to reduce clutter and unify lead capture (keep the full form on `public/contact.html`).
  - [x] Replace it with a compact "Get a quote" card (2-4 bullets + CTA button).
- [x] Remove or neutralize home-only visual motifs that make the site feel like two different designs:
  - [x] Disable/remove `.floating-elements` / `.float-plus` usage on home OR implement site-wide consistently (default recommendation: remove from home).
  - [x] Replace the angled `.dark-section` clip-path CTA with a standard `.section` + `.note`/`.card` treatment OR create a reusable "dark section" used across pages (default recommendation: remove/standardize to match inner pages).
  - [x] Remove `.button.pulse` usage on the primary CTA (default recommendation: remove).

Acceptance:
- Homepage has one clear primary CTA and no embedded contact form.
- Homepage section count is reduced and visually matches inner pages more closely.

## Phase 2: Copy Tightening Across Pages (Outcome-Forward)

Target: each page reads like one cohesive brand voice; short, scannable, consistent.

- [x] Rewrite copy on key pages to follow 6x6 for intros and reduce paragraphs:
  - [x] `public/index.html`: hero + section intros.
  - [x] `public/services.html`: each service card = 1 short sentence + 3 bullets max.
  - [x] `public/pricing.html`: each plan = 4 bullets max; remove filler language.
  - [x] `public/portfolio.html`: each item = 1-line outcome + 2-3 bullets (scope/timeline/result).
  - [x] `public/about.html`: reduce to values + short story; remove long paragraphs.
  - [x] `public/contact.html`: tighten hero; keep form labels accessible.
- [x] Standardize terminology across pages:
  - [x] Choose a consistent set: "Website", "Web App", "Care Plan" (or "Management") and use everywhere.
  - [x] Choose one promise for turnaround/support language and reuse.
- [x] De-emphasize AI language:
  - [x] Remove or reduce "AI-assisted" claims where not necessary; keep any mention as a supporting detail, not the headline.

Acceptance:
- Every page hero can be read in ~5 seconds.
- Most sections lead with bullets, not paragraphs.
- Terminology matches across `public/services.html` and `public/pricing.html`.

## Phase 3: Component Consistency (Headers/Footers/Sections)

- [x] Unify footer markup across all pages:
  - [x] Pick the "inner page" footer structure as the single standard (recommended).
  - [x] Update `public/index.html` footer to match exactly (no inline styles).
- [x] Ensure consistent `<main>` structure:
  - [x] Avoid nesting `<footer>` inside `<main>` on the homepage; align structure with other pages.
- [x] Ensure nav active state conventions remain consistent (active link class usage).

Acceptance:
- All pages share the same footer HTML structure and styling.
- Document structure is consistent and semantic (header/main/footer).

## Phase 4: CSS Cleanup (Reduce Noise + Remove Dupes)

Primary objective: reduce the "busy" feeling by limiting special effects and ensuring a single style system.

- [x] Remove inline styles by creating small utility classes or component styles:
  - [x] Replace inline footer spacing/styles in `public/index.html`.
  - [x] Replace inline note margin in `public/pricing.html`.
- [x] Deduplicate CSS in `public/assets/css/style.css`:
  - [x] There are duplicate `.nav-links a.nav-cta` blocks; consolidate into one.
  - [x] Remove unused/legacy selectors if no longer referenced (confirm via ripgrep before deletion).
- [x] Reduce motion + hover intensity:
  - [x] Remove/limit `.button.pulse`.
  - [x] Consider reducing exaggerated hover lifts (`transform: translateY(-5px)` etc.) to a consistent, subtle value.
  - [x] Add `@media (prefers-reduced-motion: reduce)` to disable reveal animations and any remaining motion.
- [x] Keep the design language coherent:
  - [x] Favor the calmer inner-page card system over the home-only decorative effects (unless intentionally made reusable).

Acceptance:
- `public/assets/css/style.css` has no obvious duplicate blocks for the same component.
- Motion respects `prefers-reduced-motion`.
- Visual effects feel consistent across pages.

## Phase 5: Manual QA (No Automated Tests)

- [ ] Run locally and click through all pages:
  - [ ] `public/index.html`
  - [ ] `public/services.html`
  - [ ] `public/pricing.html`
  - [ ] `public/portfolio.html`
  - [ ] `public/about.html`
  - [ ] `public/contact.html`
  - [ ] `public/privacy.html`
  - [ ] `public/terms.html`
- [ ] Theme toggle:
  - [ ] Works on desktop + mobile; persists via `localStorage`.
  - [ ] Toggle does not break the mobile menu behavior.
- [ ] Mobile hamburger menu:
  - [ ] Opens/closes correctly.
  - [ ] Closes on outside click.
  - [ ] Closes on Escape.
  - [ ] Closes after clicking a nav link.
- [ ] Responsive sanity checks:
  - [ ] Mobile (320-720px)
  - [ ] Tablet (720-1024px)
  - [ ] Desktop (1024px+)
- [ ] Form sanity:
  - [ ] `public/contact.html` required fields enforce correctly.
  - [ ] Homepage has no conflicting form handler.

Acceptance:
- No layout regressions across breakpoints.
- Navigation + theme toggle work as before.

## Suggested Execution Order (For The Agent)

- [x] Implement Phase 1 (homepage restructure) first.
- [x] Then Phase 3 (footer + structure consistency) to reduce drift.
- [x] Then Phase 2 (copy pass) once the structure is stable.
- [x] Then Phase 4 (CSS cleanup) after HTML settles.
- [ ] Finish with Phase 5 (manual QA).
