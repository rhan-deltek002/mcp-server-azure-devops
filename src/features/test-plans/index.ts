// Re-export types
export * from './types';

// Re-export features
export * from './list-test-plans';
export * from './get-test-plan';
export * from './list-test-suites';
export * from './get-test-suite';
export * from './list-test-configurations';
export * from './get-test-configuration';
export * from './list-test-variables';
export * from './get-test-variable';
export * from './list-test-cases';
export * from './get-test-case';
export * from './list-test-points';
export * from './get-test-point';
export * from './get-suite-entries';
export * from './get-suites-by-test-case';
export * from './get-test-entity-counts';

// Export tool definitions
export * from './tool-definitions';

import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { WebApi } from 'azure-devops-node-api';
import {
  SuiteExpand,
  ExcludeFlags,
  SuiteEntryTypes,
  UserFriendlyTestOutcome,
  TestEntityTypes,
} from 'azure-devops-node-api/interfaces/TestPlanInterfaces';
import {
  RequestIdentifier,
  RequestHandler,
} from '../../shared/types/request-handler';
import { ListTestPlansSchema } from './list-test-plans';
import { GetTestPlanSchema } from './get-test-plan';
import { ListTestSuitesSchema } from './list-test-suites';
import { GetTestSuiteSchema } from './get-test-suite';
import { ListTestConfigurationsSchema } from './list-test-configurations';
import { GetTestConfigurationSchema } from './get-test-configuration';
import { ListTestVariablesSchema } from './list-test-variables';
import { GetTestVariableSchema } from './get-test-variable';
import { ListTestCasesSchema } from './list-test-cases';
import { GetTestCaseSchema } from './get-test-case';
import { ListTestPointsSchema } from './list-test-points';
import { GetTestPointSchema } from './get-test-point';
import { GetSuiteEntriesSchema } from './get-suite-entries';
import { GetSuitesByTestCaseSchema } from './get-suites-by-test-case';
import { GetTestEntityCountsSchema } from './get-test-entity-counts';
import { listTestPlans } from './list-test-plans';
import { getTestPlan } from './get-test-plan';
import { listTestSuites } from './list-test-suites';
import { getTestSuite } from './get-test-suite';
import { listTestConfigurations } from './list-test-configurations';
import { getTestConfiguration } from './get-test-configuration';
import { listTestVariables } from './list-test-variables';
import { getTestVariable } from './get-test-variable';
import { listTestCases } from './list-test-cases';
import { getTestCase } from './get-test-case';
import { listTestPoints } from './list-test-points';
import { getTestPoint } from './get-test-point';
import { getSuiteEntries } from './get-suite-entries';
import { getSuitesByTestCase } from './get-suites-by-test-case';
import { getTestEntityCounts } from './get-test-entity-counts';
import { defaultProject } from '../../utils/environment';

/**
 * Map string expand values to SuiteExpand enum
 */
function parseSuiteExpand(expand?: string): SuiteExpand | undefined {
  if (!expand) return undefined;
  switch (expand) {
    case 'children':
      return SuiteExpand.Children;
    case 'defaultTesters':
      return SuiteExpand.DefaultTesters;
    case 'none':
      return SuiteExpand.None;
    default:
      return undefined;
  }
}

/**
 * Map string values to ExcludeFlags enum
 */
function parseExcludeFlags(flags?: string): ExcludeFlags | undefined {
  if (!flags) return undefined;
  switch (flags) {
    case 'none':
      return ExcludeFlags.None;
    case 'pointAssignments':
      return ExcludeFlags.PointAssignments;
    case 'extraInformation':
      return ExcludeFlags.ExtraInformation;
    default:
      return undefined;
  }
}

/**
 * Map string values to SuiteEntryTypes enum
 */
function parseSuiteEntryType(entryType?: string): SuiteEntryTypes | undefined {
  if (!entryType) return undefined;
  switch (entryType) {
    case 'testCase':
      return SuiteEntryTypes.TestCase;
    case 'suite':
      return SuiteEntryTypes.Suite;
    default:
      return undefined;
  }
}

/**
 * Map string values to UserFriendlyTestOutcome enum
 */
function parseUserFriendlyTestOutcome(
  outcome?: string,
): UserFriendlyTestOutcome | undefined {
  if (!outcome) return undefined;
  switch (outcome) {
    case 'inProgress':
      return UserFriendlyTestOutcome.InProgress;
    case 'blocked':
      return UserFriendlyTestOutcome.Blocked;
    case 'failed':
      return UserFriendlyTestOutcome.Failed;
    case 'passed':
      return UserFriendlyTestOutcome.Passed;
    case 'ready':
      return UserFriendlyTestOutcome.Ready;
    case 'notApplicable':
      return UserFriendlyTestOutcome.NotApplicable;
    case 'paused':
      return UserFriendlyTestOutcome.Paused;
    case 'timeout':
      return UserFriendlyTestOutcome.Timeout;
    case 'warning':
      return UserFriendlyTestOutcome.Warning;
    case 'error':
      return UserFriendlyTestOutcome.Error;
    case 'notExecuted':
      return UserFriendlyTestOutcome.NotExecuted;
    case 'inconclusive':
      return UserFriendlyTestOutcome.Inconclusive;
    case 'aborted':
      return UserFriendlyTestOutcome.Aborted;
    case 'none':
      return UserFriendlyTestOutcome.None;
    case 'notImpacted':
      return UserFriendlyTestOutcome.NotImpacted;
    case 'unspecified':
      return UserFriendlyTestOutcome.Unspecified;
    default:
      return undefined;
  }
}

/**
 * Map string values to TestEntityTypes enum
 */
