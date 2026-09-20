export interface DashboardMetrics {
  totalProjects: number;
  totalRequirements: number;
  totalTestCases: number;
  automationCandidates: number;
  testCoveragePercent: number;
}

export interface CategoryChartPoint {
  category: string;
  count: number;
}

export interface PriorityChartPoint {
  priority: string;
  count: number;
}

export interface TimelineChartPoint {
  date: string;
  count: number;
}

export interface RecentActivityItem {
  id: string;
  requirement: string;
  project: string;
  testCasesGenerated: number;
  date: string;
  status: string;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  testCasesByCategory: CategoryChartPoint[];
  testCasesByPriority: PriorityChartPoint[];
  requirementsAnalyzedOverTime: TimelineChartPoint[];
  recentActivity: RecentActivityItem[];
}
