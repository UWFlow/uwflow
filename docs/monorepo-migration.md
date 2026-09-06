# Proposal: combine UWFlow into one Git repository

Status: proposed. This document plans the migration; it does not change code,
CI/CD, hosting settings, or production infrastructure.

## Target

Import `UWFlow/uwflow_frontend` into `UWFlow/uwflow/frontend/`, preserving the
frontend commit history. All future development uses one repository, one set of
branches, and one pull-request workflow. A single commit can change frontend,
Go API, and Hasura schema together.

```text
uwflow/
├── .git/                  # Only Git repository in a normal clone
├── frontend/              # Ordinary tracked files; no nested .git or submodule
│   ├── src/
│   ├── public/
│   ├── config/
│   ├── scripts/
│   ├── package.json
│   ├── bun.lock
│   ├── Dockerfile
│   └── vercel.json
├── flow/
├── hasura/
├── nginx/
├── staging/
├── script/
├── .circleci/config.yml
├── docker-compose.yml
└── Makefile
```

Keep backend paths stable to preserve Compose mounts, Go build contexts, Hasura
configuration, and staging bootstrap. Keep Bun dependencies inside `frontend/`;
no root JavaScript workspace or build orchestrator is needed for this migration.
Archive the old frontend repository after cutover and outstanding work transfer.

## Inspected baseline

Inspected on 2026-09-05:

- Backend `main`: `9ef3b71`; frontend `main`: `03ef05d`.
- Backend CircleCI builds and publishes `neuwflow/api`, `neuwflow/email`, and
  `neuwflow/uw`. Frontend CircleCI separately publishes `neuwflow/frontend`.
  Both publish `latest` on `main`.
- Production Compose consumes those images. The frontend container serves the
  built assets through the repository's Nginx configuration.
- Frontend `vercel.json` builds with `bun run build:vercel`, serves `build`, and
  proxies `/api` and `/graphql` to `https://uwflow.com` before the SPA fallback.
- GitHub deployment checks identify Vercel project `uwflow-frontend` in team
  `uwflow-62bc4f45`. The inspecting CLI account cannot access that team; private
  project settings, domains, and environment configuration remain unverified.
- Frontend build configuration derives application paths from `process.cwd()`.
- `script/deploy.sh` omits the frontend. `script/stayupdated.sh` continuously
  pulls images; which mechanism production currently uses remains unverified.
- There are 14 open frontend PRs and 4 open frontend issues. The E2E harness is
  on an open PR, not frontend `main`.
- Main-branch review/admin protections differ between repositories. Neither
  inspected main-branch protection lists required status checks.

Refresh this inventory before execution. Local feature branches and untracked
files are not migration inputs.

## 1. Inventory external settings and establish rollback

- [ ] Record exact source SHAs and the destination base SHA.
- [ ] Inventory CircleCI variable names, contexts, triggers, permissions, SSH
  keys, and caches. Configure required credentials in the destination project
  without copying secret values into Git or the migration document.
- [ ] Have an authorized Vercel owner inventory the Git connection, production
  branch, root/build/install/output settings, runtime version, environment
  scopes and branch overrides, domains, deployment protection, integrations,
  deploy hooks, and ignored-build settings.
- [ ] Inventory GitHub teams, collaborators, protections, webhooks, app access,
  labels, milestones, releases, issues, and outstanding branches/PRs.
- [ ] Inventory Sentry repository association, release commit mapping, and
  source-map upload configuration. Retain existing analytics project identities.
- [ ] Identify the actual production deployment process, repository checkout,
  auto-updaters, and staging consumers. Record deployed image digests, repository
  revision, and the last working Vercel deployment.
- [ ] Record owners for CI, Vercel, production rollout, and repository migration.

## 2. Import the frontend and its history

- [ ] Work in an isolated checkout from destination `main`.
- [ ] Use a one-time `git subtree add --prefix=frontend` import of the selected
  frontend commit, without `--squash`. This joins the histories; it creates no
  submodule, nested repository, or ongoing synchronization requirement.
- [ ] Compare the imported `frontend/` tree with the source commit before
  making migration edits. Preserve all tracked application assets, licenses,
  documentation, dotfiles, agent instructions, and skills.
- [ ] Do not copy `.git`, local environment files, `node_modules`, build outputs,
  or workstation-only files from an existing working directory.
- [ ] Preserve imported ancestry when merging the implementation PR. Use a merge
  commit; squash/rebase merging would discard the intended history connection.
