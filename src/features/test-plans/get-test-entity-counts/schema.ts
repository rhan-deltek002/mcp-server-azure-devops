import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getTestEntityCounts function
 */
export const GetTestEntityCountsSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z.number().int().positive().describe('The ID of the test plan'),
  states: z
    .string()
    .optional()
    .describe('Comma-separated list of test point states to filter by'),
  outcome: z
    .enum([
      'inProgress',
      'blocked',
      'failed',
      'passed',
      'ready',
      'notApplicable',
      'paused',
      'timeout',
      'warning',
      'error',
      'notExecuted',
      'inconclusive',
      'aborted',
      'none',
      'notImpacted',
      'unspecified',
    ])
    .optional()
    .describe('Test outcome to filter by'),
  configurations: z
    .string()
    .optional()
    .describe('Comma-separated list of configuration IDs to filter by'),
  testers: z
    .string()
    .optional()
    .describe('Comma-separated list of tester IDs to filter by'),
  assignedTo: z
    .string()
    .optional()
    .describe('Comma-separated list of assigned-to IDs to filter by'),
  entity: z
    .enum(['testCase', 'testPoint'])
    .optional()
    .describe('Type of entity to count: testCase or testPoint'),
  top: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe(
      'Maximum number of count entries to return (default 25, max 100)',
    ),
});
