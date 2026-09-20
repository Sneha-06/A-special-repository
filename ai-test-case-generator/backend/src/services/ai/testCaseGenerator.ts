import { aiTestCasesResponseSchema } from "../../validators/testCaseSchemas";
import { HttpError } from "../../utils/httpError";
import { env } from "../../utils/env";
import type { TestCaseGenerationContext } from "../../types/testCase";

const SYSTEM_PROMPT = `You are a senior QA engineer creating detailed, requirement-specific test cases.

Return ONLY valid JSON with this exact schema:
{
  "testCases": [
    {
      "testCaseId": "TC001",
      "title": "string",
      "category": "string",
      "priority": "High",
      "severity": "Critical",
      "preconditions": ["string"],
      "testData": [{ "field": "string", "value": "string", "dataType": "string" }],
      "steps": [
        {
          "stepNumber": 1,
          "action": "string",
          "testData": "string",
          "expectedResult": "string"
        }
      ],
      "expectedResult": "string",
      "postconditions": "string",
      "automationCandidate": true
    }
  ]
}

Rules:
- Derive EVERY test case from the provided requirement and analysis. Do NOT produce generic placeholder tests.
- When the requirement contains numeric ranges (e.g. age 18 to 65), generate boundary tests for min, max, just below min, and just above max.
- For email, password, date, phone, currency, and ID fields, include appropriate negative, boundary, and edge cases.
- Each test case category MUST be one of the requested test types.
- Steps must be actionable and specific to the requirement domain.
- Use realistic test data values tied to the requirement context.
- preconditions is an array of strings.
- priority values: Low, Medium, High, Critical
- severity values: Minor, Moderate, Major, Critical
- testCaseId values must be unique within the response (TC001, TC002, ...).`;

function buildUserPrompt(context: TestCaseGenerationContext): string {
  const { requirement, analysis, testTypes, numberOfTestCases, priority, severity } = context;

  const parts = [
    `Generate exactly ${numberOfTestCases} test case(s).`,
    `Allowed categories (use exactly these labels): ${testTypes.join(", ")}`,
    `Default priority for generated cases: ${priority}`,
    `Default severity for generated cases: ${severity}`,
    "",
    "=== REQUIREMENT ===",
    `Title: ${requirement.title}`,
    `Description: ${requirement.description}`,
    `Priority: ${requirement.priority}`,
  ];

  if (requirement.userStory) parts.push(`User Story: ${requirement.userStory}`);
  if (requirement.applicationModule) parts.push(`Module: ${requirement.applicationModule}`);
  if (requirement.acceptanceCriteriaText) {
    parts.push(`Acceptance Criteria: ${requirement.acceptanceCriteriaText}`);
  }
  if (requirement.additionalContext) parts.push(`Additional Context: ${requirement.additionalContext}`);

  if (analysis) {
    parts.push(
      "",
      "=== REQUIREMENT ANALYSIS ===",
      `Summary: ${analysis.summary}`,
      `Actors: ${analysis.actors.join("; ")}`,
      `Business Rules: ${analysis.businessRules.join("; ")}`,
      `Functional Requirements: ${analysis.functionalRequirements.join("; ")}`,
      `Risk Areas: ${analysis.riskAreas.join("; ")}`,
      `Ambiguities: ${analysis.ambiguities.join("; ")}`,
      `Missing Information: ${analysis.missingInformation.join("; ")}`,
    );
  }

  parts.push(
    "",
    "Distribute test cases across the requested categories where applicable.",
    "Include boundary and negative cases when the requirement contains constraints, ranges, or validated fields.",
  );

  return parts.join("\n");
}

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new HttpError(502, "AI response did not contain valid JSON");
    return JSON.parse(match[0]);
  }
}

export async function generateTestCasesWithAi(context: TestCaseGenerationContext) {
  if (!env.openAiApiKey) {
    throw new HttpError(
      503,
      "OpenAI API key is not configured. Set OPENAI_API_KEY in the backend environment.",
    );
  }

  const response = await fetch(`${env.openAiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(context) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new HttpError(502, "OpenAI API request failed", {
      status: response.status,
      body: body.slice(0, 500),
    });
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new HttpError(502, "OpenAI returned an empty response");
  }

  const parsed = extractJson(content);
  const validated = aiTestCasesResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new HttpError(502, "AI test case response failed validation", validated.error.flatten());
  }

  return validated.data.testCases;
}
