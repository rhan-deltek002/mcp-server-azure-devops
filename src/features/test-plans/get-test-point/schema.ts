import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getTestPoint function
 */
export const GetTestPointSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  suiteId: z.number().int().positive().describe('The ID of the test suite'),
  pointId: z.string().describe('The ID of the test point to retrieve'),
  returnIdentityRef: z
    .boolean()
    .optional()
    .describe('If true, returns identity references instead of display names'),
  includePointDetails: z
    .boolean()
    .optional()
    .describe('If true, returns additional point details'),
});
