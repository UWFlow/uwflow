# Staging

[`.github/workflows/staging.yml`](../.github/workflows/staging.yml) deploys a PR
to the staging box: the server-infra EC2 instance at `3.135.22.212`
(`ssh ytdlp`).

**To deploy a PR,** add the `staging` label. Later pushes redeploy it.
Deploying a PR removes the label from whichever PR had it before. **Run
workflow** deploys `main` or a PR by number, and its *refresh data* option
replaces staging's data with today's production dump.

## What a run does

1. Builds the `api` and `frontend` images on `ubuntu-latest` with
   `script/build.sh`, tagged `neuwflow/<service>:<sha>`. For public
   repositories that runner has 4 vCPU and 16 GB and costs nothing; larger
   runners would need a paid org plan.
2. Opens port 22 on the box's security group to the runner's IP, and closes
   it again when the job ends.
3. Streams the images over SSH with `docker save | ssh … docker load`.
   Nothing is pushed to a registry.
4. On the box, in `~/uwflow`, checks out the same commit, so migrations,
   Hasura metadata and the nginx config match the images.
5. On the first deploy, or when asked, runs `script/fetch-dump.sh uwflow-prod`
   and then `make setup`.
6. Runs `docker compose up -d postgres hasura api frontend`. Hasura applies
   the PR's migrations on start. `uw` and `email` are never started:
   the email worker would mail real users from the production queue.
7. Smoke-tests the deploy:
   - the right images are running;
   - `index.html` loads;
   - anonymous GraphQL returns courses;
   - `/api/data/search` works;
   - Hasura metadata is consistent;
   - no container is crash-looping.

The workflow logs in as `ubuntu`, so code from any PR can read whatever that
user can read on the box, including the production SSH key. Only people with
write access to this repository can trigger a deploy. Add required reviewers
to the `staging` environment if that's too broad.

## One-time setup

### Box

```bash
ssh ytdlp
sudo apt-get install -y make
git clone https://github.com/UWFlow/uwflow ~/uwflow && cd ~/uwflow
cp .env.sample .env
# Staging values. Fresh secrets mean production sessions don't work here.
sed -i -e "s/^DOMAIN=.*/DOMAIN=staging.uwflow.local/" \
  -e "s/^RUN_MODE=.*/RUN_MODE=staging/" \
  -e "s/^HASURA_PORT=.*/HASURA_PORT=18080/" \
  -e "s/^HASURA_GRAPHQL_ADMIN_SECRET=.*/HASURA_GRAPHQL_ADMIN_SECRET=$(openssl rand -hex 24)/" \
  -e "s/^HASURA_GRAPHQL_JWT_KEY=.*/HASURA_GRAPHQL_JWT_KEY=$(openssl rand -hex 32)/" \
  -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" \
  -e "s/^SMTP_PASSWORD=.*/SMTP_PASSWORD=/" .env
```

Why these values:
- **`HASURA_PORT=18080`:** server-infra's nginx already listens on
  `127.0.0.1:8080`.
- **`DOMAIN`:** set it to the hostname you route to staging.
- **Production access:** for `fetch-dump.sh`, add a `uwflow-prod` entry to
  `~/.ssh/config` on the box, matching the one on your Mac, and copy its key
  over.

For GitHub's key, run `ssh-keygen -t ed25519 -N '' -f ~/gha` on the box.
Append `~/gha.pub` to `~/.ssh/authorized_keys`, store `~/gha` as the secret
below, then delete both files.

### AWS role

The workflow needs a role it can assume through GitHub OIDC. The role may
only add and remove SSH rules on the box's security group. Add this to
server-infra's `terraform/`. It only adds IAM resources and does not replace
the instance.

```hcl
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

resource "aws_iam_role" "uwflow_staging_deploy" {
  name = "uwflow-staging-deploy"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRoleWithWebIdentity"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Condition = { StringEquals = {
        "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        "token.actions.githubusercontent.com:sub" = "repo:UWFlow/uwflow:environment:staging"
      } }
    }]
  })
}

resource "aws_iam_role_policy" "uwflow_staging_deploy" {
  role = aws_iam_role.uwflow_staging_deploy.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ec2:AuthorizeSecurityGroupIngress", "ec2:RevokeSecurityGroupIngress"]
      Resource = "arn:aws:ec2:us-east-2:825063800433:security-group/sg-031c1e6ebf4ae7321"
    }]
  })
}
```

### GitHub

Create the `staging` label and an environment named `staging` with:

| Kind | Name | Value |
| --- | --- | --- |
| secret | `STAGING_SSH_KEY` | private key from the box step above |
| secret | `STAGING_SSH_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 3.135.22.212` |
| variable | `STAGING_SSH_HOST` | `3.135.22.212` |
| variable | `STAGING_SECURITY_GROUP_ID` | `sg-031c1e6ebf4ae7321` |
| variable | `STAGING_AWS_ROLE_ARN` | ARN of `uwflow-staging-deploy` |
| variable | `STAGING_URL` | optional public URL, shown on the deployment |

## Reaching staging

Staging's ports are closed to the internet. Forward them over SSH:
`ssh -L 8443:127.0.0.1:443 -L 15432:127.0.0.1:5432 ytdlp`. For a public
URL, add a Cloudflare tunnel hostname pointing at `https://localhost:443`,
with *No TLS Verify* turned on.
