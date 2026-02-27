import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getTestConfiguration function
 */
export const GetTestConfigurationSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  testConfigurationId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the test configuration to retrieve'),
});
