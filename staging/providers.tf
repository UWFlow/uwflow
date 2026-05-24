provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "uwflow"
      Environment = "staging"
      ManagedBy   = "terraform"
    }
  }
}
