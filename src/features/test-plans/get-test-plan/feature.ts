import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { GetTestPlanOptions, TestPlan } from '../types';

/**
 * Get a specific test plan by ID
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting a test plan
 * @returns Test plan details
 */
export async function getTestPlan(
  connection: WebApi,
  options: GetTestPlanOptions,
): Promise<TestPlan> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const { projectId, planId } = options;

    const testPlan = await testPlanApi.getTestPlanById(projectId, planId);

    if (testPlan === null || testPlan === undefined) {
      throw new AzureDevOpsResourceNotFoundError(
        `Test plan not found with ID: ${planId}`,
      );
    }

    return testPlan;
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
          `Test plan or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get test plan: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
