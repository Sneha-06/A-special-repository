import { prisma } from "../../utils/prisma";

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getReviewDashboardStats() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalReviews,
    scoreAgg,
    criticalSum,
    highSum,
    reviewsThisMonth,
    recentReviews,
    reviewsInRange,
    issuesBySeverity,
    issuesByCategory,
  ] = await Promise.all([
    prisma.codeReview.count(),
    prisma.codeReview.aggregate({ _avg: { overallScore: true } }),
    prisma.codeReview.aggregate({ _sum: { criticalCount: true } }),
    prisma.codeReview.aggregate({ _sum: { highCount: true } }),
    prisma.codeReview.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.codeReview.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { repository: true },
    }),
    prisma.codeReview.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, overallScore: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.reviewIssue.groupBy({
      by: ["severity"],
      _count: { _all: true },
      orderBy: { severity: "asc" },
    }),
    prisma.reviewIssue.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { _count: { category: "desc" } },
    }),
  ]);

  const reviewsByDate = new Map<string, number>();
  const scoreByDate = new Map<string, { total: number; count: number }>();

  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    reviewsByDate.set(formatDateKey(d), 0);
    scoreByDate.set(formatDateKey(d), { total: 0, count: 0 });
  }

  for (const review of reviewsInRange) {
    const key = formatDateKey(review.createdAt);
    reviewsByDate.set(key, (reviewsByDate.get(key) ?? 0) + 1);
    const bucket = scoreByDate.get(key) ?? { total: 0, count: 0 };
    bucket.total += review.overallScore;
    bucket.count += 1;
    scoreByDate.set(key, bucket);
  }

  const reviewsOverTime = Array.from(reviewsByDate.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  const averageScoreOverTime = Array.from(scoreByDate.entries()).map(([date, bucket]) => ({
    date,
    score: bucket.count > 0 ? Math.round((bucket.total / bucket.count) * 10) / 10 : null,
  }));

  return {
    totalReviews,
    averageScore: Math.round((scoreAgg._avg.overallScore ?? 0) * 10) / 10,
    criticalIssues: criticalSum._sum.criticalCount ?? 0,
    highIssues: highSum._sum.highCount ?? 0,
    reviewsThisMonth,
    reviewsOverTime,
    issuesBySeverity: issuesBySeverity.map((row) => ({
      severity: row.severity,
      count: row._count._all,
    })),
    issuesByCategory: issuesByCategory.map((row) => ({
      category: row.category,
      count: row._count._all,
    })),
    averageScoreOverTime,
    recentReviews: recentReviews.map((review) => ({
      id: review.id,
      fileName: review.fileName ?? "Untitled",
      repository: review.repository?.fullName ?? "—",
      overallScore: review.overallScore,
      issueCount: review.issueCount,
      criticalCount: review.criticalCount,
      highCount: review.highCount,
      createdAt: review.createdAt.toISOString(),
    })),
  };
}
