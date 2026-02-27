import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { GetTestVariableOptions, TestVariable } from '../types';

/**
 * Get a specific test variable by ID
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting a test variable
 * @returns Test variable details
 */
export async function getTestVariable(
  connection: WebApi,
  options: GetTestVariableOptions,
): Promise<TestVariable> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const { projectId, testVariableId } = options;

    const variable = await testPlanApi.getTestVariableById(
      projectId,
      testVariableId,
    );

    if (variable === null || variable === undefined) {
      throw new AzureDevOpsResourceNotFoundError(
        `Test variable not found with ID: ${testVariableId}`,
      );
    }

    return variable;
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
          `Test variable or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get test variable: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
