import { analysisResultSchema } from "../../validators/requirementSchemas";
import { HttpError } from "../../utils/httpError";
import { env } from "../../utils/env";
import type { RequirementAnalysisResult } from "../../types/requirement";

interface RequirementContext {
  title: string;
  description: string;
  userStory?: string | null;
  applicationModule?: string | null;
  priority: string;
  acceptanceCriteriaText?: string | null;
  additionalContext?: string | null;
}

const SYSTEM_PROMPT = `You are a senior QA analyst and business analyst. Analyze software requirements and return ONLY valid JSON matching this exact schema:
{
  "summary": "string",
  "actors": ["string"],
  "preconditions": ["string"],
  "businessRules": ["string"],
  "functionalRequirements": ["string"],
  "nonFunctionalRequirements": ["string"],
  "assumptions": ["string"],
  "ambiguities": ["string"],
  "missingInformation": ["string"],
  "riskAreas": ["string"]
}

Rules:
- Base your analysis ONLY on the provided requirement text. Do NOT invent features, rules, or requirements that are not supported by the input.
- If something is unclear or not specified, list it under "ambiguities" or "missingInformation" instead of assuming it.
- "functionalRequirements" and "businessRules" must reflect only what can be reasonably derived from the given text.
- Use empty arrays when a section has no applicable items.
- Be concise and professional.`;

function buildUserPrompt(requirement: RequirementContext): string {
  const sections = [
    `Title: ${requirement.title}`,
    `Description: ${requirement.description}`,
    `Priority: ${requirement.priority}`,
  ];

  if (requirement.userStory) sections.push(`User Story: ${requirement.userStory}`);
  if (requirement.applicationModule) sections.push(`Application/Module: ${requirement.applicationModule}`);
  if (requirement.acceptanceCriteriaText) {
    sections.push(`Acceptance Criteria: ${requirement.acceptanceCriteriaText}`);
  }
  if (requirement.additionalContext) sections.push(`Additional Context: ${requirement.additionalContext}`);

  return `Analyze the following software requirement:\n\n${sections.join("\n\n")}`;
}

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new HttpError(502, "AI response did not contain valid JSON");
    }
    return JSON.parse(match[0]);
  }
}

export async function analyzeRequirement(
  requirement: RequirementContext,
): Promise<RequirementAnalysisResult> {
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
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(requirement) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new HttpError(
      502,
      "OpenAI API request failed",
      { status: response.status, body: body.slice(0, 500) },
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new HttpError(502, "OpenAI returned an empty response");
  }

  const parsed = extractJson(content);
  const validated = analysisResultSchema.safeParse(parsed);

  if (!validated.success) {
    throw new HttpError(502, "AI response failed validation", validated.error.flatten());
  }

  return validated.data;
}
