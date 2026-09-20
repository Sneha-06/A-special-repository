import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "./reviewSchemas";

export const explainCodeSchema = z.object({
  code: z.string().min(1, "Code cannot be empty").max(100_000, "Code exceeds maximum size of 100KB"),
  language: z.enum(SUPPORTED_LANGUAGES, `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`),
  context: z.string().max(5000).optional(),
});

export const flowStepSchema = z.object({
  step: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const keyFunctionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  parameters: z.array(z.string()).default([]),
  returns: z.string().optional(),
});

export const potentialIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]).optional(),
});

export const codeExplanationResponseSchema = z.object({
  summary: z.string().min(1),
  purpose: z.string().min(1),
  architecture: z.string().min(1),
  flow: z.array(flowStepSchema),
  dependencies: z.array(z.string()),
  potentialIssues: z.array(potentialIssueSchema),
  keyFunctions: z.array(keyFunctionSchema),
});

export type ExplainCodeBody = z.infer<typeof explainCodeSchema>;
export type CodeExplanationResponse = z.infer<typeof codeExplanationResponseSchema>;
