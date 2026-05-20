# uwflow-terraform

Cheap single-box AWS deploy of the [UWFlow](https://github.com/UWFlow/uwflow)
docker-compose stack for **staging**.

This is one EC2 instance running all six containers (postgres, hasura, api,
uw, email, frontend/nginx). Not for production — no RDS, no ALB, no managed
TLS, no autoscaling. See `main.tf` for `TODO` markers where each of those
would be the next upgrade.

## Files

```
.
├── main.tf                       # SG, IAM, AMI, EC2
├── variables.tf                  # inputs (incl. sensitive app_env map)
├── outputs.tf                    # public_ip, ssh/ssm one-liners
├── providers.tf                  # AWS provider + default tags
├── versions.tf                   # terraform >= 1.6, aws ~> 5
├── templates/
│   └── user_data.sh.tftpl        # cloud-init: docker, clone, .env, certs, up
└── README.md
```

## Prerequisites

### 1. AWS credentials (`aws configure`)

Install the AWS CLI (`brew install awscli` on macOS), then create an IAM
user with programmatic access (or use SSO) and run:

```bash
aws configure
```

You'll be prompted for four values:

| Prompt                    | Example          | Notes                                |
| ------------------------- | ---------------- | ------------------------------------ |
| AWS Access Key ID         | `AKIA...`        | IAM → Users → Security credentials   |
| AWS Secret Access Key     | `wJalr...`       | Shown once at key creation           |
| Default region name       | `us-east-2`      | Must match `var.aws_region`          |
| Default output format     | `json`           | Any value is fine                    |

This writes `~/.aws/credentials` and `~/.aws/config`, which both Terraform
and `aws` CLI commands pick up automatically. Verify with:

I'm lazy and created an IAM role with AdminstratorAccess, and got the Access Key ID
and Secret Access Key as such. 


### 2. EC2 key pair

You need an SSH key pair in EC2 to SSH into the box. Create one via the
CLI (the only way to get the private key out — the console **doesn't let
you re-download** an existing key):

```bash
KEY_NAME=uwflow-staging                           
aws ec2 create-key-pair \
  --key-name "$KEY_NAME" \
  --key-type ed25519 \
  --query 'KeyMaterial' \
  --output text \
  > ~/.ssh/"$KEY_NAME".pem
chmod 400 ~/.ssh/"$KEY_NAME".pem
```

Then set `key_name = "uwflow-staging"` in `terraform.tfvars`.


## Quick start

```bash
cp terraform.tfvars.example terraform.tfvars 
terraform init
terraform plan
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

## Seeding the database

The Postgres container writes to a Docker named volume on the root EBS
disk. `terraform destroy` (or any change that triggers instance
replacement) **wipes the DB**. That's the trade-off for staying at $17/mo.

To seed from a `pg_dump`:

```bash
# 1. copy the dump to the instance
scp -i ~/.ssh/<key>.pem ../uwflow/XXX-XX-XX-pg-latest.pgdump ubuntu@<public_ip>:/home/ubuntu/

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
