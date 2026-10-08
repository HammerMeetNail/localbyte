# Validation

Read when choosing checks, reviewing changes, or preparing a PR. Select the sections
that apply to the change. [Back to the agent guide](../../AGENTS.md).

## Commands and ownership

The repository has automated tests. [package.json](../../package.json) and
[playwright.config.js](../../playwright.config.js) are authoritative for commands and
test discovery; there is no production build step or configured lint command.

| Purpose | Command |
| --- | --- |
| Local preview | `make local` or `npm run dev` |
| All browser tests | `npm test` (or `npm run test:e2e`) |
| Unit tests | `npm run test:unit` |
| One demo | `npm run test:coffee-shop`, `npm run test:bytebites`, `npm run test:finance-dashboard`, or `npm run test:launchclock` |
| One browser spec | `npm test -- tests/easy-email/portfolio-link.spec.js` (replace with the relevant existing spec) |
| Patch formatting | `git diff --check` |

Playwright starts or reuses the preview server at `http://127.0.0.1:9000`. One owner
coordinates the server and browser runs; avoid competing suites on that port. Use
`npm test -- --workers=2` when limiting load on the local Python server is needed.
Keep logs, screenshots, traces, and test output outside the repository; for example,
pass `--output=/tmp/localbyte-check/test-results` to Playwright.

## Choose checks by the change

| Change | Required evidence |
| --- | --- |
| Documentation only | Check linked files/anchors, instructions against current source/config, and the diff. No browser/unit rerun is needed. |
| Copy or one asset | Inspect affected pages/links, wrapping, and image rendering at relevant sizes/themes. |
| Shared font, layout, or component CSS | Inspect every affected main page or demo page in both themes across mobile/tablet/desktop; perform the visual checks below. |
| Form, keyboard, theme, storage, or async behavior | Reproduce the issue; run focused interaction checks and relevant existing suites. Add a regression test when it protects meaningful behavior. |
| Broad behavior changes, test/config changes, or PR-wide integration | Run the applicable full browser/unit suites after focused checks and review. |

Do not rerun broad suites for every reversible cosmetic edit or to compensate for
missing visual inspection. Expand checks to resolve a concrete remaining risk or
meet a required gate. For concurrency/callback changes, obtain an independent review
of behavior and test synchronization before an expensive full run.

## Visual changes

- Use a fresh browser context or verified fresh assets. Confirm the relevant cache
  versions and wait for fonts/images to load before measuring or taking screenshots.
- For site-wide typography, spacing, or shell changes, cover every root HTML page,
  including legal and confirmation pages. For component-only changes, cover its
  consuming pages. The main-page inventory is in [Design](design.md#scope-and-sources).
- Use 320/390px mobile, 768/1024px tablet, and 1440px desktop as the baseline for shared
  typography/layout work; inspect either side of any changed breakpoint too. Check
  light and dark independently, clearing saved theme state when testing OS fallback.
- Inspect actual glyphs and computed font family/style/weight, line wrapping,
  horizontal overflow, clipped text, button/price sizing, container alignment, and
  gaps between the header, visible section content, contact panel, and footer.
- Check image loading/decoding, aspect ratio/cropping, hidden states, short/empty
  content, and unusually long input. A successful HTTP request alone does not prove
  the image is visible or the surrounding layout is correct.
- Review screenshots in addition to geometry assertions and accessibility scans.
  Axe and passing test-case lines cannot establish visual quality. Check contrast
  in both themes; existing specs may exclude contrast checks.
- For shared typography or layout changes, check affected representative layouts in
  WebKit as well as Chromium, especially narrow screens and font-dependent wrapping.

## Interaction changes

- Exercise changed flows and failure/recovery states, including keyboard focus,
  menu dismissal, persistence/reload, unavailable storage, and native form validation
  when relevant. Verify resulting state as well as success text.
- For async work, wait for the specific operation to settle. Check edits during a
  pending operation, repeated requests, stale completion, failure, and retry; an
  assertion on an initial empty state does not prove late callbacks are harmless.
- Check QR/download contents, URL encoding, and copy fallback when those outputs
  change. Avoid opening real email clients or submitting real forms for a smoke check.
- Preserve honest status: demo simulations, a local validation pass, and a hosted
  service accepting a real submission are different outcomes. Report what was tested.

## PR and completion evidence

- Review the final diff; stage only intended source/docs/product assets. Keep secrets,
  test artifacts, raw logs, and troubleshooting images out of commits.
- Confirm terminal exit status **and** structured results, including failures, errors,
  skips, and flaky/expected failures. A script returning an `ISSUES` object can still
  exit zero; treat that as a failed check. Fix faulty check assumptions as well as bugs.
- After an authorized push, use the watcher role for long-running checks. Verify the
  newest run belongs to the exact pushed commit; do not reuse an older green result.
- For published page/asset changes, inspect the updated preview after it is ready.
  Documentation-only pushes do not need another browser pass. Preview verification
  does not authorize a production deployment or merge.
- Summarize what changed, checks actually run, material limits, and the review link.
  Keep detailed transient test counts and artifact paths in the PR/task report.
