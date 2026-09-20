import type { Request, Response } from "express";
import { runCodeReview } from "../services/ai/codeReviewService";
import { getReviewById, listReviewHistory } from "../services/reviews/reviewHistoryService";
import { saveCodeReview } from "../services/reviews/reviewPersistenceService";
import { HttpError } from "../utils/httpError";
import type { CreateReviewBody } from "../validators/reviewSchemas";

export async function createReview(req: Request, res: Response) {
  const body = req.body as CreateReviewBody;

  if (!body.code?.trim()) {
    throw new HttpError(400, "Code cannot be empty. Paste source code before requesting a review.");
  }

  const review = await runCodeReview(body);
  const saved = await saveCodeReview({ review, input: body });

  res.status(200).json({ review, reviewId: saved.id });
}

export async function getHistory(req: Request, res: Response) {
  const result = await listReviewHistory({
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
    search: req.query.search as string | undefined,
    language: req.query.language as string | undefined,
    repository: req.query.repository as string | undefined,
    reviewType: req.query.reviewType as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
  });

  res.json(result);
}

export async function getReview(req: Request, res: Response) {
  const id = String(req.params.id);
  const review = await getReviewById(id);
  res.json({ review });
}
