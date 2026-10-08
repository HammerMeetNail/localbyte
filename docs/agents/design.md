# Design and consistency

Read for main-site visual/content changes, or when a demo shares a pattern being
changed. [Back to the agent guide](../../AGENTS.md).

## Scope and sources

- Main pages share [style.css](../../public/assets/css/style.css) and
  [theme.js](../../public/assets/js/theme.js). Their HTML shells are duplicated, so
  shared markup, font imports, and asset references must be updated together.
- For site-wide typography, spacing, or shell changes, check every main page: `index.html`,
  `services.html`, `pricing.html`, `portfolio.html`, `about.html`, `contact.html`,
  `privacy.html`, `terms.html`, and `thanks.html`, plus any newly added main pages.
- Each directory in `public/demos/` is a separate visual identity. Maintain
  consistency within that demo; a main-site font change does not restyle the demos
  or the real products pictured in portfolio screenshots.
- Current source and the user's accepted direction govern implementation. The
  [refresh plan](../../plans/website-refresh.md) supplies rationale and asset sources;
  older plans may describe superseded designs.

## Shared design defaults

| Area | Convention |
| --- | --- |
| Typography | Upright DM Sans throughout the main site; `h1`–`h3` use weight 600. `--font-display` resolves to `--font-body`. Keep font imports consistent and load only used families/styles/weights. |
| Colors | Reuse semantic CSS variables. Define palette values centrally and maintain both explicit dark mode and OS-preference fallback. |
| Section spacing | Use `--section-gap: clamp(3rem, 5vw, 4rem)` for the main vertical rhythm, including intro and footer boundaries. |
| Content spacing | Use `--content-gap: 2rem` for section heading-to-content spacing and project-grid row gaps. |
| Layout | Reuse `.container`, existing grids, and component classes. Use relative units and responsive type; allow content to wrap at narrow widths. |
| Shared shell | Keep navigation order, labels, theme/menu controls, contact actions, and footer content aligned across main pages. Preserve each page's active navigation state. |

These defaults can evolve with a requested design change. Update shared rules,
consuming pages, and this guidance together so an exception does not become drift.

## Applying a consistency fix

1. Reproduce the reported example and inspect sibling pages at the same width/theme.
   Check computed styles and loaded assets; distinguish an image-loading failure
   from empty layout space or delayed lazy loading.
2. Find the shared token, selector, markup, or state transition. Search for competing
   page/breakpoint overrides and all consumers of the changed asset.
3. Put the fix in the shared rule. Scope genuine structural exceptions and
   remove superseded overrides; avoid accumulating page-specific patches.
4. Compare the affected pages in the browser using the
   [visual checks](validation.md#visual-changes), including the original example.

### Spacing and typography pitfalls

- Measure the gap between visible content, including combined margins, padding,
  and grid gaps. One boundary should not receive the full section gap twice.
- The portfolio grid supplies its section gaps; ordinary sections share padding
  across boundaries. Preserve that structure when changing either layout.
- Let standalone cards fit their content. Use equal heights or minimum heights only
  when the component needs them; inspect short/empty states for unused space.
- Verify actual font loading and glyphs, not just the declared font-family. A home
  headline override does not change interior headings, prices, or the wordmark.
- Font changes require checks for wrapping, clipped text, buttons, and price ranges,
  as well as the section spacing they can affect.

## Content and assets

- Explain websites, web/mobile apps, pricing, and next steps in plain language.
  Lead with the visitor's task and next action; use clear links or FAQs for secondary
  detail. Keep essential prices, requirements, and form labels easy to find.
- Describe verified work honestly. Distinguish live projects, work in development,
  and concept demos. Avoid invented expertise, client relationships, endorsements,
  testimonials, metrics, download links, or delivery promises.
- Treat published prices, contact details, and legal text as deliberate content;
  change them only within the requested scope.
- Use authentic, current screenshots for existing products and demos. Preserve
  aspect ratios, provide dimensions/alt text, and inspect cropping and legibility
  in both themes. Do not commit troubleshooting screenshots as portfolio assets.
