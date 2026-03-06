import { WebApi } from 'azure-devops-node-api';
import { AzureDevOpsError } from '../../../shared/errors';
import { handleRequestError } from '../../../shared/errors/handle-request-error';
import { UpdateTestSuiteOptions, TestSuite } from '../types';
import {
  TestConfigurationReference,
  TestSuiteUpdateParams,
} from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

/**
 * Update an existing test suite
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for updating a test suite
 * @returns The updated test suite
 */
export async function updateTestSuite(
  connection: WebApi,
  options: UpdateTestSuiteOptions,
): Promise<TestSuite> {
  const {
    projectId,
    planId,
    suiteId,
    name,
    inheritDefaultConfigurations,
    defaultConfigurationIds,
    revision,
  } = options;

  let testSuite;
  try {
    const testPlanApi = await connection.getTestPlanApi();
    testSuite = await testPlanApi.updateTestSuite(
      {
        name,
        inheritDefaultConfigurations,
        defaultConfigurations: defaultConfigurationIds?.map(
          (id) => ({ id }) as TestConfigurationReference,
        ),
        revision,
      } as TestSuiteUpdateParams,
      projectId,
      planId,
      suiteId,
    );
  } catch (error) {
    return handleRequestError(
      error,
      `updating test suite ${suiteId} in plan ${planId} in project "${projectId}"`,
    );
  }

  if (testSuite == null) {
    throw new AzureDevOpsError(
      `Failed to update test suite ${suiteId}: API returned no data`,
    );
  }

  return testSuite;
}
