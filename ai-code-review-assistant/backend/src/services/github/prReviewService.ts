import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";
import { HttpError } from "../../utils/httpError";
import { prReviewResponseSchema, type PrReviewResponse } from "../../validators/githubSchemas";
import {
  getFileContent,
  getPullRequest,
  getPullRequestFiles,
  isAllowedSourceFile,
} from "./githubService";

const SYSTEM_PROMPT = `You are a senior engineer reviewing a GitHub pull request.

Analyze the changed code and produce a structured review. Do NOT invent issues unsupported by the code.

Return ONLY valid JSON:
{
  "summary": "executive PR summary",
  "bugs": ["bug findings as strings"],
  "security": ["security concerns"],
  "performance": ["performance concerns"],
  "maintainability": ["maintainability issues"],
  "recommendations": ["actionable recommendations"],
  "proposedComments": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "body": "Suggested review comment for the author",
      "severity": "high",
      "category": "bug"
    }
  ]
}

proposedComments are review comments to show the developer — do NOT assume they will be posted to GitHub.`;

const RETRY_SUFFIX = `\n\nReturn ONLY valid JSON matching the schema.`;

async function loadPrSourceCode(
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<{ sourceCode: string; files: Array<{ filename: string; additions: number; deletions: number; status: string }> }> {
  const [pr, files] = await Promise.all([
    getPullRequest(owner, repo, pullNumber),
    getPullRequestFiles(owner, repo, pullNumber),
  ]);

  const codeFiles = files.filter((f) => isAllowedSourceFile(f.filename));

  if (codeFiles.length === 0) {
    throw new HttpError(400, "No analyzable source files found in this pull request");
  }

  const parts = await Promise.all(
    codeFiles.slice(0, 8).map(async (file) => {
      try {
        const content = await getFileContent(owner, repo, file.filename, pr.head.ref);
        return `// File: ${file.filename} (+${file.additions}/-${file.deletions})\n${content}`;
      } catch {
        return file.patch
          ? `// File: ${file.filename} (patch only, +${file.additions}/-${file.deletions})\n${file.patch}`
          : null;
      }
    }),
  );

  const sourceCode = parts.filter(Boolean).join("\n\n// ---\n\n");
  if (!sourceCode) {
    throw new HttpError(400, "Could not load pull request file contents for review");
  }

  return {
    sourceCode,
    files: codeFiles.map((f) => ({
      filename: f.filename,
      additions: f.additions,
      deletions: f.deletions,
      status: f.status,
    })),
  };
}

async function callAndValidate(userPrompt: string): Promise<PrReviewResponse> {
  const raw = await callOpenAiJson(SYSTEM_PROMPT, userPrompt);
  const parsed = extractJsonFromAi(raw);
  const result = prReviewResponseSchema.safeParse(parsed);
  if (!result.success) throw result.error;
  return result.data;
}

export async function runPullRequestReview(owner: string, repo: string, pullNumber: number) {
  const pr = await getPullRequest(owner, repo, pullNumber);
  const { sourceCode, files } = await loadPrSourceCode(owner, repo, pullNumber);

  const userPrompt = [
    `Repository: ${owner}/${repo}`,
    `PR #${pullNumber}: ${pr.title}`,
    `Author: ${pr.user.login}`,
    `Base: ${pr.base.ref} → Head: ${pr.head.ref}`,
    `Changed files (${files.length}):`,
    files.map((f) => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join("\n"),
    `\nCode to review:\n${sourceCode}`,
  ].join("\n");

  try {
    const review = await callAndValidate(userPrompt);
    return { pullRequest: pr, files, review };
  } catch (firstError) {
    try {
      const review = await callAndValidate(userPrompt + RETRY_SUFFIX);
      return { pullRequest: pr, files, review };
    } catch {
      throw new HttpError(502, "AI returned an invalid PR review response after retry", {
        reason: firstError instanceof Error ? firstError.message : "validation failed",
      });
    }
  }
}
