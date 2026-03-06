import { createTestSuite } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('createTestSuite unit', () => {
  const mockSuite = { id: 10, name: 'New Suite' };

  function makeConnection(result: any = mockSuite) {
    return {
      getTestPlanApi: jest.fn().mockResolvedValue({
        createTestSuite: jest.fn().mockResolvedValue(result),
      }),
    } as any;
  }

  test('should call createTestSuite with correct params', async () => {
    const mockCreate = jest.fn().mockResolvedValue(mockSuite);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ createTestSuite: mockCreate }),
    };

    await createTestSuite(mockConnection, {
      projectId: 'my-project',
      planId: 1,
      name: 'New Suite',
      suiteType: 'staticTestSuite',
      parentSuiteId: 5,
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Suite', parentSuite: { id: 5 } }),
      'my-project',
      1,
    );
  });

  test('should default to staticTestSuite when suiteType not specified', async () => {
    const mockCreate = jest.fn().mockResolvedValue(mockSuite);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ createTestSuite: mockCreate }),
    };

    await createTestSuite(mockConnection, {
      projectId: 'my-project',
      planId: 1,
      name: 'Suite',
    });

    // StaticTestSuite = 2
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ suiteType: 2 }),
      'my-project',
      1,
    );
  });

  test('should map dynamicTestSuite to DynamicTestSuite enum', async () => {
    const mockCreate = jest.fn().mockResolvedValue(mockSuite);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ createTestSuite: mockCreate }),
    };

    await createTestSuite(mockConnection, {
      projectId: 'my-project',
      planId: 1,
      name: 'Dynamic Suite',
      suiteType: 'dynamicTestSuite',
      queryString:
        'SELECT * FROM WorkItems WHERE [System.WorkItemType] = "Test Case"',
    });

    // DynamicTestSuite = 1
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        suiteType: 1,
        queryString:
          'SELECT * FROM WorkItems WHERE [System.WorkItemType] = "Test Case"',
      }),
      'my-project',
      1,
    );
  });

  test('should map requirementTestSuite to RequirementTestSuite enum', async () => {
    const mockCreate = jest.fn().mockResolvedValue(mockSuite);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ createTestSuite: mockCreate }),
    };

    await createTestSuite(mockConnection, {
      projectId: 'my-project',
      planId: 1,
      name: 'Req Suite',
      suiteType: 'requirementTestSuite',
      requirementId: 42,
    });

    // RequirementTestSuite = 3
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ suiteType: 3, requirementId: 42 }),
      'my-project',
      1,
    );
  });

  test('should map defaultConfigurationIds to defaultConfigurations', async () => {
    const mockCreate = jest.fn().mockResolvedValue(mockSuite);
    const mockConnection: any = {
      getTestPlanApi: jest
        .fn()
        .mockResolvedValue({ createTestSuite: mockCreate }),
    };

    await createTestSuite(mockConnection, {
      projectId: 'my-project',
      planId: 1,
      name: 'Suite',
      defaultConfigurationIds: [1, 2],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultConfigurations: [{ id: 1 }, { id: 2 }],
      }),
      'my-project',
      1,
    );
  });

  test('should return the created suite', async () => {
    const result = await createTestSuite(makeConnection(), {
      projectId: 'my-project',
      planId: 1,
      name: 'New Suite',
    });

    expect(result).toEqual(mockSuite);
  });

  test('should throw AzureDevOpsError when API returns null', async () => {
    await expect(
      createTestSuite(makeConnection(null), {
        projectId: 'my-project',
        planId: 1,
        name: 'New Suite',
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });

  test('should propagate authentication errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        createTestSuite: jest
          .fn()
          .mockRejectedValue(
            new AzureDevOpsAuthenticationError('Unauthorized'),
          ),
      }),
    };

    await expect(
      createTestSuite(mockConnection, {
        projectId: 'test',
        planId: 1,
        name: 'Suite',
      }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should propagate not found errors', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        createTestSuite: jest
          .fn()
          .mockRejectedValue(
            new AzureDevOpsResourceNotFoundError('Plan not found'),
          ),
      }),
    };

    await expect(
      createTestSuite(mockConnection, {
        projectId: 'test',
        planId: 99,
        name: 'Suite',
      }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap generic errors with AzureDevOpsError', async () => {
    const mockConnection: any = {
      getTestPlanApi: jest.fn().mockResolvedValue({
        createTestSuite: jest
          .fn()
          .mockRejectedValue(new Error('Something went wrong')),
      }),
    };

    await expect(
      createTestSuite(mockConnection, {
        projectId: 'test',
        planId: 1,
        name: 'Suite',
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
