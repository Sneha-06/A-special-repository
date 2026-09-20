import { env } from "../../utils/env";
import { HttpError } from "../../utils/httpError";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
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
  patch?: string;
  additions: number;
  deletions: number;
  changes: number;
}

const ALLOWED_EXTENSIONS = /\.(ts|tsx|js|jsx|py|java|go)$/i;

export function isAllowedSourceFile(path: string): boolean {
  return ALLOWED_EXTENSIONS.test(path);
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function githubFetch<T>(path: string): Promise<T> {
  if (!env.githubToken) {
    throw new HttpError(
      503,
      "GitHub is not connected. Configure GITHUB_TOKEN in the server environment.",
    );
  }

  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${env.githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (response.status === 401) {
    throw new HttpError(401, "GitHub token is invalid or expired. Update GITHUB_TOKEN on the server.");
  }

  if (response.status === 403) {
    const body = await response.text();
    if (body.includes("rate limit") || response.headers.get("x-ratelimit-remaining") === "0") {
      const reset = response.headers.get("x-ratelimit-reset");
      throw new HttpError(429, "GitHub API rate limit exceeded. Please try again later.", { reset });
    }
    throw new HttpError(403, "GitHub API access forbidden. Check token permissions.");
  }

  if (response.status === 429) {
    throw new HttpError(429, "GitHub API rate limit exceeded. Please try again later.");
  }

  if (!response.ok) {
    const body = await response.text();
    throw new HttpError(response.status === 404 ? 404 : 502, "GitHub API request failed", {
      status: response.status,
      body: body.slice(0, 500),
    });
  }

  return response.json() as Promise<T>;
}

export async function getAuthenticatedUser(): Promise<GitHubUser> {
  return githubFetch<GitHubUser>("/user");
}

export async function getConnectionStatus() {
  if (!env.githubToken) {
    return { connected: false, user: null };
  }
  try {
    const user = await getAuthenticatedUser();
    return {
      connected: true,
      user: {
        login: user.login,
        name: user.name,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
      },
    };
  } catch (error) {
    if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
      return { connected: false, user: null, error: error.message };
    }
    throw error;
  }
}

export async function listRepositories(page = 1, perPage = 50) {
  return githubFetch<GitHubRepo[]>(
    `/user/repos?sort=updated&per_page=${perPage}&page=${page}&affiliation=owner,collaborator,organization_member`,
  );
}

export async function listBranches(owner: string, repo: string) {
  return githubFetch<GitHubBranch[]>(`/repos/${owner}/${repo}/branches?per_page=100`);
}

export async function listFiles(owner: string, repo: string, path = "", ref?: string) {
  const encoded = path ? `/${encodePath(path)}` : "";
  const refParam = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const result = await githubFetch<GitHubFileItem[] | GitHubFileItem>(
    `/repos/${owner}/${repo}/contents${encoded}${refParam}`,
  );
  const items = Array.isArray(result) ? result : [result];
  return items
    .map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: item.sha,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
): Promise<GitHubFileContent> {
  const refParam = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const item = await githubFetch<{ path: string; content: string; encoding: string; size: number }>(
    `/repos/${owner}/${repo}/contents/${encodePath(path)}${refParam}`,
  );

  const content =
    item.encoding === "base64"
      ? Buffer.from(item.content.replace(/\n/g, ""), "base64").toString("utf-8")
      : item.content;

  return { path: item.path, content, encoding: item.encoding, size: item.size };
}

export async function listPullRequests(owner: string, repo: string, state = "open") {
  return githubFetch<GitHubPullRequest[]>(
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=30`,
  );
}

export async function getPullRequest(owner: string, repo: string, number: number) {
  return githubFetch<GitHubPullRequest & { body: string | null; head: { ref: string }; base: { ref: string } }>(
    `/repos/${owner}/${repo}/pulls/${number}`,
  );
}

export async function getPullRequestFiles(owner: string, repo: string, pullNumber: number) {
  return githubFetch<GitHubPullRequestFile[]>(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`,
  );
}

// Legacy aliases
export const listUserRepos = listRepositories;
export const getRepoContents = listFiles;
export const getRepoPullRequests = listPullRequests;
