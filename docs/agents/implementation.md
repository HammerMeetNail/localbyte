# Implementation

Read the sections relevant to code, forms, navigation, theme, or demo behavior.
[Back to the agent guide](../../AGENTS.md).

## HTML, CSS, and shared assets

- Use semantic landmarks, one descriptive page title/description, logical headings,
  labelled controls, image alt text, and explicit button types. Decorative SVGs use
  `aria-hidden="true"` and `focusable="false"`.
- Reuse a current peer page's shell when adding a page. Keep its shared imports,
  navigation, footer, and accessibility behavior; update page-specific metadata,
  active navigation, paths, and content. Avoid a second copied template in docs.
- Keep main styles in [style.css](../../public/assets/css/style.css). Use descriptive
  hyphenated classes, semantic variables, and existing components. Define colors in
  palette variables; transparent overlays may use explicit alpha colors.
- Keep base styles and component rules readable, with responsive overrides grouped
  consistently. Avoid repeated inline styles and unexplained specificity increases.
- Use `minmax(0, 1fr)`/`min-width: 0` where grid or flex children need to shrink.
  Preserve `[hidden]` behavior when introducing display rules for a component.
- After changing a shared CSS/JS file, increment its existing `?v=` value in **every
  consuming HTML page**, including nested demo and 404 pages where applicable.
  Different assets may have different versions; do not copy old numbers from docs.
- Preserve relative links and fragments. Optimize intended product images and
  verify replacement paths before removing unused assets.

## JavaScript and state

- Keep scripts small and framework-free. Follow the existing IIFE, `var`, camelCase,
  double-quoted strings, and semicolon conventions. Check optional DOM elements
  before attaching listeners; use `addEventListener` and focused functions.
- Treat URL parameters and stored values as untrusted input. Validate identifiers,
  enums, whole-number ranges, finite timestamps, and URL schemes before use. Use
  `textContent` for user-controlled text; reserve HTML strings for trusted templates.
- Guard storage access and malformed stored data. Provide usable defaults when
  persistence is blocked, and keep visible controls synchronized with state.
- Editing inputs or submitting invalid data must invalidate stale derived output,
  links, QR codes, downloads, and success messages as appropriate.
- Async callbacks must still belong to the current input/request before publishing
  results. Use a generation token or equivalent ownership check; make failures
  recoverable, and keep displayed/downloaded/copied output in agreement.
- Handle keyboard events within the active control or overlay. Escape should dismiss
  the innermost open UI before triggering a page-level action; preserve focus.

## Theme and navigation

- Main behavior lives in [theme.js](../../public/assets/js/theme.js). Keep explicit
  theme choice, localStorage persistence, live OS preference, and cross-tab updates.
- With no explicit preference, the main site intentionally omits `data-theme` and
  uses CSS media queries. Verify computed colors/color-scheme, not attribute presence
  alone. Storage failure must not break the page.
- Preserve menu toggle state/labels, first-link focus, Escape/outside-click/nav-link
  dismissal, focus restoration, breakpoint transitions, and landscape scrolling.
- Keep visible focus, reduced-motion support, and usable navigation without JS.

## Forms and demo boundaries

- Use `info@localbytellc.com` as the single LocalByte contact address across main-site
  email links, legal contact text, and organization metadata. Live form email
  notifications must use the same recipient in Netlify; that setting is external
  to the repository. See [contact delivery](../../README.md#contact-address-and-form-delivery).
- The [contact form](../../public/contact.html) uses a native POST to `thanks.html`,
  Netlify form identity `contact`, hidden `form-name`, and the `bot-field` honeypot.
  Preserve that contract and the existing required fields unless the task changes it.
- Keep native validation and accessible labels/errors. Required contact fields are
  name, email, and message; optional service/company choices should stay optional.
- Demo forms/actions must clearly describe simulations. Validate generated links
  and downloads without submitting real inquiries, orders, or messages unless the
  user has authorized that action.
- Read the affected demo's own README and code before changing it. Keep its URLs,
  assets, storage behavior, and navigation internally consistent.

## Instruction maintenance

Keep task-specific instructions in these linked references, with read triggers in
the root guide. Follow the [official AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
when changing instruction discovery or directory overrides. Project docs should
complement the user's global instructions without copying model configuration or
adding approval steps to work the user has already authorized.
