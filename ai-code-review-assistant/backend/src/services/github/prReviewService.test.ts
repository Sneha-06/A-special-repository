import { describe, expect, it } from "vitest";
import { prReviewResponseSchema } from "../../validators/githubSchemas";

describe("prReviewResponseSchema", () => {
  it("validates a PR review response", () => {
    const data = {
      summary: "Solid PR with minor issues.",
      bugs: ["Missing error handling on fetch"],
      security: [],
      performance: ["Effect runs on every render"],
      maintainability: ["Extract fetch logic to a hook"],
      recommendations: ["Add tests for error state"],
      proposedComments: [
        {
          file: "src/UserList.tsx",
          line: 12,
          body: "Add a dependency array to useEffect",
          severity: "high",
          category: "bug",
        },
      ],
    };
    expect(prReviewResponseSchema.safeParse(data).success).toBe(true);
  });
});
