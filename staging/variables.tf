variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "us-east-2"
}

variable "instance_type" {
  description = "EC2 instance type. t3.small (2 vCPU / 2 GiB) is the cheap default; bump to t3.medium (~$30/mo) if Hasura + Postgres + 3 Go services run tight on RAM."
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Name of an existing EC2 key pair for SSH access. SSM Session Manager works without a key, but a key pair is still handy for scp-ing pg_dump files."
  type        = string
}

variable "domain_name" {
  description = "Public DNS name (e.g. staging.uwflow.com). Used as the CN of the self-signed cert and as DOMAIN inside the app. Point an A record at the output EIP."
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH on port 22. WARNING: defaults to 0.0.0.0/0 for convenience. Lock this down to your IP (e.g. \"1.2.3.4/32\") for anything beyond throwaway staging."
  type        = string
  default     = "0.0.0.0/0"
}

variable "app_env" {
  description = "Key/value pairs rendered verbatim into /home/ubuntu/uwflow/.env (KEY=VALUE per line, no quoting). Holds Hasura admin secret, Postgres creds, SMTP creds, UW API key, etc. See README for the full list."
  type        = map(string)
  sensitive   = true
}
