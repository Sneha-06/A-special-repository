import { z } from "zod";

export const TEST_LANGUAGES = ["typescript", "javascript", "tsx", "jsx"] as const;
export const TEST_FRAMEWORKS = ["react", "javascript", "typescript"] as const;
export const TESTING_FRAMEWORKS = ["vitest", "jest", "react-testing-library"] as const;
export const TEST_CATEGORIES = ["happy-path", "negative", "edge-case", "error", "async"] as const;

export const generateTestsSchema = z.object({
  code: z.string().min(1, "Code cannot be empty").max(100_000, "Code exceeds maximum size of 100KB"),
  language: z.enum(TEST_LANGUAGES, `Unsupported language. Supported: ${TEST_LANGUAGES.join(", ")}`),
  framework: z.enum(TEST_FRAMEWORKS, `Unsupported framework. Supported: ${TEST_FRAMEWORKS.join(", ")}`),
  testingFramework: z.enum(TESTING_FRAMEWORKS, `Unsupported testing framework. Supported: ${TESTING_FRAMEWORKS.join(", ")}`),
  fileName: z.string().max(500).optional(),
});

export const generatedTestCaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(TEST_CATEGORIES),
  targetFunction: z.string().optional(),
});

export const testGeneratorResponseSchema = z.object({
  testFileName: z.string().min(1),
  testFramework: z.string().min(1),
  tests: z.array(generatedTestCaseSchema).min(1),
  code: z.string().min(1),
  summary: z.object({
    totalTests: z.number().int().positive(),
    functionsCovered: z.array(z.string()),
    edgeCasesCovered: z.number().int().min(0),
  }),
});

export type GenerateTestsBody = z.infer<typeof generateTestsSchema>;
export type TestGeneratorResponse = z.infer<typeof testGeneratorResponseSchema>;
export type GeneratedTestCase = z.infer<typeof generatedTestCaseSchema>;
