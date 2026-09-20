import { GenerationType, TestCategory, TestPriority } from "@prisma/client";
import { prisma } from "../utils/prisma";

const CATEGORY_LABELS: Record<string, string> = {
  FUNCTIONAL: "Functional",
  NEGATIVE: "Negative",
  EDGE_CASE: "Edge",
  SECURITY: "Security",
  REGRESSION: "Regression",
  INTEGRATION: "Integration",
  SMOKE: "Smoke",
  PERFORMANCE: "Performance",
};

const PRIORITY_LABELS: Record<TestPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const CHART_CATEGORIES: TestCategory[] = [
  TestCategory.FUNCTIONAL,
  TestCategory.NEGATIVE,
  TestCategory.EDGE_CASE,
  TestCategory.SECURITY,
  TestCategory.REGRESSION,
];

export async function getDashboardData() {
  const [
    totalProjects,
    totalRequirements,
    totalTestCases,
    automationCandidates,
    requirementsWithTests,
    categoryGroups,
    priorityGroups,
    analyses,
    recentGenerations,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.requirement.count(),
    prisma.testCase.count(),
    prisma.testCase.count({ where: { automationCandidate: true } }),
    prisma.requirement.count({ where: { testCases: { some: {} } } }),
    prisma.testCase.groupBy({
      by: ["category"],
      _count: { category: true },
    }),
    prisma.testCase.groupBy({
      by: ["priority"],
      _count: { priority: true },
    }),
    prisma.requirementAnalysis.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.generationHistory.findMany({
      where: { generationType: GenerationType.TEST_CASES },
      include: {
        requirement: {
          select: {
            id: true,
            title: true,
            testCases: { select: { id: true } },
            project: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const categoryCountMap = new Map(
    categoryGroups.map((group) => [group.category, group._count.category]),
  );

  const testCasesByCategory = CHART_CATEGORIES.map((category) => ({
    category: CATEGORY_LABELS[category] ?? category,
    count: categoryCountMap.get(category) ?? 0,
  }));

  const priorityCountMap = new Map(
    priorityGroups.map((group) => [group.priority, group._count.priority]),
  );

  const testCasesByPriority = Object.values(TestPriority).map((priority) => ({
    priority: PRIORITY_LABELS[priority],
    count: priorityCountMap.get(priority) ?? 0,
  }));

  const analyzedByDate = new Map<string, number>();
  for (const analysis of analyses) {
    const dateKey = analysis.createdAt.toISOString().slice(0, 10);
    analyzedByDate.set(dateKey, (analyzedByDate.get(dateKey) ?? 0) + 1);
  }

  const requirementsAnalyzedOverTime = [...analyzedByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const testCoveragePercent =
    totalRequirements === 0
      ? 0
      : Math.round((requirementsWithTests / totalRequirements) * 100);

  const recentActivity = recentGenerations.map((entry) => ({
    id: entry.id,
    requirement: entry.requirement.title,
    project: entry.requirement.project.name,
    testCasesGenerated: entry.requirement.testCases.length,
    date: entry.createdAt.toISOString(),
    status: entry.status,
  }));

  return {
    metrics: {
      totalProjects,
      totalRequirements,
      totalTestCases,
      automationCandidates,
      testCoveragePercent,
    },
    testCasesByCategory,
    testCasesByPriority,
    requirementsAnalyzedOverTime,
    recentActivity,
  };
}