- [ ] Document the import SHA and history lookup across the directory boundary.
  Original frontend commit IDs remain reachable, though their historical paths
  are at the old repository root.

## 3. Update developer tooling

- [ ] Add root convenience targets for frontend install, start, lint, typecheck,
  unit tests, build, and GraphQL generation. Run every frontend command with
  `frontend/` as its working directory.
- [ ] Allow frontend-only targets to run without a backend `.env`; the current
  Makefile includes it unconditionally. Preserve required backend configuration
  checks for backend targets.
- [ ] Keep frontend environment overrides inside `frontend/` and backend
  environment configuration at the repository root.
- [ ] Update README setup instructions, CI badges, sibling-repository references,
  documentation, and agent/skill paths for the unified checkout.
- [ ] Adapt Husky/lint-staged to the root Git repository and test hook execution
  on frontend files. Preserve the frontend pre-commit lint requirement.
- [ ] Review ignore rules and Docker context exclusions, including local
  environment files and Vercel link metadata.
- [ ] Run code generation from `frontend/` against the matching monorepo Hasura
  schema. Do not hand-edit generated GraphQL types.
- [ ] Port E2E harness paths when its open PR is migrated; do not assume that
  feature-branch tooling is already part of the baseline.

## 4. Consolidate CircleCI

Replace the two independent configurations with one root pipeline. Remove the
imported `frontend/.circleci/config.yml` after incorporating its responsibilities.

| Area | Required behavior |
| --- | --- |
| Frontend checks | From `frontend/`: frozen Bun install, lint, TypeScript, unit tests, production build |
| Frontend image | Build using `frontend/` as the Docker context |
| Backend checks/images | Preserve the `flow/` context and API/email/importer targets; run appropriate Go checks in the project Linux environment |
| Artifacts | Separate frontend/backend image archive names and workspace paths |
| Caches | Key frontend dependencies on `frontend/bun.lock` and pinned runtime versions |
| Publishing | Only trusted `main` builds publish after required validation |
| Credentials | Destination project provides Docker Hub credentials, Sentry token, and frontend public build variables |
| Image identity | Retain existing image names; add commit-SHA tags alongside `latest` |

Preserve Bun `1.3.14` and the frontend Node version declaration unless a separate
compatibility change is needed. Preserve optional Sentry source-map upload through
the Docker build secret; PR validation must not depend on publishing credentials.

Initially run frontend and backend validation on every PR. After cutover, add
path filtering with an explicit dependency map:

- `frontend/**`: frontend jobs.
- `flow/**`: backend jobs.
- `hasura/**`: backend/schema checks and frontend contract checks.
- Shared CI, build, or deployment configuration: all affected jobs.
- Documentation-only changes: lightweight validation, with required checks still
  reaching a terminal successful state.

