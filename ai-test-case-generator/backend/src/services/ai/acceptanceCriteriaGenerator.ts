import { aiAcceptanceCriteriaResponseSchema } from "../../validators/acceptanceCriteriaSchemas";
import { HttpError } from "../../utils/httpError";
import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";

interface RequirementContext {
  title: string;
  description: string;
  userStory?: string | null;
  applicationModule?: string | null;
  acceptanceCriteriaText?: string | null;
  additionalContext?: string | null;
  analysisSummary?: string | null;
}

const SYSTEM_PROMPT = `You are a senior business analyst writing acceptance criteria in Given/When/Then format.

Return ONLY valid JSON:
{
  "acceptanceCriteria": [
    {
      "id": "AC001",
      "given": "string",
      "when": "string",
      "then": "string"
    }
  ]
}

Rules:
- Derive criteria ONLY from the provided requirement. Do not invent features.
- Use clear, testable Given/When/Then statements.
- IDs must be sequential: AC001, AC002, AC003...
- Generate 3 to 8 criteria depending on requirement complexity.
- Cover happy path, negative paths, and edge cases when supported by the requirement text.`;

function buildUserPrompt(requirement: RequirementContext): string {
  const parts = [
    `Title: ${requirement.title}`,
    `Description: ${requirement.description}`,
  ];
  if (requirement.userStory) parts.push(`User Story: ${requirement.userStory}`);
  if (requirement.applicationModule) parts.push(`Module: ${requirement.applicationModule}`);
  if (requirement.acceptanceCriteriaText) {
    parts.push(`Existing Notes: ${requirement.acceptanceCriteriaText}`);
  }
  if (requirement.additionalContext) parts.push(`Context: ${requirement.additionalContext}`);
  if (requirement.analysisSummary) parts.push(`Analysis Summary: ${requirement.analysisSummary}`);
  return `Generate acceptance criteria for:\n\n${parts.join("\n\n")}`;
}

export async function generateAcceptanceCriteriaWithAi(requirement: RequirementContext) {
  const content = await callOpenAiJson(SYSTEM_PROMPT, buildUserPrompt(requirement));
  const parsed = extractJsonFromAi(content);
  const validated = aiAcceptanceCriteriaResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new HttpError(502, "AI acceptance criteria response failed validation", validated.error.flatten());
  }

  return validated.data.acceptanceCriteria;
}
