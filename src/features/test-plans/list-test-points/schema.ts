import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the listTestPoints function
 */
export const ListTestPointsSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  suiteId: z.number().int().positive().describe('The ID of the test suite'),
  testPointIds: z
    .string()
    .optional()
    .describe('Comma-separated list of test point IDs to fetch'),
  testCaseId: z
    .string()
    .optional()
    .describe('Test case ID to filter points by'),
  continuationToken: z
    .string()
    .optional()
    .describe('Continuation token for paging'),
  returnIdentityRef: z
    .boolean()
    .optional()
    .describe('If true, returns identity references instead of display names'),
  includePointDetails: z
    .boolean()
    .optional()
    .describe('If true, returns additional point details'),
  isRecursive: z
    .boolean()
    .optional()
    .describe('If true, includes test points from child suites'),
  top: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe('Maximum number of test points to return (default 25, max 100)'),
});
