import { updateSuiteTestCases } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('updateSuiteTestCases unit', () => {
  const mockTestCases = [{ workItem: { id: 101 } }];

  function makeConnection(result: any = mockTestCases) {
    return {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateSuiteTestCases: jest.fn().mockResolvedValue(result),
      }),
    } as any;
  }

  test('should call updateSuiteTestCases with correct params', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(mockTestCases);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ updateSuiteTestCases: mockUpdate }),
    };

    await updateSuiteTestCases(mockConnection, {
      projectId: 'my-project',
      planId: 1,
      suiteId: 10,
      testCases: [{ workItemId: 101, configurationIds: [3] }],
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      [{ workItem: { id: 101 }, pointAssignments: [{ configurationId: 3 }] }],
      'my-project',
      1,
      10,
    );
  });

  test('should return the updated test cases', async () => {
    const result = await updateSuiteTestCases(makeConnection(), {
      projectId: 'my-project',
      planId: 1,
      suiteId: 10,
      testCases: [{ workItemId: 101 }],
    });

    expect(result).toEqual(mockTestCases);
  });

  test('should propagate authentication errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateSuiteTestCases: jest
          .fn()
          .mockRejectedValue(new Error('Unauthorized access')),
      }),
    };

    await expect(
      updateSuiteTestCases(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 10,
        testCases: [{ workItemId: 1 }],
      }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should propagate not found errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateSuiteTestCases: jest
          .fn()
          .mockRejectedValue(new Error('Suite not found')),
      }),
    };

    await expect(
      updateSuiteTestCases(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 99,
        testCases: [{ workItemId: 1 }],
      }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap generic errors with AzureDevOpsError', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        updateSuiteTestCases: jest
          .fn()
          .mockRejectedValue(new Error('Something went wrong')),
      }),
    };

    await expect(
      updateSuiteTestCases(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 10,
        testCases: [{ workItemId: 1 }],
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
