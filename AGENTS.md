# LocalByte agent guide

LocalByte is a static marketing website for web and app services, with independent
portfolio demos. Use semantic HTML, CSS, and vanilla JavaScript; there is no production
build step or framework. `public/` is the deployed site root.

## Working rules

- **Fix shared patterns everywhere they apply.** When a user identifies inconsistent
  typography, spacing, navigation, or behavior, trace the shared rule and check its
  other consumers. A fix to the example page alone is incomplete unless the user
  explicitly limits the scope.
- Preserve the main site's upright **DM Sans**, semibold headings, shared color and
  spacing tokens, and matching navigation/footer treatment. Change these defaults
  together when the task calls for a new design; keep demo identities separate.
- Reuse shared components and CSS rules. Give structural exceptions a scoped class
  and a clear reason; remove obsolete overrides when a shared rule replaces them.
- Preserve keyboard access, mobile navigation, light/dark themes, storage fallbacks,
  and the real Netlify contact form. Keep content clear for nontechnical visitors.
- Verify what the browser renders, including other affected pages. Match validation
  to the change and report concrete results and remaining limits.
- Follow the task's publishing boundary. An authorized PR/preview update does not
  authorize merging or deploying production. Keep raw logs and screenshots outside
  the repository unless they are intended product assets.

## Read only the guidance needed for the task

Open the matching reference before editing that area; load additional sections only
when the work crosses into them.

| Task | Read |
| --- | --- |
| Typography, spacing, components, images, or customer-facing copy | [Design and consistency](docs/agents/design.md) |
| HTML/CSS/JavaScript, forms, navigation, theme, or demo behavior | [Implementation](docs/agents/implementation.md) |
| Selecting checks, reviewing changes, or updating a PR | [Validation](docs/agents/validation.md) |
| Setup and repository layout | [README](README.md) |
| Rationale or provenance for the website refresh | [Refresh plan](plans/website-refresh.md) |

## Quick commands

- Preview: `make local` or `npm run dev` → `http://127.0.0.1:9000`.
- Browser tests: `npm test`. Unit tests: `npm run test:unit`.
- Focused suites and verification scope: [Validation](docs/agents/validation.md).
- Confirm commands against `package.json`, `Makefile`, and `playwright.config.js`.

## Code review rules

- Flag partial shared fixes, conflicting overrides, and drift in fonts, spacing,
  imports, navigation, or asset versions across affected pages.
- Flag accessibility/interaction regressions and unsupported claims about real
  projects, prices, or demo capabilities.
- Require relevant verification evidence; passing demo tests alone does not prove
  the main site's presentation is correct.

## Maintaining this guidance

Keep this file a short entry point. Put detailed rules in the linked topic files,
with clear read triggers, and update them when an accepted convention changes.
Reference current source/configuration instead of duplicating templates, cache
version numbers, test counts, global model settings, or historical task logs.
