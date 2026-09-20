import { z } from "zod";

export const ANALYSIS_TYPES = [
  "CODE_REVIEW",
  "EXPLANATION",
  "REFACTORING",
  "BUG_DETECTION",
  "PERFORMANCE",
  "SECURITY",
  "REACT_ANALYSIS",
  "ACCESSIBILITY",
  "UNIT_TESTS",
  "DOCUMENTATION",
] as const;

export const analyzeCodeSchema = z.object({
  sourceCode: z.string().min(1, "sourceCode is required").max(100_000),
  language: z.string().min(1).default("typescript"),
  filePath: z.string().optional(),
  title: z.string().optional(),
  analysisType: z.enum(ANALYSIS_TYPES),
  context: z.string().optional(),
  repositoryId: z.string().optional(),
});

export const findingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.enum([
    "BUG", "SECURITY", "PERFORMANCE", "STYLE", "ACCESSIBILITY",
    "REACT", "MAINTAINABILITY", "TESTING", "DOCUMENTATION", "OTHER",
  ]),
  lineStart: z.number().int().positive().optional().nullable(),
  lineEnd: z.number().int().positive().optional().nullable(),
  suggestion: z.string().optional().nullable(),
});

export const aiAnalysisResponseSchema = z.object({
  summary: z.string().min(1),
  findings: z.array(findingSchema).default([]),
  improvedCode: z.string().optional().nullable(),
  documentation: z.string().optional().nullable(),
  unitTests: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  metrics: z.object({
    qualityScore: z.number().min(0).max(100).optional(),
    securityScore: z.number().min(0).max(100).optional(),
    performanceScore: z.number().min(0).max(100).optional(),
    accessibilityScore: z.number().min(0).max(100).optional(),
  }).optional(),
});

export type AnalyzeCodeBody = z.infer<typeof analyzeCodeSchema>;
export type AiAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;
