import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import {
  GetSuitesByTestCaseOptions,
  TestSuite,
  PagedResult,
  slimListItem,
} from '../types';

/**
 * Find all test suites containing a given test case across all projects
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting suites by test case
 * @returns List of test suites containing the test case
 */
export async function getSuitesByTestCase(
  connection: WebApi,
  options: GetSuitesByTestCaseOptions,
): Promise<PagedResult<TestSuite>> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const { testCaseId, top = 25 } = options;

    const suites = await testPlanApi.getSuitesByTestCaseId(testCaseId);

    const truncated = suites.slice(0, top);
    const hasMoreResults = truncated.length < suites.length;

    return {
      count: truncated.length,
      value: truncated.map((item) =>
        slimListItem(item as any),
      ) as unknown as TestSuite[],
      hasMoreResults,
      ...(hasMoreResults
        ? {
            warning: `Results limited to ${top} items. Increase top to retrieve more.`,
          }
        : {}),
    };
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
          `Test case not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get suites by test case: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
