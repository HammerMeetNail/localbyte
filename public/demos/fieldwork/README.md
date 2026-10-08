# Fieldwork — Business Website Plus example

A fictional landscape studio website. All garden briefs, service descriptions, and business details are illustrative samples. Original SVG planting plans are concept studies, not completed commissions or scaled construction drawings.

## Routes

Exactly eight substantive HTML pages:

- `index.html` — studio overview and routes into services and garden studies.
- `services.html` — garden design, planting design, and garden review scope.
- `gardens.html` — three original, explained concept studies.
- `approach.html` — briefing, design development, and handover.
- `resources.html` — preparation and planting-brief guidance.
- `faq.html` — scope and practical questions, using native accessible disclosures.
- `about.html` — fictional studio identity and design principles.
- `inquiry.html` — conditional inquiry, local review, and static scheduling handoff.

Every page links to the central `../../pricing.html#business-plus` anchor and to `../../contact.html?service=business-plus`. Central pricing owns package amounts.

## Tier boundary

This concept demonstrates a richer eight-page content architecture, scoped writing help, a more sophisticated inquiry journey, and the placement of **one existing business tool**. The static handoff panel represents an agreed configuration of an existing scheduling provider. It is not a custom scheduler, live integration, CRM backend, estimator, ecommerce flow, or account system. The demo has no active provider link, availability, booking, network submission, or persistent storage.

## Interaction contract

All form controls use sample details. The submit button starts disabled in HTML. `assets/site.js` registers `preventDefault()` before enabling it. Native validation remains active; the noscript notice explains that local review needs JavaScript. The other seven pages and navigation remain usable without JavaScript.

- `#request-type` offers `design`, `planting`, or `review`.
- The matching `[data-request]` fieldset becomes visible and enabled. Other branches are hidden and their controls disabled and not required. The matching `data-required` select is required.
- `#name` and `#email` are required sample identity fields.
- `#add-next-step` optionally reveals and enables `#next-step`; that preference never arranges an appointment.
- Valid submission hides `#inquiry-form`, builds `#review-summary` with DOM nodes and `textContent`, reveals `#inquiry-review`, and focuses `#review-heading`.
- The review explicitly says nothing was sent. Its existing-tool handoff is static explanatory content, with no active booking control.
- `#edit-inquiry` empties and hides the review, restores the form, retains entered fields, and focuses `#request-type`.
- Input/change, invalid submissions, reset, and browser page restoration clear derived output. Reset is synchronous and clears all fields, branch requirements, and the optional next step. No timers or asynchronous ownership are involved.
- Values from disabled branches are omitted from review. Existing branch entries are retained while switching request types so they can be revised if the visitor switches back.

## Design and validation

Moss, ochre, and linen; serif display type; ruled editorial rows; top-down planting compositions; responsive grids; system dark preference; visible keyboard focus and reduced-motion handling. All assets and scripts live within this directory and have no external dependency.

Source checks: JavaScript syntax, local route/asset references, eight-page inventory, and patch whitespace. Browser/axe/responsive checks are coordinated by the lead against the shared preview server; this worker did not start a server or run browser suites.
