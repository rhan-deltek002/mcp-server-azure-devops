import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getTestPlan function
 */
export const GetTestPlanSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the test plan to retrieve'),
});
