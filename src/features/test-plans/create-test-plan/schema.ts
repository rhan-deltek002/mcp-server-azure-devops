import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const CreateTestPlanSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  name: z.string().describe('Name of the test plan'),
  iteration: z
    .string()
    .describe('Iteration path for the test plan (e.g. "MyProject\\Sprint 1")'),
  areaPath: z.string().optional().describe('Area path for the test plan'),
  description: z.string().optional().describe('Description of the test plan'),
  startDate: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(new Date(val).getTime()), {
      message: 'startDate must be a valid date string',
    })
    .describe('Start date (ISO 8601 format)'),
  endDate: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(new Date(val).getTime()), {
      message: 'endDate must be a valid date string',
    })
    .describe('End date (ISO 8601 format)'),
  state: z
    .string()
    .optional()
    .describe('State of the test plan (e.g. "Active", "Inactive")'),
  buildId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('ID of the build to be tested'),
});
