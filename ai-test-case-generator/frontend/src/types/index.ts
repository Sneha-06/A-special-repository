export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  timestamp: string;
}

export interface AppUser {
  name: string;
  role: string;
  email: string;
}

export type {
  DashboardMetrics,
  DashboardResponse,
  CategoryChartPoint,
  PriorityChartPoint,
  TimelineChartPoint,
  RecentActivityItem,
} from "./dashboard";
