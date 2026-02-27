import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import {
  GetSuiteEntriesOptions,
  SuiteEntry,
  PagedResult,
  slimListItem,
} from '../types';

/**
 * Get ordered entries (test cases and child suites) in a suite
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting suite entries
 * @returns List of suite entries with sequence numbers
 */
export async function getSuiteEntries(
  connection: WebApi,
  options: GetSuiteEntriesOptions,
): Promise<PagedResult<SuiteEntry>> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const { projectId, suiteId, suiteEntryType, top = 50 } = options;

    const entries = await testPlanApi.getSuiteEntries(
      projectId,
      suiteId,
      suiteEntryType,
    );

    const truncated = entries.slice(0, top);
    const hasMoreResults = truncated.length < entries.length;

    return {
      count: truncated.length,
      value: truncated.map((item) =>
        slimListItem(item as any),
      ) as unknown as SuiteEntry[],
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
          `Suite or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get suite entries: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
