import { updateTestPlan } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('updateTestPlan unit', () => {
  const mockPlan = { id: 42, name: 'Updated Plan' };

  function makeConnection(result: any = mockPlan) {
    return {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateTestPlan: jest.fn().mockResolvedValue(result),
      }),
    } as any;
  }

  test('should call updateTestPlan with correct params', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(mockPlan);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ updateTestPlan: mockUpdate }),
    };

    await updateTestPlan(mockConnection, {
      projectId: 'my-project',
      planId: 42,
      name: 'Updated Plan',
      state: 'Inactive',
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated Plan', state: 'Inactive' }),
      'my-project',
      42,
    );
  });

  test('should return the updated test plan', async () => {
    const result = await updateTestPlan(makeConnection(), {
      projectId: 'my-project',
      planId: 42,
      name: 'Updated Plan',
    });

    expect(result).toEqual(mockPlan);
  });

  test('should propagate authentication errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateTestPlan: jest
          .fn()
          .mockRejectedValue(new Error('Unauthorized access')),
      }),
    };

    await expect(
      updateTestPlan(mockConnection, { projectId: 'test', planId: 1 }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should propagate not found errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateTestPlan: jest
          .fn()
          .mockRejectedValue(new Error('Plan not found')),
      }),
    };

    await expect(
      updateTestPlan(mockConnection, { projectId: 'test', planId: 99 }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap generic errors with AzureDevOpsError', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateTestPlan: jest
          .fn()
          .mockRejectedValue(new Error('Something went wrong')),
      }),
    };

    await expect(
      updateTestPlan(mockConnection, { projectId: 'test', planId: 1 }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
