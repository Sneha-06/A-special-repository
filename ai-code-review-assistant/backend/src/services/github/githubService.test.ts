import { beforeEach, describe, expect, it, vi } from "vitest";

const { envMock } = vi.hoisted(() => ({
  envMock: { githubToken: "test-token" },
}));

vi.mock("../../utils/env", () => ({ env: envMock }));

import { getConnectionStatus, isAllowedSourceFile, listRepositories } from "./githubService";

describe("githubService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    envMock.githubToken = "test-token";
  });

  describe("isAllowedSourceFile", () => {
    it("allows supported source extensions", () => {
      expect(isAllowedSourceFile("src/App.tsx")).toBe(true);
      expect(isAllowedSourceFile("main.py")).toBe(true);
      expect(isAllowedSourceFile("service.go")).toBe(true);
    });

    it("rejects unsupported extensions", () => {
      expect(isAllowedSourceFile("README.md")).toBe(false);
      expect(isAllowedSourceFile("image.png")).toBe(false);
    });
  });

  describe("getConnectionStatus", () => {
    it("returns disconnected when token is missing", async () => {
      envMock.githubToken = "";
      const status = await getConnectionStatus();
      expect(status.connected).toBe(false);
      expect(status.user).toBeNull();
    });

    it("returns user when GitHub API succeeds", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ login: "dev", name: "Dev", avatar_url: "https://a", html_url: "https://gh" }),
        headers: { get: () => null },
      }));

      const status = await getConnectionStatus();
      expect(status.connected).toBe(true);
      expect(status.user?.login).toBe("dev");
    });
  });

  describe("listRepositories", () => {
    it("maps rate limit errors to HttpError 429", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "rate limit exceeded",
        headers: { get: (key: string) => (key === "x-ratelimit-remaining" ? "0" : null) },
      }));

      await expect(listRepositories()).rejects.toMatchObject({ status: 429 });
    });
  });
});
