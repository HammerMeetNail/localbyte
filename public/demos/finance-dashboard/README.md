# ClearLedger — Personal Finance Dashboard (Demo)

ClearLedger is a fictional, local-first personal finance dashboard built for the LocalByte LLC portfolio.

- **Demo only:** no backend, no accounts, no external APIs
- **Local-first:** data is stored in your browser via `localStorage`
- **Sample data:** the demo seeds a realistic dataset on first run (you can reset in Settings)

## Run locally

From the repo root:

```bash
make local
```

Then open:

- `http://localhost:9000/demos/finance-dashboard/index.html`

## Tests

This repo uses Playwright for demo smoke tests.

```bash
npm install
npx playwright install
npm test
```

To run only this demo’s tests:

```bash
npm run test:finance-dashboard
```

To run unit tests (pure functions):

```bash
npm run test:unit
```

## Notes

- This is **not financial advice**.
- Clearing site data in your browser will remove the demo’s state.
