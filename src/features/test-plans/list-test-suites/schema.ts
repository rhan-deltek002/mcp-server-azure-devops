import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the listTestSuites function
 */
export const ListTestSuitesSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  expand: z
    .enum(['none', 'children', 'defaultTesters'])
    .optional()
    .describe(
      'Option to expand the response. Use "children" to include child suites',
    ),
  continuationToken: z
    .string()
    .optional()
    .describe('Continuation token for paging'),
  asTreeView: z
    .boolean()
    .optional()
    .describe('If true, returns suites in a hierarchical tree structure'),
  top: z
    .number()
    .int()
    .min(1)
    .max(200)
    .default(50)
    .describe(
      'Maximum number of test suites to return (default 50, max 200). When asTreeView is true, truncates the flat node count which may produce incomplete trees.',
    ),
});
