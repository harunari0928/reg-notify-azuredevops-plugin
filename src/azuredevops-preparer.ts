import type { PluginCreateOptions, PluginPreparer } from 'reg-suit-interface';
import { AzureDevopsPluginOption } from './azuredevops-notifier-plugin';

export interface AzureDevopsPreparerOption {
  organization: string,
}

export class AzureDevopsPreparer implements PluginPreparer<AzureDevopsPreparerOption, AzureDevopsPluginOption> {
  inquire = () => [];

  prepare(option: PluginCreateOptions<AzureDevopsPreparerOption>): Promise<AzureDevopsPluginOption> {
    return Promise.resolve({
      organization: option.options.organization,
    });
  }
}
