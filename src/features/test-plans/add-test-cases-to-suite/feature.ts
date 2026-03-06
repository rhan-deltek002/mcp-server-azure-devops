import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { AddTestCasesToSuiteOptions, TestCase } from '../types';

export async function addTestCasesToSuite(
  connection: WebApi,
  options: AddTestCasesToSuiteOptions,
): Promise<TestCase[]> {
  try {
    const testPlanApi = await connection.getTestPlanApi();
    const { projectId, planId, suiteId, testCases } = options;

    const params = testCases.map(({ workItemId, configurationIds }) => ({
      workItem: { id: workItemId },
      pointAssignments: configurationIds?.map((id) => ({
        configurationId: id,
      })),
    }));

    return await testPlanApi.addTestCasesToSuite(
      params,
      projectId,
      planId,
      suiteId,
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
          `Test suite, plan, or project not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to add test cases to suite: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
