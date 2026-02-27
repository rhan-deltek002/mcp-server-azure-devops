import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import {
  GetTestEntityCountOptions,
  TestEntityCount,
  PagedResult,
} from '../types';

/**
 * Get test entity counts for a test plan
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting test entity counts
 * @returns List of test entity counts
 */
export async function getTestEntityCounts(
  connection: WebApi,
  options: GetTestEntityCountOptions,
): Promise<PagedResult<TestEntityCount>> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const {
      projectId,
      planId,
      states,
      outcome,
      configurations,
      testers,
      assignedTo,
      entity,
      top = 25,
    } = options;

    const counts = await testPlanApi.getTestEntityCountByPlanId(
      projectId,
      planId,
      states,
      outcome,
      configurations,
      testers,
      assignedTo,
      entity,
    );

    const truncated = counts.slice(0, top);
    const hasMoreResults = truncated.length < counts.length;

    return {
      count: truncated.length,
      value: truncated,
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
          `Plan or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get test entity counts: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
