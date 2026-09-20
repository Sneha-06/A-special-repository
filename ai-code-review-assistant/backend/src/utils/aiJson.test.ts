import { describe, expect, it } from "vitest";
import { extractJsonFromAi } from "./aiJson";
import { HttpError } from "./httpError";

describe("extractJsonFromAi", () => {
  it("parses raw JSON", () => {
    const result = extractJsonFromAi('{"summary":"ok","score":1}');
    expect(result).toEqual({ summary: "ok", score: 1 });
  });

  it("extracts JSON embedded in prose", () => {
    const result = extractJsonFromAi('Here is the result:\n{"summary":"ok"}');
    expect(result).toEqual({ summary: "ok" });
  });

  it("throws HttpError when JSON is missing", () => {
    expect(() => extractJsonFromAi("no json here")).toThrow(HttpError);
  });
});
