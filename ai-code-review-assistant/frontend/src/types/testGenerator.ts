export const TESTING_FRAMEWORKS = [
  { value: "vitest", label: "Vitest" },
  { value: "jest", label: "Jest" },
  { value: "react-testing-library", label: "React Testing Library" },
] as const;

export type TestingFramework = (typeof TESTING_FRAMEWORKS)[number]["value"];

export type TestCategory = "happy-path" | "negative" | "edge-case" | "error" | "async";

export interface GeneratedTestCase {
  name: string;
  description: string;
  category: TestCategory;
  targetFunction?: string;
}

export interface TestGeneratorResult {
  testFileName: string;
  testFramework: string;
  tests: GeneratedTestCase[];
  code: string;
  summary: {
    totalTests: number;
    functionsCovered: string[];
    edgeCasesCovered: number;
  };
}

export interface GenerateTestsRequest {
  code: string;
  language: string;
  framework: string;
  testingFramework: TestingFramework;
  fileName?: string;
}
