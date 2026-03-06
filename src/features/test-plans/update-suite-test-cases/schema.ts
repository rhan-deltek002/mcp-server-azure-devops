import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const UpdateSuiteTestCasesSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  suiteId: z.number().int().positive().describe('The ID of the test suite'),
  testCases: z
    .array(
      z.object({
        workItemId: z
          .number()
          .int()
          .positive()
          .describe('ID of the test case work item'),
        configurationIds: z
          .array(z.number().int().positive())
          .optional()
          .describe('New configuration IDs to assign to this test case'),
      }),
    )
    .min(1)
    .describe('Test cases to update in the suite'),
});
