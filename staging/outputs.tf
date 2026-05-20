output "public_ip" {
  description = "Auto-assigned public IP. Changes on stop/start and on instance replacement."
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "AWS-assigned public DNS of the instance."
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "SSH one-liner using the configured key pair."
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_instance.app.public_ip}"
}

output "ssm_command" {
  description = "Open a shell via SSM Session Manager (no SSH key, no inbound port needed). Requires AWS CLI + session-manager-plugin."
  value       = "aws ssm start-session --region ${var.aws_region} --target ${aws_instance.app.id}"
}

output "estimated_monthly_cost" {
  description = "Back-of-envelope monthly cost, on-demand."
  value       = local.estimated_monthly_cost
}

output "dns_reminder" {
  description = "Manual DNS step. NOTE: the IP changes on stop/start — update the A record each time you restart the instance."
  value       = "Create an A record: ${var.domain_name} -> ${aws_instance.app.public_ip}"
}
