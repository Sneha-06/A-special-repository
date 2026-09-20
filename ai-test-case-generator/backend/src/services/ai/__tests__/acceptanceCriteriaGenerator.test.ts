import { describe, expect, it, vi } from "vitest";
import { HttpError } from "../../../utils/httpError";

vi.mock("../../../utils/aiJson", () => ({
  callOpenAiJson: vi.fn(),
  extractJsonFromAi: (content: string) => JSON.parse(content),
}));

import { callOpenAiJson } from "../../../utils/aiJson";
import { generateAcceptanceCriteriaWithAi } from "../acceptanceCriteriaGenerator";

describe("generateAcceptanceCriteriaWithAi", () => {
  it("returns validated acceptance criteria from mocked OpenAI response", async () => {
    vi.mocked(callOpenAiJson).mockResolvedValue(
      JSON.stringify({
        acceptanceCriteria: [
          { id: "AC001", given: "a user", when: "they login", then: "dashboard loads" },
        ],
      }),
    );

    const result = await generateAcceptanceCriteriaWithAi({
      title: "Login",
      description: "User authentication",
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("AC001");
    expect(callOpenAiJson).toHaveBeenCalledOnce();
  });

  it("throws HttpError when AI response fails validation", async () => {
    vi.mocked(callOpenAiJson).mockResolvedValue(JSON.stringify({ acceptanceCriteria: [] }));

    await expect(
      generateAcceptanceCriteriaWithAi({ title: "Login", description: "Auth" }),
    ).rejects.toThrow(HttpError);
  });
});
