import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const UpdateTestSuiteSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  suiteId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the test suite to update'),
  name: z.string().optional().describe('New name for the test suite'),
  inheritDefaultConfigurations: z
    .boolean()
    .optional()
    .describe(
      'Whether to inherit default configurations from the parent suite',
    ),
  defaultConfigurationIds: z
    .array(z.number().int().positive())
    .optional()
    .describe('IDs of default configurations to assign to this suite'),
  revision: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      'Current revision of the test suite (for optimistic concurrency)',
    ),
});
