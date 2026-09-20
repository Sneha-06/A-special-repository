import { z } from "zod";

export const REVIEW_TYPES = [
  "general",
  "bugs",
  "performance",
  "security",
  "code-quality",
  "react",
  "accessibility",
] as const;

export const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "python",
  "go",
  "java",
  "rust",
  "csharp",
  "ruby",
  "php",
  "sql",
  "json",
  "html",
  "css",
  "vue",
  "svelte",
] as const;

export const SEVERITIES = ["critical", "high", "medium", "low", "info"] as const;
export const CATEGORIES = [
  "bug",
  "security",
  "performance",
  "code-quality",
  "react",
  "accessibility",
  "maintainability",
] as const;

export const createReviewSchema = z
  .object({
    code: z.string().min(1, "Code cannot be empty").max(100_000, "Code exceeds maximum size of 100KB"),
    language: z.enum(SUPPORTED_LANGUAGES, `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`),
    framework: z.string().min(1, "Framework is required").max(50),
    fileName: z.string().max(500).optional(),
    reviewType: z.union([z.enum(REVIEW_TYPES), z.array(z.enum(REVIEW_TYPES)).min(1)]).optional(),
    projectContext: z.string().max(5000).optional(),
  })
  .transform((data) => {
    const reviewTypes: ReviewType[] = Array.isArray(data.reviewType)
      ? data.reviewType
      : data.reviewType
        ? [data.reviewType]
        : ["general"];
    return { ...data, reviewTypes };
  });

export const reviewIssueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(SEVERITIES),
  category: z.enum(CATEGORIES),
  lineStart: z.number().int().positive().nullable().optional(),
  lineEnd: z.number().int().positive().nullable().optional(),
  suggestion: z.string().optional().default(""),
  explanation: z.string().optional().default(""),
});

export const codeReviewResponseSchema = z.object({
  summary: z.string().min(1),
  overallScore: z.number().min(0).max(100),
  issues: z.array(reviewIssueSchema),
  strengths: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type CreateReviewBody = z.infer<typeof createReviewSchema>;
export type CodeReviewResponse = z.infer<typeof codeReviewResponseSchema>;
export type ReviewIssue = z.infer<typeof reviewIssueSchema>;
export type ReviewType = (typeof REVIEW_TYPES)[number];
