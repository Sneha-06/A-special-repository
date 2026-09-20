import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { getErrorMessage } from "../api";

describe("getErrorMessage", () => {
  it("extracts API error message from axios response", () => {
    const error = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: { error: "Invalid request body" },
        statusText: "Bad Request",
        headers: {},
        config: { headers: {} as never },
      },
    );

    expect(getErrorMessage(error)).toBe("Invalid request body");
  });

  it("falls back to Error message", () => {
    expect(getErrorMessage(new Error("Network down"))).toBe("Network down");
  });

  it("returns generic message for unknown errors", () => {
    expect(getErrorMessage("oops")).toBe("Something went wrong");
  });
});
