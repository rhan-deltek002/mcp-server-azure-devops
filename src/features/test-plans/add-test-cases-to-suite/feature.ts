import { WebApi } from 'azure-devops-node-api';
import { AzureDevOpsError } from '../../../shared/errors';
import { handleRequestError } from '../../../shared/errors/handle-request-error';
import { AddTestCasesToSuiteOptions, TestCase } from '../types';

/**
 * Add test cases to a test suite
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for adding test cases to a suite
 * @returns The added test cases
 */
export async function addTestCasesToSuite(
  connection: WebApi,
  options: AddTestCasesToSuiteOptions,
): Promise<TestCase[]> {
  const { projectId, planId, suiteId, testCases } = options;

  const params = testCases.map(({ workItemId, configurationIds }) => ({
    workItem: { id: workItemId },
    pointAssignments: configurationIds?.map((id) => ({ configurationId: id })),
  }));

  let result;
  try {
    const testPlanApi = await connection.getTestPlanApi();
    result = await testPlanApi.addTestCasesToSuite(
      params,
      projectId,
      planId,
      suiteId,
    );
  } catch (error) {
    return handleRequestError(
      error,
      `adding test cases to suite ${suiteId} in plan ${planId} in project "${projectId}"`,
    );
  }

  if (result == null) {
    throw new AzureDevOpsError(
      `Failed to add test cases to suite ${suiteId}: API returned no data`,
    );
  }

  return result;
}
