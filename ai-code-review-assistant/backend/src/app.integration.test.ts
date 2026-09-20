import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { sampleExplanationResponse, sampleRefactorResponse, sampleReviewResponse, sampleTestGeneratorResponse } from "./test/fixtures";

const mockRunCodeReview = vi.fn();
const mockRunCodeRefactor = vi.fn();
const mockRunCodeExplanation = vi.fn();
const mockRunTestGeneration = vi.fn();
const mockSaveCodeReview = vi.fn();
const mockListReviewHistory = vi.fn();
const mockGetReviewById = vi.fn();
const mockGetDashboard = vi.fn();

vi.mock("./services/ai/codeReviewService", () => ({
  runCodeReview: (...args: unknown[]) => mockRunCodeReview(...args),
}));
vi.mock("./services/ai/refactorService", () => ({
  runCodeRefactor: (...args: unknown[]) => mockRunCodeRefactor(...args),
}));
vi.mock("./services/ai/codeExplanationService", () => ({
  runCodeExplanation: (...args: unknown[]) => mockRunCodeExplanation(...args),
}));
vi.mock("./services/ai/testGeneratorService", () => ({
  runTestGeneration: (...args: unknown[]) => mockRunTestGeneration(...args),
}));
vi.mock("./services/reviews/reviewPersistenceService", () => ({
  saveCodeReview: (...args: unknown[]) => mockSaveCodeReview(...args),
}));
vi.mock("./services/reviews/reviewHistoryService", () => ({
  listReviewHistory: (...args: unknown[]) => mockListReviewHistory(...args),
  getReviewById: (...args: unknown[]) => mockGetReviewById(...args),
}));
vi.mock("./services/reviews/dashboardService", () => ({
  getReviewDashboardStats: (...args: unknown[]) => mockGetDashboard(...args),
}));

import { createApp } from "./app";

describe("API integration", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRunCodeReview.mockResolvedValue(sampleReviewResponse);
    mockRunCodeRefactor.mockResolvedValue(sampleRefactorResponse);
    mockRunCodeExplanation.mockResolvedValue(sampleExplanationResponse);
    mockRunTestGeneration.mockResolvedValue(sampleTestGeneratorResponse);
    mockSaveCodeReview.mockResolvedValue({ id: "review-1" });
    mockListReviewHistory.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10, pageCount: 0 });
    mockGetReviewById.mockResolvedValue({ id: "review-1", review: sampleReviewResponse });
    mockGetDashboard.mockResolvedValue({ totalReviews: 0, averageScore: 0, criticalIssues: 0, highIssues: 0, reviewsThisMonth: 0, reviewsOverTime: [], issuesBySeverity: [], issuesByCategory: [], averageScoreOverTime: [], recentReviews: [] });
  });

  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  describe("POST /api/reviews", () => {
    it("returns review and persists result", async () => {
      const res = await request(app).post("/api/reviews").send({
        code: "const x = 1;",
        language: "typescript",
        framework: "node",
      });

      expect(res.status).toBe(200);
      expect(res.body.review.overallScore).toBe(80);
      expect(res.body.reviewId).toBe("review-1");
      expect(mockRunCodeReview).toHaveBeenCalledOnce();
      expect(mockSaveCodeReview).toHaveBeenCalledOnce();
    });

    it("rejects empty code", async () => {
      const res = await request(app).post("/api/reviews").send({
        code: "",
        language: "typescript",
        framework: "node",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    });

    it("rejects unsupported language", async () => {
      const res = await request(app).post("/api/reviews").send({
        code: "print('hi')",
        language: "cobol",
        framework: "node",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/reviews/history", () => {
    it("returns paginated history", async () => {
      const res = await request(app).get("/api/reviews/history?page=1&pageSize=10");
      expect(res.status).toBe(200);
      expect(mockListReviewHistory).toHaveBeenCalled();
    });
  });

  describe("POST /api/refactor", () => {
    it("returns refactored code", async () => {
      const res = await request(app).post("/api/refactor").send({
        code: "function add(a,b){return a+b}",
        language: "typescript",
        framework: "node",
      });

      expect(res.status).toBe(200);
      expect(res.body.refactor.improvedCode).toContain("add");
      expect(mockRunCodeRefactor).toHaveBeenCalledOnce();
    });

    it("rejects missing framework", async () => {
      const res = await request(app).post("/api/refactor").send({
        code: "const x = 1",
        language: "typescript",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/explain", () => {
    it("returns explanation", async () => {
      const res = await request(app).post("/api/explain").send({
        code: "function add(a,b){return a+b}",
        language: "typescript",
      });

      expect(res.status).toBe(200);
      expect(res.body.explanation.summary).toBeTruthy();
      expect(mockRunCodeExplanation).toHaveBeenCalledOnce();
    });
  });

  describe("POST /api/tests/generate", () => {
    it("returns generated tests", async () => {
      const res = await request(app).post("/api/tests/generate").send({
        code: "export const add = (a,b) => a+b;",
        language: "typescript",
        framework: "typescript",
        testingFramework: "vitest",
      });

      expect(res.status).toBe(200);
      expect(res.body.code).toContain("vitest");
      expect(mockRunTestGeneration).toHaveBeenCalledOnce();
    });
  });

  describe("GET /api/dashboard", () => {
    it("returns dashboard stats", async () => {
      const res = await request(app).get("/api/dashboard");
      expect(res.status).toBe(200);
      expect(res.body.totalReviews).toBe(0);
    });
  });
});
