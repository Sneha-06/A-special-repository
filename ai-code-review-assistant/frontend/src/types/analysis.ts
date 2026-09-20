export const ANALYSIS_TYPES = [
  { value: "CODE_REVIEW", label: "Code Review", description: "Full code review with actionable findings" },
  { value: "EXPLANATION", label: "Explanation", description: "Understand what the code does" },
  { value: "REFACTORING", label: "Refactoring", description: "Improve structure and readability" },
  { value: "BUG_DETECTION", label: "Bug Detection", description: "Find logic errors and edge cases" },
  { value: "PERFORMANCE", label: "Performance", description: "Analyze performance bottlenecks" },
  { value: "SECURITY", label: "Security", description: "Identify security vulnerabilities" },
  { value: "REACT_ANALYSIS", label: "React Analysis", description: "React-specific patterns and issues" },
  { value: "ACCESSIBILITY", label: "Accessibility", description: "WCAG and a11y compliance" },
  { value: "UNIT_TESTS", label: "Unit Tests", description: "Generate unit test code" },
  { value: "DOCUMENTATION", label: "Documentation", description: "Generate technical documentation" },
] as const;

export type AnalysisType = (typeof ANALYSIS_TYPES)[number]["value"];

export type FindingSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type FindingCategory =
  | "BUG" | "SECURITY" | "PERFORMANCE" | "STYLE" | "ACCESSIBILITY"
  | "REACT" | "MAINTAINABILITY" | "TESTING" | "DOCUMENTATION" | "OTHER";

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  category: FindingCategory;
  lineStart?: number | null;
  lineEnd?: number | null;
  suggestion?: string | null;
}

export interface CodeSession {
  id: string;
  title: string;
  filePath?: string | null;
  language: string;
  sourceCode: string;
  analysisType: AnalysisType;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  summary?: string | null;
  improvedCode?: string | null;
  documentation?: string | null;
  unitTests?: string | null;
  createdAt: string;
  findings: Finding[];
}

export interface AnalyzeRequest {
  sourceCode: string;
  language: string;
  filePath?: string;
  title?: string;
  analysisType: AnalysisType;
  context?: string;
}

export interface AnalyzeResponse {
  session: CodeSession;
  metrics: { lines: number; characters: number; functions: number; complexityEstimate: number };
  aiResult: {
    summary: string;
    findings: Finding[];
    improvedCode?: string | null;
    documentation?: string | null;
    unitTests?: string | null;
    explanation?: string | null;
    metrics?: {
      qualityScore?: number;
      securityScore?: number;
      performanceScore?: number;
      accessibilityScore?: number;
    };
  };
}

export interface DashboardStats {
  totalSessions: number;
  completed: number;
  failed: number;
  findingsBySeverity: Array<{ severity: string; count: number }>;
  sessionsByType: Array<{ type: string; count: number }>;
  recentSessions: Array<{
    id: string;
    title: string;
    analysisType: string;
    status: string;
    createdAt: string;
    language: string;
  }>;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string };
  created_at: string;
  updated_at: string;
}
