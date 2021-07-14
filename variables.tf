variable "gcp_project" {
    type = string
    default = "gcp-project"
    description = "The name of the Google Cloud Project where the cluster is to be provisioned"
}

variable "gcp_region" {
    type = string
    default = "us-central1"
    description = "The name of the Google region where the cluster nodes are to be provisioned"
}

variable "cluster_name" {
    type = string
    default = "GitLab group level cluster"
    description = "The name of the cluster to appear on the Google Cloud Console"
}

variable "machine_type" {
    type = string
    default = "n1-standard-4"
    description = "The name of the machine type to use for the cluster nodes"
}

variable "cluster_description" {
    type = string
    default = "This cluster is defined in GitLab"
    description = "A description for the cluster. We recommend adding the \$CI_PROJECT_URL variable to describe where the cluster is configured."
}
