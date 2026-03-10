# LocalByte LLC Website

Static marketing site and portfolio demos for LocalByte LLC.

## Overview

This repository contains:

- The main LocalByte brochure site under `public/`
- Several interactive concept demos under `public/demos/`
- Playwright end-to-end tests under `tests/`
- Small Node-based unit tests for demo utilities under `tests/unit/`

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

## Deployment Notes

- The site is fully static and can be deployed to any standard static host.
- `public/contact.html` uses Netlify Forms attributes. If you deploy elsewhere, swap that form handling to a different provider or endpoint.
- Everything under `public/` is deployment material. The rest of the repository supports development, testing, and planning.

## Maintenance Notes

- Shared brochure-site styles live in `public/assets/css/style.css`.
- Shared brochure-site behavior lives in `public/assets/js/theme.js`.
- Demo apps are intentionally self-contained so they can be shown independently from the main site.
- The `plans/` directory is internal working material, not customer-facing content.

## Standards

Repo-specific editing conventions and implementation guidance live in [AGENTS.md](./AGENTS.md).
