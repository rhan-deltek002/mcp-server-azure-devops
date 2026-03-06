import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { UpdateTestSuiteOptions, TestSuite } from '../types';
import {
  TestConfigurationReference,
  TestSuiteUpdateParams,
} from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

export async function updateTestSuite(
  connection: WebApi,
  options: UpdateTestSuiteOptions,
): Promise<TestSuite> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const {
      projectId,
      planId,
      suiteId,
      name,
      inheritDefaultConfigurations,
      defaultConfigurationIds,
      revision,
    } = options;

    return await testPlanApi.updateTestSuite(
      {
        name,
        inheritDefaultConfigurations,
        defaultConfigurations: defaultConfigurationIds?.map(
          (id) => ({ id }) as TestConfigurationReference,
        ),
        revision,
      } as TestSuiteUpdateParams,
      projectId,
      planId,
      suiteId,
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
          `Test suite, plan, or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to update test suite: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
