# LocalByte website refresh

Design proposed and implemented for PR review, October 2026.

## Who the site should help

A busy local business owner should be able to understand what LocalByte does,
find a realistic starting price, see actual work, and send a short inquiry.
They should not need a technical vocabulary or a prepared project brief.

The previous site repeated agency terms, lists of capabilities, and generic
illustrations. Some portfolio images were text placeholders. The refresh puts
business needs, real examples, and the next step ahead of technical details.

## Design direction

The visual idea is a welcoming neighborhood studio: warm paper, forest green,
terracotta, a clear upright homepage headline, and generous space. Secondary
headings retain the quieter serif treatment. A custom inline SVG
illustrates two neighborhood storefronts. It is decorative inspiration, not a
client claim. Dark mode uses warm green charcoal, cream text, and softer accents.

- Keep the existing LocalByte mark and add a quieter typographic wordmark.
- Treat the brief's business examples as a standard for ease of use, rather than
  claims of industry expertise. Describe LocalByte's design and development work
  directly. Use upright DM Sans for the main headline, with color for emphasis.
- Use a consistent navigation: Services, Pricing, Our work, About, and Let's talk.
- Give website design the first position; explain apps and care through everyday
  problems rather than implementation terms.
- Keep existing price ranges visible, with an explanation of scope and outside
  costs. Remove unsubstantiated popularity and generic rapid-launch claims.
- Use actual site screenshots and existing app assets. Label live projects,
  development work, and concept demos separately.
- Make contact approachable: only name, email, and message are required. Include
  “I'm not sure yet,” a direct email alternative, and an explanation of next steps.
- Preserve a real native form POST; add a simple success destination instead of
  a client-side simulated confirmation.

## Portfolio evidence and assets

Checked against the sibling repositories and public pages during the refresh:

| Project | What the site says | Evidence and asset source |
| --- | --- | --- |
| Joe Denning | Live author website | Existing portfolio entry; current screenshot from https://joedenning.com/ |
| Year of Bingo | Live goal-tracking web app | Existing portfolio entry; current screenshot from https://yearofbingo.com/ |
| Nabu | Live shared household routine app | https://nabu-app.com/ and `../nabu/README.md`; `../nabu/web/static/images/screenshot-home.webp` is already used on its public landing page |
| Tinsel | Audiobook player for iPhone, in development | `../tinsel/README.md`, project overview, and release acceptance documents; existing app icon |
| Tap | Writing app for Mac, iPhone, and iPad, in development | `../tap/README.md` and roadmap; existing app icon |

Tinsel and Tap have no verified public product or store destination. Their cards
have no invented download links. The site makes no unsupported revenue,
conversion, user-count, testimonial, endorsement, or blanket security claims.
Projects are not all described as client commissions.

The five existing interactive demos retain their URLs and behavior. Their new
WebP previews are screenshots of those demos, and their concept status and
simulated actions are explained before the links.

## Implementation and review

The site remains plain HTML, CSS, and JavaScript. There is no build step, component
framework, or new production dependency. Shared navigation and footer markup is
present directly in every page. The original privacy and terms body copy is
unchanged. Shared styles use `v=6` and script references use `v=5` for cache
invalidation.

Review locally with `make local`, then open http://127.0.0.1:9000. Review all pages
in light and dark mode, with particular attention to mobile Menu navigation,
Pricing, the portfolio status labels, and the contact form.

Validation artifacts and screenshots are kept outside the repository. The PR
records the final check results. Two existing test discovery issues were repaired:
Playwright now selects browser `*.spec.js` files instead of collecting Node unit
tests, and the coffee-shop directions assertion uses a valid URL regex.
The full suite also exposed two stale demo assertions and two finance-demo bugs.
The fixes preserve OR search and preview headers, honor `hidden`, and give budget
usage bars proper meter semantics. Reset checks verify the stored dataset as well
as the visible banner.

## Deployment boundary

This work is for a pull request only. No production deployment or merge is part
of the task. The existing Netlify form registration and honeypot are retained.
Native validation and the submission payload can be checked locally; actual
Netlify acceptance, spam filtering, redirect behavior, and email delivery require
a configured hosted environment. The source's `netlify-honeypot` attribute is a
[documented Netlify extension](https://docs.netlify.com/manage/forms/spam-filters/)
and is the expected exception reported by the HTML validator.
