import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import {
  ListTestCasesOptions,
  TestCase,
  PagedResult,
  slimListItem,
} from '../types';

/**
 * List test cases in a test suite
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for listing test cases
 * @returns List of test cases
 */
export async function listTestCases(
  connection: WebApi,
  options: ListTestCasesOptions,
): Promise<PagedResult<TestCase>> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const {
      projectId,
      planId,
      suiteId,
      testIds,
      configurationIds,
      witFields,
      continuationToken,
      returnIdentityRef,
      expand,
      excludeFlags,
      isRecursive,
      top = 25,
    } = options;

    const testCases = await testPlanApi.getTestCaseList(
      projectId,
      planId,
      suiteId,
      testIds,
      configurationIds,
      witFields,
      continuationToken,
      returnIdentityRef,
      expand,
      excludeFlags,
      isRecursive,
    );

    const apiToken = (testCases as any).continuationToken as string | undefined;
    const truncated = testCases.slice(0, top);
    const hasMoreResults = truncated.length < testCases.length || !!apiToken;

    return {
      count: truncated.length,
      value: truncated.map((item) => {
        const slimmed = slimListItem(item as any);
        // Strip workItemFields from list responses — it contains huge HTML
        // test steps (5KB+ each). Use get_test_case for full details.
        if (slimmed.workItem?.workItemFields) {
          slimmed.workItem = {
            id: slimmed.workItem.id,
            name: slimmed.workItem.name,
          };
        }
        return slimmed;
      }) as unknown as TestCase[],
      ...(apiToken ? { continuationToken: apiToken } : {}),
      hasMoreResults,
      ...(hasMoreResults
        ? {
            warning: `Results limited to ${top} items. ${apiToken ? `Use continuationToken '${apiToken}' to get the next page.` : 'Increase top to retrieve more.'}`,
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
          `Project, plan, or suite not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to list test cases: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
