import type { AnalysisResult, RequirementAnalysis } from "../types/requirement";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toAnalysisResult(source: {
  summary?: unknown;
  actors?: unknown;
  preconditions?: unknown;
  businessRules?: unknown;
  functionalRequirements?: unknown;
  nonFunctionalRequirements?: unknown;
  assumptions?: unknown;
  ambiguities?: unknown;
  missingInformation?: unknown;
  riskAreas?: unknown;
}): AnalysisResult {
  return {
    summary: typeof source.summary === "string" ? source.summary : "",
    actors: asStringArray(source.actors),
    preconditions: asStringArray(source.preconditions),
    businessRules: asStringArray(source.businessRules),
    functionalRequirements: asStringArray(source.functionalRequirements),
    nonFunctionalRequirements: asStringArray(source.nonFunctionalRequirements),
    assumptions: asStringArray(source.assumptions),
    ambiguities: asStringArray(source.ambiguities),
    missingInformation: asStringArray(source.missingInformation),
    riskAreas: asStringArray(source.riskAreas),
  };
}

export function normalizeAnalysis(analysis: RequirementAnalysis): AnalysisResult {
  return toAnalysisResult(analysis);
}

export function normalizeAnalysisRecord(value: Record<string, unknown>): AnalysisResult {
  return toAnalysisResult(value);
}
