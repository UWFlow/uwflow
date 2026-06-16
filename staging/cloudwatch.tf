# ---------------------------------------------------------------------------
# EC2 monitoring — fulfils the "CloudWatch Agent" TODO in main.tf.
#
# Adding the events-analytics pipeline (ClickHouse + a public ingestion
# endpoint) means analytics traffic now shares the single box with the app.
# This wires up:
#   - the CloudWatch Agent policy on the instance role (agent is installed and
#     configured in user_data.sh.tftpl)
#   - a high-CPU alarm (native AWS/EC2 metric) to catch analytics burning CPU
#   - a low-root-disk alarm (agent CWAgent metric) — ClickHouse + the daily
#     Parquet exports live on the root volume
#   - an optional SNS topic + email subscription for alarm notifications
#
# Kept cheap: alarms use the default 5-minute (basic) metric resolution; no
# detailed monitoring is enabled.
# ---------------------------------------------------------------------------

# Let the instance ship metrics via the CloudWatch Agent.
resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# ---------------------------------------------------------------------------
# SNS topic for alarm notifications (optional — only if alarm_email is set).
# ---------------------------------------------------------------------------

resource "aws_sns_topic" "alarms" {
  count = var.alarm_email == "" ? 0 : 1
  name  = "${local.name}-alarms"
}

resource "aws_sns_topic_subscription" "alarms_email" {
  count     = var.alarm_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.alarms[0].arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

locals {
  # Wire alarms to SNS only when a topic exists.
  alarm_actions = var.alarm_email == "" ? [] : [aws_sns_topic.alarms[0].arn]
}

# ---------------------------------------------------------------------------
# Alarms
# ---------------------------------------------------------------------------

# Sustained high CPU — analytics traffic (or anything) hammering the box.
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${local.name}-high-cpu"
  alarm_description   = "EC2 CPUUtilization >= ${var.cpu_alarm_threshold}% for 15 minutes."
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  threshold           = var.cpu_alarm_threshold
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "missing"

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  alarm_actions = local.alarm_actions
  ok_actions    = local.alarm_actions
}

# Low root-disk free space — reported by the CloudWatch Agent (CWAgent
# namespace). disk_used_percent is published with the dimensions configured in
# the agent config in user_data; we alarm when used% crosses (100 - free%).
resource "aws_cloudwatch_metric_alarm" "low_disk" {
  alarm_name          = "${local.name}-low-root-disk"
  alarm_description   = "Root volume free space below ${var.disk_free_alarm_threshold_percent}%."
  namespace           = "CWAgent"
  metric_name         = "disk_used_percent"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 1
  threshold           = 100 - var.disk_free_alarm_threshold_percent
  comparison_operator = "GreaterThanOrEqualToThreshold"
  # The agent may take a few minutes after boot to publish; don't page on gaps.
  treat_missing_data = "missing"

  dimensions = {
    InstanceId = aws_instance.app.id
    path       = "/"
    device     = "xvda1"
    fstype     = "ext4"
  }

  alarm_actions = local.alarm_actions
  ok_actions    = local.alarm_actions
}
