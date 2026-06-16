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
  description = "Key/value pairs rendered verbatim into /home/ubuntu/uwflow/.env (KEY=VALUE per line, no quoting). Holds Hasura admin secret, Postgres creds, SMTP creds, UW API key, ClickHouse creds, EVENTS_IP_HASH_SALT, etc. See README for the full list."
  type        = map(string)
  sensitive   = true
}

# ---------------------------------------------------------------------------
# Events-analytics archival
# ---------------------------------------------------------------------------

variable "events_archive_bucket" {
  description = "Globally-unique S3 bucket name for the daily Parquet events archive. The instance role is granted s3:PutObject to events/* in this bucket."
  type        = string
  default     = "uwflow-events-archive"
}

variable "events_archive_glacier_days" {
  description = "Days after upload before archived event objects transition to Glacier Deep Archive."
  type        = number
  default     = 30
}

# ---------------------------------------------------------------------------
# CloudWatch monitoring / alerting
# ---------------------------------------------------------------------------

variable "alarm_email" {
  description = "Optional email address to subscribe to the CloudWatch alarm SNS topic. Leave empty to skip alarm notifications (alarms still fire, just no email). You must confirm the SNS subscription via the email AWS sends."
  type        = string
  default     = ""
}

variable "cpu_alarm_threshold" {
  description = "CPUUtilization percent that, when sustained, trips the high-CPU alarm. Useful to spot analytics traffic burning CPU."
  type        = number
  default     = 80
}

variable "disk_free_alarm_threshold_percent" {
  description = "Root-disk free-space percent below which the low-disk alarm trips. ClickHouse + Parquet exports live on the root volume."
  type        = number
  default     = 15
}
