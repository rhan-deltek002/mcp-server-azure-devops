import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import {
  ListTestPointsOptions,
  TestPoint,
  PagedResult,
  slimListItem,
} from '../types';

/**
 * List test points in a test suite
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for listing test points
 * @returns List of test points
 */
export async function listTestPoints(
  connection: WebApi,
  options: ListTestPointsOptions,
): Promise<PagedResult<TestPoint>> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const {
      projectId,
      planId,
      suiteId,
      testPointIds,
      testCaseId,
      continuationToken,
      returnIdentityRef,
      includePointDetails,
      isRecursive,
      top = 25,
    } = options;

    const testPoints = await testPlanApi.getPointsList(
      projectId,
      planId,
      suiteId,
      testPointIds,
      testCaseId,
      continuationToken,
      returnIdentityRef,
      includePointDetails,
      isRecursive,
    );

    const apiToken = (testPoints as any).continuationToken as
      | string
      | undefined;
    const truncated = testPoints.slice(0, top);
    const hasMoreResults = truncated.length < testPoints.length || !!apiToken;

    return {
      count: truncated.length,
      value: truncated.map((item) =>
        slimListItem(item as any),
      ) as unknown as TestPoint[],
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
      `Failed to list test points: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
