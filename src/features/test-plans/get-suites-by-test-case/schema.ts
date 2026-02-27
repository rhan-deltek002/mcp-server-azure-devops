import { z } from 'zod';

/**
 * Schema for the getSuitesByTestCase function
 */
export const GetSuitesByTestCaseSchema = z.object({
  testCaseId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the test case to find suites for'),
  top: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe('Maximum number of suites to return (default 25, max 100)'),
});
