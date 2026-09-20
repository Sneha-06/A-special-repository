import { z } from "zod";

export const acceptanceCriterionSchema = z.object({
  id: z.string().min(1),
  given: z.string().min(1),
  when: z.string().min(1),
  then: z.string().min(1),
});

export const aiAcceptanceCriteriaResponseSchema = z.object({
  acceptanceCriteria: z.array(acceptanceCriterionSchema).min(1),
});

export const generateAcceptanceCriteriaSchema = z.object({
  requirementId: z.string().min(1),
  replaceExisting: z.boolean().optional(),
});

export const createAcceptanceCriterionSchema = z.object({
  requirementId: z.string().min(1),
  criteriaKey: z.string().optional(),
  given: z.string().min(1),
  when: z.string().min(1),
  then: z.string().min(1),
});

export const updateAcceptanceCriterionSchema = z.object({
  criteriaKey: z.string().optional(),
  given: z.string().min(1).optional(),
  when: z.string().min(1).optional(),
  then: z.string().min(1).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required",
});

export type GenerateAcceptanceCriteriaBody = z.infer<typeof generateAcceptanceCriteriaSchema>;
export type CreateAcceptanceCriterionBody = z.infer<typeof createAcceptanceCriterionSchema>;
export type UpdateAcceptanceCriterionBody = z.infer<typeof updateAcceptanceCriterionSchema>;
