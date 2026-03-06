import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition } from '../../shared/types/tool-definition';
import { ListTestPlansSchema } from './list-test-plans/schema';
import { GetTestPlanSchema } from './get-test-plan/schema';
import { CreateTestPlanSchema } from './create-test-plan/schema';
import { UpdateTestPlanSchema } from './update-test-plan/schema';
import { ListTestSuitesSchema } from './list-test-suites/schema';
import { GetTestSuiteSchema } from './get-test-suite/schema';
import { CreateTestSuiteSchema } from './create-test-suite/schema';
import { UpdateTestSuiteSchema } from './update-test-suite/schema';
import { AddTestCasesToSuiteSchema } from './add-test-cases-to-suite/schema';
import { UpdateSuiteTestCasesSchema } from './update-suite-test-cases/schema';
import { ListTestConfigurationsSchema } from './list-test-configurations/schema';
import { GetTestConfigurationSchema } from './get-test-configuration/schema';
import { ListTestVariablesSchema } from './list-test-variables/schema';
import { GetTestVariableSchema } from './get-test-variable/schema';
import { ListTestCasesSchema } from './list-test-cases/schema';
import { GetTestCaseSchema } from './get-test-case/schema';
import { ListTestPointsSchema } from './list-test-points/schema';
import { GetTestPointSchema } from './get-test-point/schema';
import { GetSuiteEntriesSchema } from './get-suite-entries/schema';
import { GetSuitesByTestCaseSchema } from './get-suites-by-test-case/schema';
import { GetTestEntityCountsSchema } from './get-test-entity-counts/schema';

/**
 * List of test plan tools
 */
export const testPlansTools: ToolDefinition[] = [
  {
    name: 'list_test_plans',
    description:
      'Get a list of test plans in a project (default 25, max 100 per page). Use this instead of list_work_items or get_work_item when working with test plans, even on on-prem TFS.',
    inputSchema: zodToJsonSchema(ListTestPlansSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_test_plan',
    description:
      'Get a test plan by ID. Use this instead of get_work_item when retrieving test plan details, even on on-prem TFS.',
    inputSchema: zodToJsonSchema(GetTestPlanSchema),
    mcp_enabled: true,
  },
  {
    name: 'create_test_plan',
    description: 'Create a new test plan in a project.',
    inputSchema: zodToJsonSchema(CreateTestPlanSchema),
    mcp_enabled: true,
  },
  {
    name: 'update_test_plan',
    description:
      'Update an existing test plan (name, dates, state, area path, iteration, etc.).',
    inputSchema: zodToJsonSchema(UpdateTestPlanSchema),
    mcp_enabled: true,
  },
  {
    name: 'list_test_suites',
    description:
      'List test suites for a test plan (default 50, max 200 per page). Use asTreeView to get the full suite hierarchy. Use this to explore the structure within a test plan.',
    inputSchema: zodToJsonSchema(ListTestSuitesSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_test_suite',
    description:
      'Get a specific test suite by ID. Use expand=children to include child suites in the response.',
    inputSchema: zodToJsonSchema(GetTestSuiteSchema),
    mcp_enabled: true,
  },
  {
    name: 'create_test_suite',
    description:
      'Create a new test suite within a test plan. Supports static, dynamic (query-based), and requirement-based suite types.',
    inputSchema: zodToJsonSchema(CreateTestSuiteSchema),
    mcp_enabled: true,
  },
  {
    name: 'update_test_suite',
    description:
      'Update an existing test suite (name, default configurations, configuration inheritance).',
    inputSchema: zodToJsonSchema(UpdateTestSuiteSchema),
    mcp_enabled: true,
  },
  {
    name: 'add_test_cases_to_suite',
    description:
      'Add test cases (by work item ID) to a test suite, optionally assigning configurations.',
    inputSchema: zodToJsonSchema(AddTestCasesToSuiteSchema),
    mcp_enabled: true,
  },
  {
    name: 'update_suite_test_cases',
    description:
      'Update the configuration assignments for test cases already in a suite.',
    inputSchema: zodToJsonSchema(UpdateSuiteTestCasesSchema),
    mcp_enabled: true,
  },
  {
    name: 'list_test_configurations',
    description:
      'List test configurations in a project (default 25, max 100 per page). Configurations define environment settings (e.g., browser, OS) for running test cases.',
    inputSchema: zodToJsonSchema(ListTestConfigurationsSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_test_configuration',
    description:
      'Get a test configuration by ID. Returns environment settings like browser and OS values.',
    inputSchema: zodToJsonSchema(GetTestConfigurationSchema),
    mcp_enabled: true,
  },
  {
    name: 'list_test_variables',
    description:
      'List test variables in a project (default 25, max 100 per page). Variables define dimensions (e.g., Browser, OS) and allowed values used to build configurations.',
    inputSchema: zodToJsonSchema(ListTestVariablesSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_test_variable',
    description:
      'Get a test variable by ID. Returns the variable name, description, and allowed values.',
    inputSchema: zodToJsonSchema(GetTestVariableSchema),
    mcp_enabled: true,
  },
  {
    name: 'list_test_cases',
    description:
      'List test cases in a test suite (default 25, max 100 per page). Use isRecursive to include child suites.',
    inputSchema: zodToJsonSchema(ListTestCasesSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_test_case',
    description:
      'Get a specific test case from a test suite by ID. Returns work item details and point assignments.',
    inputSchema: zodToJsonSchema(GetTestCaseSchema),
    mcp_enabled: true,
  },
  {
    name: 'list_test_points',
    description:
      'List test points in a test suite (default 25, max 100 per page). Test points track execution status per test case + configuration combination.',
    inputSchema: zodToJsonSchema(ListTestPointsSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_test_point',
    description:
      'Get a specific test point. Returns execution outcome, tester assignment, and results.',
    inputSchema: zodToJsonSchema(GetTestPointSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_suite_entries',
    description:
      'Get ordered entries (test cases and child suites) in a suite with sequence numbers (default 50, max 200).',
    inputSchema: zodToJsonSchema(GetSuiteEntriesSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_suites_by_test_case',
    description:
      'Find all test suites containing a given test case across all projects (default 25, max 100).',
    inputSchema: zodToJsonSchema(GetSuitesByTestCaseSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_test_entity_counts',
    description:
      'Get test case or test point counts for a plan with optional filters (default 25, max 100). Use for progress summaries.',
    inputSchema: zodToJsonSchema(GetTestEntityCountsSchema),
    mcp_enabled: true,
  },
];
