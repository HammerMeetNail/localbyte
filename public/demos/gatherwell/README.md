# Gatherwell — Business Website Plus example

A fictional hospitality and event venue with a warm pink/cherry/cream identity, expressive sans typography, capsule navigation, a layered photo/poster homepage, and varied photo-led interiors. Venue imagery is AI-generated concept photography, not an operating venue. No address, capacity, availability, testimonial, or customer result is claimed.

## Eight routes

- `index.html` — photographic setting and expressive hospitality introduction.
- `spaces.html` — hall, courtyard, and drawing room exploration with in-page links.
- `gatherings.html` — personal, team, and community occasion guidance.
- `gallery.html` — six views of three fictional concepts, including labelled detail crops.
- `planning.html` — a practical sequence and brief checklist.
- `faq.html` — native disclosures and clear demonstration boundaries.
- `about.html` — fictional venue character and guiding idea.
- `inquiry.html` — concierge inquiry, live planning notes, local review, and handoff.

Every page links to `../../pricing.html#business-plus` and `../../contact.html?service=business-plus`. Central Pricing owns package amounts. All eight routes use `assets/site.css?v=2` and `assets/site.js?v=2`.

## Tier boundary

This Plus concept demonstrates eight connected content pages, scoped writing help, a sophisticated inquiry, and placement of **one existing business-tool configuration**. The static handoff represents a scheduling provider configured by agreement. It neither connects a provider nor implements a custom scheduler, CRM backend, price estimator, account, payment, or availability check. Nothing is sent, booked, or persisted.

## Concierge interaction contract

The inquiry is a single approachable form with a live local planning snapshot beside it on desktop and above it on smaller screens. It deliberately differs from Fieldwork’s progressive brief.

- Existing core IDs remain: `#inquiry-form`, `#request-type`, `#name`, `#email`, `#context`, `#period`, `#guests`, `#add-next-step`, `#next-step`, `#review-button`, `#form-status`, `#inquiry-review`, `#review-summary`, `#review-heading`, `#edit-inquiry`.
- New IDs include `#draft-layout`, `#planning-snapshot`, `#snapshot-heading`, `#snapshot-occasion`, `#snapshot-guests`, `#snapshot-period`, `#snapshot-next`, `#snapshot-status`, `#guest-wrap`, and `#reset-review`.
- Request values remain `celebration`, `meeting`, and `visit`; only the matching `[data-request]` fieldset is visible/enabled. Required state is managed from `data-required`.
- Approximate guests are optional for celebrations and meetings, hidden/disabled for a venue visit. Native integer/range validation allows 1–10000 as a data-entry guard, not a capacity claim.
- Preferred period is plain planning context, with an explicit no-availability/no-reservation note.
- The optional next-step checkbox reveals and enables the preference select; it does not arrange an appointment.
- Input/change updates four safe `textContent` snapshot values. Valid guest entries show approximate people; invalid/empty entries show a prompt. The snapshot is a reflection, not a recommendation or estimate.
- Changes receive a polite status announcement; no live region repeats the full form on every keystroke.
- Submission is initially disabled in HTML. JavaScript attaches local-only `preventDefault()` before enabling it. Native validation remains active, and a noscript notice explains the demonstration.
- Valid submission hides the draft, builds a safe text-only review using enabled fields, reveals the review, and focuses its heading.
- Edit clears the final review, restores current draft notes, and focuses request type. Reset clears fields and both derived views synchronously. Edits, invalid submission, and page restoration clear stale final output.
- The sample existing-tool panel has no external URL, booking control, provider connection, or availability display.
- No asynchronous operations, timers, storage, credentials, or network sends are used.

## Gallery and imagery

The lead provides `assets/img/{courtyard,hall,room}-concept.webp` (1536×1024). All visible uses disclose their fictional AI-generated nature. Full-image and detail views reuse the same three concepts; detail captions explicitly identify that relationship.

Native gallery filter buttons (`data-filter` values `all`, `hall`, `courtyard`, `room`) update pressed state, item visibility, and a live count. Controls start hidden and are revealed by JavaScript. All six images and site navigation remain available without JavaScript.

## Validation ownership

The worker runs source/syntax/reference checks only. The lead coordinates the preview server, browser interactions, accessibility, responsive inspection, and image provenance. Dark preference, visible focus, and reduced-motion handling are local to this demo.
