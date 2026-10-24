# General review

Apply these checks to every PR, then use the [backend](backend/review.md) and
[frontend](frontend/review.md) reviews for the areas it touches.

## Scope and ownership

- Search for an existing helper, constant, type, or component before accepting a new one.
- Check that the fix addresses the cause at the owning layer.
- Flag copied defaults, mappings, and contracts that can drift between callers.
- Remove unused options, exports, branches, and speculative abstractions.
- Keep unrelated refactors and upgrades out of the diff.

## Tests

- Read the test name and assertions together. Check that the assertions establish the claimed behavior.
- Search for duplicate coverage of the same subject, inputs, and setup.
- Exercise the real subject; stub dependencies rather than replacing the implementation under test.
- Check meaningful outputs and failure paths, including permissions and retries where relevant.
- Fix clock, randomness, locale, and network inputs when they affect a result.
- Confirm regression tests fail with the bug present.
- Check the [verification requirements](general.md#verification) and report anything unverified.

## Runtime and deployment

- Verify new versions against upstream release notes and security advisories.
- Check local, CI, Docker, and Vercel version selection together.
- Build changed images and test native-library compatibility where applicable.
- Check that the deploy path uses fresh images and does not restart unrelated services.
- Identify database/catalog upgrades, backup requirements, and rollback limitations.
- Keep secrets out of build arguments, logs, artifacts, and PR descriptions.
- Distinguish local tests, CI results, and deployed verification in the PR.

## Instructions and writing

- Check that agent files, skills, and guides match current paths, commands, and ownership.
- Link to an existing rule instead of duplicating it.
- Remove comments that narrate changes or repeat the code.
- Describe the final behavior and relevant verification in the PR.
