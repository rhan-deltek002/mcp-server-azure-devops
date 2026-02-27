import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the listTestVariables function
 */
export const ListTestVariablesSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  continuationToken: z
    .string()
    .optional()
    .describe('Continuation token for paging'),
  top: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe(
      'Maximum number of test variables to return (default 25, max 100)',
    ),
});
