import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { UpdateTestPlanOptions, TestPlan } from '../types';
import { TestPlanUpdateParams } from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

export async function updateTestPlan(
  connection: WebApi,
  options: UpdateTestPlanOptions,
): Promise<TestPlan> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
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

    return await testPlanApi.updateTestPlan(
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
          `Test plan not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to update test plan: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
