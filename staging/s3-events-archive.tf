# ---------------------------------------------------------------------------
# S3 archive bucket for the events-analytics pipeline.
#
# The daily ETL (script/etl-events-archive.sh, wired into the user_data cron)
# exports the previous day's ClickHouse partition as Parquet and uploads it
# under events/dt=YYYY-MM-DD/. Objects transition to Glacier Deep Archive after
# ~30 days, so warm analytics stays cheap to query while cold history is kept
# for pennies. ClickHouse itself drops raw rows after 90 days (table TTL), so
# S3 is the long-term system of record.
#
# Cost notes: ~10k events/day is a few MB/day of Parquet. Deep Archive is the
# cheapest tier; retrieval is slow (hours) but this is an archive, not a
# query path.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "events_archive" {
  bucket = var.events_archive_bucket

  tags = {
    Name = "${local.name}-events-archive"
  }
}

# Never expose archived analytics publicly.
resource "aws_s3_bucket_public_access_block" "events_archive" {
  bucket = aws_s3_bucket.events_archive.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Server-side encryption at rest (SSE-S3, no KMS cost).
resource "aws_s3_bucket_server_side_encryption_configuration" "events_archive" {
  bucket = aws_s3_bucket.events_archive.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Lifecycle: transition objects to Glacier Deep Archive after ~30 days. We keep
# them indefinitely (no expiration) — adjust if a retention window is needed.
resource "aws_s3_bucket_lifecycle_configuration" "events_archive" {
  bucket = aws_s3_bucket.events_archive.id

  rule {
    id     = "archive-to-deep-glacier"
    status = "Enabled"

    filter {
      prefix = "events/"
    }

    transition {
      days          = var.events_archive_glacier_days
      storage_class = "DEEP_ARCHIVE"
    }

    # Clean up failed multipart uploads so they don't accrue silent cost.
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# ---------------------------------------------------------------------------
# Grant the EC2 instance role permission to PUT (and List/Get for idempotency
# checks) into the archive bucket only. Least privilege: no Delete.
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "events_archive_put" {
  statement {
    sid     = "PutEventsArchive"
    actions = ["s3:PutObject"]
    resources = [
      "${aws_s3_bucket.events_archive.arn}/events/*",
    ]
  }

  statement {
    sid     = "ListEventsArchive"
    actions = ["s3:ListBucket"]
    resources = [
      aws_s3_bucket.events_archive.arn,
    ]
  }
}

resource "aws_iam_role_policy" "events_archive_put" {
  name   = "${local.name}-events-archive-put"
  role   = aws_iam_role.instance.id
  policy = data.aws_iam_policy_document.events_archive_put.json
}
