import type { AiResponse, AiSource, GenerateParams } from "./types";

function extractJson(text: string): unknown {
  const fenced = text.match(/\{[\s\S]*\}/);
  if (!fenced) return null;
  try {
    return JSON.parse(fenced[0]);
  } catch {
    return null;
  }
}

export function coerceAiResponse(raw: unknown, fallbackAnswer: string): AiResponse {
  const value = (raw ?? {}) as Record<string, unknown>;
  const sources: AiSource[] = Array.isArray(value.sources)
    ? value.sources
        .map((source) => {
          const item = source as Record<string, unknown>;
          const type = item.type;
          if (type !== "claim" && type !== "rule" && type !== "document") return null;
          return {
            type,
            id: String(item.id ?? ""),
            title: String(item.title ?? item.id ?? "Source"),
          } satisfies AiSource;
        })
        .filter((source): source is AiSource => Boolean(source?.id))
    : [];

  const recommendations = Array.isArray(value.recommendations)
    ? value.recommendations.map((item) => String(item)).filter(Boolean)
    : [];

  const confidence = typeof value.confidence === "number" ? value.confidence : 0.7;

  return {
    answer: String(value.answer ?? fallbackAnswer),
    claimId: value.claimId ? String(value.claimId) : null,
    ruleId: value.ruleId ? String(value.ruleId) : null,
    confidence: Math.max(0, Math.min(1, confidence)),
    sources,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ["Review the cited rule and supporting claim details before taking action."],
    simpleExplanation:
      typeof value.simpleExplanation === "string" ? value.simpleExplanation : undefined,
  };
}

export function parseModelOutput(text: string, fallbackAnswer: string): AiResponse {
  return coerceAiResponse(extractJson(text), fallbackAnswer);
}

export function fallbackFromContext(params: GenerateParams): AiResponse {
  return {
    answer: "I could not produce a structured response from the current provider.",
    claimId: null,
    ruleId: null,
    confidence: 0.2,
    sources: [],
    recommendations: ["Retry the question or switch AI_PROVIDER to mock for demo mode."],
    simpleExplanation: params.retrievedContext.slice(0, 240),
  };
}
