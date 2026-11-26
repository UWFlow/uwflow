<!--
Write bullets only, with no headings: see styleguide/review.md#pr-descriptions.
Replace each prompt, delete bullets that do not apply, and keep it
proportional to the change. These comments do not appear in the posted PR.
-->

- **What:** <!-- The concrete problem and the resulting behavior. -->
- **Why:** <!-- Who it affects and why now. -->
- **Issue:** <!-- #123 or FLOW-123. Write "none" for small fixes. -->
- **Tested:** <!-- Each command you ran and its result, e.g. `make test` passed. Pick checks from styleguide/general.md#verification. -->
- **Manual:** <!-- Steps you followed in the running app and what you saw. -->
- **Not tested:** <!-- Checks that could not run, and why. -->
- **Screenshots:** <!-- Visible UI changes only: before/after images in bullets, desktop and phone when layout changes. A short recording for interactions. See styleguide/frontend/browser-review.md. -->
- **Risk and rollout:** <!-- Migrations, Hasura permissions, public API or error-enum changes, deploy order (e.g. backend before frontend), env vars, or steps a maintainer must take. Write "none" if none. -->
- **Scope:** <!-- One concern per PR. Split out unrelated refactors and formatting. If the diff is large, say why it cannot be smaller. For stacked PRs, link the prerequisite. -->
- [ ] I can comfortably explain what this PR changes and why.
- [ ] I added or updated tests for changed behavior, or explained why not above.
- [ ] No secrets, `.env` files, database dumps, keys, or Terraform state are committed.
- [ ] I updated docs, `AGENTS.md`, or the styleguide if behavior or commands changed.
