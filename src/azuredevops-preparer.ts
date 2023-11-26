import type { PluginCreateOptions, PluginPreparer } from 'reg-suit-interface';
import { AzureDevopsPluginOption } from './azuredevops-notifier-plugin';

export interface AzureDevopsPreparerOption {
  organization: string,
  pullRequestId: number,
  repositoryId: string,
  project?: string,
  PAT: string // NOTE: not base64 format
}

export class AzureDevopsPreparer implements PluginPreparer<AzureDevopsPreparerOption, AzureDevopsPluginOption> {
  inquire = () => [];

  prepare(option: PluginCreateOptions<AzureDevopsPreparerOption>): Promise<AzureDevopsPluginOption> {
    return Promise.resolve({
      organization: option.options.organization,
      pullRequestId: Number(process.env['SYSTEM_PULLREQUEST_PULLREQUESTID']),
      repositoryId: process.env['BUILD_REPOSITORY_ID'] ?? '',
      project: process.env['SYSTEM_TEAMPROJECT'],
      PAT: option.options.PAT
    });
  }
}
