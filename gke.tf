provider "google" {
  project     = var.gcp_project
}

resource "google_container_cluster" "primary" {
  name                     = var.cluster_name
  location                 = var.gcp_region
  remove_default_node_pool = true
  initial_node_count       = 1
  min_master_version       = "1.19"
  description              = var.description
}

resource "google_container_node_pool" "primary_preemptible_nodes" {
  name       = "${var.cluster-name} - node-pool"
  cluster    = google_container_cluster.primary.name
  location                 = var.gcp_region
  node_count = 3

  node_config {
    preemptible  = true
    machine_type = var.machine_type

    metadata = {
      disable-legacy-endpoints = "true"
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
  }
}
