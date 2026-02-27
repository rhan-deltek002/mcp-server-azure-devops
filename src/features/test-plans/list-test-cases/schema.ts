import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the listTestCases function
 */
export const ListTestCasesSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  suiteId: z.number().int().positive().describe('The ID of the test suite'),
  testIds: z
    .string()
    .optional()
    .describe('Comma-separated list of test case IDs to fetch'),
  configurationIds: z
    .string()
    .optional()
    .describe('Comma-separated list of configuration IDs to filter by'),
  witFields: z
    .string()
    .optional()
    .describe('Comma-separated list of work item field names to return'),
  continuationToken: z
    .string()
    .optional()
    .describe('Continuation token for paging'),
  returnIdentityRef: z
    .boolean()
    .optional()
    .describe('If true, returns identity references instead of display names'),
  expand: z
    .boolean()
    .optional()
    .describe('If true, returns all properties of the test case'),
  excludeFlags: z
    .enum(['none', 'pointAssignments', 'extraInformation'])
    .optional()
    .describe('Flag to exclude specific fields from the response'),
  isRecursive: z
    .boolean()
    .optional()
    .describe('If true, includes test cases from child suites'),
  top: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe('Maximum number of test cases to return (default 25, max 100)'),
});
