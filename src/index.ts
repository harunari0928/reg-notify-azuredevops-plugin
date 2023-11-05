import type { NotifierPluginFactory } from 'reg-suit-interface';
import { AzureDevopsNotifierPlugin } from './azuredevops-notifier-plugin';
import { AzureDevopsPreparer } from './azuredevops-preparer';

const factory: NotifierPluginFactory = () => {
  return {
    notifier: new AzureDevopsNotifierPlugin(),
    preparer: new AzureDevopsPreparer(),
  };
};

export default factory;
