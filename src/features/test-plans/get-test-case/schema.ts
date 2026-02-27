import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getTestCase function
 */
export const GetTestCaseSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  suiteId: z.number().int().positive().describe('The ID of the test suite'),
  testCaseId: z.string().describe('The ID of the test case to retrieve'),
  witFields: z
    .string()
    .optional()
    .describe('Comma-separated list of work item field names to return'),
  returnIdentityRef: z
    .boolean()
    .optional()
    .describe('If true, returns identity references instead of display names'),
});
