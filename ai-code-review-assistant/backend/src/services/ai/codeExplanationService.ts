import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";
import { HttpError } from "../../utils/httpError";
import {
  codeExplanationResponseSchema,
  type CodeExplanationResponse,
  type ExplainCodeBody,
} from "../../validators/explainSchemas";

const SYSTEM_PROMPT = `You are a senior software engineer explaining code to fellow developers.

Rules:
- Use clear, developer-friendly language. Avoid jargon without explanation.
- Base your explanation only on the provided code and context.
- Do not invent functionality that is not present in the code.
- flow: ordered execution steps with step number, title, and description.
- dependencies: external libraries, modules, APIs, or internal imports used.
- potentialIssues: only flag concerns reasonably supported by the code.
- keyFunctions: important functions/components with name, description, parameters, and returns.

Return ONLY valid JSON:
{
  "summary": "one-paragraph overview",
  "purpose": "what this code is meant to accomplish",
  "architecture": "how the code is structured and organized",
  "flow": [{ "step": 1, "title": "...", "description": "..." }],
  "dependencies": ["dependency or import names"],
  "potentialIssues": [{ "title": "...", "description": "...", "severity": "low|medium|high" }],
  "keyFunctions": [{ "name": "...", "description": "...", "parameters": ["..."], "returns": "..." }]
}`;

const RETRY_SUFFIX = `\n\nYour previous response failed JSON validation. Return ONLY valid JSON matching the schema exactly.`;

function buildUserPrompt(input: ExplainCodeBody): string {
  return [
    `Language: ${input.language}`,
    input.context ? `Context:\n${input.context}` : null,
    `\nCode to explain:\n\`\`\`${input.language}\n${input.code}\n\`\`\``,
  ]
    .filter(Boolean)
    .join("\n");
}

async function callAndValidate(userPrompt: string): Promise<CodeExplanationResponse> {
  const raw = await callOpenAiJson(SYSTEM_PROMPT, userPrompt);
  const parsed = extractJsonFromAi(raw);
  const result = codeExplanationResponseSchema.safeParse(parsed);
  if (!result.success) throw result.error;
  return result.data;
}

export async function runCodeExplanation(input: ExplainCodeBody): Promise<CodeExplanationResponse> {
  const userPrompt = buildUserPrompt(input);
  try {
    return await callAndValidate(userPrompt);
  } catch (firstError) {
    try {
      return await callAndValidate(userPrompt + RETRY_SUFFIX);
    } catch {
      throw new HttpError(502, "AI returned an invalid explanation response after retry", {
        reason: firstError instanceof Error ? firstError.message : "validation failed",
      });
    }
  }
}
