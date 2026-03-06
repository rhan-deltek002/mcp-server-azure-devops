import {
  TestPlan,
  TestSuite,
  TestConfiguration,
  TestVariable,
  TestCase,
  TestPoint,
  SuiteEntry,
  SuiteExpand,
  SuiteEntryTypes,
  ExcludeFlags,
  TestEntityCount,
  TestEntityTypes,
  UserFriendlyTestOutcome,
} from 'azure-devops-node-api/interfaces/TestPlanInterfaces';

/**
 * Paginated result envelope for list operations
 */
export interface PagedResult<T> {
  count: number;
  value: T[];
  continuationToken?: string;
  hasMoreResults: boolean;
  warning?: string;
}

/**
 * Options for listing test plans
 */
export interface ListTestPlansOptions {
  projectId: string;
  owner?: string;
  continuationToken?: string;
  includePlanDetails?: boolean;
  filterActivePlans?: boolean;
  top?: number;
}

/**
 * Options for getting a test plan
 */
export interface GetTestPlanOptions {
  projectId: string;
  planId: number;
}

/**
 * Options for creating a test plan
 */
export interface CreateTestPlanOptions {
  projectId: string;
  name: string;
  iteration: string;
  areaPath?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  state?: string;
  buildId?: number;
}

/**
 * Options for updating a test plan
 */
export interface UpdateTestPlanOptions {
  projectId: string;
  planId: number;
  name?: string;
  iteration?: string;
  areaPath?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  state?: string;
  buildId?: number;
  revision?: number;
}

/**
 * Options for listing test suites
 */
export interface ListTestSuitesOptions {
  projectId: string;
  planId: number;
  expand?: SuiteExpand;
  continuationToken?: string;
  asTreeView?: boolean;
  top?: number;
}

/**
 * Options for getting a test suite
 */
export interface GetTestSuiteOptions {
  projectId: string;
  planId: number;
  suiteId: number;
  expand?: SuiteExpand;
}

/**
 * Options for creating a test suite
 */
export interface CreateTestSuiteOptions {
  projectId: string;
  planId: number;
  name: string;
  suiteType?: 'staticTestSuite' | 'dynamicTestSuite' | 'requirementTestSuite';
  parentSuiteId?: number;
  requirementId?: number;
  inheritDefaultConfigurations?: boolean;
  defaultConfigurationIds?: number[];
}

/**
 * Options for updating a test suite
 */
export interface UpdateTestSuiteOptions {
  projectId: string;
  planId: number;
  suiteId: number;
  name?: string;
  inheritDefaultConfigurations?: boolean;
  defaultConfigurationIds?: number[];
  revision?: number;
}

/**
 * Options for adding test cases to a suite
 */
export interface AddTestCasesToSuiteOptions {
  projectId: string;
  planId: number;
  suiteId: number;
  testCases: Array<{
    workItemId: number;
    configurationIds?: number[];
  }>;
}

/**
 * Options for updating test cases in a suite
 */
export interface UpdateSuiteTestCasesOptions {
  projectId: string;
  planId: number;
  suiteId: number;
  testCases: Array<{
    workItemId: number;
    configurationIds?: number[];
  }>;
}

/**
 * Options for listing test configurations
 */
export interface ListTestConfigurationsOptions {
  projectId: string;
  continuationToken?: string;
  top?: number;
}

/**
 * Options for getting a test configuration
 */
export interface GetTestConfigurationOptions {
  projectId: string;
  testConfigurationId: number;
}

/**
 * Options for listing test variables
 */
export interface ListTestVariablesOptions {
  projectId: string;
  continuationToken?: string;
  top?: number;
}

/**
 * Options for getting a test variable
 */
export interface GetTestVariableOptions {
  projectId: string;
  testVariableId: number;
}

/**
 * Options for listing test cases
 */
export interface ListTestCasesOptions {
  projectId: string;
  planId: number;
  suiteId: number;
  testIds?: string;
  configurationIds?: string;
  witFields?: string;
  continuationToken?: string;
  returnIdentityRef?: boolean;
  expand?: boolean;
  excludeFlags?: ExcludeFlags;
  isRecursive?: boolean;
  top?: number;
}

/**
 * Options for getting a test case
 */
export interface GetTestCaseOptions {
  projectId: string;
  planId: number;
  suiteId: number;
  testCaseId: string;
  witFields?: string;
  returnIdentityRef?: boolean;
}

/**
 * Options for listing test points
 */
export interface ListTestPointsOptions {
  projectId: string;
  planId: number;
  suiteId: number;
  testPointIds?: string;
  testCaseId?: string;
  continuationToken?: string;
  returnIdentityRef?: boolean;
  includePointDetails?: boolean;
  isRecursive?: boolean;
  top?: number;
}

/**
 * Options for getting a test point
 */
export interface GetTestPointOptions {
  projectId: string;
  planId: number;
  suiteId: number;
  pointId: string;
  returnIdentityRef?: boolean;
  includePointDetails?: boolean;
}

/**
 * Options for getting suite entries
 */
export interface GetSuiteEntriesOptions {
  projectId: string;
  suiteId: number;
  suiteEntryType?: SuiteEntryTypes;
  top?: number;
}

/**
 * Options for getting suites by test case
 */
export interface GetSuitesByTestCaseOptions {
  testCaseId: number;
  top?: number;
}

/**
 * Options for getting test entity counts
 */
export interface GetTestEntityCountOptions {
  projectId: string;
  planId: number;
  states?: string;
  outcome?: UserFriendlyTestOutcome;
  configurations?: string;
  testers?: string;
  assignedTo?: string;
  entity?: TestEntityTypes;
  top?: number;
}

/**
 * Strip verbose fields from API objects to reduce response payload size.
 * Removes _links/links, project, plan, testPlan, testSuite (redundant —
 * caller already knows these), revision, lastUpdatedDate, and slims
 * identity refs (url, _links, imageUrl, descriptor) down to
 * just displayName + uniqueName + id.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function slimIdentityRef(ref: any): any {
  return {
    displayName: ref.displayName,
    uniqueName: ref.uniqueName,
    id: ref.id,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isIdentityRef(value: any): boolean {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value.uniqueName
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function slimListItem(obj: Record<string, any>): Record<string, any> {
  // Remove redundant top-level fields
  const {
    _links,
    links: _links_alt,
    project: _project,
    plan: _plan,
    testPlan: _testPlan,
    testSuite: _testSuite,
    revision: _revision,
    lastUpdatedDate: _lastUpdatedDate,
    ...rest
  } = obj;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (isIdentityRef(value)) {
      result[key] = slimIdentityRef(value);
    } else if (Array.isArray(value)) {
      // Slim identity refs inside arrays (e.g. pointAssignments[].tester)
      result[key] = value.map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const slimmed: Record<string, any> = {};
          for (const [k, v] of Object.entries(item)) {
            if (isIdentityRef(v)) {
              slimmed[k] = slimIdentityRef(v);
            } else {
              slimmed[k] = v;
            }
          }
          return slimmed;
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }
  return result;
}

export {
  TestPlan,
  TestSuite,
  TestConfiguration,
  TestVariable,
  TestCase,
  TestPoint,
  SuiteEntry,
  SuiteExpand,
  SuiteEntryTypes,
  ExcludeFlags,
  TestEntityCount,
  TestEntityTypes,
  UserFriendlyTestOutcome,
};
