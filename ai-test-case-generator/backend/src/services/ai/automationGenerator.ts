import { aiAutomationResponseSchema } from "../../validators/automationSchemas";
import { HttpError } from "../../utils/httpError";
import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";

export interface AutomationTestCaseContext {
  testCaseId: string;
  title: string;
  category: string;
  priority: string;
  severity: string;
  preconditions: string;
  expectedResult: string;
  postconditions?: string | null;
  steps: Array<{
    stepNumber: number;
    action: string;
    testData?: string | null;
    expectedResult: string;
  }>;
  testData: Array<{
    field: string;
    value: string;
    dataType: string;
  }>;
  framework: string;
  language: string;
}

const SYSTEM_PROMPT = `You are a senior test automation engineer. Generate production-quality automation code from a manual test case.

Return ONLY valid JSON:
{
  "code": "string"
}

Rules:
- The code MUST implement the exact test steps and expected results provided. Do NOT generate generic boilerplate unrelated to the test case.
- Use the specified framework and language idioms correctly.
- Include meaningful selectors, actions, and assertions mapped to each step.
- Use synthetic test data from the test case where applicable (e.g. test.user@example.com).
- For Playwright + TypeScript: use @playwright/test with async/await.
- For Cypress + JavaScript: use describe/it with cy commands.
- For Selenium + Java: use TestNG or JUnit style with WebDriver.
- Output a complete, runnable test file as a single code string with proper escaping for JSON.
- Do not include markdown code fences in the code field.`;

function buildUserPrompt(context: AutomationTestCaseContext): string {
  const stepsText = context.steps
    .map(
      (step) =>
        `Step ${step.stepNumber}: ${step.action}\n  Test data: ${step.testData ?? "N/A"}\n  Expected: ${step.expectedResult}`,
    )
    .join("\n");

  const dataText = context.testData.length
    ? context.testData.map((d) => `- ${d.field} (${d.dataType}): ${d.value}`).join("\n")
    : "None";

  return [
    `Framework: ${context.framework}`,
    `Language: ${context.language}`,
    `Test Case ID: ${context.testCaseId}`,
    `Title: ${context.title}`,
    `Category: ${context.category}`,
    `Priority: ${context.priority} | Severity: ${context.severity}`,
    `Preconditions: ${context.preconditions}`,
    `Expected Result: ${context.expectedResult}`,
    context.postconditions ? `Postconditions: ${context.postconditions}` : "",
    "",
    "Test Steps:",
    stepsText,
    "",
    "Test Data:",
    dataText,
    "",
    `Generate ${context.framework} automation code in ${context.language} that executes these steps and asserts the expected result.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export type AutomationAiCaller = (system: string, user: string) => Promise<string>;

const defaultCaller: AutomationAiCaller = (system, user) => callOpenAiJson(system, user);

export async function generateAutomationCodeWithAi(
  context: AutomationTestCaseContext,
  caller: AutomationAiCaller = defaultCaller,
): Promise<string> {
  const content = await caller(SYSTEM_PROMPT, buildUserPrompt(context));
  const parsed = extractJsonFromAi(content);
  const validated = aiAutomationResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new HttpError(502, "AI automation code response failed validation", validated.error.flatten());
  }

  return validated.data.code;
}