Introduce required GitHub checks only after verifying their actual names and
behavior, including changes that skip component work. See
[CircleCI dynamic configuration](https://circleci.com/docs/guides/orchestrate/using-dynamic-configuration/).

## 5. Reconnect the existing Vercel project

Use a temporary validation project to build the migration branch before switching
the existing project's repository connection. Configure equivalent non-production
settings and access controls; do not attach production domains to that project.

At cutover, retain the existing Vercel project and reconnect it to `UWFlow/uwflow`:

| Setting | Target |
| --- | --- |
| Root Directory | `frontend` |
| Install command | `bun install --frozen-lockfile` |
| Build command | `bun run build:vercel` |
| Output Directory | `build` |
| Production branch | `main` |
| Application configuration | `frontend/vercel.json` |

- [ ] Grant the Vercel GitHub app access to `UWFlow/uwflow`.
- [ ] Preserve and verify project domains, environment scopes, protection,
  runtime settings, and integrations against the inventory.
- [ ] Remap branch-specific variables and deploy hooks as needed.
- [ ] Preserve API/GraphQL rewrites and SPA fallback ordering.
- [ ] Verify a new monorepo PR receives a preview deployment, status check, and
  preview link associated with the correct monorepo commit.
- [ ] Verify a `main` build follows the intended production-branch behavior.
- [ ] Start without build-skipping optimization. Later, account for shared
  configuration/schema dependencies and required-check behavior when skipping.

A frontend preview continues to use the deployed backend under the current
rewrite contract. Combining repositories does not create isolated backend or
database previews. Test schema-dependent changes against matching staging
services before rollout. Creating per-PR backend environments is separate work.

References: [Vercel monorepos](https://vercel.com/docs/monorepos) and
[Vercel Git connection management](https://vercel.com/docs/cli/git).

## 6. Hand over production publishing and deployment

- [ ] Disable the old frontend publisher and drain or cancel in-flight publishing
  jobs before the new pipeline can update `neuwflow/frontend:latest`.
- [ ] Extend or replace the active deployment entry point to include frontend
  releases; the checked-in `script/deploy.sh` currently excludes them.
- [ ] Account for any running auto-updater: publishing `latest` may itself start
  rollout. Coordinate or pause it during the cutover and rollback window.
- [ ] Keep Nginx/Compose/Hasura repository synchronization explicit. Pulling an
  image alone does not update mounted configuration, migrations, or metadata.
- [ ] Validate staging bootstrap and existing image consumers with the retained
  backend paths and image names.
- [ ] Deploy backward-compatible schema/API changes before dependent frontend
  changes. Record the image digests and repository revision for each release.

## 7. Move outstanding work and repository administration

- [ ] During a short frontend merge freeze, refresh and import the final source
  SHA. Account explicitly for every open PR and active branch.
- [ ] Merge ready frontend PRs before that import or port their changes to
  monorepo branches. Reopen ported PRs as drafts with links to original discussion
  and backend dependencies. Preserve original PRs as historical references.
- [ ] Transfer open issues, preserving labels/milestones as appropriate. See
  [GitHub issue transfers](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository).
- [ ] Reconcile collaborators, teams, ownership/review policy, branch protections,
  labels, milestones, releases, and repository links.
- [ ] Update or retire webhook consumers and app connections deliberately;
  repository-level settings do not move with a Git history import.
- [ ] Keep old branches, tags, releases, and closed PR discussions available in
  the old repository; port active work and namespace any tags copied into the
  destination to avoid collisions.
- [ ] After the rollback window and outstanding-work audit, add a migration
  notice to the old repository and archive it.

## Acceptance checklist

- [ ] A fresh clone contains ordinary frontend files and no nested frontend Git
  repository or submodule; both original histories are reachable.
- [ ] Frontend install/start/checks work from documented root commands without
  requiring backend credentials for frontend-only tasks.
- [ ] Frontend lint, TypeScript, unit tests, production build, and relevant Go
  checks pass; all four application Docker images build.
- [ ] Frontend-only, backend-only, and combined PRs report expected checks.
- [ ] A monorepo PR receives a working Vercel preview for its exact commit.
- [ ] Terminal checks validate assets, deep-link responses, and API/GraphQL
  routing. A maintainer verifies appearance and interactive login manually;
  browser UI automation requires an explicit user request.
- [ ] A staging deployment proves the frontend image works with existing Nginx
  routing and matching backend/schema changes.
- [ ] Destination `main` publishes expected images and the deployment mechanism
  actually serves the expected revision.
- [ ] Old publishing jobs cannot overwrite new images.
- [ ] A prior image digest and Vercel deployment can be restored.

## Cutover and rollback order

1. Complete the inventory and baseline validation; prepare the history-preserving
   implementation PR as a draft and validate its frontend on the temporary
   Vercel project. Prepare destination credentials before merging.
2. Freeze frontend merges briefly, refresh the imported source SHA, and repeat
   affected checks. Disable the old publisher and drain its jobs. Coordinate
   production auto-updaters so no unreviewed release is pulled mid-cutover.
3. Merge the implementation PR with a merge commit. Reconnect the existing
   Vercel project and set its root directory only once `frontend/` exists on the
   destination branch. Verify previews and production-branch behavior.
4. Verify the new CircleCI publication, then deploy and verify production with
   the recorded release identity. Resume normal development in `uwflow`.
5. Port remaining work, observe the rollback window, then archive the old repo
   and remove the temporary validation project.

If cutover fails, pause the new publisher and any auto-updater first. Restore
known-good image digests plus the matching repository configuration; restore the
previous Vercel deployment and, if needed, its old Git connection/root settings.
Only re-enable the old publisher after the new one cannot race it. Do not reset
the database or undo unrelated work to reverse a repository migration. Any schema
change needs its own compatibility/rollback plan.

## Delivery

This proposal PR is documentation only. The implementation PR will contain the
history import, tooling updates, consolidated CI, deployment-script changes, and
the completed cutover runbook. External service changes happen during the
coordinated cutover after implementation validation. Path-filtering optimization
can follow once the unified pipeline has proven reliable.
