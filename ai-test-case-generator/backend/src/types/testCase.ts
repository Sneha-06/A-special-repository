import type { TestCategory, TestPriority, TestSeverity } from "@prisma/client";

export type GenerationStage =
  | "analyzing_requirement"
  | "identifying_scenarios"
  | "generating_test_cases"
  | "finalizing";

export interface GeneratedTestCaseStep {
  stepNumber: number;
  action: string;
  testData: string;
  expectedResult: string;
}

export interface GeneratedTestCaseData {
  field: string;
  value: string;
  dataType: string;
}

export interface GeneratedTestCase {
  testCaseId: string;
  title: string;
  category: string;
  priority: string;
  severity: string;
  preconditions: string[];
  testData: GeneratedTestCaseData[];
  steps: GeneratedTestCaseStep[];
  expectedResult: string;
  postconditions: string;
  automationCandidate: boolean;
}

export interface GenerateTestCasesInput {
  requirementId: string;
  testTypes: string[];
  numberOfTestCases: number;
  priority: TestPriority;
  severity: TestSeverity;
}

export interface TestCaseGenerationContext {
  requirement: {
    title: string;
    description: string;
    userStory?: string | null;
    applicationModule?: string | null;
    priority: string;
    acceptanceCriteriaText?: string | null;
    additionalContext?: string | null;
  };
  analysis?: {
    summary: string;
    actors: string[];
    preconditions: string[];
    businessRules: string[];
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    assumptions: string[];
    ambiguities: string[];
    missingInformation: string[];
    riskAreas: string[];
  } | null;
  testTypes: string[];
  numberOfTestCases: number;
  priority: TestPriority;
  severity: TestSeverity;
}

export const TEST_TYPE_TO_CATEGORY: Record<string, TestCategory> = {
  Functional: "FUNCTIONAL",
  Positive: "POSITIVE",
  Negative: "NEGATIVE",
  Boundary: "BOUNDARY",
  "Edge Case": "EDGE_CASE",
  Regression: "REGRESSION",
  Security: "SECURITY",
  Accessibility: "ACCESSIBILITY",
  API: "API",
  Performance: "PERFORMANCE",
};
