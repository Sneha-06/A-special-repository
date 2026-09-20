import { TestCategory } from "@prisma/client";
import type { AiCoverageResponse } from "../validators/coverageSchemas";

export interface CoverageRequirementMetrics {
  id: string;
  title: string;
  acceptanceCriteria: Array<{ id: string }>;
  testCases: Array<{
    testCaseId: string;
    category: TestCategory;
    automationCode: Array<{ framework: string; language: string }>;
  }>;
}

export function computeCoverageScore(
  requirements: CoverageRequirementMetrics[],
  mappings: AiCoverageResponse["acceptanceCriteriaMappings"],
): number {
  let totalUnits = 0;
  let coveredUnits = 0;

  const mappingByAcId = new Map(mappings.map((m) => [m.acceptanceCriteriaId, m]));

  for (const req of requirements) {
    if (req.acceptanceCriteria.length > 0) {
      for (const ac of req.acceptanceCriteria) {
        totalUnits += 1;
        const mapping = mappingByAcId.get(ac.id);
        if (!mapping || mapping.coverageStatus === "uncovered") continue;
        if (mapping.coverageStatus === "covered") coveredUnits += 1;
        if (mapping.coverageStatus === "partial") coveredUnits += 0.5;
      }
    } else {
      totalUnits += 1;
      if (req.testCases.length > 0) coveredUnits += 1;
    }
  }

  if (totalUnits === 0) return 0;
  return Math.round((coveredUnits / totalUnits) * 100);
}

export function buildCategoryGaps(requirements: CoverageRequirementMetrics[]) {
  const securityGaps: string[] = [];
  const edgeCaseGaps: string[] = [];
  const regressionGaps: string[] = [];

  for (const req of requirements) {
    const categories = new Set(req.testCases.map((tc) => tc.category));

    if (req.testCases.length === 0) {
      securityGaps.push(`${req.title}: no test cases generated`);
      edgeCaseGaps.push(`${req.title}: no test cases generated`);
      regressionGaps.push(`${req.title}: no test cases generated`);
      continue;
    }

    if (!categories.has(TestCategory.SECURITY)) {
      securityGaps.push(`${req.title}: no SECURITY test cases`);
    }
    if (!categories.has(TestCategory.EDGE_CASE) && !categories.has(TestCategory.BOUNDARY)) {
      edgeCaseGaps.push(`${req.title}: no EDGE_CASE or BOUNDARY test cases`);
    }
    if (!categories.has(TestCategory.REGRESSION)) {
      regressionGaps.push(`${req.title}: no REGRESSION test cases`);
    }
  }

  return { securityGaps, edgeCaseGaps, regressionGaps };
}
