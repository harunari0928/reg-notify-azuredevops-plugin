import { NotifyParams } from 'reg-suit-interface';
import { AzureDevopsNotifierPlugin } from './azuredevops-notifier-plugin';

describe('AzureDevopsNotifierPlugin', () => {
  const mocks = vi.hoisted(() => ({
    fetch: vi.fn(),
    repo: vi.fn(),
  }));
  
  function getPlugin(isNoEmit: boolean, logger?: Record<string, any>) {
    const defaultMockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), colors: { green: vi.fn(), }, verbose: vi.fn(), getSpinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })) };
    const plugin = new AzureDevopsNotifierPlugin();
    plugin.init({
      coreConfig: vi.fn()(),
      workingDirs: vi.fn()(),
      logger: { ...defaultMockLogger, ...logger }as any,
      noEmit: isNoEmit,
      options: { organization: 'YourOrg', pullRequestId: 5, repositoryId: 'guid', project: 'YourProject', PAT: 'YourPAT' },
    });
    return plugin;
  }
  
  describe('notify', () => {
    beforeEach(() => {
      vi.mock('node-fetch', async () => ({ default: mocks.fetch }));
      mocks.repo.mockImplementation(() => ({
        readHeadSync: () => ({ type: 'branch', branch: { commit: { hash: 'hash' }} }),
      }));
      vi.mock('tiny-commit-walker', async (importOriginal) => ({ 
        ...importOriginal,
        Repository: mocks.repo,      
      }));
    });

    const defaultNotfiyParam: NotifyParams = {
      expectedKey: null,
      actualKey: '',
      comparisonResult: {
        failedItems: [],
        newItems: [],
        deletedItems: [],
        passedItems: [],
        expectedItems: [],
        actualItems: [],
        diffItems: [],
        actualDir: '',
        expectedDir: '',
        diffDir: '',
      }
    };
    
    describe('if git head type is neither branch nor commit', () => {
      mocks.repo.mockImplementation(() => ({
        readHeadSync: () => ({ type: 'test', }),
      }));
      

      const mockLogError = vi.fn();     
      const plugin = getPlugin(false, { error: mockLogError });

      it('should abort notifying', async () => {
        await plugin.notify(defaultNotfiyParam).catch(() => {});
        
        expect(mocks.fetch).not.toHaveBeenCalled();
      });
  
      it('should emit an error message', async () => {
        await plugin.notify(defaultNotfiyParam).catch(() => {});
        
        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe('if git head is not attached into any branches', () => {
      mocks.repo.mockImplementation(() => ({
        readHeadSync: () => ({ type: 'commit', commit: { hash: 'hash' }}),
      }));
      
      const mockLogWarn = vi.fn();     
      const plugin = getPlugin(false, { warn: mockLogWarn });
      
      it('should abort notifying', async () => {
        await plugin.notify(defaultNotfiyParam).catch(() => {});
        
        expect(mocks.fetch).not.toHaveBeenCalled();
      });

      it('should emit an warning message', async () => {
        await plugin.notify(defaultNotfiyParam).catch(() => {});
        
        expect(mockLogWarn).toHaveBeenCalled();
      });
    });

    it('should not send any comments, if noEmit option is enabled', async () => {
      const plugin = getPlugin(true);
      
      await plugin.notify(defaultNotfiyParam);
        
      expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it('should make a pullrequest comment status "active", when any failed items exist', async () => {
      const plugin = getPlugin(false);
      
      await plugin.notify({ 
        ...defaultNotfiyParam,
        comparisonResult: {
          ...defaultNotfiyParam.comparisonResult,
          failedItems: ['one'], 
        }});
        
      expect(JSON.stringify(mocks.fetch.mock.calls[0][1])).toContain('active');
    });
    
    it('should make a pullrequest comment status "won\'t fix", when no failed items exist', async () => {
      const plugin = getPlugin(false);
      
      await plugin.notify(defaultNotfiyParam);
        
      expect(JSON.stringify(mocks.fetch.mock.calls[0][1])).toContain('wontFix');
    });

    it('should emit error messages, if sending a comment is failed', async () => {
      mocks.fetch.mockImplementation(() => Promise.resolve({
        status: 400, body: {}
      }));
      const mockLogError = vi.fn();     
      const plugin = getPlugin(false, { error: mockLogError });
      
      await plugin.notify(defaultNotfiyParam).catch(() => {});;
        
      expect(mockLogError).toHaveBeenCalled();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });
  });
});
