# uwflow-terraform

Cheap single-box AWS deploy of the [UWFlow](https://github.com/UWFlow/uwflow)
docker-compose stack for **staging**. Target cost: **~$19.50/mo** running,
**~$0.80/mo** when stopped (t3.small + auto-assigned public IPv4 + 10 GiB gp3).

This is one EC2 instance running all six containers (postgres, hasura, api,
uw, email, frontend/nginx). Not for production — no RDS, no ALB, no managed
TLS, no autoscaling. See `main.tf` for `TODO` markers where each of those
would be the next upgrade.

## Files

```
.
├── main.tf                       # SG, IAM, AMI, EC2
├── variables.tf                  # inputs (incl. sensitive app_env map)
├── outputs.tf                    # public_ip, ssh/ssm one-liners, cost
├── providers.tf                  # AWS provider + default tags
├── versions.tf                   # terraform >= 1.6, aws ~> 5
├── templates/
│   └── user_data.sh.tftpl        # cloud-init: docker, clone, .env, certs, up
└── README.md
```

## Quick start

```bash
cp terraform.tfvars.example terraform.tfvars   # then edit (see below)
terraform init
terraform apply
```

Outputs include the public IP. **Manually create an A record**
`<domain_name> -> <public_ip>` at your DNS provider — Terraform does not
touch Route53 here. ⚠️ The IP is auto-assigned, not Elastic — it changes
every time you stop/start or replace the instance, and you'll need to
refresh the A record.

SSH (key pair required):

```bash
ssh -i ~/.ssh/<key_name>.pem ubuntu@<public_ip>
```

SSM Session Manager (no inbound SSH needed, works even with port 22 closed):

```bash
aws ssm start-session --target <instance-id>
```

## Sample `terraform.tfvars`

```hcl
aws_region       = "us-east-1"
instance_type    = "t3.small"          # bump to t3.medium (~$30/mo) if RAM-tight
key_name         = "my-ec2-keypair"
domain_name      = "staging.uwflow.com"
allowed_ssh_cidr = "1.2.3.4/32"        # your IP — don't leave as 0.0.0.0/0

app_env = {
  # --- API ---
  API_PORT                         = "8081"
  DOMAIN                           = "staging.uwflow.com"
  RUN_MODE                         = "staging"

  # --- Hasura ---
  HASURA_GRAPHQL_ADMIN_SECRET      = "CHANGE_ME_LONG_RANDOM"
  HASURA_GRAPHQL_UNAUTHORIZED_ROLE = "public"
  HASURA_GRAPHQL_JWT_KEY           = "CHANGE_ME_LONG_RANDOM"
  HASURA_PORT                      = "8080"

  # --- Sentry ---
  SENTRY_DSN                       = ""
  SENTRY_TRACES_SAMPLE_RATE        = "0.1"
  SENTRY_ERROR_SAMPLE_RATE         = "1.0"

  # --- nginx ---
  NGINX_HTTP_PORT                  = "80"
  NGINX_HTTPS_PORT                 = "443"

  # --- Postgres ---
  POSTGRES_DB                      = "flow"
  POSTGRES_HOST                    = "postgres"
  POSTGRES_PASSWORD                = "CHANGE_ME"
  POSTGRES_PORT                    = "5432"
  POSTGRES_USER                    = "postgres"

  # --- UW open data API ---
  UW_API_KEY_V3                    = "CHANGE_ME"

  # --- Email ---
  SMTP_SERVER                      = "smtp.sendgrid.net"
  SMTP_PORT                        = "587"
  SMTP_FROM                        = "noreply@staging.uwflow.com"
  SMTP_USERNAME                    = "apikey"
  SMTP_PASSWORD                    = "CHANGE_ME"
}
```

`app_env` is marked `sensitive` — values won't show in plan/apply output —
but **don't commit `terraform.tfvars`**. Either keep it local, use a
secrets manager, or set `TF_VAR_app_env` from the shell.

## Seeding the database

The Postgres container writes to a Docker named volume on the root EBS
disk. `terraform destroy` (or any change that triggers instance
replacement) **wipes the DB**. That's the trade-off for staying at $17/mo.

To seed from a `pg_dump`:

```bash
# 1. copy the dump to the instance
scp -i ~/.ssh/<key>.pem flow.dump ubuntu@<public_ip>:/home/ubuntu/

# 2. restore into the postgres container
ssh -i ~/.ssh/<key>.pem ubuntu@<public_ip> \
  'docker exec -i postgres pg_restore -U postgres -d flow --clean --if-exists' \
  < /home/ubuntu/flow.dump
```

For a plain SQL dump use `psql -U postgres -d flow` in place of
`pg_restore`.

## Stopping the instance to save more

When you're not actively using staging, stop the instance:

```bash
aws ec2 stop-instances --instance-ids <instance-id>
```

Stopped t3.small costs **$0** for compute. You still pay for the 10 GiB
gp3 root volume (~$0.80/mo). The auto-assigned public IP is released
when the instance stops — you get a different one when you start it
back up, so **the A record needs to be updated** after each restart.
The Docker volumes persist on the root disk; `docker compose up -d` on
start brings everything back without re-seeding.

## TLS

`user_data.sh.tftpl` drops a self-signed cert into `./.ssl/` so nginx can
start on first boot. Browsers will warn. Once DNS is pointed at the EIP,
swap in a real cert — easiest path is certbot in standalone mode (stop
nginx briefly, issue the cert, copy into `.ssl/`, restart). See the TODO
in the template.

## Importer cron

`/etc/cron.d/uwflow-importer` is installed by cloud-init:

```
0 * * * * root docker exec uw /app/uw hourly >> /var/log/uwflow-importer.log 2>&1
0 3 * * * root docker exec uw /app/uw vacuum >> /var/log/uwflow-importer.log 2>&1
```

Tail it with `ssh ... 'sudo tail -f /var/log/uwflow-importer.log'`.

## Cost breakdown (on-demand)

| Item                                | Monthly |
| ----------------------------------- | ------- |
| t3.small (730 hr)                   | ~$15.18 |
| 10 GiB gp3 root volume              | ~$0.80  |
| Public IPv4 (auto-assigned, attached) | ~$3.60  |
| **Total, running**                  | **~$19.50** |
| **Total, stopped 24/7**             | ~$0.80  |

Note: AWS charges for all public IPv4s since Feb 2024, so swapping the
auto-assigned IP for an Elastic IP doesn't change the running cost —
the trade-off is stable address vs. extra resource to manage.

Detailed CloudWatch is disabled (`monitoring = false`). Bandwidth is
metered separately but negligible for a staging box.

## What's intentionally missing (and roughly what each upgrade costs)

- **Route53** — manual A record instead (~$0.50/mo to automate).
- **ACM / ALB / managed TLS** — self-signed + TODO for certbot (ALB adds ~$16/mo).
- **RDS** — Postgres in a Docker volume on root (RDS db.t4g.micro ~$13/mo).
- **Separate data EBS** — Docker volume on root, lost on destroy (~$2/mo per 25 GiB).
- **Autoscaling, multi-AZ, modules** — out of scope for one cheap box.

## Remote state

Local state by default. A commented `backend "s3"` stub lives in
`versions.tf` — uncomment and fill in once you've created the bucket +
DynamoDB lock table.
