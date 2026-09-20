import { aiCoverageResponseSchema } from "../../validators/coverageSchemas";
import { HttpError } from "../../utils/httpError";
import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";

export interface CoverageAcceptanceCriterion {
  id: string;
  criteriaKey: string | null;
  given: string;
  when: string;
  then: string;
}

export interface CoverageTestCase {
  id: string;
  testCaseId: string;
  title: string;
  category: string;
  expectedResult: string;
  steps: Array<{
    stepNumber: number;
    action: string;
    expectedResult: string;
  }>;
  hasAutomation: boolean;
}

export interface CoverageRequirementContext {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: CoverageAcceptanceCriterion[];
  testCases: CoverageTestCase[];
}

export interface CoverageAnalysisContext {
  projectName: string;
  requirements: CoverageRequirementContext[];
}

const SYSTEM_PROMPT = `You are a senior QA architect performing test coverage analysis.

Return ONLY valid JSON:
{
  "acceptanceCriteriaMappings": [
    {
      "acceptanceCriteriaId": "string (use the exact acceptanceCriteriaId from input)",
      "mappedTestCaseIds": ["TC-001"],
      "coverageStatus": "covered" | "partial" | "uncovered",
      "rationale": "string"
    }
  ],
  "coveredAreas": ["string"],
  "missingAreas": ["string"],
  "missingTestScenarios": [
    { "title": "string", "category": "SECURITY|EDGE_CASE|REGRESSION|FUNCTIONAL|NEGATIVE", "rationale": "string" }
  ],
  "recommendations": ["string"],
  "securityGaps": ["string"],
  "edgeCaseGaps": ["string"],
  "regressionGaps": ["string"]
}

Rules:
- Map each acceptance criterion to existing test cases ONLY when the test case clearly validates that criterion.
- Use coverageStatus "covered" when fully validated, "partial" when only partly validated, "uncovered" when no test case maps.
- If a requirement has no acceptance criteria, still analyze its test cases against the requirement description.
- Identify security, edge-case, and regression gaps based on actual test case categories present.
- missingTestScenarios must suggest concrete scenarios NOT already covered by existing test cases.
- Do NOT invent test case IDs — only reference testCaseId values provided in the input.
- Base analysis strictly on the provided requirement, acceptance criteria, and test cases.`;

function formatCriterion(ac: CoverageAcceptanceCriterion): string {
  const key = ac.criteriaKey ?? ac.id;
  return `[${key}] Given: ${ac.given} | When: ${ac.when} | Then: ${ac.then}`;
}

function formatTestCase(tc: CoverageTestCase): string {
  const steps = tc.steps
    .map((s) => `  ${s.stepNumber}. ${s.action} → ${s.expectedResult}`)
    .join("\n");
  return `testCaseId: ${tc.testCaseId} | title: ${tc.title} | category: ${tc.category} | automation: ${tc.hasAutomation ? "yes" : "no"}
Expected: ${tc.expectedResult}
Steps:
${steps}`;
}

function buildUserPrompt(context: CoverageAnalysisContext): string {
  const requirementBlocks = context.requirements.map((req) => {
    const acBlock = req.acceptanceCriteria.length
      ? req.acceptanceCriteria
          .map((ac) => `acceptanceCriteriaId: ${ac.id}\n${formatCriterion(ac)}`)
          .join("\n\n")
      : "No formal acceptance criteria — analyze requirement text directly.";

    const tcBlock = req.testCases.length
      ? req.testCases.map(formatTestCase).join("\n\n")
      : "No test cases generated yet.";

    return [
      `=== Requirement: ${req.title} (id: ${req.id}) ===`,
      `Description: ${req.description}`,
      "",
      "Acceptance Criteria:",
      acBlock,
      "",
      "Test Cases:",
      tcBlock,
    ].join("\n");
  });

  return [
    `Project: ${context.projectName}`,
    `Requirements to analyze: ${context.requirements.length}`,
    "",
    ...requirementBlocks,
    "",
    "Analyze coverage. Map each acceptanceCriteriaId to testCaseId values. Identify gaps and recommend missing scenarios.",
  ].join("\n");
}

export type CoverageAiCaller = (system: string, user: string) => Promise<string>;

const defaultCaller: CoverageAiCaller = (system, user) => callOpenAiJson(system, user);

export async function analyzeCoverageWithAi(
  context: CoverageAnalysisContext,
  caller: CoverageAiCaller = defaultCaller,
) {
  const content = await caller(SYSTEM_PROMPT, buildUserPrompt(context));
  const parsed = extractJsonFromAi(content);
  const validated = aiCoverageResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new HttpError(502, "AI coverage analysis response failed validation", validated.error.flatten());
  }

  return validated.data;
}
