import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "./reviewSchemas";

export const REFACTOR_OPTIONS = [
  "readability",
  "performance",
  "react-patterns",
  "typescript",
  "security",
  "accessibility",
  "reduce-duplication",
] as const;

export const refactorIssueInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  severity: z.string().optional(),
  category: z.string().optional(),
  suggestion: z.string().optional(),
});

export const createRefactorSchema = z
  .object({
    code: z.string().min(1, "Code cannot be empty").max(100_000, "Code exceeds maximum size of 100KB"),
    language: z.enum(SUPPORTED_LANGUAGES, `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`),
    framework: z.string().min(1, "Framework is required").max(50),
    issues: z.array(refactorIssueInputSchema).default([]),
    fileName: z.string().max(500).optional(),
    options: z.union([z.enum(REFACTOR_OPTIONS), z.array(z.enum(REFACTOR_OPTIONS)).min(1)]).optional(),
  })
  .transform((data) => {
    const refactorOptions: RefactorOption[] = Array.isArray(data.options)
      ? data.options
      : data.options
        ? [data.options]
        : ["readability"];
    return { ...data, refactorOptions };
  });

export const refactorResponseSchema = z.object({
  summary: z.string().min(1),
  improvements: z.array(z.string()),
  beforeCode: z.string(),
  afterCode: z.string().min(1),
  explanation: z.string().min(1),
});

export type CreateRefactorBody = z.infer<typeof createRefactorSchema>;
export type RefactorResponse = z.infer<typeof refactorResponseSchema>;
export type RefactorOption = (typeof REFACTOR_OPTIONS)[number];
