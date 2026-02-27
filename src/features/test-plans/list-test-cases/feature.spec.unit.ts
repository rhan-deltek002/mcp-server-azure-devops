import { listTestCases } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('listTestCases unit', () => {
  test('should return paginated result envelope', async () => {
    const mockCases = [
      { id: 1, workItem: { id: 100, name: 'Test Case 1' } },
      { id: 2, workItem: { id: 101, name: 'Test Case 2' } },
    ];

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestCaseList: jest.fn().mockResolvedValue(mockCases),
      }),
    };

    const result = await listTestCases(mockConnection, {
      projectId: 'test-project',
      planId: 1,
      suiteId: 10,
    });

    expect(result.count).toBe(2);
    expect(result.hasMoreResults).toBe(false);
    expect(result.value).toHaveLength(2);
  });

  test('should strip workItemFields from list responses', async () => {
    const mockCases = [
      {
        id: 1,
        workItem: {
          id: 100,
          name: 'Test Case 1',
          workItemFields: [
            {
              'Microsoft.VSTS.TCM.Steps':
                '<steps><step><parameterizedString>Long HTML...</parameterizedString></step></steps>',
            },
          ],
        },
      },
    ];

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestCaseList: jest.fn().mockResolvedValue(mockCases),
      }),
    };

    const result = await listTestCases(mockConnection, {
      projectId: 'test-project',
      planId: 1,
      suiteId: 10,
    });

    const tc = result.value[0] as any;
    expect(tc.workItem).toEqual({ id: 100, name: 'Test Case 1' });
    expect(tc.workItem.workItemFields).toBeUndefined();
  });

  test('should truncate to top and set hasMoreResults', async () => {
    const mockCases = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      workItem: { id: 100 + i, name: `TC ${i + 1}` },
    }));

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestCaseList: jest.fn().mockResolvedValue(mockCases),
      }),
    };

    const result = await listTestCases(mockConnection, {
      projectId: 'test-project',
      planId: 1,
      suiteId: 10,
      top: 5,
    });

    expect(result.count).toBe(5);
    expect(result.hasMoreResults).toBe(true);
    expect(result.warning).toContain('Results limited to 5');
  });

  test('should extract continuationToken from API response', async () => {
    const mockCases = [{ id: 1, workItem: { id: 100, name: 'TC 1' } }];
    (mockCases as any).continuationToken = 'ct-abc';

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestCaseList: jest.fn().mockResolvedValue(mockCases),
      }),
    };

    const result = await listTestCases(mockConnection, {
      projectId: 'test-project',
      planId: 1,
      suiteId: 10,
    });

    expect(result.continuationToken).toBe('ct-abc');
    expect(result.hasMoreResults).toBe(true);
  });

  test('should propagate authentication errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestCaseList: jest
          .fn()
          .mockRejectedValue(new Error('401 Unauthorized')),
      }),
    };

    await expect(
      listTestCases(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 10,
      }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should propagate resource not found errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestCaseList: jest
          .fn()
          .mockRejectedValue(new Error('Suite does not exist')),
      }),
    };

    await expect(
      listTestCases(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 999,
      }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap generic errors with AzureDevOpsError', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestCaseList: jest
          .fn()
          .mockRejectedValue(new Error('Unexpected failure')),
      }),
    };

    await expect(
      listTestCases(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 10,
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
