import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";
import { HttpError } from "../../utils/httpError";
import {
  aiAnalysisResponseSchema,
  type AiAnalysisResponse,
  type AnalyzeCodeBody,
} from "../../validators/analysisSchemas";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";

export async function runAiAnalysis(input: AnalyzeCodeBody): Promise<AiAnalysisResponse> {
  const systemPrompt = buildSystemPrompt(input.analysisType);
  const userPrompt = buildUserPrompt(input);

  const raw = await callOpenAiJson(systemPrompt, userPrompt);
  const parsed = extractJsonFromAi(raw);
  const result = aiAnalysisResponseSchema.safeParse(parsed);

  if (!result.success) {
    throw new HttpError(502, "AI response failed validation", result.error.flatten());
  }

  return result.data;
}
