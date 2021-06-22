# Infrastructure as Code with GitLab and Terraform (GKE)

This repository contains sample code for creating Google Kubernetes Engine (GKE) [Group level clusters](https://docs.gitlab.com/ee/user/group/clusters/) with the [GitLab Infrastructure as Code](https://docs.gitlab.com/ee/user/infrastructure/).

## Which resources are provisioned?

- A [cluster on Google Cloud Platform (GCP)](gke.tf) with some defaults for name, location, node count, k8s version, etc.
- A [`gitlab-admin` K8s service account](gitlab-admin.tf) with `cluster-admin` privileges.
- An association between this new cluster and an existing GitLab group that we assume you have admin right to it. You
can [override the group `full_path` here](./group_cluster.tf).

## Important Terraform files

These are the Terraform files we have pre-configured for the project.

```
├── backend.tf         # State file Location Configuration
├── gke.tf             # Google GKE Configuration
├── gitlab-admin.tf    # Adding kubernetes service account
└── group_cluster.tf   # Registering kubernetes cluster to GitLab `apps` Group
```

## Secrets

The following [CI environment variables](https://docs.gitlab.com/ee/ci/variables/) need to be set so that your CI 
job is able to provision the cluster on GCP and so that the CI job can associate the cluster to 
your group. It is advised that you create them through the UI and not inside the `.gitlab-ci.yml` to not expose
them in your code.

- `GITLAB_TOKEN`: [GitLab personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) to add K8s clusters to your GitLab your group
- `BASE64_GOOGLE_CREDENTIALS`: 
  - You must create [GCP service account](https://cloud.google.com/docs/authentication/getting-started) with the following roles: `Compute Network Viewer`, `Kubernetes Engine Admin`, `Service Account User`. 
  - As described in the above link, also create a json service account key. 
  - After downloading the json file for the key, encode it with: `base64 /path/to/sa-key.json | tr -d \\n`. Copy this value and use it to create your CI environment variable.

## Configure your deployment

Some defaults in this sample need to be configured to match your desired infrastructure.

- In the [`gke.tf`](gke.tf) file.
  - **(required)** Override the GCP `project` name under the [`gke.tf`](gke.rf) file.
  - **(optional)** Choose also the `region` and `zone` that you would like to deploy your cluster to.
- In the [`group_cluster.tf`](group_cluster.tf) file.
  - **(required)** Override the full_path to point to your GitLab desired group name.

You can refer to the [GitLab Terraform provider](https://registry.terraform.io/providers/gitlabhq/gitlab/latest/docs) and the [Google Terraform provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference) for further resource options.
