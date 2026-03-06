import { WebApi } from 'azure-devops-node-api';
import { AzureDevOpsError } from '../../../shared/errors';
import { handleRequestError } from '../../../shared/errors/handle-request-error';
import { UpdateTestPlanOptions, TestPlan } from '../types';
import { TestPlanUpdateParams } from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

/**
 * Update an existing test plan
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for updating a test plan
 * @returns The updated test plan
 */
export async function updateTestPlan(
  connection: WebApi,
  options: UpdateTestPlanOptions,
): Promise<TestPlan> {
  const {
    projectId,
    planId,
    name,
    iteration,
    areaPath,
    description,
    startDate,
    endDate,
    state,
    buildId,
    revision,
  } = options;

  let testPlan;
  try {
    const testPlanApi = await connection.getTestPlanApi();
    testPlan = await testPlanApi.updateTestPlan(
      {
        name,
        iteration,
        areaPath,
        description,
        startDate,
        endDate,
        state,
        buildId,
        revision,
      } as TestPlanUpdateParams,
      projectId,
      planId,
    );
  } catch (error) {
    return handleRequestError(
      error,
      `updating test plan ${planId} in project "${projectId}"`,
    );
  }

  if (testPlan == null) {
    throw new AzureDevOpsError(
      `Failed to update test plan ${planId}: API returned no data`,
    );
  }

  return testPlan;
}
