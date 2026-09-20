import { describe, expect, it, vi, afterEach } from "vitest";
import { extractJsonFromAi } from "../aiJson";
import { HttpError } from "../httpError";

describe("extractJsonFromAi", () => {
  it("parses valid JSON", () => {
    expect(extractJsonFromAi('{"code":"test"}')).toEqual({ code: "test" });
  });

  it("extracts JSON from wrapped text", () => {
    expect(extractJsonFromAi('Here is the result: {"count": 3}')).toEqual({ count: 3 });
  });

  it("throws when no JSON is present", () => {
    expect(() => extractJsonFromAi("not json")).toThrow(HttpError);
  });
});

describe("callOpenAiJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("throws 503 when API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.resetModules();

    const { callOpenAiJson: call } = await import("../aiJson");
    await expect(call("system", "user")).rejects.toThrow("OpenAI API key is not configured");
  });

  it("throws 503 on OpenAI rate limit without calling real API in success path", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => "rate limited",
      }),
    );
    vi.resetModules();

    const { callOpenAiJson: call } = await import("../aiJson");
    await expect(call("system", "user")).rejects.toMatchObject({
      status: 503,
      message: "OpenAI rate limit exceeded. Please retry later.",
    });
  });
});
