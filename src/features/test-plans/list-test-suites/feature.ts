import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { ListTestSuitesOptions, PagedResult, slimListItem } from '../types';
import { TestSuite } from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

/**
 * Flatten a nested suite tree into a compact list with parentId references.
 * Deeply nested trees produce huge JSON due to indentation; a flat list with
 * parentId is far more compact and equally useful for the LLM.
 */
function flattenSuiteTree(
  suites: TestSuite[],
  parentId?: number,
): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];
  for (const s of suites as any[]) {
    const entry: Record<string, unknown> = {
      id: s.id,
      name: s.name,
      suiteType: s.suiteType,
    };
    if (parentId !== undefined) {
      entry.parentId = parentId;
    }
    const children = s.children as TestSuite[] | undefined;
    if (children?.length) {
      entry.childCount = children.length;
    }
    if (s.queryString) {
      entry.queryString = s.queryString;
    }
    result.push(entry);
    if (children?.length) {
      result.push(...flattenSuiteTree(children, s.id));
    }
  }
  return result;
}

/**
 * List test suites for a test plan
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for listing test suites
 * @returns List of test suites
 */
export async function listTestSuites(
  connection: WebApi,
  options: ListTestSuitesOptions,
): Promise<PagedResult<TestSuite>> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const {
      projectId,
      planId,
      expand,
      continuationToken,
      asTreeView,
      top = 50,
    } = options;

    const testSuites = await testPlanApi.getTestSuitesForPlan(
      projectId,
      planId,
      expand,
      continuationToken,
      asTreeView,
    );

    // For tree views, flatten the nested tree into a compact list with
    // parentId references. This avoids deep JSON nesting which causes
    // massive whitespace overhead (a 961-node tree can go from 432K to 85K).
    if (asTreeView) {
      const flat = flattenSuiteTree(testSuites);
      const truncated = flat.slice(0, top);
      const hasMore = truncated.length < flat.length;
      return {
        count: truncated.length,
        value: truncated as unknown as TestSuite[],
        hasMoreResults: hasMore,
        ...(hasMore
          ? {
              warning: `Results limited to ${top} of ${flat.length} suites. Increase top to retrieve more.`,
            }
          : {}),
      };
    }

    const apiToken = (testSuites as any).continuationToken as
      | string
      | undefined;
    const truncated = testSuites.slice(0, top);
    const hasMoreResults = truncated.length < testSuites.length || !!apiToken;

    return {
      count: truncated.length,
      value: truncated.map((item) =>
        slimListItem(item as any),
      ) as unknown as TestSuite[],
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
          `Project or test plan not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to list test suites: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
