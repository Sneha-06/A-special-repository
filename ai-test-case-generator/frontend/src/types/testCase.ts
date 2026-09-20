export type TestCategory =
  | "FUNCTIONAL"
  | "POSITIVE"
  | "NEGATIVE"
  | "BOUNDARY"
  | "EDGE_CASE"
  | "REGRESSION"
  | "SECURITY"
  | "ACCESSIBILITY"
  | "API"
  | "PERFORMANCE"
  | "INTEGRATION"
  | "SMOKE";

export type TestPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TestSeverity = "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL";

export const TEST_TYPE_OPTIONS = [
  "Functional",
  "Positive",
  "Negative",
  "Boundary",
  "Edge Case",
  "Regression",
  "Security",
  "Accessibility",
  "API",
  "Performance",
] as const;

export type TestTypeOption = (typeof TEST_TYPE_OPTIONS)[number];

export type GenerationStage =
  | "analyzing_requirement"
  | "identifying_scenarios"
  | "generating_test_cases"
  | "finalizing";

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  testData?: string | null;
  expectedResult: string;
}

export interface TestDataRow {
  id: string;
  field: string;
  value: string;
  dataType: string;
}

export interface TestCase {
  id: string;
  requirementId: string;
  testCaseId: string;
  title: string;
  category: TestCategory;
  priority: TestPriority;
  severity: TestSeverity;
  preconditions: string;
  expectedResult: string;
  postconditions?: string | null;
  automationCandidate: boolean;
  createdAt: string;
  updatedAt: string;
  steps: TestStep[];
  testData: TestDataRow[];
  requirement?: {
    id: string;
    title: string;
    project?: { id?: string; name: string };
  };
}

export interface GenerateTestCasesRequest {
  requirementId: string;
  testTypes: TestTypeOption[];
  numberOfTestCases: number;
  priority: TestPriority;
  severity: TestSeverity;
}

export interface GenerationProgressEvent {
  stage: GenerationStage;
  message: string;
}

export interface UpdateTestCasePayload {
  title?: string;
  category?: string;
  priority?: TestPriority;
  severity?: TestSeverity;
  preconditions?: string;
  expectedResult?: string;
  postconditions?: string | null;
  automationCandidate?: boolean;
}
