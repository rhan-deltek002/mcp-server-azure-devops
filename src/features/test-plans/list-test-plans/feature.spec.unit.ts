import { listTestPlans } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('listTestPlans unit', () => {
  test('should return paginated result envelope', async () => {
    const mockPlans = [
      { id: 1, name: 'Plan 1', state: 'active' },
      { id: 2, name: 'Plan 2', state: 'inactive' },
    ];

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: jest.fn().mockResolvedValue(mockPlans),
      }),
    };

    const result = await listTestPlans(mockConnection, {
      projectId: 'test-project',
    });

    expect(result.count).toBe(2);
    expect(result.hasMoreResults).toBe(false);
    expect(result.value).toHaveLength(2);
    expect(result.value[0].id).toBe(1);
    expect(result.warning).toBeUndefined();
    expect(result.continuationToken).toBeUndefined();
  });

  test('should slim identity refs and remove _links', async () => {
    const mockPlans = [
      {
        id: 1,
        name: 'Plan 1',
        _links: { self: { href: 'http://...' } },
        owner: {
          displayName: 'John',
          uniqueName: 'john@test.com',
          id: 'u1',
          url: 'http://long-url',
          imageUrl: 'http://avatar',
          descriptor: 'aad.xyz',
        },
      },
    ];

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: jest.fn().mockResolvedValue(mockPlans),
      }),
    };

    const result = await listTestPlans(mockConnection, {
      projectId: 'test-project',
    });

    const plan = result.value[0] as any;
    expect(plan._links).toBeUndefined();
    expect(plan.owner).toEqual({
      displayName: 'John',
      uniqueName: 'john@test.com',
      id: 'u1',
    });
  });

  test('should truncate to top and set warning', async () => {
    const mockPlans = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      name: `Plan ${i + 1}`,
    }));

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: jest.fn().mockResolvedValue(mockPlans),
      }),
    };

    const result = await listTestPlans(mockConnection, {
      projectId: 'test-project',
      top: 10,
    });

    expect(result.count).toBe(10);
    expect(result.hasMoreResults).toBe(true);
    expect(result.warning).toContain('Results limited to 10');
  });

  test('should include continuationToken from API response', async () => {
    const mockPlans = [{ id: 1, name: 'Plan 1' }];
    (mockPlans as any).continuationToken = 'next-page-token';

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: jest.fn().mockResolvedValue(mockPlans),
      }),
    };

    const result = await listTestPlans(mockConnection, {
      projectId: 'test-project',
    });

    expect(result.continuationToken).toBe('next-page-token');
    expect(result.hasMoreResults).toBe(true);
  });

  test('should pass continuationToken to API', async () => {
    const mockGetTestPlans = jest.fn().mockResolvedValue([]);

    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: mockGetTestPlans,
      }),
    };

    await listTestPlans(mockConnection, {
      projectId: 'test-project',
      continuationToken: 'page-2-token',
    });

    expect(mockGetTestPlans).toHaveBeenCalledWith(
      'test-project',
      undefined, // owner
      'page-2-token', // continuationToken
      undefined, // includePlanDetails
      undefined, // filterActivePlans
    );
  });

  test('should return empty result for no plans', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: jest.fn().mockResolvedValue([]),
      }),
    };

    const result = await listTestPlans(mockConnection, {
      projectId: 'test-project',
    });

    expect(result.count).toBe(0);
    expect(result.value).toEqual([]);
    expect(result.hasMoreResults).toBe(false);
  });

  test('should propagate authentication errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: jest
          .fn()
          .mockRejectedValue(new Error('Unauthorized access')),
      }),
    };

    await expect(
      listTestPlans(mockConnection, { projectId: 'test' }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should propagate resource not found errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: jest
          .fn()
          .mockRejectedValue(new Error('Project not found')),
      }),
    };

    await expect(
      listTestPlans(mockConnection, { projectId: 'nonexistent' }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap generic errors with AzureDevOpsError', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        getTestPlans: jest
          .fn()
          .mockRejectedValue(new Error('Something went wrong')),
      }),
    };

    await expect(
      listTestPlans(mockConnection, { projectId: 'test' }),
    ).rejects.toThrow(AzureDevOpsError);
    await expect(
      listTestPlans(mockConnection, { projectId: 'test' }),
    ).rejects.toThrow('Failed to list test plans: Something went wrong');
  });
});
