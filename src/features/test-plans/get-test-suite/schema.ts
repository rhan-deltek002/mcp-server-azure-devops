import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getTestSuite function
 */
export const GetTestSuiteSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  suiteId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the test suite to retrieve'),
  expand: z
    .enum(['none', 'children', 'defaultTesters'])
    .optional()
    .describe(
      'Option to expand the response. Use "children" to include child suites',
    ),
});
