# Gatherwell — Business Website Plus example

A fictional event venue website. Spaces, occasions, and venue details are illustrative samples. Original SVG architectural compositions are drawings, not photographs of an operating venue. No address, capacity, availability, testimonial, or customer outcome is claimed.

## Routes

Exactly eight substantive HTML pages:

- `index.html` — venue introduction and occasion pathways.
- `spaces.html` — hall, courtyard, and drawing room descriptions.
- `gatherings.html` — sample celebration, meeting, and community formats.
- `gallery.html` — six original illustration views with optional space filtering.
- `planning.html` — planning sequence and a practical brief checklist.
- `faq.html` — venue and demonstration boundaries, using native disclosures.
- `about.html` — fictional venue character and guiding principles.
- `inquiry.html` — conditional inquiry, local review, and static scheduling handoff.

Every page links to the central `../../pricing.html#business-plus` anchor and to `../../contact.html?service=business-plus`. Central pricing owns package amounts.

## Tier boundary

The concept demonstrates eight connected pages, scoped writing help, a guided inquiry, and the placement of **one existing business-tool configuration**. The static sample handoff represents an agreed existing scheduling provider. It does not implement custom booking or a backend CRM, check dates, calculate prices, take payments, or create accounts. No provider is connected, link activated, booking made, message sent, or personal information persisted.

## Interaction contract

The submit button is disabled in HTML until `assets/site.js` registers a local-only `preventDefault()` handler. Native validation remains active. A noscript notice explains local review; navigation and page content need no JavaScript.

- `#request-type` offers `celebration`, `meeting`, or `visit`.
- The matching `[data-request]` fieldset is visible and enabled. Other branches and controls are hidden/disabled/not required; the matching `data-required` select is required.
- `#name` and `#email` are required sample fields. Guest count, if entered, must be a whole number from 1 to 10000; this is planning context, not a venue capacity claim.
- `#period` accepts a preferred period as context and performs no availability check.
- `#add-next-step` reveals/enables the optional `#next-step` preference.
- Valid submission hides `#inquiry-form`, builds a safe text-only `#review-summary`, reveals `#inquiry-review`, and focuses `#review-heading`.
- The handoff is static sample content. It names no provider and has no booking button or external URL.
- `#edit-inquiry` empties/hides the review, restores the form with current entries, and focuses `#request-type`.
- Edits, invalid submission, synchronous reset, and page restoration clear derived output. Reset clears branches and the optional next step. No asynchronous operations or timers occur.
- Disabled branch values are omitted from review. Branch entries remain available when switching back to an earlier request type.
- Gallery controls (`[data-filter]` values `all`, `hall`, `courtyard`, `room`) start hidden; JavaScript reveals them. Each native button sets `aria-pressed`, updates `[data-category]` item visibility, and announces a count in `.gallery-status`. All six figures remain visible without JavaScript.

## Design and validation

Plum, coral, and cream; bold compact headlines; room-like coloured volumes; arched imagery and architectural illustrations. Responsive grids, system dark preference, visible focus, and reduced-motion handling are local to this demo. No remote assets or dependencies.

Source checks: JavaScript syntax, local route/asset references, eight-page inventory, and patch whitespace. Lead coordinates browser/axe/responsive checks using the shared preview server. This worker ran no browser suites and did not start or stop a server.
