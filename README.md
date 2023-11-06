# reg-notify-azuredevops-plugin

Simple Azure DevOps(Repos) notification plugin for [reg-suit](https://github.com/reg-viz/reg-suit)

<img width="592" alt="image" src="https://github.com/harunari0928/reg-notify-azuredevops-plugin/assets/33255443/1bd1dfa8-3db9-4659-8808-5e15064b713b">
<img width="590" alt="image" src="https://github.com/harunari0928/reg-notify-azuredevops-plugin/assets/33255443/3fcc02b7-c4fc-4567-83ae-e6aa97242030">

## Prerequisites

* Your repository is in AzureRepos.
* Your CI is running on AzurePipelines.
* The reg-suit is working on your environment.

## Getting Started

### Install package
   
If you use npm,
```sh
npm install -D reg-notify-azuredevops-plugin
```

### Create AzureDevOps PAT

* Required Scopes
   - Code
     - Read & Write
   - Pull Request Threads
     - Read & Write

[Documentation for creating PAT](https://learn.microsoft.com/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows#create-a-pat)

### Add plugin settings to your `regconfig.json`

```json
{
...
  "reg-notify-azuredevops-plugin": {
    "organization": "{Your AzureDevOps Organization}",
    "pullRequestId": "$SYSTEM_PULLREQUEST_PULLREQUESTID",
    "repositoryId": "$BUILD_REPOSITORY_ID",
    "project": "$SYSTEM_TEAMPROJECT",
    // NOTE: Using a environment variable is recommended(eg. $MY_PAT)
    "PAT": "{Your PAT}"
  }
...
}
```
