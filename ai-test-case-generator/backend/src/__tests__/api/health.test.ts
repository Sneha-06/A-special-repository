import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../app";

describe("GET /api/health", () => {
  it("returns service health status", async () => {
    const app = createApp();
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      service: "ai-test-case-generator",
    });
    expect(response.body.timestamp).toBeDefined();
  });
});

describe("GET /api/unknown", () => {
  it("returns 404 for unknown routes", async () => {
    const app = createApp();
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Route not found");
  });
});
