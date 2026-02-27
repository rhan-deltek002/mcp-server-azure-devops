import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getTestVariable function
 */
export const GetTestVariableSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  testVariableId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the test variable to retrieve'),
});
