import { createTestPlan } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('createTestPlan unit', () => {
  const mockPlan = {
    id: 1,
    name: 'New Plan',
    iteration: 'MyProject\\Sprint 1',
  };

  function makeConnection(result: any = mockPlan) {
    return {
      getTestPlanApi: jest.fn().mockResolvedValue({
        createTestPlan: jest.fn().mockResolvedValue(result),
      }),
    } as any;
  }

  test('should call createTestPlan with correct params', async () => {
    const mockCreate = jest.fn().mockResolvedValue(mockPlan);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ createTestPlan: mockCreate }),
    };

    await createTestPlan(mockConnection, {
      projectId: 'my-project',
      name: 'New Plan',
      iteration: 'MyProject\\Sprint 1',
      areaPath: 'MyProject\\Area',
      description: 'A test plan',
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Plan',
        iteration: 'MyProject\\Sprint 1',
      }),
      'my-project',
    );
  });

  test('should return the created test plan', async () => {
    const result = await createTestPlan(makeConnection(), {
      projectId: 'my-project',
      name: 'New Plan',
      iteration: 'MyProject\\Sprint 1',
    });

    expect(result).toEqual(mockPlan);
  });

  test('should throw AzureDevOpsError when API returns null', async () => {
    await expect(
      createTestPlan(makeConnection(null), {
        projectId: 'my-project',
        name: 'New Plan',
        iteration: 'MyProject\\Sprint 1',
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });

  test('should propagate not found errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        createTestPlan: jest
          .fn()
          .mockRejectedValue(
            new AzureDevOpsResourceNotFoundError('Project not found'),
          ),
      }),
    };

    await expect(
      createTestPlan(mockConnection, {
        projectId: 'missing-project',
        name: 'Plan',
        iteration: 'iter',
      }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should propagate authentication errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        createTestPlan: jest
          .fn()
          .mockRejectedValue(
            new AzureDevOpsAuthenticationError('Unauthorized'),
          ),
      }),
    };

    await expect(
      createTestPlan(mockConnection, {
        projectId: 'test',
        name: 'Plan',
        iteration: 'iter',
      }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should wrap generic errors with AzureDevOpsError', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        createTestPlan: jest
          .fn()
          .mockRejectedValue(new Error('Something went wrong')),
      }),
    };

    await expect(
      createTestPlan(mockConnection, {
        projectId: 'test',
        name: 'Plan',
        iteration: 'iter',
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
