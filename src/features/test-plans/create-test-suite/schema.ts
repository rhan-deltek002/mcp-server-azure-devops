import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const CreateTestSuiteSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  name: z.string().describe('Name of the test suite'),
  suiteType: z
    .enum(['staticTestSuite', 'dynamicTestSuite', 'requirementTestSuite'])
    .optional()
    .default('staticTestSuite')
    .describe('Type of test suite (default: staticTestSuite)'),
  parentSuiteId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('ID of the parent suite (defaults to root suite)'),
  requirementId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Work item ID for a requirement-based suite'),
  inheritDefaultConfigurations: z
    .boolean()
    .optional()
    .describe(
      'Whether to inherit default configurations from the parent suite',
    ),
  defaultConfigurationIds: z
    .array(z.number().int().positive())
    .optional()
    .describe('IDs of default configurations to assign to this suite'),
});
