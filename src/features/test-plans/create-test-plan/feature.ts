import { WebApi } from 'azure-devops-node-api';
import { AzureDevOpsError } from '../../../shared/errors';
import { handleRequestError } from '../../../shared/errors/handle-request-error';
import { CreateTestPlanOptions, TestPlan } from '../types';

/**
 * Create a new test plan in a project
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for creating a test plan
 * @returns The created test plan
 */
export async function createTestPlan(
  connection: WebApi,
  options: CreateTestPlanOptions,
): Promise<TestPlan> {
  const {
    projectId,
    name,
    iteration,
    areaPath,
    description,
    startDate,
    endDate,
    state,
    buildId,
  } = options;

  let testPlan;
  try {
    const testPlanApi = await connection.getTestPlanApi();
    testPlan = await testPlanApi.createTestPlan(
      {
        name,
        iteration,
        areaPath,
        description,
        startDate,
        endDate,
        state,
        buildId,
      },
      projectId,
    );
  } catch (error) {
    return handleRequestError(
      error,
      `creating test plan in project "${projectId}"`,
    );
  }

  if (testPlan == null) {
    throw new AzureDevOpsError(
      `Failed to create test plan "${name}": API returned no data`,
    );
  }

  return testPlan;
}
