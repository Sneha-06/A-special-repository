import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";
import { HttpError } from "../../utils/httpError";
import {
  codeReviewResponseSchema,
  type CodeReviewResponse,
  type CreateReviewBody,
  type ReviewType,
} from "../../validators/reviewSchemas";

const REVIEW_FOCUS: Record<ReviewType, string> = {
  general: "Perform a balanced review across correctness, maintainability, readability, and best practices.",
  bugs: "Focus on bugs, logic errors, null/undefined issues, async problems, and missing error handling.",
  performance: "Focus on performance: unnecessary renders, expensive calculations, inefficient loops, redundant API calls, memory issues.",
  security: "Focus on security: injection risks, hardcoded secrets, unsafe input handling, auth/authz flaws.",
  "code-quality": "Focus on code quality: duplication, complex functions, poor naming, separation of concerns.",
  react: "Focus on React: useEffect issues, dependency arrays, state management, prop drilling, re-renders, keys, hooks, memoization.",
  accessibility: "Focus on accessibility: missing labels, keyboard access, semantic HTML, ARIA, color/interaction issues.",
};

const SYSTEM_PROMPT = `You are a senior software engineer performing a production code review.

Rules:
- Only report issues reasonably supported by the provided code. Do NOT invent problems.
- Be specific and actionable. Reference line numbers when possible.
- If the code is clean for a focus area, return no issues for that area.
- overallScore: 0-100 reflecting production readiness (100 = excellent).
- Assign unique issue ids: ISSUE-001, ISSUE-002, etc.
- severity: critical | high | medium | low | info
- category: bug | security | performance | code-quality | react | accessibility | maintainability

Return ONLY valid JSON with this exact shape:
{
  "summary": "executive summary",
  "overallScore": 85,
  "issues": [
    {
      "id": "ISSUE-001",
      "title": "short title",
      "description": "what is wrong",
      "severity": "high",
      "category": "bug",
      "lineStart": 10,
      "lineEnd": 12,
      "suggestion": "how to fix",
      "explanation": "why it matters"
    }
  ],
  "strengths": ["positive aspects"],
  "recommendations": ["actionable next steps"]
}`;

const RETRY_SUFFIX = `\n\nYour previous response failed JSON validation. Return ONLY valid JSON matching the required schema exactly. Ensure all required fields are present and enums use lowercase values.`;

function buildUserPrompt(input: CreateReviewBody): string {
  const focusAreas = input.reviewTypes
    .map((t) => `- ${t}: ${REVIEW_FOCUS[t]}`)
    .join("\n");

  return [
    `Language: ${input.language}`,
    `Framework: ${input.framework}`,
    input.fileName ? `File: ${input.fileName}` : null,
    input.projectContext ? `Project context:\n${input.projectContext}` : null,
    `\nReview focus areas:\n${focusAreas}`,
    `\nCode to review:\n\`\`\`${input.language}\n${input.code}\n\`\`\``,
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeResponse(data: CodeReviewResponse): CodeReviewResponse {
  return {
    ...data,
    issues: data.issues.map((issue, index) => ({
      ...issue,
      id: issue.id || `ISSUE-${String(index + 1).padStart(3, "0")}`,
      suggestion: issue.suggestion ?? "",
      explanation: issue.explanation ?? "",
      lineStart: issue.lineStart ?? null,
      lineEnd: issue.lineEnd ?? null,
    })),
    strengths: data.strengths ?? [],
    recommendations: data.recommendations ?? [],
  };
}

async function callAndValidate(userPrompt: string): Promise<CodeReviewResponse> {
  const raw = await callOpenAiJson(SYSTEM_PROMPT, userPrompt);
  const parsed = extractJsonFromAi(raw);
  const result = codeReviewResponseSchema.safeParse(parsed);

  if (!result.success) {
    throw result.error;
  }

  return normalizeResponse(result.data);
}

export async function runCodeReview(input: CreateReviewBody): Promise<CodeReviewResponse> {
  const userPrompt = buildUserPrompt(input);

  try {
    return await callAndValidate(userPrompt);
  } catch (firstError) {
    try {
      return await callAndValidate(userPrompt + RETRY_SUFFIX);
    } catch {
      const message =
        firstError instanceof Error && "issues" in firstError
          ? "AI returned an invalid review structure after retry"
          : "AI returned an invalid review structure";
      throw new HttpError(502, message, {
        reason: firstError instanceof Error ? firstError.message : "validation failed",
      });
    }
  }
}
