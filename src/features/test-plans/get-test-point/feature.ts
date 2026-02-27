import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { GetTestPointOptions, TestPoint } from '../types';

/**
 * Get a specific test point by ID
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for getting a test point
 * @returns Test point details (array — API returns TestPoint[])
 */
export async function getTestPoint(
  connection: WebApi,
  options: GetTestPointOptions,
): Promise<TestPoint[]> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const {
      projectId,
      planId,
      suiteId,
      pointId,
      returnIdentityRef,
      includePointDetails,
    } = options;

    const testPoints = await testPlanApi.getPoints(
      projectId,
      planId,
      suiteId,
      pointId,
      returnIdentityRef,
      includePointDetails,
    );

    return testPoints;
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
          `Test point, suite, plan, or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get test point: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
