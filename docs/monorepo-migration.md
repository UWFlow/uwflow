# Monorepo migration and cutover

This branch implements the frontend import, combined CI, root developer commands,
and deployment changes. External CI/Vercel connections and repository retirement
remain a coordinated cutover after validation. Merging the PR does not reconnect
Vercel automatically, but it does enable the combined CircleCI publisher on `main`.

## One repository and preserved history

`frontend/` contains ordinary tracked files. There is no submodule, nested `.git`,
or ongoing synchronization with `uwflow_frontend`. Future commits and PRs can change
frontend, Go services, and Hasura together.

The import merge joins frontend commit
`03ef05d70c9e983efd48a69af7d666b6dae69725` to backend history based on `9ef3b71`.
At the import commit, the `frontend/` tree exactly matches the source tree
`e359be325a7f5754a11f7b8b06e427183b44172a`. Migration changes follow in a separate
commit so reviewers can inspect them independently of the large import.

**Merge this PR with a merge commit. Do not squash or rebase merge it:** those
methods discard the imported ancestry. The repository currently allows only squash
merges (`allow_merge_commit=false`); an owner must enable merge commits before
merging this migration. Original frontend commit IDs remain
reachable. Before the import boundary, frontend files have their original root
paths; inspect that history explicitly, for example:

```sh
git log 03ef05d70c9e983efd48a69af7d666b6dae69725 -- src/App.tsx
git merge-base --is-ancestor 03ef05d70c9e983efd48a69af7d666b6dae69725 HEAD
```

The old repository retains closed PR discussions, historical tags, and releases.
It becomes an archive after active work and integrations are migrated.

## Implemented repository changes

| Area | Behavior |
| --- | --- |
| Layout | Frontend under `frontend/`; backend, Hasura, Nginx and staging paths stay stable |
| Dependencies | Bun `1.3.14`, Node `22.20.0`, package and lockfile in `frontend/` |
| Developer commands | Root `make frontend-*` targets run from the frontend package without loading backend `.env` |
| Git hooks | `make hooks` installs `.githooks/pre-commit`; frontend lint checks staged frontend work without rewriting files |
| CI | One root CircleCI pipeline; frontend lint/typecheck/tests, frontend image, backend images/Go tests |
| Publishing | All validation must pass; only `main` publishes all four images with commit-SHA and `latest` tags |
| Docker contexts | Frontend uses `frontend/`; API/email/importer use `flow/` |
| Build credentials | Optional Sentry token remains a BuildKit secret; non-main CI frontend builds omit it |
| Deployment | `script/deploy.sh` uses its own checkout, supports frontend-only releases, pulls before replacing containers, and avoids `down` |
| Release selection | `UWFLOW_IMAGE_TAG` selects the tag for all four application images; default is `latest` |
| Vercel | `frontend/vercel.json` carries install/build/output settings and existing rewrites |

