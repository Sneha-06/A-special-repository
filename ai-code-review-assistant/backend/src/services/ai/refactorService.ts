import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";
import { HttpError } from "../../utils/httpError";
import {
  refactorResponseSchema,
  type CreateRefactorBody,
  type RefactorOption,
  type RefactorResponse,
} from "../../validators/refactorSchemas";

const OPTION_FOCUS: Record<RefactorOption, string> = {
  readability: "Improve naming, structure, comments where helpful, and overall clarity without changing behavior.",
  performance: "Optimize performance: reduce unnecessary work, improve algorithms, avoid redundant operations. Preserve behavior.",
  "react-patterns": "Apply React best practices: hooks, effects, state, memoization, component composition. Preserve behavior.",
  typescript: "Strengthen TypeScript types, remove unsafe any, improve type inference and null safety. Preserve behavior.",
  security: "Harden security: validate input, avoid injection, remove secrets, safe defaults. Preserve behavior.",
  accessibility: "Improve a11y: labels, semantics, keyboard support, ARIA. Preserve behavior.",
  "reduce-duplication": "Extract duplication into reusable helpers/components. Preserve behavior.",
};

const SYSTEM_PROMPT = `You are a senior software engineer performing a careful, production-safe code refactor.

CRITICAL RULES:
- PRESERVE the original functionality. Do NOT arbitrarily rewrite working code.
- Only change what meaningfully improves the code for the requested focus areas.
- If the code is already good, make minimal or no changes and explain why.
- beforeCode must be the exact original code provided.
- afterCode must be the complete refactored file, not a snippet or partial diff.
- Do not add features, remove features, or change public API behavior unless fixing a clear bug.

Return ONLY valid JSON:
{
  "summary": "brief summary of what was improved",
  "improvements": ["list of specific improvements made"],
  "beforeCode": "exact original code",
  "afterCode": "complete improved code",
  "explanation": "detailed explanation of changes and why they help"
}`;

const RETRY_SUFFIX = `\n\nYour previous response failed validation. Return ONLY valid JSON. beforeCode must match the input exactly. afterCode must be the complete refactored source file.`;

function buildUserPrompt(input: CreateRefactorBody): string {
  const focus = input.refactorOptions.map((o) => `- ${o}: ${OPTION_FOCUS[o]}`).join("\n");

  const issueBlock =
    input.issues.length > 0
      ? `\nKnown issues to address if relevant:\n${input.issues
          .map((i) => `- ${i.title ?? "Issue"}: ${i.description ?? ""}${i.suggestion ? ` (suggestion: ${i.suggestion})` : ""}`)
          .join("\n")}`
      : "";

  return [
    `Language: ${input.language}`,
    `Framework: ${input.framework}`,
    input.fileName ? `File: ${input.fileName}` : null,
    `\nRefactoring focus:\n${focus}`,
    issueBlock,
    `\nOriginal code:\n\`\`\`${input.language}\n${input.code}\n\`\`\``,
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeResponse(input: CreateRefactorBody, data: RefactorResponse): RefactorResponse {
  return {
    summary: data.summary,
    improvements: data.improvements ?? [],
    beforeCode: input.code,
    afterCode: data.afterCode,
    explanation: data.explanation,
  };
}

async function callAndValidate(input: CreateRefactorBody, userPrompt: string): Promise<RefactorResponse> {
  const raw = await callOpenAiJson(SYSTEM_PROMPT, userPrompt);
  const parsed = extractJsonFromAi(raw);
  const result = refactorResponseSchema.safeParse(parsed);

  if (!result.success) {
    throw result.error;
  }

  if (!result.data.afterCode.trim()) {
    throw new Error("afterCode is empty");
  }

  return normalizeResponse(input, result.data);
}

export async function runCodeRefactor(input: CreateRefactorBody): Promise<RefactorResponse> {
  const userPrompt = buildUserPrompt(input);

  try {
    return await callAndValidate(input, userPrompt);
  } catch (firstError) {
    try {
      return await callAndValidate(input, userPrompt + RETRY_SUFFIX);
    } catch {
      throw new HttpError(502, "AI returned an invalid refactor response after retry", {
        reason: firstError instanceof Error ? firstError.message : "validation failed",
      });
    }
  }
}
