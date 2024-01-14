# reg-notify-azuredevops-plugin

Simple Azure DevOps(Repos) notification plugin for [reg-suit](https://github.com/reg-viz/reg-suit)

<img width="592" alt="image" src="https://github.com/harunari0928/reg-notify-azuredevops-plugin/assets/33255443/1bd1dfa8-3db9-4659-8808-5e15064b713b">

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

### Add plugin settings to your `regconfig.json`

```json
{
...
  "reg-notify-azuredevops-plugin": {
    "organization": "{Your AzureDevOps Organization}",
  }
...
}
```
