import type { Request, Response } from "express";
import { runCodeReview } from "../services/ai/codeReviewService";
import {
  getConnectionStatus,
  getFileContent,
  isAllowedSourceFile,
  listBranches,
  listFiles,
  listPullRequests,
  listRepositories,
} from "../services/github/githubService";
import { runPullRequestReview } from "../services/github/prReviewService";
import { saveCodeReview } from "../services/reviews/reviewPersistenceService";
import { HttpError } from "../utils/httpError";

function parseRepoParams(req: Request) {
  return { owner: String(req.params.owner), repo: String(req.params.repo) };
}

export async function status(_req: Request, res: Response) {
  const status = await getConnectionStatus();
  res.json(status);
}

export async function repositories(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const repos = await listRepositories(page);
  res.json({ repositories: repos });
}

/** @deprecated use repositories */
export async function repos(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const repos = await listRepositories(page);
  res.json({ repos });
}

export async function branches(req: Request, res: Response) {
  const { owner, repo } = parseRepoParams(req);
  const branchList = await listBranches(owner, repo);
  res.json({ branches: branchList });
}

export async function files(req: Request, res: Response) {
  const { owner, repo } = parseRepoParams(req);
  const path = (req.query.path as string) ?? "";
  const ref = req.query.ref as string | undefined;
  const items = await listFiles(owner, repo, path, ref);
  res.json({ files: items });
}

/** @deprecated use files */
export async function contents(req: Request, res: Response) {
  const { owner, repo } = parseRepoParams(req);
  const path = (req.query.path as string) ?? "";
  const ref = req.query.ref as string | undefined;
  const items = await listFiles(owner, repo, path, ref);
  res.json({ contents: items });
}

export async function file(req: Request, res: Response) {
  const { owner, repo } = parseRepoParams(req);
  const path = req.query.path as string;
  const ref = req.query.ref as string | undefined;

  if (!path) throw new HttpError(400, "Query parameter 'path' is required");

  if (!isAllowedSourceFile(path)) {
    throw new HttpError(400, "File type not supported. Allowed: .ts, .tsx, .js, .jsx, .py, .java, .go");
  }

  const fileContent = await getFileContent(owner, repo, path, ref);
  res.json({ file: fileContent });
}

export async function pulls(req: Request, res: Response) {
  const { owner, repo } = parseRepoParams(req);
  const state = (req.query.state as string) ?? "open";
  const pullList = await listPullRequests(owner, repo, state);
  res.json({ pulls: pullList });
}

export async function reviewFile(req: Request, res: Response) {
  const { owner, repo } = parseRepoParams(req);
  const path = req.body.path as string;
  const ref = req.body.ref as string | undefined;
  const reviewTypes = req.body.reviewTypes as string[] | undefined;

  if (!path) throw new HttpError(400, "path is required");
  if (!isAllowedSourceFile(path)) {
    throw new HttpError(400, "File type not supported for review");
  }

  const fileContent = await getFileContent(owner, repo, path, ref);
  const ext = path.split(".").pop()?.toLowerCase() ?? "typescript";
  const languageMap: Record<string, "typescript" | "tsx" | "javascript" | "jsx" | "python" | "java" | "go"> = {
    ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
    py: "python", java: "java", go: "go",
  };

  const types = (reviewTypes as ("general" | "bugs" | "security" | "performance")[]) ?? [
    "general", "bugs", "security",
  ];

  const reviewInput = {
    code: fileContent.content,
    language: languageMap[ext] ?? "typescript",
    framework: ["tsx", "jsx"].includes(ext) ? "react" : ext,
    fileName: path,
    reviewTypes: types,
  };

  const review = await runCodeReview(reviewInput);
  const saved = await saveCodeReview({
    review,
    input: reviewInput,
    repository: { owner, name: repo, fullName: `${owner}/${repo}` },
  });

  res.status(200).json({ file: { path, ref }, review, reviewId: saved.id });
}

export async function reviewPullRequest(req: Request, res: Response) {
  const { owner, repo } = parseRepoParams(req);
  const pullNumber = Number(req.params.number);
  const result = await runPullRequestReview(owner, repo, pullNumber);
  res.status(200).json(result);
}