All components are validated on every PR initially. Path filtering can follow once
shared schema/config dependencies and required-check behavior are covered. See
[CircleCI dynamic configuration](https://circleci.com/docs/guides/orchestrate/using-dynamic-configuration/).

## External inventory before merging

Record owners and current settings without putting secret values in Git:

- [ ] CircleCI: destination project enabled, environment variable names, contexts,
  triggers, cache behavior, and publishing permissions. Configure `DOCKERHUB_USER`,
  `DOCKERHUB_PASS`, optional `SENTRY_AUTH_TOKEN`, and `REACT_APP_POSTHOG_KEY` in the
  destination project/context as appropriate.
- [ ] Vercel: Git connection, production branch, runtime, root/install/build/output,
  environment scopes and branch overrides, domains, deploy hooks, deployment
  protection, integrations, and ignored-build settings.
- [ ] GitHub: teams/collaborators, review policy, required checks, merge-commit
  support, webhooks, app access, labels, milestones, open issues and PRs.
- [ ] Sentry: repository association, release commit mapping, and source-map uploads.
  Preserve existing Sentry/PostHog project identities.
- [ ] Production/staging: actual deployment entry point, checkout revision, running
  auto-updaters, deployed image digests, and last working Vercel deployment.

On 2026-09-05, GitHub checks identified Vercel project `uwflow-frontend` in team
`uwflow-62bc4f45`. The inspecting CLI account could not access that team; private
settings remain unverified. The repositories had different review/admin policies
and no listed required main-branch status checks. Refresh these facts at cutover.

## Vercel cutover

Use the existing Vercel project so its identity and deployment history are retained.
Before switching its Git connection, build the migration branch in a temporary
validation project with appropriate non-production settings and access controls.
Do not assign production domains to that temporary project.

Apply these settings to the existing project when the destination branch contains
`frontend/`:

| Setting | Value |
| --- | --- |
| Git repository | `UWFlow/uwflow` |
| Root Directory | `frontend` |
| Framework preset | Other (`null` in `vercel.json`) |
| Install command | `bun install --frozen-lockfile` |
| Build command | `bun run build:vercel` |
| Output directory | `build` |
| Production branch | `main` |
| Node version | Compatible Node 22 runtime; verify against `frontend/.nvmrc` |

Root Directory and the Git connection are project settings, not properties to add
to `vercel.json`. An authorized owner can use the dashboard or Vercel CLI/API.
Grant the Vercel GitHub app access to `UWFlow/uwflow`, reconnect the project, and
compare every retained setting with the inventory. Remap branch-specific
variables and deploy hooks where necessary. Disable old path-based ignored-build
commands until monorepo behavior is verified.

Verify a new PR on `uwflow` receives a preview deployment, status check, and preview
link for its exact commit. Verify the `main` deployment separately. Existing
frontend PRs will not automatically gain monorepo previews; port them first.

The existing rewrites still send `/api` and `/graphql` to `https://uwflow.com`,
then apply the SPA fallback. These are frontend previews using the deployed
backend. Schema-dependent work needs a matching staging backend; a repository
migration does not provision per-PR databases or APIs. Keep production domains and
hosting topology unchanged during this cutover.

References: [Vercel monorepos](https://vercel.com/docs/monorepos),
[build settings](https://vercel.com/docs/builds/configure-a-build), and
[Git connection management](https://vercel.com/docs/cli/git).

## Production publishing handoff

1. Freeze frontend merges briefly. Confirm the imported source SHA is still the
   intended baseline; merge ready work or record how to port subsequent commits.
2. Prepare destination CircleCI credentials and validate the draft PR. Record the
   old production images and repository configuration for rollback.
3. Disable the old frontend publisher and drain/cancel its in-flight publishing
   jobs before merging. Two pipelines must not race on `neuwflow/frontend:latest`.
4. Coordinate any `script/stayupdated.sh` process or other auto-updater. Publishing
   `latest` can initiate rollout without a separate deploy command. Pause it during
   cutover, or pin the desired release in `.env` before publication.
5. Merge with a merge commit, verify the new CircleCI image publication, then
   reconnect Vercel and verify its previews and production-branch behavior.
6. Update the deployment checkout explicitly. Pulling images alone does not update
   mounted Nginx, Compose, migrations, or Hasura metadata. Apply backward-compatible
   schema/API changes before frontend changes that require them.
7. Pin the chosen release with `UWFLOW_IMAGE_TAG=<published-commit-sha>` in the root
   `.env`, then run `./script/deploy.sh` for a full release or
   `./script/deploy.sh frontend` for only the frontend. The latter assumes backend
   dependencies are already running. Hasura/Postgres retain their existing image
   versions; `UWFLOW_IMAGE_TAG` applies only to the four application images.
8. Verify served assets and API/GraphQL behavior, record deployed digests and checkout
   revision, then resume normal development and the intended updater behavior.

`latest` is retained for existing consumers, but pushes to several image repositories
are not atomic. SHA-pinned deployment is the way to select one complete release.
Both production and staging continue using the existing image names and root paths.

## Outstanding work and archive

The inventory on 2026-09-05 found 14 open frontend PRs and 4 open frontend issues.
The E2E harness was on an open PR, not frontend `main`; it is not included in this
import. Refresh this list rather than importing local feature branches silently.

- [ ] Merge ready PRs before the final import or port their commits into monorepo
  branches, accounting for the `frontend/` prefix. Reopen as drafts with links to
  original discussion and backend dependencies.
- [ ] Transfer active issues and reconcile labels/milestones. Git history import
  does not move GitHub issues, PRs, settings, or webhooks.
- [ ] Reconcile collaborators, teams, ownership and review policy. Once observed,
  configure required checks for `frontend-checks`, `frontend-build`, and
  `backend-build`; use the exact contexts GitHub receives. Publishing is main-only
  and should not be a required PR check.
- [ ] Update webhook consumers and repository-linked integrations, including Sentry.
- [ ] Keep historical tags/releases in the old repository or namespace any copied
  tags to avoid collisions.
- [ ] After the rollback window and active-work audit, add a migration notice,
  disable remaining old automation, and archive `uwflow_frontend`.
- [ ] Remove the temporary Vercel validation project after verification.

See [GitHub issue transfers](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository).

## Implementation validation

Verified locally for the migration changes:

- Frozen Bun install, frontend lint, TypeScript, production build, and all 44 unit tests.
- Ten command tests covering component builds, secret references, environment-file
  isolation, frontend-only deployment, failed pulls, and root Git hook installation.
- All four Docker images built successfully; backend builds include the Go suite.
- Official CircleCI CLI configuration validation passed.
- The frontend image served HTTPS, SPA deep links, JavaScript assets, missing-asset
  404s, and API/GraphQL rewrites using the existing Nginx configuration. Upstreams
  were disposable mocks, not production or a full staging database.

Reproduce the routing test with `make frontend-container-test` after building the
frontend image. Set `FRONTEND_TEST_IMAGE` to test a specific local image tag.
Vercel account settings, live previews, production rollout, and manual visual/login
checks remain cutover acceptance items below.

## Acceptance and rollback

Before cutover:

- [ ] Verify original frontend ancestry, exact import tree, and no frontend submodule.
- [ ] From a fresh clone, run `make frontend-install frontend-check frontend-build`
  and `make migration-test`. Verify the installed root hook.
- [ ] Build all four Docker images; backend builds include `go test ./...`.
- [ ] Validate CircleCI configuration and observe the draft PR checks.
- [ ] Verify frontend-only, backend-only, and combined PR preview/check behavior.
- [ ] Use terminal checks for assets, deep links, API and GraphQL routing; have a
  maintainer verify appearance and interactive login manually.
- [ ] Validate the frontend image with the existing Nginx configuration in staging.

After cutover:

- [ ] Verify monorepo `main` published and deployed the intended release.
- [ ] Verify the old publisher cannot overwrite images.
- [ ] Record and exercise restoration of a prior image digest and Vercel deployment.

If cutover fails, pause the new publisher and auto-updaters first. Restore the
known-good application image digests and matching checkout/configuration. Releases
predating this migration may not have common SHA tags, so use the recorded digests
in a Compose override file. Restore the prior Vercel deployment and, if necessary,
the previous Git connection and Root Directory settings. Only re-enable the old
publisher after the new publisher cannot race it. Do not reset the database to
reverse a repository migration; schema changes need a separate compatibility plan.
