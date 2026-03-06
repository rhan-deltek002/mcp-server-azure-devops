import { addTestCasesToSuite } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('addTestCasesToSuite unit', () => {
  const mockTestCases = [{ workItem: { id: 101 } }, { workItem: { id: 102 } }];

  function makeConnection(result: any = mockTestCases) {
    return {
      getTestPlanApi: jest.fn().mockResolvedValue({
        addTestCasesToSuite: jest.fn().mockResolvedValue(result),
      }),
    } as any;
  }

  test('should call addTestCasesToSuite with correct params', async () => {
    const mockAdd = jest.fn().mockResolvedValue(mockTestCases);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ addTestCasesToSuite: mockAdd }),
    };

    await addTestCasesToSuite(mockConnection, {
      projectId: 'my-project',
      planId: 1,
      suiteId: 10,
      testCases: [
        { workItemId: 101, configurationIds: [1, 2] },
        { workItemId: 102 },
      ],
    });

    expect(mockAdd).toHaveBeenCalledWith(
      [
        {
          workItem: { id: 101 },
          pointAssignments: [{ configurationId: 1 }, { configurationId: 2 }],
        },
        { workItem: { id: 102 }, pointAssignments: undefined },
      ],
      'my-project',
      1,
      10,
    );
  });

  test('should return the added test cases', async () => {
    const result = await addTestCasesToSuite(makeConnection(), {
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
        addTestCasesToSuite: jest
          .fn()
          .mockRejectedValue(new Error('Unauthorized access')),
      }),
    };

    await expect(
      addTestCasesToSuite(mockConnection, {
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
        addTestCasesToSuite: jest
          .fn()
          .mockRejectedValue(new Error('Suite not found')),
      }),
    };

    await expect(
      addTestCasesToSuite(mockConnection, {
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
        addTestCasesToSuite: jest
          .fn()
          .mockRejectedValue(new Error('Something went wrong')),
      }),
    };

    await expect(
      addTestCasesToSuite(mockConnection, {
        projectId: 'test',
        planId: 1,
        suiteId: 10,
        testCases: [{ workItemId: 1 }],
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
