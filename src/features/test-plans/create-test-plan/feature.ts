import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
} from '../../../shared/errors';
import { CreateTestPlanOptions, TestPlan } from '../types';

export async function createTestPlan(
  connection: WebApi,
  options: CreateTestPlanOptions,
): Promise<TestPlan> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
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

    return await testPlanApi.createTestPlan(
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
    }

    throw new AzureDevOpsError(
      `Failed to create test plan: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
