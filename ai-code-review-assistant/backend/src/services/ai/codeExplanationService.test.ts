import { describe, expect, it } from "vitest";
import { codeExplanationResponseSchema } from "../../validators/explainSchemas";

describe("codeExplanationResponseSchema", () => {
  it("validates a well-formed explanation", () => {
    const data = {
      summary: "A React component that fetches users.",
      purpose: "Display a list of users from an API.",
      architecture: "Single functional component with hooks.",
      flow: [{ step: 1, title: "Mount", description: "Component renders and triggers useEffect." }],
      dependencies: ["react", "/api/users"],
      potentialIssues: [{ title: "Missing deps", description: "useEffect has no dependency array.", severity: "medium" }],
      keyFunctions: [{ name: "UserList", description: "Main component", parameters: [], returns: "JSX.Element" }],
    };
    expect(codeExplanationResponseSchema.safeParse(data).success).toBe(true);
  });
});
