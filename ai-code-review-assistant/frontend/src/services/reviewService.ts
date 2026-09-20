import type {
  CodeReviewResult,
  CreateReviewRequest,
  ReviewDashboardStats,
  ReviewDetail,
  ReviewHistoryQuery,
  ReviewHistoryResponse,
} from "../types/review";
import { api } from "./api";

export async function createReview(payload: CreateReviewRequest): Promise<{ review: CodeReviewResult; reviewId: string }> {
  if (!payload.code.trim()) {
    throw new Error("Please paste code before requesting a review.");
  }

  const { data } = await api.post<{ review: CodeReviewResult; reviewId: string }>("/reviews", payload);
  return data;
}

export async function fetchReviewHistory(query: ReviewHistoryQuery = {}): Promise<ReviewHistoryResponse> {
  const { data } = await api.get<ReviewHistoryResponse>("/reviews/history", { params: query });
  return data;
}

export async function fetchReviewById(id: string): Promise<ReviewDetail> {
  const { data } = await api.get<{ review: ReviewDetail }>(`/reviews/${id}`);
  return data.review;
}

export async function fetchReviewDashboard(): Promise<ReviewDashboardStats> {
  const { data } = await api.get<ReviewDashboardStats>("/dashboard");
  return data;
}
