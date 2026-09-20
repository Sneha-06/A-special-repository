import { GenerationType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { countGeneratedItems } from "../historyService";
import { sanitizeHistoryPayload } from "../../utils/sanitizeHistory";

describe("countGeneratedItems", () => {
  it("reads count from output", () => {
    expect(countGeneratedItems(GenerationType.TEST_CASES, { count: 5 })).toBe(5);
  });

  it("counts test case ids when present", () => {
    expect(
      countGeneratedItems(GenerationType.TEST_CASES, { testCaseIds: ["TC-1", "TC-2"] }),
    ).toBe(2);
  });

  it("returns 1 for requirement analysis output", () => {
    expect(
      countGeneratedItems(GenerationType.REQUIREMENT_ANALYSIS, { summary: "Analysis complete" }),
    ).toBe(1);
  });
});

describe("sanitizeHistoryPayload", () => {
  it("redacts secret-like keys", () => {
    const result = sanitizeHistoryPayload({
      title: "Login",
      apiKey: "sk-secret",
      nested: { authorization: "Bearer token" },
    }) as Record<string, unknown>;

    expect(result.title).toBe("Login");
    expect(result.apiKey).toBe("[REDACTED]");
    expect((result.nested as Record<string, unknown>).authorization).toBe("[REDACTED]");
  });
});
