# Browser review

Use Playwright for repeatable browser interactions and screenshots. It is a local
browser automation library, not a hosted service. The optional package in
`tools/browser/` keeps it out of application installs and production builds.

## Setup

From the repo root:

```sh
cd tools/browser
bun install --frozen-lockfile
bunx playwright install --only-shell chromium
```

Install only the Chromium headless shell unless a bug requires another engine. Reuse the installed
browser and one browser process; do not create parallel sessions for screenshots.
No browser runs in CI by default.

## Capture

Start the app or an isolated component fixture separately. From `tools/browser/`:

```sh
bun run capture --url http://localhost:3000/example --ready '[data-testid="example-ready"]' --label after
```

Choose a selector from the actual page that appears when its data and layout are
ready. The example selector is not built into Flow. Do not wait for an arbitrary
sleep or global network idle; analytics and polling can prevent idle forever.

The command captures desktop (1440 × 1000) and phone (390 × 844) sequentially in
one Chromium process. Output goes to ignored `artifacts/ui/`. It waits for the
selected element and fonts, disables animation, and records navigation timing,
horizontal overflow, and page errors in JSON. This timing is a diagnostic, not a
performance benchmark. Compare repeated runs under the same conditions when
investigating a regression.

- Capture the base revision with `--label before`, then the changed revision with `--label after`.
- Use the same route, fixture data, viewport, and selected state for both captures.
- Use `--out` to separate examples and `--full-page` only when the whole page matters.
- Use `--mask SELECTOR` for private fields and `--storage-state FILE` for a local test session stored under ignored `artifacts/`.
- Use disposable accounts and data. Never commit session state, cookies, tokens, or private screenshots.
- Open both PNGs before attaching them. Reject loading placeholders, broken layouts, and screenshots with hidden errors.

## Interaction checks

For a state that requires clicks, use a small Playwright script beside the task's
artifacts. Import Playwright from this package. Prefer `getByRole` and `getByLabel`,
wait for a visible outcome, and call `page.screenshot` after the interaction.
Reuse the same browser and close it in `finally`. Keep fixture data deterministic.

Check keyboard focus, dismissal, touch access, and console errors. For changes to
scrolling or rendering, exercise the interaction repeatedly and inspect browser
performance rather than inferring responsiveness from a screenshot.

## PR evidence

Follow [PR descriptions](../review.md#pr-descriptions). Attach before/after images
for visible changes, grouped desktop before/after and phone before/after. Use
GitHub attachments or an approved artifact link that reviewers can open; local
filesystem paths do not work in GitHub PR descriptions. Do not commit PNGs just
to host them. If upload is unavailable, report where the local files are and that
the PR evidence still needs attaching.

For designer review sites, use live interactive comparisons as described in the
[design system guide](design-system.md#design-review). Screenshots support the PR;
they do not replace those comparisons.

References: [screenshots](https://playwright.dev/docs/screenshots),
[locators](https://playwright.dev/docs/locators),
[authentication state](https://playwright.dev/docs/auth).
