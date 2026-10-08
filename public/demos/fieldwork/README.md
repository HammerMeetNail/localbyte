# Fieldwork — Business Website Plus example

A fictional landscape studio presented as a technical field guide. Original SVG planting plans are illustrative studies, not client work, scaled drawings, or construction documents. The off-white graph-paper canvas, dark forest type, electric-lime annotations, uppercase sans typography, and indexed navigation are local to this demo.

## Eight routes

- `index.html` — typographic masthead, annotated plan spread, and overview.
- `services.html` — garden design, planting design, and garden review.
- `gardens.html` — three explained original concept plans.
- `approach.html` — brief, spatial direction, resolution, and handover.
- `resources.html` — field notes for preparing a useful garden brief.
- `faq.html` — practical scope answers and native disclosures.
- `about.html` — fictional studio principles.
- `inquiry.html` — a progressive project brief, local review, and static handoff.

Every page links to `../../pricing.html#business-plus` and `../../contact.html?service=business-plus`. The central Pricing page owns package amounts. Local styles use `?v=3` and scripts use `?v=2` across all eight routes.

## Tier boundary

Eight connected content pages, scoped writing help, a richer inquiry journey, and placement of one agreed existing business-tool configuration demonstrate the Plus tier. The sample handoff represents an existing scheduling provider, configured by agreement. No provider is connected. There is no custom scheduler, CRM backend, account system, estimate, payment, availability check, appointment, or network submission. No personal data is persisted.

## Progressive brief contract

The three progress states are **Your need → Site & context → Local review**. This is a small local inquiry demonstration, not a web application.

- Existing core IDs remain: `#inquiry-form`, `#request-type`, `#name`, `#email`, `#context`, `#add-next-step`, `#next-step`, `#review-button`, `#form-status`, `#inquiry-review`, `#review-summary`, `#review-heading`, `#edit-inquiry`.
- New IDs include `#brief-next`, `#brief-back`, `#brief-status`, `#step-one-heading`, `#step-two-heading`, `#site-character`, and `#reset-review`.
- `[data-step="0"]` contains request type and relevant conditional questions. Request values remain `design`, `planting`, and `review`.
- `[data-step="1"]` contains optional site/context fields, required sample name/email, and the optional next-step preference.
- `[data-progress]` items announce progress through `aria-current="step"`; `#brief-status` reports the visible step.
- HTML actions start disabled and progressive controls hidden. All site content/navigation remain available without JavaScript, with a clear noscript note.
- JavaScript first attaches `preventDefault()` to submission, then enables the progressive controls and sets `form.noValidate` so **visible-step native validation** can be managed safely.
- `syncFields()` hides inactive steps/branches, disables their fieldsets and individual controls, and removes their required state. Only active `data-required` controls are required. Hidden controls cannot receive a native validation error.
- `#brief-next` validates only enabled controls with native `checkValidity()` / `reportValidity()`, then advances and focuses the next heading. Enter on the first step follows the same path.
- The second-step submit synchronously revisits and validates both editing steps. Any failure leaves its step visible and its invalid control focusable. Success builds a `textContent`-only review and focuses `#review-heading`.
- Review serialization intentionally reads relevant controls across both steps, even though prior-step fields are disabled. Irrelevant request branches and unchecked next-step preferences are excluded.
- Back retains entries and clears derived output. Edit from review clears it, returns to the first step, and focuses `#request-type`.
- Start over resets fields and progress synchronously, clears output, disables irrelevant requirements, and focuses the request type. Page restoration clears the review and returns to the first step without creating a late callback.
- No timers, asynchronous operations, browser storage, external providers, or network sends occur.

## Validation ownership

This worker checks syntax, route/asset references, page inventory, version references, and source formatting. The lead owns the server and all browser, accessibility, responsive, and interaction checks. System dark preference, visible focus, and reduced-motion handling are defined locally.
