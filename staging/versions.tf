terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # TODO: enable remote state for any non-throwaway environment.
  # backend "s3" {
  #   bucket         = "uwflow-tfstate"
  #   key            = "staging/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "uwflow-tfstate-lock"
  #   encrypt        = true
  # }
}
