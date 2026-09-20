import type {
  GitHubBranch,
  GitHubConnectionStatus,
  GitHubFileContent,
  GitHubFileItem,
  GitHubPullRequest,
  GitHubRepo,
  PrReviewResponse,
} from "../types/github";
import type { CodeReviewResult } from "../types/review";
import { api } from "./api";

export async function fetchGitHubStatus(): Promise<GitHubConnectionStatus> {
  const { data } = await api.get<GitHubConnectionStatus>("/github/status");
  return data;
}

export async function fetchRepositories(): Promise<GitHubRepo[]> {
  const { data } = await api.get<{ repositories: GitHubRepo[] }>("/github/repositories");
  return data.repositories;
}

/** @deprecated */
export async function fetchRepos(): Promise<GitHubRepo[]> {
  return fetchRepositories();
}

export async function fetchBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  const { data } = await api.get<{ branches: GitHubBranch[] }>(
    `/github/repositories/${owner}/${repo}/branches`,
  );
  return data.branches;
}

export async function fetchFiles(owner: string, repo: string, path = "", ref?: string): Promise<GitHubFileItem[]> {
  const { data } = await api.get<{ files: GitHubFileItem[] }>(
    `/github/repositories/${owner}/${repo}/files`,
    { params: { path, ref } },
  );
  return data.files;
}

export async function fetchFile(owner: string, repo: string, path: string, ref?: string): Promise<GitHubFileContent> {
  const { data } = await api.get<{ file: GitHubFileContent }>(
    `/github/repositories/${owner}/${repo}/file`,
    { params: { path, ref } },
  );
  return data.file;
}

export async function fetchPullRequests(owner: string, repo: string, state = "open"): Promise<GitHubPullRequest[]> {
  const { data } = await api.get<{ pulls: GitHubPullRequest[] }>(
    `/github/repositories/${owner}/${repo}/pulls`,
    { params: { state } },
  );
  return data.pulls;
}

export async function reviewFile(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
): Promise<{ file: { path: string; ref?: string }; review: CodeReviewResult }> {
  const { data } = await api.post(`/github/repositories/${owner}/${repo}/review-file`, { path, ref });
  return data;
}

export async function reviewPullRequest(owner: string, repo: string, number: number): Promise<PrReviewResponse> {
  const { data } = await api.post<PrReviewResponse>(
    `/github/repositories/${owner}/${repo}/pulls/${number}/review`,
  );
  return data;
}
