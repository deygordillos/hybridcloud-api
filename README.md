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
- `BASE64_GOOGLE_CREDENTIALS`: You must create [GCP service account](https://cloud.google.com/docs/authentication/getting-started), with a json service account key. After downloading this json file, encode it with: `base64 /path/to/sa-key.json | tr -d \\n`. Copy this value and use it to create your CI environment variable.

## Other optional configuration

In the [GCP terraform provider reference](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference) you will find other ways to configure your cluster throught environment variables. Here's
a couple of suggestions:

| Variable Name | required | Description |
| ------ | ------ | ------ |
| GOOGLE_PROJECT | optional | The default name of the GCP project. See the [GCP terraform provider reference](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference) |
| GOOGLE_REGION | optional | The default region of your desired cluster. See the [GCP terraform provider reference](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference) |
