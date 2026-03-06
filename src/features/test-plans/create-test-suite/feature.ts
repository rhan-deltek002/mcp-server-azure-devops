import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { CreateTestSuiteOptions, TestSuite } from '../types';
import {
  TestSuiteType,
  TestConfigurationReference,
  TestSuiteReference,
} from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

export async function createTestSuite(
  connection: WebApi,
  options: CreateTestSuiteOptions,
): Promise<TestSuite> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const {
      projectId,
      planId,
      name,
      suiteType,
      parentSuiteId,
      requirementId,
      inheritDefaultConfigurations,
      defaultConfigurationIds,
    } = options;

    const suiteTypeEnum =
      suiteType === 'dynamicTestSuite'
        ? TestSuiteType.DynamicTestSuite
        : suiteType === 'requirementTestSuite'
          ? TestSuiteType.RequirementTestSuite
          : TestSuiteType.StaticTestSuite;

    return await testPlanApi.createTestSuite(
      {
        name,
        suiteType: suiteTypeEnum,
        requirementId,
        inheritDefaultConfigurations,
        defaultConfigurations: defaultConfigurationIds?.map(
          (id) => ({ id }) as TestConfigurationReference,
        ),
        parentSuite: parentSuiteId
          ? ({ id: parentSuiteId } as TestSuiteReference)
          : undefined,
      },
      projectId,
      planId,
    );
  } catch (error) {
    if (error instanceof AzureDevOpsError) {
      throw error;
    }

    if (error instanceof Error) {
      if (
        error.message.includes('Authentication') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('401')
      ) {
        throw new AzureDevOpsAuthenticationError(
          `Failed to authenticate: ${error.message}`,
        );
      }

      if (
        error.message.includes('not found') ||
        error.message.includes('does not exist') ||
        error.message.includes('404')
      ) {
        throw new AzureDevOpsResourceNotFoundError(
          `Test plan or parent suite not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to create test suite: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
