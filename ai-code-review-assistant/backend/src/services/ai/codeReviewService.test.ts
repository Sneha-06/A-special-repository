import { describe, expect, it } from "vitest";
import { codeReviewResponseSchema } from "../../validators/reviewSchemas";

describe("codeReviewResponseSchema", () => {
  it("validates a well-formed review response", () => {
    const data = {
      summary: "Code has several React hook issues.",
      overallScore: 72,
      issues: [
        {
          id: "ISSUE-001",
          title: "Missing useEffect dependency array",
          description: "Effect runs on every render.",
          severity: "high",
          category: "react",
          lineStart: 5,
          lineEnd: 8,
          suggestion: "Add an empty dependency array or include dependencies.",
          explanation: "Without deps, the effect re-runs every render causing infinite fetch loops.",
        },
      ],
      strengths: ["Clear component structure"],
      recommendations: ["Add error handling to fetch"],
    };

    const result = codeReviewResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects invalid severity", () => {
    const data = {
      summary: "Test",
      overallScore: 50,
      issues: [
        {
          id: "ISSUE-001",
          title: "Bad",
          description: "Bad",
          severity: "urgent",
          category: "bug",
        },
      ],
      strengths: [],
      recommendations: [],
    };

    const result = codeReviewResponseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
