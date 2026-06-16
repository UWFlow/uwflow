output "public_ip" {
  description = "Auto-assigned public IP. Changes on stop/start and on instance replacement."
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "AWS-assigned public DNS of the instance."
  value       = "https://${aws_instance.app.public_dns}"
}

output "ssh_command" {
  description = "SSH one-liner using the configured key pair."
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_instance.app.public_ip}"
}

output "ssm_command" {
  description = "Open a shell via SSM Session Manager (no SSH key, no inbound port needed). Requires AWS CLI + session-manager-plugin."
  value       = "aws ssm start-session --region ${var.aws_region} --target ${aws_instance.app.id}"
}

output "dns_reminder" {
  description = "Manual DNS step. NOTE: the IP changes on stop/start — update the A record each time you restart the instance."
  value       = "Create an A record: ${var.domain_name} -> ${aws_instance.app.public_ip}"
}

output "events_archive_bucket" {
  description = "S3 bucket holding the daily Parquet events archive (transitions to Glacier Deep Archive)."
  value       = aws_s3_bucket.events_archive.bucket
}

output "alarm_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarms (empty if no alarm_email was configured)."
  value       = var.alarm_email == "" ? "" : aws_sns_topic.alarms[0].arn
}
