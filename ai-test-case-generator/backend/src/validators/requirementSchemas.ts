import { z } from "zod";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const createRequirementSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required"),
  userStory: z.string().trim().optional(),
  applicationModule: z.string().trim().optional(),
  priority: priorityEnum.optional(),
  acceptanceCriteria: z.string().trim().optional(),
  additionalContext: z.string().trim().optional(),
});

export const updateRequirementSchema = createRequirementSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required to update" },
);

export const analysisResultSchema = z.object({
  summary: z.string(),
  actors: z.array(z.string()),
  preconditions: z.array(z.string()),
  businessRules: z.array(z.string()),
  functionalRequirements: z.array(z.string()),
  nonFunctionalRequirements: z.array(z.string()),
  assumptions: z.array(z.string()),
  ambiguities: z.array(z.string()),
  missingInformation: z.array(z.string()),
  riskAreas: z.array(z.string()),
});

export type CreateRequirementBody = z.infer<typeof createRequirementSchema>;
export type UpdateRequirementBody = z.infer<typeof updateRequirementSchema>;
export type AnalysisResultBody = z.infer<typeof analysisResultSchema>;
