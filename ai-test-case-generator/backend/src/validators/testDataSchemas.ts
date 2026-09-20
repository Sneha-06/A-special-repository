import { z } from "zod";

export const TEST_DATA_PURPOSES = [
  "valid",
  "invalid",
  "boundary",
  "edge",
  "empty",
] as const;

export const syntheticTestDataItemSchema = z.object({
  field: z.string().min(1),
  value: z.string(),
  dataType: z.string().min(1),
  purpose: z.enum(TEST_DATA_PURPOSES),
});

export const aiTestDataResponseSchema = z.object({
  testData: z.array(syntheticTestDataItemSchema).min(1),
});

export const generateTestDataSchema = z.object({
  requirementId: z.string().min(1),
  replaceExisting: z.boolean().optional(),
});

export type GenerateTestDataBody = z.infer<typeof generateTestDataSchema>;
