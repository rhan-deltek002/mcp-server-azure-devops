import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { GetTestCaseOptions, TestCase } from '../types';

/**
 * Get a specific test case from a test suite by ID
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting a test case
 * @returns Test case details (array — API returns TestCase[])
 */
export async function getTestCase(
  connection: WebApi,
  options: GetTestCaseOptions,
): Promise<TestCase[]> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const {
      projectId,
      planId,
      suiteId,
      testCaseId,
      witFields,
      returnIdentityRef,
    } = options;

    const testCases = await testPlanApi.getTestCase(
      projectId,
      planId,
      suiteId,
      testCaseId,
      witFields,
      returnIdentityRef,
    );

    return testCases;
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
          `Test case, suite, plan, or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get test case: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
