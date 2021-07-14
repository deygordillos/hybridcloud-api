output "env-dynamic-url" {
  value = "https://${google_container_cluster.primary.endpoint}"
}
