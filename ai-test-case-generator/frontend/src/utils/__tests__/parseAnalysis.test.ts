import { describe, expect, it } from "vitest";
import { normalizeAnalysis, normalizeAnalysisRecord } from "../parseAnalysis";

describe("normalizeAnalysis", () => {
  it("coerces JSON array fields to string arrays", () => {
    const result = normalizeAnalysis({
      id: "1",
      requirementId: "req-1",
      summary: "Test summary",
      actors: ["Admin"],
      preconditions: [],
      businessRules: [],
      functionalRequirements: ["FR1"],
      nonFunctionalRequirements: [],
      assumptions: [],
      ambiguities: [],
      missingInformation: [],
      riskAreas: ["Security"],
      createdAt: "2026-01-01",
    });

    expect(result.summary).toBe("Test summary");
    expect(result.actors).toEqual(["Admin"]);
    expect(result.functionalRequirements).toEqual(["FR1"]);
    expect(result.riskAreas).toEqual(["Security"]);
  });
});

describe("normalizeAnalysisRecord", () => {
  it("normalizes raw AI output records", () => {
    const result = normalizeAnalysisRecord({
      summary: "Coverage complete",
      actors: ["QA Lead"],
      preconditions: [],
      businessRules: [],
      functionalRequirements: [],
      nonFunctionalRequirements: [],
      assumptions: [],
      ambiguities: [],
      missingInformation: [],
      riskAreas: [],
    });

    expect(result.summary).toBe("Coverage complete");
    expect(result.actors).toEqual(["QA Lead"]);
  });

  it("ignores non-array field values", () => {
    const result = normalizeAnalysisRecord({
      summary: "Test",
      actors: "invalid",
      preconditions: [],
      businessRules: [],
      functionalRequirements: [],
      nonFunctionalRequirements: [],
      assumptions: [],
      ambiguities: [],
      missingInformation: [],
      riskAreas: [],
    });

    expect(result.actors).toEqual([]);
  });
});
