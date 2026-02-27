import { listTestSuites } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('listTestSuites unit', () => {
  test('should return paginated result with slimmed items', async () => {
    const mockSuites = [
      {
        id: 1,
        name: 'Suite 1',
        suiteType: 'staticTestSuite',
        _links: { self: { href: 'http://...' } },
        project: { id: 'proj' },
        plan: { id: 100 },
      },
      {
        id: 2,
        name: 'Suite 2',
        suiteType: 'dynamicTestSuite',
        _links: {},
        project: { id: 'proj' },
      },
    ];

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestSuitesForPlan: jest.fn().mockResolvedValue(mockSuites),
      }),
    };

    const result = await listTestSuites(mockConnection, {
      projectId: 'test-project',
      planId: 1,
    });

    expect(result.count).toBe(2);
    expect(result.hasMoreResults).toBe(false);
    expect(result.value[0]._links).toBeUndefined();
    expect(result.value[0].project).toBeUndefined();
    expect(result.value[0].plan).toBeUndefined();
    expect(result.value[0].id).toBe(1);
    expect(result.value[0].name).toBe('Suite 1');
  });

  test('should truncate results to top and set hasMoreResults', async () => {
    const mockSuites = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Suite ${i + 1}`,
    }));

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestSuitesForPlan: jest.fn().mockResolvedValue(mockSuites),
      }),
    };

    const result = await listTestSuites(mockConnection, {
      projectId: 'test-project',
      planId: 1,
      top: 3,
    });

    expect(result.count).toBe(3);
    expect(result.hasMoreResults).toBe(true);
    expect(result.warning).toContain('Results limited to 3');
  });

  test('should flatten tree view into compact list with parentId', async () => {
    const mockTree = [
      {
        id: 1,
        name: 'Root',
        suiteType: 'staticTestSuite',
        children: [
          {
            id: 2,
            name: 'Child A',
            suiteType: 'staticTestSuite',
            children: [
              {
                id: 3,
                name: 'Grandchild',
                suiteType: 'dynamicTestSuite',
                queryString: 'SELECT * FROM ...',
              },
            ],
          },
          {
            id: 4,
            name: 'Child B',
            suiteType: 'staticTestSuite',
          },
        ],
      },
    ];

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestSuitesForPlan: jest.fn().mockResolvedValue(mockTree),
      }),
    };

    const result = await listTestSuites(mockConnection, {
      projectId: 'test-project',
      planId: 1,
      asTreeView: true,
    });

    expect(result.count).toBe(4);
    expect(result.hasMoreResults).toBe(false);

    // Root node has no parentId
    const root = result.value[0] as any;
    expect(root.id).toBe(1);
    expect(root.name).toBe('Root');
    expect(root.parentId).toBeUndefined();
    expect(root.childCount).toBe(2);

    // Child A has parentId = 1
    const childA = result.value[1] as any;
    expect(childA.id).toBe(2);
    expect(childA.parentId).toBe(1);
    expect(childA.childCount).toBe(1);

    // Grandchild has parentId = 2 and queryString
    const grandchild = result.value[2] as any;
    expect(grandchild.id).toBe(3);
    expect(grandchild.parentId).toBe(2);
    expect(grandchild.queryString).toBe('SELECT * FROM ...');

    // Child B has parentId = 1
    const childB = result.value[3] as any;
    expect(childB.id).toBe(4);
    expect(childB.parentId).toBe(1);
  });

  test('should truncate flattened tree with top parameter', async () => {
    const mockTree = [
      {
        id: 1,
        name: 'Root',
        suiteType: 'static',
        children: Array.from({ length: 5 }, (_, i) => ({
          id: i + 2,
          name: `Child ${i}`,
          suiteType: 'static',
        })),
      },
    ];

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestSuitesForPlan: jest.fn().mockResolvedValue(mockTree),
      }),
    };

    const result = await listTestSuites(mockConnection, {
      projectId: 'test-project',
      planId: 1,
      asTreeView: true,
      top: 3,
    });

    // Total nodes = 6 (1 root + 5 children), truncated to 3
    expect(result.count).toBe(3);
    expect(result.hasMoreResults).toBe(true);
    expect(result.warning).toContain('3 of 6');
  });

  test('should extract continuationToken from API response', async () => {
    const mockSuites = [{ id: 1, name: 'Suite 1' }];
    (mockSuites as any).continuationToken = 'token-123';

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestSuitesForPlan: jest.fn().mockResolvedValue(mockSuites),
      }),
    };

    const result = await listTestSuites(mockConnection, {
      projectId: 'test-project',
      planId: 1,
    });

    expect(result.continuationToken).toBe('token-123');
    expect(result.hasMoreResults).toBe(true);
  });

  test('should propagate authentication errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestSuitesForPlan: jest
          .fn()
          .mockRejectedValue(new Error('401 Unauthorized')),
      }),
    };

    await expect(
      listTestSuites(mockConnection, { projectId: 'test', planId: 1 }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should propagate resource not found errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestSuitesForPlan: jest
          .fn()
          .mockRejectedValue(new Error('Plan not found')),
      }),
    };

    await expect(
      listTestSuites(mockConnection, { projectId: 'test', planId: 999 }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap generic errors with AzureDevOpsError', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestSuitesForPlan: jest
          .fn()
          .mockRejectedValue(new Error('Network timeout')),
      }),
    };

    await expect(
      listTestSuites(mockConnection, { projectId: 'test', planId: 1 }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
