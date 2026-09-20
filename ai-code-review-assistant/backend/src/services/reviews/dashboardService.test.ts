import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    codeReview: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    reviewIssue: {
      groupBy: vi.fn(),
    },
  },
}));

vi.mock("../../utils/prisma", () => ({ prisma: mockPrisma }));

import { getReviewDashboardStats } from "./dashboardService";

describe("getReviewDashboardStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.codeReview.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    mockPrisma.codeReview.aggregate
      .mockResolvedValueOnce({ _avg: { overallScore: 75 } })
      .mockResolvedValueOnce({ _sum: { criticalCount: 2 } })
      .mockResolvedValueOnce({ _sum: { highCount: 4 } });
    mockPrisma.codeReview.findMany
      .mockResolvedValueOnce([
        {
          id: "r1",
          fileName: "a.ts",
          overallScore: 80,
          issueCount: 1,
          criticalCount: 0,
          highCount: 1,
          createdAt: new Date(),
          repository: { fullName: "org/repo" },
        },
      ])
      .mockResolvedValueOnce([
        { createdAt: new Date(), overallScore: 80 },
      ]);
    mockPrisma.reviewIssue.groupBy
      .mockResolvedValueOnce([{ severity: "high", _count: { _all: 4 } }])
      .mockResolvedValueOnce([{ category: "bug", _count: { _all: 3 } }]);
  });

  it("returns aggregated dashboard metrics", async () => {
    const stats = await getReviewDashboardStats();

    expect(stats.totalReviews).toBe(3);
    expect(stats.averageScore).toBe(75);
    expect(stats.criticalIssues).toBe(2);
    expect(stats.highIssues).toBe(4);
    expect(stats.reviewsThisMonth).toBe(2);
    expect(stats.recentReviews).toHaveLength(1);
    expect(stats.reviewsOverTime.length).toBeGreaterThanOrEqual(29);
    expect(stats.issuesBySeverity[0]).toEqual({ severity: "high", count: 4 });
  });
});
