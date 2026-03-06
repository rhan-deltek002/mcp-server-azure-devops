import { WebApi } from 'azure-devops-node-api';
import { AzureDevOpsError } from '../../../shared/errors';
import { handleRequestError } from '../../../shared/errors/handle-request-error';
import { UpdateSuiteTestCasesOptions, TestCase } from '../types';

/**
 * Update test case configuration assignments in a test suite
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for updating test cases in a suite
 * @returns The updated test cases
 */
export async function updateSuiteTestCases(
  connection: WebApi,
  options: UpdateSuiteTestCasesOptions,
): Promise<TestCase[]> {
  const { projectId, planId, suiteId, testCases } = options;

  const params = testCases.map(({ workItemId, configurationIds }) => ({
    workItem: { id: workItemId },
    pointAssignments: configurationIds?.map((id) => ({ configurationId: id })),
  }));

  let result;
  try {
    const testPlanApi = await connection.getTestPlanApi();
    result = await testPlanApi.updateSuiteTestCases(
      params,
      projectId,
      planId,
      suiteId,
    );
  } catch (error) {
    return handleRequestError(
      error,
      `updating test cases in suite ${suiteId} in plan ${planId} in project "${projectId}"`,
    );
  }

  if (result == null) {
    throw new AzureDevOpsError(
      `Failed to update test cases in suite ${suiteId}: API returned no data`,
    );
  }

  return result;
}
