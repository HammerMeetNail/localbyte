# LaunchClock (Demo)

LaunchClock is a fictional “micro‑SaaS style” countdown landing page generator built as a portfolio demo for LocalByte LLC.

## Run locally

From the repo root:

```bash
make local
# or
python3 -m http.server 9000 --directory public
```

Then open:

- `http://localhost:9000/demos/launchclock/index.html`

## How share links work

- The generator builds a URL to `countdown.html` with query parameters like `name` and `ts` (epoch milliseconds).
- The countdown page renders *only* from the URL (no backend).

## Demo-only disclaimer

- Email signup on the countdown page is a demo. No emails are sent.
- Signups are stored locally in your browser (localStorage) so you can see a realistic flow.

## Tests

Unit tests (pure URL/time logic):

```bash
npm run test:unit
```

E2E tests (Playwright):

```bash
npm install
npx playwright install
npm run test:launchclock
```
