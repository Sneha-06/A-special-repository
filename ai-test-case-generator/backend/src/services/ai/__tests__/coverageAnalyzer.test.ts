import { describe, expect, it, vi } from "vitest";
import { analyzeCoverageWithAi } from "../coverageAnalyzer";
import { HttpError } from "../../../utils/httpError";

const sampleContext = {
  projectName: "Healthcare Claims",
  requirements: [
    {
      id: "req-1",
      title: "User Login",
      description: "Users must authenticate with email and password",
      acceptanceCriteria: [
        {
          id: "ac-1",
          criteriaKey: "AC001",
          given: "a registered user",
          when: "they enter valid credentials",
          then: "they are redirected to the dashboard",
        },
        {
          id: "ac-2",
          criteriaKey: "AC002",
          given: "a registered user",
          when: "they enter invalid credentials",
          then: "an error message is shown",
        },
      ],
      testCases: [
        {
          id: "tc-db-1",
          testCaseId: "TC-LOGIN-001",
          title: "Login with valid credentials",
          category: "FUNCTIONAL",
          expectedResult: "User is redirected to dashboard",
          steps: [
            { stepNumber: 1, action: "Navigate to login", expectedResult: "Login form shown" },
            { stepNumber: 2, action: "Enter valid credentials", expectedResult: "Accepted" },
          ],
          hasAutomation: true,
        },
      ],
    },
  ],
};

describe("analyzeCoverageWithAi", () => {
  it("returns validated coverage analysis from mocked OpenAI response", async () => {
    const caller = vi.fn().mockResolvedValue(
      JSON.stringify({
        acceptanceCriteriaMappings: [
          {
            acceptanceCriteriaId: "ac-1",
            mappedTestCaseIds: ["TC-LOGIN-001"],
            coverageStatus: "covered",
            rationale: "TC-LOGIN-001 validates successful login",
          },
          {
            acceptanceCriteriaId: "ac-2",
            mappedTestCaseIds: [],
            coverageStatus: "uncovered",
            rationale: "No negative login test exists",
          },
        ],
        coveredAreas: ["Valid login flow"],
        missingAreas: ["Invalid credentials handling"],
        missingTestScenarios: [
          {
            title: "Login with invalid password",
            category: "NEGATIVE",
            rationale: "AC002 is not covered",
          },
        ],
        recommendations: ["Add negative login test cases"],
        securityGaps: ["No brute-force protection tests"],
        edgeCaseGaps: [],
        regressionGaps: [],
      }),
    );

    const result = await analyzeCoverageWithAi(sampleContext, caller);

    expect(caller).toHaveBeenCalledOnce();
    expect(result.acceptanceCriteriaMappings).toHaveLength(2);
    expect(result.missingTestScenarios[0]).toMatchObject({
      title: "Login with invalid password",
    });
  });

  it("throws HttpError when AI response fails validation", async () => {
    const caller = vi.fn().mockResolvedValue(JSON.stringify({ coveredAreas: [] }));

    await expect(analyzeCoverageWithAi(sampleContext, caller)).rejects.toThrow(HttpError);
  });

  it("includes requirement and test case data in the prompt", async () => {
    const caller = vi.fn().mockResolvedValue(
      JSON.stringify({
        acceptanceCriteriaMappings: [],
        coveredAreas: [],
        missingAreas: [],
        missingTestScenarios: [],
        recommendations: [],
      }),
    );

    await analyzeCoverageWithAi(sampleContext, caller);

    const userPrompt = caller.mock.calls[0][1] as string;
    expect(userPrompt).toContain("User Login");
    expect(userPrompt).toContain("TC-LOGIN-001");
    expect(userPrompt).toContain("ac-1");
  });
});
