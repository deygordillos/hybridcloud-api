variable "gcp_project" {
  type        = string
  description = "The name of the Google Cloud Project where the cluster is to be provisioned"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1-a"
  description = "The name of the Google region where the cluster nodes are to be provisioned"
}

variable "cluster_name" {
  type        = string
  default     = "gitlab-terraform-gke"
  description = "The name of the cluster to appear on the Google Cloud Console"
}

variable "cluster_description" {
  type        = string
  default     = "This cluster is managed by GitLab"
  description = "A description for the cluster. We recommend adding the $CI_PROJECT_URL variable to describe where the cluster is configured."
}

variable "machine_type" {
  type        = string
  default     = "n1-standard-2"
  description = "The name of the machine type to use for the cluster nodes"
}

variable "node_count" {
  default     = 2
  description = "The number of cluster nodes"
}

variable "agent_namespace" {
  default     = "gitlab-agent"
  description = "Kubernetes namespace to install the Agent"
}

variable "agent_token" {
  description = "Agent token (provided when registering an Agent in GitLab)"
  sensitive   = true
}

variable "kas_address" {
  description = "Agent Server address (provided when registering an Agent in GitLab)"
}
