import fetch from 'node-fetch';
import path from 'node:path'; 
import { HEAD, Repository } from 'tiny-commit-walker';
import type { NotifierPlugin, NotifyParams, PluginCreateOptions, PluginLogger } from 'reg-suit-interface';
import { fsUtil } from 'reg-suit-util';
import { createCommentBody } from './create-comment';

export interface AzureDevopsPluginOption {
  organization: string,
  PAT: string;
}

export class AzureDevopsNotifierPlugin implements NotifierPlugin<AzureDevopsPluginOption> {
  private logger!: PluginLogger;
  private isNoEmit!: boolean;
  private repo!: Repository;
  private options!: AzureDevopsPluginOption;

  init(config: PluginCreateOptions<AzureDevopsPluginOption>): void {
    this.logger = config.logger;
    this.isNoEmit = config.noEmit;
    this.repo = new Repository(path.join(fsUtil.prjRootDir('.git'), '.git'));
    this.options = config.options;
  }

  async notify(params: NotifyParams): Promise<void> {
    const head = this.repo.readHeadSync();
    const commitHash = this.getCommitHash(head);
    if (!commitHash) {
      this.logger?.error('Can\'t detect HEAD branch or commit.');
      return Promise.reject();
    }

    if (head.type !== 'branch') {
      this.logger.warn('HEAD is not attached into any branches.');
      return Promise.reject();
    }

    this.logger.info(`Comment to PR associated with ${this.logger.colors.green(head?.branch?.name ?? '')} .`);
    const { failedItems, newItems, deletedItems, passedItems } = params.comparisonResult;
    const comment = createCommentBody({
      reportUrl: params.reportUrl,
      failedItemsCount: failedItems.length,
      newItemsCount: newItems.length,
      deletedItemsCount: deletedItems.length,
      passedItemsCount: passedItems.length,
      shortDescription: false,
    });
    this.logger.verbose('PR comment: ', createCommentBody);

    if (this.isNoEmit) {
      return Promise.resolve();
    }

    await this.sendComment(this.options, comment, failedItems.length > 0);
  }

  private async sendComment({organization, PAT }: AzureDevopsPluginOption, comment: string, isFailed: boolean) {
    const spinner = this.logger.getSpinner('sending notification to AzureDevops...');
    spinner.start();
    try {
      const createUrl = () => {
        const repositoryId = process.env['BUILD_REPOSITORY_ID'] ?? '';
        const pullRequestId = Number(process.env['SYSTEM_PULLREQUEST_PULLREQUESTID']);
        const project = process.env['SYSTEM_TEAMPROJECT'];
        if (project) {
          return `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/threads?api-version=7.1`;
        }
        return `https://dev.azure.com/${organization}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/threads?api-version=7.1`;
      };
      const { status, body } = await fetch(createUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Basic ${Buffer.from(`:${PAT}`).toString('base64')}`
        },
        body: JSON.stringify({
          comments: [{
            parentCommentId: 0,
            content: comment,
            commentType: 'text',
          }],
          status: isFailed ? 'active' : 'wontFix',
        }),
      });

      if (400 <= status) {
        throw new Error(`HTTP ${status}: Failed to request.\n${body.read()}`);
      }
    } catch (err) {
      this.logger.error(err as Error);
    }
    finally {
      spinner.stop();
    }
  }

  private getCommitHash(head: HEAD): string | undefined {
    if (head.type === 'branch') {
      return head.branch?.commit.hash;
    } else if (head.type === 'commit') {
      return head.commit?.hash;
    }
  }
}
