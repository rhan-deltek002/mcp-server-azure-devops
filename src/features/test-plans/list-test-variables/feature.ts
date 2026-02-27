import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import {
  ListTestVariablesOptions,
  TestVariable,
  PagedResult,
  slimListItem,
} from '../types';

/**
 * List test variables in a project
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for listing test variables
 * @returns List of test variables
 */
export async function listTestVariables(
  connection: WebApi,
  options: ListTestVariablesOptions,
): Promise<PagedResult<TestVariable>> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const { projectId, continuationToken, top = 25 } = options;

    const variables = await testPlanApi.getTestVariables(
      projectId,
      continuationToken,
    );

    const apiToken = (variables as any).continuationToken as string | undefined;
    const truncated = variables.slice(0, top);
    const hasMoreResults = truncated.length < variables.length || !!apiToken;

    return {
      count: truncated.length,
      value: truncated.map((item) =>
        slimListItem(item as any),
      ) as unknown as TestVariable[],
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
          `Project or resource not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to list test variables: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
