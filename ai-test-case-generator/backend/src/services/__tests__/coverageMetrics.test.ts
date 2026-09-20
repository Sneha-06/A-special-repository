import { TestCategory } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { buildCategoryGaps, computeCoverageScore } from "../coverageMetrics";

describe("computeCoverageScore", () => {
  it("calculates score from acceptance criteria mappings", () => {
    const requirements = [
      {
        id: "req-1",
        title: "Login",
        acceptanceCriteria: [{ id: "ac-1" }, { id: "ac-2" }],
        testCases: [{ testCaseId: "TC-1", category: TestCategory.FUNCTIONAL, automationCode: [] }],
      },
    ];

    const mappings = [
      { acceptanceCriteriaId: "ac-1", mappedTestCaseIds: ["TC-1"], coverageStatus: "covered" as const },
      { acceptanceCriteriaId: "ac-2", mappedTestCaseIds: [], coverageStatus: "uncovered" as const },
    ];

    expect(computeCoverageScore(requirements, mappings)).toBe(50);
  });

  it("uses requirement-level coverage when no acceptance criteria exist", () => {
    const withTests = [
      {
        id: "req-1",
        title: "Login",
        acceptanceCriteria: [],
        testCases: [{ testCaseId: "TC-1", category: TestCategory.FUNCTIONAL, automationCode: [] }],
      },
    ];
    const withoutTests = [
      {
        id: "req-2",
        title: "Logout",
        acceptanceCriteria: [],
        testCases: [],
      },
    ];

    expect(computeCoverageScore(withTests, [])).toBe(100);
    expect(computeCoverageScore(withoutTests, [])).toBe(0);
  });

  it("returns 0 when there are no coverage units", () => {
    expect(computeCoverageScore([], [])).toBe(0);
  });
});

describe("buildCategoryGaps", () => {
  it("flags missing security, edge, and regression categories", () => {
    const requirements = [
      {
        id: "req-1",
        title: "Claims Submission",
        acceptanceCriteria: [],
        testCases: [{ testCaseId: "TC-1", category: TestCategory.FUNCTIONAL, automationCode: [] }],
      },
    ];

    const gaps = buildCategoryGaps(requirements);

    expect(gaps.securityGaps[0]).toContain("no SECURITY");
    expect(gaps.edgeCaseGaps[0]).toContain("no EDGE_CASE");
    expect(gaps.regressionGaps[0]).toContain("no REGRESSION");
  });
});
