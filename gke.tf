resource "google_container_cluster" "primary" {
  name                     = var.cluster_name
  location                 = var.gcp_region
  remove_default_node_pool = true
  initial_node_count       = 1
  min_master_version       = "1.22"
  description              = var.cluster_description
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-node-pool"
  cluster    = google_container_cluster.primary.name
  location   = var.gcp_region
  node_count = var.node_count

  node_config {
    preemptible  = false
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
