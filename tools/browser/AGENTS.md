# Browser tools

Read [browser review](../../styleguide/frontend/browser-review.md).
Keep this package optional and separate from application dependencies.
Use one Chromium process and capture viewports sequentially. Do not add a hosted
service, background watcher, or automatic CI browser suite for screenshot work.

After changes, run `node capture.mjs --help` and capture a disposable local page
with a visible readiness selector. Inspect both PNGs and the timing JSON.
