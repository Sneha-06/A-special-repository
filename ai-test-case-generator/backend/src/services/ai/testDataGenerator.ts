import { aiTestDataResponseSchema } from "../../validators/testDataSchemas";
import { HttpError } from "../../utils/httpError";
import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";

interface TestCaseSummary {
  testCaseId: string;
  title: string;
  category: string;
  preconditions: string;
  steps: Array<{ action: string; testData?: string | null }>;
}

interface TestDataContext {
  requirement: {
    title: string;
    description: string;
    userStory?: string | null;
    applicationModule?: string | null;
    acceptanceCriteriaText?: string | null;
  };
  testCases: TestCaseSummary[];
}

const SYSTEM_PROMPT = `You are a QA data engineer generating synthetic test data for software testing.

Return ONLY valid JSON:
{
  "testData": [
    {
      "field": "string",
      "value": "string",
      "dataType": "string",
      "purpose": "valid"
    }
  ]
}

Purpose must be one of: valid, invalid, boundary, edge, empty

Rules:
- Generate synthetic/fictional data ONLY. NEVER use real personal information (no real names, SSNs, real emails, real phone numbers, or real addresses).
- Use obvious synthetic patterns: test.user@example.com, +1-555-0100, John_Test, 123 Test Street, etc.
- Derive fields from the requirement and test cases provided.
- Include a mix of purposes: valid, invalid, boundary, edge, and empty values where applicable.
- For numeric ranges in the requirement, include boundary values (min, max, just below, just above).
- For email/password/date fields, include appropriate invalid and edge cases.
- Generate 8 to 20 data rows covering all relevant fields.`;

function buildUserPrompt(context: TestDataContext): string {
  const parts = [
    "=== REQUIREMENT ===",
    `Title: ${context.requirement.title}`,
    `Description: ${context.requirement.description}`,
  ];

  if (context.requirement.userStory) parts.push(`User Story: ${context.requirement.userStory}`);
  if (context.requirement.applicationModule) parts.push(`Module: ${context.requirement.applicationModule}`);
  if (context.requirement.acceptanceCriteriaText) {
    parts.push(`Acceptance Criteria: ${context.requirement.acceptanceCriteriaText}`);
  }

  if (context.testCases.length > 0) {
    parts.push("", "=== TEST CASES ===");
    for (const tc of context.testCases) {
      parts.push(`- ${tc.testCaseId}: ${tc.title} (${tc.category})`);
      parts.push(`  Preconditions: ${tc.preconditions}`);
      for (const step of tc.steps) {
        parts.push(`  Step: ${step.action}${step.testData ? ` [${step.testData}]` : ""}`);
      }
    }
  }

  parts.push("", "Generate comprehensive synthetic test data for these scenarios.");
  return parts.join("\n");
}

export async function generateTestDataWithAi(context: TestDataContext) {
  const content = await callOpenAiJson(SYSTEM_PROMPT, buildUserPrompt(context));
  const parsed = extractJsonFromAi(content);
  const validated = aiTestDataResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new HttpError(502, "AI test data response failed validation", validated.error.flatten());
  }

  return validated.data.testData;
}
