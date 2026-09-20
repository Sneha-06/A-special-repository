export interface GitHubConnectionStatus {
  connected: boolean;
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    profileUrl: string;
  } | null;
  error?: string;
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
  private: boolean;
  updated_at: string;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
  commit: { sha: string };
}

export interface GitHubFileItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  sha: string;
}

export interface GitHubFileContent {
  path: string;
  content: string;
  encoding: string;
  size: number;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url?: string };
  created_at: string;
  updated_at: string;
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

export interface GitHubPullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface ProposedReviewComment {
  file: string;
  line?: number | null;
  body: string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  category?: string;
}

export interface PrReviewResult {
  summary: string;
  bugs: string[];
  security: string[];
  performance: string[];
  maintainability: string[];
  recommendations: string[];
  proposedComments: ProposedReviewComment[];
}

export interface PrReviewResponse {
  pullRequest: GitHubPullRequest & { head?: { ref: string }; base?: { ref: string } };
  files: GitHubPullRequestFile[];
  review: PrReviewResult;
}

export const SOURCE_FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go"];

export function isSourceFile(path: string): boolean {
  return SOURCE_FILE_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext));
}

export function languageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
    py: "python", java: "java", go: "go",
  };
  return map[ext] ?? "typescript";
}