function parseTestEntityType(entity?: string): TestEntityTypes | undefined {
  if (!entity) return undefined;
  switch (entity) {
    case 'testCase':
      return TestEntityTypes.TestCase;
    case 'testPoint':
      return TestEntityTypes.TestPoint;
    default:
      return undefined;
  }
}

/**
 * Checks if the request is for the test plans feature
 */
export const isTestPlansRequest: RequestIdentifier = (
  request: CallToolRequest,
): boolean => {
  const toolName = request.params.name;
  return [
    'list_test_plans',
    'get_test_plan',
    'list_test_suites',
    'get_test_suite',
    'list_test_configurations',
    'get_test_configuration',
    'list_test_variables',
    'get_test_variable',
    'list_test_cases',
    'get_test_case',
    'list_test_points',
    'get_test_point',
    'get_suite_entries',
    'get_suites_by_test_case',
    'get_test_entity_counts',
  ].includes(toolName);
};

/**
 * Handles test plans feature requests
 */
export const handleTestPlansRequest: RequestHandler = async (
  connection: WebApi,
  request: CallToolRequest,
): Promise<{ content: Array<{ type: string; text: string }> }> => {
  switch (request.params.name) {
    case 'list_test_plans': {
      const args = ListTestPlansSchema.parse(request.params.arguments);
      const result = await listTestPlans(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_test_plan': {
      const args = GetTestPlanSchema.parse(request.params.arguments);
      const result = await getTestPlan(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'list_test_suites': {
      const args = ListTestSuitesSchema.parse(request.params.arguments);
      const result = await listTestSuites(connection, {
        projectId: args.projectId ?? defaultProject,
        planId: args.planId,
        expand: parseSuiteExpand(args.expand),
        continuationToken: args.continuationToken,
        asTreeView: args.asTreeView,
        top: args.top,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_test_suite': {
      const args = GetTestSuiteSchema.parse(request.params.arguments);
      const result = await getTestSuite(connection, {
        projectId: args.projectId ?? defaultProject,
        planId: args.planId,
        suiteId: args.suiteId,
        expand: parseSuiteExpand(args.expand),
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'list_test_configurations': {
      const args = ListTestConfigurationsSchema.parse(request.params.arguments);
      const result = await listTestConfigurations(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_test_configuration': {
      const args = GetTestConfigurationSchema.parse(request.params.arguments);
      const result = await getTestConfiguration(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'list_test_variables': {
      const args = ListTestVariablesSchema.parse(request.params.arguments);
      const result = await listTestVariables(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_test_variable': {
      const args = GetTestVariableSchema.parse(request.params.arguments);
      const result = await getTestVariable(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'list_test_cases': {
      const args = ListTestCasesSchema.parse(request.params.arguments);
      const result = await listTestCases(connection, {
        projectId: args.projectId ?? defaultProject,
        planId: args.planId,
        suiteId: args.suiteId,
        testIds: args.testIds,
        configurationIds: args.configurationIds,
        witFields: args.witFields,
        continuationToken: args.continuationToken,
        returnIdentityRef: args.returnIdentityRef,
        expand: args.expand,
        excludeFlags: parseExcludeFlags(args.excludeFlags),
        isRecursive: args.isRecursive,
        top: args.top,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_test_case': {
      const args = GetTestCaseSchema.parse(request.params.arguments);
      const result = await getTestCase(connection, {
        projectId: args.projectId ?? defaultProject,
        planId: args.planId,
        suiteId: args.suiteId,
        testCaseId: args.testCaseId,
        witFields: args.witFields,
        returnIdentityRef: args.returnIdentityRef,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'list_test_points': {
      const args = ListTestPointsSchema.parse(request.params.arguments);
      const result = await listTestPoints(connection, {
        projectId: args.projectId ?? defaultProject,
        planId: args.planId,
        suiteId: args.suiteId,
        testPointIds: args.testPointIds,
        testCaseId: args.testCaseId,
        continuationToken: args.continuationToken,
        returnIdentityRef: args.returnIdentityRef,
        includePointDetails: args.includePointDetails,
        isRecursive: args.isRecursive,
        top: args.top,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_test_point': {
      const args = GetTestPointSchema.parse(request.params.arguments);
      const result = await getTestPoint(connection, {
        projectId: args.projectId ?? defaultProject,
        planId: args.planId,
        suiteId: args.suiteId,
        pointId: args.pointId,
        returnIdentityRef: args.returnIdentityRef,
        includePointDetails: args.includePointDetails,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_suite_entries': {
      const args = GetSuiteEntriesSchema.parse(request.params.arguments);
      const result = await getSuiteEntries(connection, {
        projectId: args.projectId ?? defaultProject,
        suiteId: args.suiteId,
        suiteEntryType: parseSuiteEntryType(args.suiteEntryType),
        top: args.top,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_suites_by_test_case': {
      const args = GetSuitesByTestCaseSchema.parse(request.params.arguments);
      const result = await getSuitesByTestCase(connection, {
        testCaseId: args.testCaseId,
        top: args.top,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_test_entity_counts': {
      const args = GetTestEntityCountsSchema.parse(request.params.arguments);
      const result = await getTestEntityCounts(connection, {
        projectId: args.projectId ?? defaultProject,
        planId: args.planId,
        states: args.states,
        outcome: parseUserFriendlyTestOutcome(args.outcome),
        configurations: args.configurations,
        testers: args.testers,
        assignedTo: args.assignedTo,
        entity: parseTestEntityType(args.entity),
        top: args.top,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    default:
      throw new Error(`Unknown test plans tool: ${request.params.name}`);
  }
};
