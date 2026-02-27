import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { GetTestConfigurationOptions, TestConfiguration } from '../types';

/**
 * Get a specific test configuration by ID
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting a test configuration
 * @returns Test configuration details
 */
export async function getTestConfiguration(
  connection: WebApi,
  options: GetTestConfigurationOptions,
): Promise<TestConfiguration> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const { projectId, testConfigurationId } = options;

    const configuration = await testPlanApi.getTestConfigurationById(
      projectId,
      testConfigurationId,
    );

    if (configuration === null || configuration === undefined) {
      throw new AzureDevOpsResourceNotFoundError(
        `Test configuration not found with ID: ${testConfigurationId}`,
      );
    }

    return configuration;
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
          `Test configuration or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get test configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
