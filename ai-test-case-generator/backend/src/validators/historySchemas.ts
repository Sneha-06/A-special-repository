import { z } from "zod";

const generationTypes = [
  "REQUIREMENT_ANALYSIS",
  "ACCEPTANCE_CRITERIA",
  "TEST_CASES",
  "SYNTHETIC_TEST_DATA",
  "AUTOMATION_CODE",
  "COVERAGE_ANALYSIS",
] as const;

const generationStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"] as const;

export const listHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  generationType: z.enum(generationTypes).optional(),
  status: z.enum(generationStatuses).optional(),
  fromDate: z.string().min(1).optional(),
  toDate: z.string().min(1).optional(),
  requirementId: z.string().min(1).optional(),
});

export type ListHistoryQuery = z.infer<typeof listHistoryQuerySchema>;
