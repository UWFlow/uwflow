# Frontend review

Apply the [general review](../review.md) first. Use [React](react.md) and the
[design system](design-system.md) for implementation rules.

## Components and state

- Keep feature orchestration in pages and hooks, and reusable rendering in components.
- Check that shared layers do not import pages or product data into primitives.
- Reuse existing primitives and variants before accepting another control.
- Check that state belongs in Apollo, the URL, local state, or a focused context.
- Verify query inputs, cache identity, optimistic updates, and stale-response handling.
- Guard nullable data and model mutually exclusive states explicitly.

## Visuals and interaction

- Use named tokens and preserve token merging in `cn()`.
- Check meaningful loading, empty, error, disabled, and success states.
- Verify accessible names, keyboard activation, focus restoration, and dismissal.
- Check phone and desktop layouts, touch access, overflow, and reduced motion.
- Measure responsiveness for changes to rendering, scrolling, or interactions.
- For design review sites, use live before/after components grouped by viewport and bound rendering to nearby examples.

## Contracts and verification

- Check schema and permissions in `hasura/` and HTTP contracts in `flow/` from the repo root.
- Inspect generated GraphQL changes for unrelated local schema drift.
- Test visible behavior through roles and labels.
- Run frontend checks and a production build when changing primitives or build behavior.
- Report visual checks and performance measurements separately from unit-test results.
