# Admin-approved Neon previews on EC2

A maintainer requests a frontend PR preview in GitHub Actions. An administrator approves the exact frontend and backend commits in the `ec2-preview` environment. The workflow builds the backend on a GitHub runner, then EC2 reserves a slot, creates a Neon child branch, starts API/Hasura/gateway containers, and creates a Vercel deployment. The workflow summary contains the review URL, both SHAs, and expiry.

A new commit does **not** execute on EC2 until another request is approved. Backend code defaults to the backend main SHA resolved before approval; supply another full backend SHA to test a coordinated change. This first version supports frontend PRs in `UWFlow/uwflow_frontend`; fork PRs must first be copied to a maintainer-owned branch for review.

```text
GitHub request -> exact-SHA approval -> build images on GitHub
                                         |
                                         v
                         EC2 capacity lock + durable journal
                              /                      \
                 Neon child branch             API + Hasura
                                                     ^
Vercel review URL -> same-origin /api and /graphql -> gateway
```

## What is enforced

- **Capacity:** one active/provisioning/deleting preview by default. The host also requires 1.5 GiB available RAM and 4 GiB free Docker disk before deployment. Adjust only after measuring production headroom. A small existing instance may refuse deployment until resized.
- **Limits:** API 256 MiB, Hasura 768 MiB, gateway 64 MiB; each has a 0.5 CPU and 128 PID limit and bounded logs. The API uses five database connections; Hasura metadata uses ten. Neon compute is fixed at 0.25 CU with five-minute auto-suspend configured. Hasura activity can prevent suspension, so do not assume previews cost nothing.
- **Lifetime:** 24 hours by default, configurable down to one hour; the host maximum is authoritative. A successful redeployment of an approved PR preserves its database/JWT and renews its lifetime. Updates briefly stop that preview; a failed update destroys the preview and its database so the next request starts clean. There is no hourly reset. Destroy then deploy to start again from the baseline.
- **Cleanup:** the EC2 systemd timer checks every five minutes for closed/merged PRs, expired leases, and failed attempts. It removes containers and private networks first, then the Neon branch, owned Vercel deployments, credentials and unused preview images. It never runs global Docker prune or touches production volumes. The shared edge network remains installed. Published GHCR build images remain in the registry as build artifacts; configure package retention separately if needed.
- **Recovery:** reservations and unique ownership names are journaled before cloud creation. Cleanup discovers resources even if a create response was lost. Cloud failures retain the slot and journal for retry; local compute is stopped on expiry even if GitHub/Neon/Vercel are unavailable. Keep `/var/lib/uwflow-preview` on persistent EC2 storage.
- **Bounded operations:** a host operation has a 25-minute hard deadline. Operations serialize using `flock`; a running deployment can delay the timer by up to that bound. A killed provisioning attempt expires after 30 minutes. Normal ready-preview cleanup runs on the next five-minute timer tick; it does not rely on GitHub scheduled workflows/webhooks.

Containers share the production kernel. The limits reduce accidental overload; they do not sandbox hostile code from production. Approve only reviewed backend code, keep production credentials/mounts and the Docker socket out of previews, and block container access to EC2 instance metadata. Use separate compute if arbitrary fork code must run.

## 1. Create and seed Neon

1. Create a **separate preview project**, near EC2, with Postgres 15. Do not branch from production data. Rename its root branch `baseline`.
2. Create a `flow_preview` role and database owned by that role. This dedicated project should contain only synthetic data and this preview application role; no production roles or passwords. Record the project ID, baseline branch ID, database and role names.
3. From a trusted checkout of this backend with these changes, install Docker Compose v2 and run:

   ```sh
   python3 preview/bootstrap.py
   ```

   Paste the baseline database's **direct**, unpooled Neon connection URI at the hidden prompt. The helper requires database name `flow_preview`, verifies TLS, applies the repository's Hasura migrations/metadata, inserts `preview/seed.sql`, and removes its temporary local container. The Neon baseline remains. This writes to the selected baseline database; run it only against the new preview project.
4. Record the backend commit used to initialize the baseline. Deploy newer revisions with forward-compatible migrations. Do not deploy older schema revisions against a newer baseline. To change/reset the baseline, first destroy active previews, update the baseline using a trusted revision, then create new previews.
5. Create a Neon API token scoped to this preview project where available. Put it in the root-only EC2 config below. The controller resets the child role password before starting any PR containers, so they never receive the baseline password.

Neon supplies Postgres branching here. Existing UWFlow email/JWT authentication remains in use; this does not migrate to Neon Auth or repair Google OAuth origin restrictions.

## 2. Prepare a Vercel project

