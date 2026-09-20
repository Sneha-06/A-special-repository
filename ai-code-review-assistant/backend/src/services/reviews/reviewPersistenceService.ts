import type { CodeReviewResponse, CreateReviewBody } from "../../validators/reviewSchemas";
import { prisma } from "../../utils/prisma";

interface SaveReviewOptions {
  review: CodeReviewResponse;
  input: CreateReviewBody;
  userId?: string;
  repository?: { owner: string; name: string; fullName?: string; language?: string | null; htmlUrl?: string };
}

function countBySeverity(issues: CodeReviewResponse["issues"]) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const issue of issues) {
    if (issue.severity in counts) {
      counts[issue.severity as keyof typeof counts]++;
    }
  }
  return counts;
}

async function upsertGitHubRepository(repo: NonNullable<SaveReviewOptions["repository"]>) {
  const fullName = repo.fullName ?? `${repo.owner}/${repo.name}`;
  return prisma.gitHubRepository.upsert({
    where: { owner_name: { owner: repo.owner, name: repo.name } },
    create: {
      owner: repo.owner,
      name: repo.name,
      fullName,
      language: repo.language ?? null,
      htmlUrl: repo.htmlUrl ?? null,
    },
    update: {
      fullName,
      language: repo.language ?? undefined,
      htmlUrl: repo.htmlUrl ?? undefined,
    },
  });
}

export async function saveCodeReview({ review, input, userId, repository }: SaveReviewOptions) {
  const severityCounts = countBySeverity(review.issues);
  const repositoryId = repository ? (await upsertGitHubRepository(repository)).id : null;

  const saved = await prisma.codeReview.create({
    data: {
      userId: userId ?? null,
      repositoryId,
      fileName: input.fileName ?? null,
      language: input.language,
      framework: input.framework,
      reviewTypes: input.reviewTypes,
      overallScore: review.overallScore,
      issueCount: review.issues.length,
      criticalCount: severityCounts.critical,
      highCount: severityCounts.high,
      mediumCount: severityCounts.medium,
      lowCount: severityCounts.low,
      summary: review.summary,
      reviewResult: review,
      issues: {
        create: review.issues.map((issue) => ({
          issueId: issue.id,
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
          category: issue.category,
          lineStart: issue.lineStart ?? null,
          lineEnd: issue.lineEnd ?? null,
          suggestion: issue.suggestion ?? null,
          explanation: issue.explanation ?? null,
        })),
      },
      history: {
        create: { action: "created", metadata: { source: repository ? "github" : "workspace" } },
      },
    },
    include: {
      repository: true,
      issues: true,
    },
  });

  return saved;
}
