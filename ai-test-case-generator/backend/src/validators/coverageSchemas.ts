import { z } from "zod";

export const analyzeCoverageSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
});

const coverageStatusSchema = z.enum(["covered", "partial", "uncovered"]);

export const aiCoverageMappingSchema = z.object({
  acceptanceCriteriaId: z.string().min(1),
  mappedTestCaseIds: z.array(z.string()),
  coverageStatus: coverageStatusSchema,
  rationale: z.string().optional(),
});

export const aiMissingScenarioSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  rationale: z.string().optional(),
});

export const aiCoverageResponseSchema = z.object({
  acceptanceCriteriaMappings: z.array(aiCoverageMappingSchema),
  coveredAreas: z.array(z.string()),
  missingAreas: z.array(z.string()),
  missingTestScenarios: z.array(z.union([z.string(), aiMissingScenarioSchema])),
  recommendations: z.array(z.string()),
  securityGaps: z.array(z.string()).optional().default([]),
  edgeCaseGaps: z.array(z.string()).optional().default([]),
  regressionGaps: z.array(z.string()).optional().default([]),
});

export type AnalyzeCoverageBody = z.infer<typeof analyzeCoverageSchema>;
export type AiCoverageResponse = z.infer<typeof aiCoverageResponseSchema>;