Create a **dedicated** `uwflow-preview` Vercel project, with no production environment variables, Sentry upload token, production aliases or production domains. Use Bun 1.3.14 / the repository's pinned package manager. Disable automatic Git deployments for this dedicated project: the controller uploads the approved SHA's source through the Vercel API. Record its project ID, team ID and a token with access to it.

The uploaded copy receives a generated `vercel.json` that overrides production rewrites, runs `build:vercel`, and routes `/api` and `/graphql` to `https://pr-N.preview-api.uwflow.com`. The browser uses same-origin URLs, avoiding preview CORS configuration. No database/admin/cloud secret goes into the browser or Vercel build. Repository files are not modified.

Existing automatic Vercel previews are separate; they are **not** silently redirected. Use the URL from the approved workflow summary for the isolated preview. On expiry that deployment is deleted, and its backend becomes unavailable; there is no production fallback.

## 3. Install the EC2 controller

Use Ubuntu with Python 3.10+, Docker and the **`docker compose` plugin**. Older EC2 setup scripts installed only `/usr/local/bin/docker-compose`; install the plugin if `docker compose version` fails. Images are built on GitHub's Linux x86_64 runner, so use an x86_64 EC2 instance.

From a trusted checkout on EC2:

```sh
sudo install -d -m 755 /opt/uwflow-preview
sudo install -d -m 700 /etc/uwflow-preview /var/lib/uwflow-preview
sudo install -m 644 preview/controller.py /opt/uwflow-preview/controller.py
sudo install -m 755 preview/ssh-command /opt/uwflow-preview/ssh-command
sudo install -m 600 preview/config.example.json /etc/uwflow-preview/config.json
sudoedit /etc/uwflow-preview/config.json
sudo docker network create uwflow-preview-edge
```

Fill every `REPLACE` field. `github_token` needs read access to the public frontend PR API; it needs no write permissions. Neon and Vercel tokens stay on EC2. Restrict token scope to the separate preview projects as far as the providers allow. The example image prefix must match the backend repository's GHCR packages (`ghcr.io/uwflow/uwflow-preview-api` and `...-hasura`).

GHCR packages initially default to private. Either give root's Docker client read access using a dedicated `read:packages` token (`sudo docker login ghcr.io`), or make just these preview packages public after their first publication. If you choose public packages, the first deployment may fail to pull before you change package visibility; cleanup removes that attempt and a new approved run can proceed. The timer does not need image registry credentials to stop containers.

Require IMDSv2 and set EC2's metadata response hop limit to 1. Verify from a disposable container that instance metadata cannot be reached, and restrict the instance's IAM role to what production actually needs. Do not expose Docker's API over TCP. Restrict inbound traffic to the existing HTTPS proxy and authenticated SSH; the controller publishes diagnostic ports only on loopback.

## 4. Configure restricted deployment SSH

Create a separate Linux account; **do not** add it to the Docker group:

```sh
sudo useradd --create-home --shell /bin/sh preview-deploy
sudo install -d -o root -g root -m 755 /home/preview-deploy/.ssh
sudo touch /home/preview-deploy/.ssh/authorized_keys
sudo chown root:root /home/preview-deploy /home/preview-deploy/.ssh/authorized_keys
sudo chmod 755 /home/preview-deploy
sudo chmod 644 /home/preview-deploy/.ssh/authorized_keys
sudo visudo -f /etc/sudoers.d/uwflow-preview
```

Add exactly this sudoers rule:

```text
preview-deploy ALL=(root) NOPASSWD: /usr/bin/python3 /opt/uwflow-preview/controller.py request
```

Generate a dedicated deployment SSH key on your workstation. Add its public key to `authorized_keys` as one line:

```text
restrict,command="/opt/uwflow-preview/ssh-command" ssh-ed25519 YOUR_PUBLIC_KEY
```

Keep the account home, key file, controller and config root-owned. `restrict` disables forwarding/PTY; the forced command ignores `SSH_ORIGINAL_COMMAND` and accepts bounded JSON only. Do not reuse your normal administrator SSH key.

Verify the EC2 host-key fingerprint through your existing trusted admin session. Save that verified known_hosts entry; the workflow rejects unknown/changed host keys rather than using `ssh-keyscan` as trust-on-first-use.

## 5. Route HTTPS to preview gateways

1. Point `*.preview-api.uwflow.com` at EC2. Obtain a publicly trusted wildcard certificate using DNS validation and configure renewal. The existing production certificate usually will not cover these names.
2. Place the wildcard certificate and key in the production checkout's `.ssl/preview/fullchain.pem` and `.ssl/preview/privkey.pem`.
3. Copy `preview/edge.conf.example` to the production checkout's `nginx/config/preview.conf`, adjusting its domain. It resolves a PR-specific gateway through Docker DNS and never routes a missing preview to production.
4. Attach the existing `frontend` reverse proxy to the shared network persistently using the supplied Compose override:

   ```sh
   docker compose -f docker-compose.yml -f preview/production-edge.override.yml config --quiet
   docker compose -f docker-compose.yml -f preview/production-edge.override.yml up -d --no-deps frontend
   docker exec frontend nginx -t
   ```

   This recreates only the existing proxy and briefly interrupts frontend connections; arrange the one-time change accordingly. Keep the override in the production proxy's future startup commands. Existing production deploys that touch only API/Hasura/importer/email do not need it. The existing `/nginx/run.sh` generates the preview server config on startup. Do not start a second listener on ports 80/443.

