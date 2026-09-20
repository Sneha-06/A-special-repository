import { z } from "zod";

export const prReviewResponseSchema = z.object({
  summary: z.string().min(1),
  bugs: z.array(z.string()),
  security: z.array(z.string()),
  performance: z.array(z.string()),
  maintainability: z.array(z.string()),
  recommendations: z.array(z.string()),
  proposedComments: z.array(z.object({
    file: z.string().min(1),
    line: z.number().int().positive().optional().nullable(),
    body: z.string().min(1),
    severity: z.enum(["critical", "high", "medium", "low", "info"]).optional(),
    category: z.string().optional(),
  })),
});

export type PrReviewResponse = z.infer<typeof prReviewResponseSchema>;
