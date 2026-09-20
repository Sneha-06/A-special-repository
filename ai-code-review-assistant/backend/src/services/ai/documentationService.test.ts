import { describe, expect, it } from "vitest";
import { documentationResponseSchema } from "../../validators/documentationSchemas";

describe("documentationResponseSchema", () => {
  it("validates a well-formed documentation response", () => {
    const data = {
      format: "markdown",
      title: "UserList Component",
      summary: "Documentation for the UserList component.",
      content: "# UserList\n\nFetches and displays users.",
      items: [{
        name: "UserList",
        type: "component",
        description: "Renders user list",
        parameters: [],
        examples: ["<UserList />"],
      }],
      usageExamples: ["import { UserList } from './UserList';"],
    };
    expect(documentationResponseSchema.safeParse(data).success).toBe(true);
  });
});
