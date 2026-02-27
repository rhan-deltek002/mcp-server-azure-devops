import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getSuiteEntries function
 */
export const GetSuiteEntriesSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  suiteId: z.number().int().positive().describe('The ID of the test suite'),
  suiteEntryType: z
    .enum(['testCase', 'suite'])
    .optional()
    .describe('Filter entries by type: testCase or suite'),
  top: z
    .number()
    .int()
    .min(1)
    .max(200)
    .default(50)
    .describe(
      'Maximum number of suite entries to return (default 50, max 200)',
    ),
});
