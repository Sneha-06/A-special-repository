export const REVIEW_TYPES = [
  { value: "general", label: "General" },
  { value: "bugs", label: "Bugs" },
  { value: "performance", label: "Performance" },
  { value: "security", label: "Security" },
  { value: "code-quality", label: "Code Quality" },
  { value: "react", label: "React" },
  { value: "accessibility", label: "Accessibility" },
] as const;

export type ReviewType = (typeof REVIEW_TYPES)[number]["value"];

export type ReviewSeverity = "critical" | "high" | "medium" | "low" | "info";
export type ReviewCategory =
  | "bug"
  | "security"
  | "performance"
  | "code-quality"
  | "react"
  | "accessibility"
  | "maintainability";

export interface ReviewIssue {
  id: string;
  title: string;
  description: string;
  severity: ReviewSeverity;
  category: ReviewCategory;
  lineStart?: number | null;
  lineEnd?: number | null;
  suggestion: string;
  explanation: string;
}

export interface CodeReviewResult {
  summary: string;
  overallScore: number;
  issues: ReviewIssue[];
  strengths: string[];
  recommendations: string[];
}

export interface CreateReviewRequest {
  code: string;
  language: string;
  framework: string;
  fileName?: string;
  reviewType?: ReviewType | ReviewType[];
  projectContext?: string;
}

export interface IssueCounts {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export function countIssuesBySeverity(issues: ReviewIssue[]): IssueCounts {
  const counts: IssueCounts = { total: issues.length, critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const issue of issues) {
    counts[issue.severity]++;
  }
  return counts;
}

export interface ReviewHistoryItem {
  id: string;
  fileName: string;
  repository: string;
  repositoryOwner: string | null;
  repositoryName: string | null;
  language: string;
  overallScore: number;
  issueCount: number;
  criticalCount: number;
  highCount: number;
  reviewTypes: string[];
  createdAt: string;
}

export interface ReviewHistoryResponse {
  items: ReviewHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ReviewHistoryQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  language?: string;
  repository?: string;
  reviewType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ReviewDetail {
  id: string;
  fileName: string | null;
  language: string;
  framework: string | null;
  reviewTypes: string[];
  overallScore: number;
  issueCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  summary: string;
  createdAt: string;
  repository: {
    id: string;
    fullName: string;
    owner: string;
    name: string;
    htmlUrl: string | null;
  } | null;
  review: CodeReviewResult;
  issues: ReviewIssue[];
  strengths: string[];
  recommendations: string[];
}

export interface ReviewDashboardStats {
  totalReviews: number;
  averageScore: number;
  criticalIssues: number;
  highIssues: number;
  reviewsThisMonth: number;
  reviewsOverTime: Array<{ date: string; count: number }>;
  issuesBySeverity: Array<{ severity: string; count: number }>;
  issuesByCategory: Array<{ category: string; count: number }>;
  averageScoreOverTime: Array<{ date: string; score: number | null }>;
  recentReviews: Array<{
    id: string;
    fileName: string;
    repository: string;
    overallScore: number;
    issueCount: number;
    criticalCount: number;
    highCount: number;
    createdAt: string;
  }>;
}
