# LocalByte LLC Website

Static marketing site and portfolio demos for LocalByte LLC.

## Overview

This repository contains:

- The main LocalByte brochure site under `public/`
- Several interactive concept demos under `public/demos/`
- Playwright end-to-end tests under `tests/`
- Small Node-based unit tests for site and demo utilities under `tests/unit/`

The stack is intentionally simple:

- HTML5
- CSS3
- Vanilla JavaScript
- Playwright for browser tests
- Node's built-in test runner for unit tests

## Project Structure

```text
.
├── public/                  # Deployed static site root
│   ├── assets/              # Shared brochure-site assets
│   ├── demos/               # Portfolio demos and concept projects
│   ├── *.html               # Main brochure pages
│   └── site.webmanifest
├── tests/                   # Playwright and unit tests
├── config/pricing.json      # Main-site pricing amounts and payment duration
├── scripts/sync-pricing.js  # Maintenance-time static pricing sync/check
├── docs/agents/             # Task-specific agent guidance
├── plans/                   # Internal planning notes and implementation ideas
├── Makefile                 # Convenience command for local dev
├── playwright.config.js     # E2E test configuration
├── package.json             # Test and local utility scripts
└── AGENTS.md                # Repo-specific AI agent instructions
```

## Local Development

Start the local server:

```bash
make local
```

Or:

```bash
npm run dev
```

Then open `http://127.0.0.1:9000`.

## Tests

Run all browser tests:

```bash
npm test
```

Run all unit tests:

```bash
npm run test:unit
```

Run a single demo suite:

```bash
npm run test:coffee-shop
npm run test:bytebites
npm run test:finance-dashboard
npm run test:launchclock
```

## Website package examples

The Pricing and Our Work pages connect each website tier to two full concept sites:

| Package | Examples | Demonstrated scope |
| --- | --- | --- |
| Starter Website | [Juniper Yard](public/demos/juniper-yard/README.md), [Goodform](public/demos/goodform/README.md) | One page, five sections, simple inquiry preview |
| Business Website | [Harbor Home](public/demos/harbor-home/README.md), [Northline Studio](public/demos/northline/README.md) | Five pages, navigation, service/story content, simple inquiry preview |
| Business Website Plus | [Fieldwork](public/demos/fieldwork/README.md), [Gatherwell](public/demos/gatherwell/README.md) | Eight pages, conditional inquiry/review, static example of an existing-tool handoff |

All six businesses are fictional. Demo forms validate and render locally; they do
not send or save inquiries. Each demo README documents routes and interactions.
Package amounts stay in central pricing. Portfolio thumbnails are actual browser
captures of these sites, and each demo keeps its own design and assets.

Nabu is the live installable PWA example; Year of Bingo is the live browser-app
example. Both are independent LocalByte products whose complete feature sets are
beyond the starting scope of a focused application project.

## Deployment Notes

- The site is fully static and can be deployed to any standard static host.
- `public/contact.html` uses Netlify Forms attributes. If you deploy elsewhere, swap that form handling to a different provider or endpoint.
- Everything under `public/` is deployment material. The rest of the repository supports development, testing, and planning.

## Maintenance Notes

- Shared brochure-site styles live in `public/assets/css/style.css`.
- Shared brochure-site behavior lives in `public/assets/js/theme.js`.
- Demo apps are intentionally self-contained so they can be shown independently from the main site.
- The `plans/` directory is internal working material, not customer-facing content.

### Pricing maintenance

All main-site price amounts stay on the Pricing page; other pages link there.
Edit `config/pricing.json`, then run:

```bash
npm run pricing:sync
npm run pricing:check
```

The dependency-free Node script updates only marked text in `public/pricing.html`.
The complete HTML remains deployable and readable with JavaScript disabled; there
is no production fetch, build step, or runtime dependency. Commit the config and
its synchronized HTML together when publishing an authorized pricing change.

Price spans use exactly `<span data-price="KEY">...</span>` and include the full
formatted dollar amount. Every source amount key must appear at least once:
`starter`, `business`, `businessPlus`, `webApp`, `discovery`, `hosting`,
`websiteCare`, `carePlus`, `applicationCare`, `additionalPage`, `integrationMin`,
`integrationMax`, `developmentHourly`, `assessment`, `planInitial`, and
`planBuildMonthly`. Repeat marked spans wherever an amount is repeated. Integration
ranges use two price spans with an en dash between them, each with its own dollar sign.

The required derived keys are `planMonthly` (build installment plus Website Care),
`planBuildTotal` (initial payment plus build installments over `planMonths`), and
`planTotal` (initial payment plus combined monthly payments over `planMonths`).
Every payment duration uses `<span data-pricing-months>...</span>`; at least one
duration marker is required. Amounts are nonnegative safe integer USD values and
`planMonths` is a positive safe integer.

`pricing:check` is read-only and exits nonzero for stale amounts or payment durations,
unknown keys, invalid config values, or missing required markers. Check the full
pricing copy when changing a duration or package scope; the script owns marked
values, not surrounding prose. Run `node --test tests/unit/pricing.test.js` for the
focused arithmetic and synchronization checks. The regular `npm run test:unit`
suite also checks the committed pricing HTML against the config.

## Standards

Start with [AGENTS.md](./AGENTS.md), then follow its task-specific links for design,
implementation, and validation guidance.
