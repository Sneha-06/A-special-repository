import { describe, expect, it } from "vitest";
import { testGeneratorResponseSchema } from "../../validators/testGeneratorSchemas";

describe("testGeneratorResponseSchema", () => {
  it("validates a well-formed test generation response", () => {
    const data = {
      testFileName: "UserList.test.tsx",
      testFramework: "vitest",
      tests: [
        {
          name: "renders users after fetch",
          description: "Happy path: displays user names",
          category: "happy-path",
          targetFunction: "UserList",
        },
        {
          name: "handles empty response",
          description: "Edge case: empty user array",
          category: "edge-case",
          targetFunction: "UserList",
        },
      ],
      code: "import { describe, it, expect } from 'vitest';\ndescribe('UserList', () => { it('works', () => {}); });",
      summary: { totalTests: 2, functionsCovered: ["UserList"], edgeCasesCovered: 1 },
    };
    expect(testGeneratorResponseSchema.safeParse(data).success).toBe(true);
  });

  it("rejects empty tests array", () => {
    const data = {
      testFileName: "test.ts",
      testFramework: "vitest",
      tests: [],
      code: "test",
      summary: { totalTests: 0, functionsCovered: [], edgeCasesCovered: 0 },
    };
    expect(testGeneratorResponseSchema.safeParse(data).success).toBe(false);
  });
});
