import { updateTestSuite } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('updateTestSuite unit', () => {
  const mockSuite = { id: 10, name: 'Updated Suite' };

  function makeConnection(result: any = mockSuite) {
    return {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateTestSuite: jest.fn().mockResolvedValue(result),
      }),
    } as any;
  }

  test('should call updateTestSuite with correct params', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(mockSuite);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ updateTestSuite: mockUpdate }),
    };

    await updateTestSuite(mockConnection, {
      projectId: 'my-project',
      planId: 1,
      suiteId: 10,
      name: 'Updated Suite',
      inheritDefaultConfigurations: true,
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Suite',
        inheritDefaultConfigurations: true,
      }),
      'my-project',
      1,
      10,
    );
  });

  test('should return the updated suite', async () => {
    const result = await updateTestSuite(makeConnection(), {
      projectId: 'my-project',
      planId: 1,
      suiteId: 10,
      name: 'Updated Suite',
    });

    expect(result).toEqual(mockSuite);
  });

  test('should propagate authentication errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateTestSuite: jest
          .fn()
          .mockRejectedValue(new Error('Unauthorized access')),
      }),
    };

    await expect(
      updateTestSuite(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 10,
      }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should propagate not found errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateTestSuite: jest
          .fn()
          .mockRejectedValue(new Error('Suite not found')),
      }),
    };

    await expect(
      updateTestSuite(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 99,
      }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap generic errors with AzureDevOpsError', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateTestSuite: jest
          .fn()
          .mockRejectedValue(new Error('Something went wrong')),
      }),
    };

    await expect(
      updateTestSuite(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 10,
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
