import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { GetTestSuiteOptions } from '../types';
import { TestSuite } from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

/**
 * Get a specific test suite by ID
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting a test suite
 * @returns Test suite details
 */
export async function getTestSuite(
  connection: WebApi,
  options: GetTestSuiteOptions,
): Promise<TestSuite> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const { projectId, planId, suiteId, expand } = options;

    const testSuite = await testPlanApi.getTestSuiteById(
      projectId,
      planId,
      suiteId,
      expand,
    );

    if (testSuite === null || testSuite === undefined) {
      throw new AzureDevOpsResourceNotFoundError(
        `Test suite not found with ID: ${suiteId}`,
      );
    }

    return testSuite;
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
      `Failed to get test suite: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
