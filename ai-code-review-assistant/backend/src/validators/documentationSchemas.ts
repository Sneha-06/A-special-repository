import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "./reviewSchemas";

export const DOC_FORMATS = ["jsdoc", "markdown", "readme", "api"] as const;

export const createDocumentationSchema = z.object({
  code: z.string().min(1, "Code cannot be empty").max(100_000, "Code exceeds maximum size of 100KB"),
  language: z.enum(SUPPORTED_LANGUAGES, `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`),
  framework: z.string().min(1, "Framework is required").max(50),
  format: z.enum(DOC_FORMATS).default("markdown"),
  fileName: z.string().max(500).optional(),
});

export const documentedItemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["function", "component", "class", "variable", "hook", "other"]),
  description: z.string().min(1),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().optional(),
  })).default([]),
  returns: z.object({
    type: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  examples: z.array(z.string()).default([]),
});

export const documentationResponseSchema = z.object({
  format: z.enum(DOC_FORMATS),
  title: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().min(1),
  items: z.array(documentedItemSchema),
  usageExamples: z.array(z.string()).default([]),
});

export type CreateDocumentationBody = z.infer<typeof createDocumentationSchema>;
export type DocumentationResponse = z.infer<typeof documentationResponseSchema>;
export type DocFormat = (typeof DOC_FORMATS)[number];
