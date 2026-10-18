# Staging deploys

[`.github/workflows/staging.yml`](../../.github/workflows/staging.yml) builds a PR
on GitHub's runners, deploys it to the staging box (`3.135.22.212`, the
server-infra EC2 instance), and smoke-tests it.

## Using it

- **Deploy a PR:** add the `staging` label. Every later push to that PR redeploys
  it automatically.
- **One slot:** deploying a PR removes the label from whichever PR held staging
  before, and leaves that PR a comment.
- **Deploy main or a PR by number:** Actions → Staging → Run workflow.
- **Fresh production data:** tick *refresh data* on a manual run. Data is also
  refreshed automatically on the first deploy, and when the previous deploy
  applied a migration the new revision does not have.

Fork PRs are never deployed, because they would run next to staging's secrets.
Push the branch to this repository first.

## What a run does

```text
resolve   PR/main -> head SHA                            (ubuntu-latest)
backend   flow/Dockerfile -> api, uw, email images       (STAGING_BUILD_RUNNER)  in parallel
frontend  frontend/Dockerfile -> frontend image          (STAGING_BUILD_RUNNER)  in parallel
          pushed to ghcr.io/uwflow/uwflow-staging-<svc>:<sha>, layer cache in GHA
deploy    open port 22 to this runner -> ssh staging login/deploy/smoke -> close port 22
```

On the box, `uwflow-staging deploy` does the following, in order:

1. Pulls every image before stopping anything.
2. Starts Postgres. If a data refresh is needed, it copies the newest
   `YYYY-MM-DD-pg-latest.dump` from production with `scp`, restores it into a
   scratch database with `--exit-on-error`, and swaps it in only if the restore
   succeeds.
3. Starts `postgres`, `hasura`, `api` and `frontend` from the
   [production compose file](../../docker-compose.yml) plus
   [staging overrides](docker-compose.staging.yml). Hasura applies the PR's
   migrations and metadata on start.

`uw` (the importer) and `email` are built but never started. The email worker
would mail real users from the restored production queue.

`uwflow-staging smoke` then checks each layer in turn:

- the containers are up and not crash-looping;
- `api` and `frontend` were built from this exact SHA;
- the Hasura metadata is consistent;
- an anonymous GraphQL query and the Go API's `/data/search` work through nginx;
- `index.html` and its JS bundle are served.

If `STAGING_URL` is set, the runner also checks the public URL through Cloudflare.

## Trust boundary

A PR supplies only data: the images it built, plus its `hasura/` and `nginx/`
trees, which are untarred with symlinks rejected. Everything that runs as root,
including the compose files, comes from `main` through `install.sh`. The GitHub
key is pinned to the `uwflow-staging` command (`restrict,command=...`), so it
gets no shell and no port forwarding. That matters because the box holds
production SSH credentials and a copy of production data.

Anyone with write access can still deploy arbitrary application code to staging,
and through it read the staging copy of production data. Add required reviewers
to the `staging` environment if that is too broad.

## One-time setup

### 1. Install on the box

```bash
ssh ytdlp
git clone https://github.com/UWFlow/uwflow ~/uwflow && cd ~/uwflow   # main
ssh-keygen -t ed25519 -N '' -C github-actions-staging -f ~/github-actions-staging
sudo staging/box/install.sh --github-key ~/github-actions-staging.pub
```

Then edit these files (all root-owned, mode 0600):

- `/etc/uwflow-staging/env`: set `DOMAIN` to staging's hostname. Secrets were
  generated fresh, and the JWT key differs from production.
- `/etc/uwflow-staging/prod_ssh_config`: production's `HostName`.
- `/etc/uwflow-staging/prod_ssh_key`: the production key (`chmod 600`).
- `/etc/uwflow-staging/prod_known_hosts`: `ssh-keyscan <prod-ip>`, checked
  against the fingerprint you already trust from your Mac's `known_hosts`.

To upgrade after a change to `staging/box/` lands on `main`, run `git pull` and
`sudo staging/box/install.sh`. Config and data are kept.

### 2. AWS role for the security group

The box only accepts SSH from your IP. Add
[`github-actions-role.tf.example`](github-actions-role.tf.example) to
server-infra's `terraform/`, with
`staging_security_group_id = "sg-031c1e6ebf4ae7321"`. It adds only IAM
resources, and `terraform plan` should not touch the instance.

### 3. GitHub

Create the `staging` label, then an environment named `staging` holding:

| Kind | Name | Value |
| --- | --- | --- |
| secret | `STAGING_SSH_KEY` | contents of `~/github-actions-staging` (then delete it from the box) |
| secret | `STAGING_SSH_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 3.135.22.212` |
| variable | `STAGING_SSH_HOST` | `3.135.22.212` |
| variable | `STAGING_SECURITY_GROUP_ID` | `sg-031c1e6ebf4ae7321` |
| variable | `STAGING_AWS_ROLE_ARN` | output `uwflow_staging_deploy_role_arn` |
| variable | `STAGING_URL` | optional public URL, e.g. `https://staging.example.com` |

Optional *repository* variable: `STAGING_BUILD_RUNNER` names a larger-runner
label, which needs a paid GitHub plan for the org. Without it, builds use
`ubuntu-latest`, and the GHA layer cache makes repeat builds fast.

### 4. Public URL (optional)

In the Cloudflare tunnel's dashboard, add a public hostname pointing at
`https://localhost:18443`, with *No TLS Verify* on and the origin server name
set to `DOMAIN`. Without it, staging is reachable through
`ssh -L 18443:127.0.0.1:18443 ytdlp`.

## Operating

```bash
ssh ytdlp sudo uwflow-staging status
ssh ytdlp sudo uwflow-staging logs api
ssh ytdlp sudo uwflow-staging sync-data      # refresh data without redeploying
ssh -L 15432:127.0.0.1:15432 ytdlp           # staging Postgres for psql / DB tools
```
