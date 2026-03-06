import { WebApi } from 'azure-devops-node-api';
import { AzureDevOpsError } from '../../../shared/errors';
import { handleRequestError } from '../../../shared/errors/handle-request-error';
import { CreateTestSuiteOptions, TestSuite } from '../types';
import {
  TestSuiteType,
  TestConfigurationReference,
  TestSuiteReference,
} from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

/**
 * Create a new test suite within a test plan
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for creating a test suite
 * @returns The created test suite
 */
export async function createTestSuite(
  connection: WebApi,
  options: CreateTestSuiteOptions,
): Promise<TestSuite> {
  const {
    projectId,
    planId,
    name,
    suiteType,
    parentSuiteId,
    requirementId,
    queryString,
    inheritDefaultConfigurations,
    defaultConfigurationIds,
  } = options;

  let suiteTypeEnum: TestSuiteType;
  switch (suiteType) {
    case 'dynamicTestSuite':
      suiteTypeEnum = TestSuiteType.DynamicTestSuite;
      break;
    case 'requirementTestSuite':
      suiteTypeEnum = TestSuiteType.RequirementTestSuite;
      break;
    default:
      suiteTypeEnum = TestSuiteType.StaticTestSuite;
  }

  let testSuite;
  try {
    const testPlanApi = await connection.getTestPlanApi();
    testSuite = await testPlanApi.createTestSuite(
      {
        name,
        suiteType: suiteTypeEnum,
        requirementId,
        queryString,
        inheritDefaultConfigurations,
        defaultConfigurations: defaultConfigurationIds?.map(
          (id) => ({ id }) as TestConfigurationReference,
        ),
        parentSuite: parentSuiteId
          ? ({ id: parentSuiteId } as TestSuiteReference)
          : undefined,
      },
      projectId,
      planId,
    );
  } catch (error) {
    return handleRequestError(
      error,
      `creating test suite in plan ${planId} in project "${projectId}"`,
    );
  }

  if (testSuite == null) {
    throw new AzureDevOpsError(
      `Failed to create test suite "${name}": API returned no data`,
    );
  }

  return testSuite;
}
