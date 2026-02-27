import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the listTestPlans function
 */
export const ListTestPlansSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  owner: z
    .string()
    .optional()
    .describe('Filter for test plan by owner ID or name'),
  continuationToken: z
    .string()
    .optional()
    .describe('Continuation token from a previous response for pagination'),
  includePlanDetails: z
    .boolean()
    .default(false)
    .describe('Get all properties of the test plan'),
  filterActivePlans: z
    .boolean()
    .optional()
    .describe('Get just the active plans'),
  top: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe('Maximum number of test plans to return (default 25, max 100)'),
});
