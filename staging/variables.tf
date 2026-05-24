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

variable "ssl_cert_path" {
  description = "Optional path to a PEM-encoded TLS cert. Relative paths resolve against the staging/ module dir (so \".ssl/crt.pem\" reads staging/.ssl/crt.pem); absolute paths pass through. If both this and ssl_key_path are set, the files are written to .ssl/ on the box. Otherwise a self-signed cert is generated via script/generate-ssl-cert.sh (same recipe `make setup` uses locally)."
  type        = string
  default     = ""
}

variable "ssl_key_path" {
  description = "Optional path to a PEM-encoded TLS private key. Same path-resolution rules as ssl_cert_path."
  type        = string
  default     = ""
  sensitive   = true
}

variable "app_env" {
  description = "Key/value pairs rendered verbatim into /home/ubuntu/uwflow/.env (KEY=VALUE per line, no quoting). Holds Hasura admin secret, Postgres creds, SMTP creds, UW API key, etc. See README for the full list."
  type        = map(string)
  sensitive   = true
}
