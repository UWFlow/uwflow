locals {
  name = "uwflow-staging"

  # Resolve cert/key paths against the module dir so they're stable no matter
  # which directory terraform is invoked from. Absolute paths pass through.
  # path.module is "" for root modules in modern terraform, so coalesce to "."
  # to avoid producing a bogus "/cert.pem".
  module_dir    = coalesce(path.module, ".")
  ssl_cert_file = var.ssl_cert_path == "" ? "" : (startswith(var.ssl_cert_path, "/") ? var.ssl_cert_path : "${local.module_dir}/${var.ssl_cert_path}")
  ssl_key_file  = var.ssl_key_path == "" ? "" : (startswith(var.ssl_key_path, "/") ? var.ssl_key_path : "${local.module_dir}/${var.ssl_key_path}")
}

# ---------------------------------------------------------------------------
# Networking — default VPC / subnet. Cheapest possible: no NAT, no ALB.
# ---------------------------------------------------------------------------

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

# ---------------------------------------------------------------------------
# AMI — latest Ubuntu 22.04 LTS (amd64). neuwflow/* images are built on
# CircleCI's amd64 machine executor, so do NOT switch to t4g/ARM.
# ---------------------------------------------------------------------------

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ---------------------------------------------------------------------------
# Security group — 22 (restricted), 80, 443.
# ---------------------------------------------------------------------------

resource "aws_security_group" "app" {
  name        = "${local.name}-sg"
  description = "uwflow staging: SSH/HTTP/HTTPS from anywhere"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All egress"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name}-sg"
  }
}

# ---------------------------------------------------------------------------
# IAM — SSM only, so we can use Session Manager without a bastion.
# TODO: add CloudWatch Agent policy if/when we want app log shipping.
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "instance" {
  name               = "${local.name}-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "instance" {
  name = "${local.name}-profile"
  role = aws_iam_role.instance.name
}

# ---------------------------------------------------------------------------
# EC2 instance — single box, root volume only. Postgres data lives in a
# Docker named volume on the root disk; `terraform destroy` wipes the DB,
# which is acceptable for staging (re-seed from a pg_dump — see README).
# TODO: for prod, move Postgres to RDS or a separate encrypted EBS volume
# with a lifecycle prevent_destroy.
# ---------------------------------------------------------------------------

resource "aws_instance" "app" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  key_name             = var.key_name
  subnet_id            = tolist(data.aws_subnets.default.ids)[0]
  iam_instance_profile = aws_iam_instance_profile.instance.name

  vpc_security_group_ids = [aws_security_group.app.id]

  # Cost-saving: skip detailed (1-min) CloudWatch metrics.
  monitoring = false

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 10 
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required" # IMDSv2 only
  }

  user_data = templatefile("${path.module}/templates/user_data.sh.tftpl", {
    domain_name = var.domain_name
    app_env     = var.app_env
    ssl_cert    = local.ssl_cert_file != "" ? file(local.ssl_cert_file) : ""
    ssl_key     = local.ssl_key_file != "" ? file(local.ssl_key_file) : ""
  })

  # Re-run cloud-init if the rendered user_data changes (e.g. .env update).
  # Note: this REPLACES the instance, which wipes the Postgres docker volume.
  # Comment this out if you want to edit .env in place on the running box.
  user_data_replace_on_change = true

  tags = {
    Name = local.name
  }
}

# No Elastic IP — the instance uses the auto-assigned public IP from its
# default subnet. The IP changes on stop/start (and on instance replacement),
# so you'll need to refresh the DNS A record each time the instance restarts.
# Add an aws_eip + aws_eip_association if you want a stable address.

# TODO (next upgrades, in rough cost order):
#   - Elastic IP for stable address across stop/start       (~$0/mo running, $3.60/mo stopped)
#   - Route53 hosted zone + A record for domain_name        (~$0.50/mo)
#   - ACM cert + certbot/cron OR ALB+ACM termination        (ALB ~$16/mo)
#   - RDS db.t4g.micro for Postgres                         (~$13/mo)
#   - Separate EBS volume for /var/lib/docker/volumes       (~$2/mo per 25GB)
#   - CloudWatch Agent for app log shipping
