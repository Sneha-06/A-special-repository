import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { HttpError } from "../../utils/httpError";

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

const SORTABLE_FIELDS = new Set(["createdAt", "overallScore", "fileName", "language", "issueCount", "criticalCount", "highCount"]);

function formatReviewRow(review: {
  id: string;
  fileName: string | null;
  language: string;
  overallScore: number;
  issueCount: number;
  criticalCount: number;
  highCount: number;
  reviewTypes: string[];
  createdAt: Date;
  repository: { fullName: string; owner: string; name: string } | null;
}) {
  return {
    id: review.id,
    fileName: review.fileName ?? "Untitled",
    repository: review.repository?.fullName ?? "—",
    repositoryOwner: review.repository?.owner ?? null,
    repositoryName: review.repository?.name ?? null,
    language: review.language,
    overallScore: review.overallScore,
    issueCount: review.issueCount,
    criticalCount: review.criticalCount,
    highCount: review.highCount,
    reviewTypes: review.reviewTypes,
    createdAt: review.createdAt.toISOString(),
  };
}

export async function listReviewHistory(query: ReviewHistoryQuery) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));
  const sortBy = SORTABLE_FIELDS.has(query.sortBy ?? "") ? query.sortBy! : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const where: Prisma.CodeReviewWhereInput = {};

  if (query.search?.trim()) {
    const term = query.search.trim();
    where.OR = [
      { fileName: { contains: term, mode: "insensitive" } },
      { language: { contains: term, mode: "insensitive" } },
      { repository: { fullName: { contains: term, mode: "insensitive" } } },
    ];
  }

  if (query.language) {
    where.language = { equals: query.language, mode: "insensitive" };
  }

  if (query.repository?.trim()) {
    where.repository = {
      fullName: { contains: query.repository.trim(), mode: "insensitive" },
    };
  }

  if (query.reviewType?.trim()) {
    where.reviewTypes = { has: query.reviewType.trim() };
  }

  const orderBy: Prisma.CodeReviewOrderByWithRelationInput =
    sortBy === "fileName"
      ? { fileName: sortOrder }
      : sortBy === "language"
        ? { language: sortOrder }
        : sortBy === "overallScore"
          ? { overallScore: sortOrder }
          : sortBy === "issueCount"
            ? { issueCount: sortOrder }
            : sortBy === "criticalCount"
              ? { criticalCount: sortOrder }
              : sortBy === "highCount"
                ? { highCount: sortOrder }
                : { createdAt: sortOrder };

  const [total, reviews] = await Promise.all([
    prisma.codeReview.count({ where }),
    prisma.codeReview.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { repository: true },
    }),
  ]);

  return {
    items: reviews.map(formatReviewRow),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

export async function getReviewById(id: string) {
  const review = await prisma.codeReview.findUnique({
    where: { id },
    include: {
      repository: true,
      issues: { orderBy: [{ severity: "asc" }, { lineStart: "asc" }] },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!review) {
    throw new HttpError(404, "Review not found");
  }

  await prisma.reviewHistory.create({
    data: { reviewId: id, action: "viewed" },
  });

  const result = review.reviewResult as {
    summary: string;
    overallScore: number;
    issues: unknown[];
    strengths: string[];
    recommendations: string[];
  };

  return {
    id: review.id,
    fileName: review.fileName,
    language: review.language,
    framework: review.framework,
    reviewTypes: review.reviewTypes,
    overallScore: review.overallScore,
    issueCount: review.issueCount,
    criticalCount: review.criticalCount,
    highCount: review.highCount,
    mediumCount: review.mediumCount,
    lowCount: review.lowCount,
    summary: review.summary,
    createdAt: review.createdAt.toISOString(),
    repository: review.repository
      ? {
          id: review.repository.id,
          fullName: review.repository.fullName,
          owner: review.repository.owner,
          name: review.repository.name,
          htmlUrl: review.repository.htmlUrl,
        }
      : null,
    user: review.user,
    review: result,
    issues: review.issues.map((issue) => ({
      id: issue.issueId,
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      category: issue.category,
      lineStart: issue.lineStart,
      lineEnd: issue.lineEnd,
      suggestion: issue.suggestion ?? "",
      explanation: issue.explanation ?? "",
    })),
    strengths: result.strengths ?? [],
    recommendations: result.recommendations ?? [],
  };
}
