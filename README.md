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

## Configure your deployment

Some variables need to be configured to match your desired infrastructure. These values can be set as Terraform variables. Optional variables have a default set already. See [`variables.tf`](./variables.tf) for these defaults.

### Required variables/secrets

The following [CI environment variables](https://docs.gitlab.com/ee/ci/variables/) need to be set so that your CI 
job is able to provision the cluster on GCP and so that the CI job can associate the cluster to 
your group. It is advised that you create them through the UI and not inside the `.gitlab-ci.yml` to not expose
them in your code.

- `TF_VAR_gitlab_token`: [GitLab personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) with `api` scope to add the provisioned cluster to your GitLab group.
- `BASE64_GOOGLE_CREDENTIALS`: 
  - You must create [GCP service account](https://cloud.google.com/docs/authentication/getting-started) with the following roles: `Compute Network Viewer`, `Kubernetes Engine Admin`, `Service Account User`. 
  - As described in the above link, also create a json service account key. 
  - After downloading the json file for the key, encode it with: `base64 /path/to/sa-key.json | tr -d \\n`. Copy this value and use it to create your CI environment variable.

- `TF_VAR_gcp_project`: Override the GCP `project` name
- `TF_VAR_gitlab_token`: Provide a GitLab [Personal Access Token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#personal-access-tokens) with admin rights to the `gitlab_group`
- `TF_VAR_gitlab_group`: Set the GitLab group to attach the cluster to GitLab.

### Optional variables

- `TF_VAR_gcp_region`: Set the region for your cluster. 
- `TF_VAR_cluster_name`: Set the name of the cluster. 
- `TF_VAR_machine_type`: Set the machine type for the Kubernetes nodes. 
- `TF_VAR_cluster_description`: Set a description for the cluster. We recommend setting this to `$CI_PROJECT_URL`.
- `TF_VAR_base_domain`: Set to the base domain to provision resources under.
- `TF_VAR_environment_scope`: Set to the GitLab environment name to associate the cluster with.

## More info

You can refer to the [GitLab Terraform provider](https://registry.terraform.io/providers/gitlabhq/gitlab/latest/docs) and the [Google Terraform provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference) for further resource options.