Validate DNS and certificate issuance before the first preview. From outside EC2, an undeployed `pr-N` host should return a gateway error, never production app data.

## 6. Enable cleanup before allowing deployment

```sh
sudo install -m 644 preview/uwflow-preview-gc.service preview/uwflow-preview-gc.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now uwflow-preview-gc.timer
sudo systemctl start uwflow-preview-gc.service
sudo systemctl list-timers uwflow-preview-gc.timer
sudo journalctl -u uwflow-preview-gc.service -n 30
```

Monitor timer failures. The timer starts after reboot and does not require a CI secret. Do not delete the state directory to fix a stuck slot: retry reconciliation after restoring provider access. Failed partial provisioning is deliberately counted toward capacity until cleanup is complete.

## 7. Configure the GitHub admin gate

After merging this draft PR, in **UWFlow/uwflow → Settings → Environments**, create `ec2-preview`:

- Add designated administrators as **required reviewers**. Enable **Prevent self-review** if a second administrator should approve requests; otherwise a designated administrator may approve their own request.
- Disable administrator bypass of protection rules. Restrict deployment branches to **main only**.
- Add environment secret `PREVIEW_SSH_KEY` (the dedicated private key) and `PREVIEW_KNOWN_HOSTS` (the verified host entry).
- Add environment variable `PREVIEW_EC2_HOST` (EC2 hostname).

Do this **before** adding the SSH secret. Without required reviewers, naming an environment alone does not create an approval gate. The workflow runs from `main` only, resolves SHAs in a read-only job, then blocks at the protected environment before building/deploying. Do not place the deployment key in repository-level secrets or authorize PR branch workflows to use it.

Required environment reviewers are available for public repositories on GitHub Free; this backend repository is public. If repository visibility changes, verify your plan still supports required reviewers. Protect changes to `.github/workflows/preview.yml`, `preview/` and `flow/Dockerfile` through your normal main-branch review rules.

Open **Actions → Approved branch preview → Run workflow**, choose `main`, `deploy`, the frontend PR number, optional full backend SHA and TTL. Review the exact SHAs shown, approve, then use the URL in the workflow summary. Run again with `destroy` to remove immediately or `status` to list leases. A PR closed during deployment is rejected/cleaned; one that changes while approval is pending requires a new request.

## Review and validation

Run these locally without cloud credentials:

```sh
python3 -m unittest discover -s preview/tests -v
docker build --target api -t uwflow-preview-api-validation flow
docker build -f preview/Hasura.Dockerfile -t uwflow-preview-hasura-validation .
python3 preview/smoke.py
```

The same checks run on PRs in `preview-checks.yml`. The smoke test creates isolated containers with ephemeral Postgres, applies real migrations, checks signup/login and review creation/editing through the gateway, deletes its test account, then removes its stack. It uses HTTP APIs, not a browser, and does not contact Neon/Vercel or production.

After one-time provider setup, validate the real path with a **one-hour** approved preview:

1. Open the workflow URL. Create an account, sign out/in, post a CS135 review, and edit it. The baseline has a synthetic CS135 course; import a sanitized catalog into the baseline if richer manual testing is needed.
2. Check the browser's network requests use that URL's `/api` and `/graphql`, whose Vercel rewrites point to the PR backend. Confirm the matching Neon child exists.
3. Attempt a second preview with capacity one; it must be refused. Push another frontend commit; no new EC2 deployment should occur automatically.
4. Close the PR and confirm the timer removes containers, Neon child and Vercel deployment. Repeat with TTL expiry while GitHub access is temporarily unavailable; EC2 containers must still stop.
5. Check production health throughout. Only raise capacity after measuring peak memory, CPU and disk usage under review traffic.

This provides the isolated hosted target for manual validation and future hosted Playwright runs. The frontend's existing E2E helper currently accepts only local endpoints; this PR does not change that runner or enable Google SSO on arbitrary preview origins. Email/password works against the real API. Browser E2E and Google OAuth migration should be validated separately against this infrastructure.

Provider contracts: [GitHub environment protection](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments), [Neon branch creation](https://api-docs.neon.tech/reference/createprojectbranch), [child role password reset](https://api-docs.neon.tech/reference/resetprojectbranchrolepassword), [Vercel source deployments](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment).
