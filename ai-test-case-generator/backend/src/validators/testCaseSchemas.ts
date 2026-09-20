import { z } from "zod";

export const TEST_TYPE_OPTIONS = [
  "Functional",
  "Positive",
  "Negative",
  "Boundary",
  "Edge Case",
  "Regression",
  "Security",
  "Accessibility",
  "API",
  "Performance",
] as const;

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const severityEnum = z.enum(["MINOR", "MODERATE", "MAJOR", "CRITICAL"]);

export const generateTestCasesSchema = z.object({
  requirementId: z.string().min(1, "requirementId is required"),
  testTypes: z.array(z.enum(TEST_TYPE_OPTIONS)).min(1, "Select at least one test type"),
  numberOfTestCases: z.number().int().min(1).max(25),
  priority: priorityEnum,
  severity: severityEnum,
});

export const generatedStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  action: z.string().min(1),
  testData: z.string().optional().default(""),
  expectedResult: z.string().min(1),
});

export const generatedTestDataSchema = z.object({
  field: z.string().min(1),
  value: z.string(),
  dataType: z.string().min(1),
});

export const generatedTestCaseSchema = z.object({
  testCaseId: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  priority: z.string().min(1),
  severity: z.string().min(1),
  preconditions: z.array(z.string()),
  testData: z.array(generatedTestDataSchema),
  steps: z.array(generatedStepSchema).min(1),
  expectedResult: z.string().min(1),
  postconditions: z.string().optional().default(""),
  automationCandidate: z.boolean(),
});

export const aiTestCasesResponseSchema = z.object({
  testCases: z.array(generatedTestCaseSchema).min(1),
});

export const updateTestCaseSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().optional(),
  priority: priorityEnum.optional(),
  severity: severityEnum.optional(),
  preconditions: z.string().optional(),
  expectedResult: z.string().optional(),
  postconditions: z.string().nullable().optional(),
  automationCandidate: z.boolean().optional(),
});

export type GenerateTestCasesBody = z.infer<typeof generateTestCasesSchema>;
export type UpdateTestCaseBody = z.infer<typeof updateTestCaseSchema>;
