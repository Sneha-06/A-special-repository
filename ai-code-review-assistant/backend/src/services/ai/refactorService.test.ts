import { describe, expect, it } from "vitest";
import { refactorResponseSchema } from "../../validators/refactorSchemas";

describe("refactorResponseSchema", () => {
  it("validates a well-formed refactor response", () => {
    const data = {
      summary: "Improved effect dependencies and error handling.",
      improvements: ["Added useEffect dependency array", "Added fetch error handling"],
      beforeCode: "const x = 1;",
      afterCode: "const x = 1;\n// improved",
      explanation: "The effect now runs only once on mount.",
    };

    expect(refactorResponseSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing afterCode", () => {
    const data = {
      summary: "Test",
      improvements: [],
      beforeCode: "a",
      afterCode: "",
      explanation: "none",
    };

    expect(refactorResponseSchema.safeParse(data).success).toBe(false);
  });
});
