import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const UpdateTestPlanSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  planId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the test plan to update'),
  name: z.string().optional().describe('New name for the test plan'),
  iteration: z.string().optional().describe('New iteration path'),
  areaPath: z.string().optional().describe('New area path'),
  description: z.string().optional().describe('New description'),
  startDate: z.string().optional().describe('New start date (ISO 8601 format)'),
  endDate: z.string().optional().describe('New end date (ISO 8601 format)'),
  state: z
    .string()
    .optional()
    .describe('New state (e.g. "Active", "Inactive")'),
  buildId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('New build ID to be tested'),
  revision: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Current revision of the test plan (for optimistic concurrency)'),
});
