import type { GenerationHistoryItem, GenerationHistoryListResponse, HistoryFilters } from "../types/history";
import { api } from "./api";

export async function fetchHistory(
  filters: HistoryFilters = {},
): Promise<GenerationHistoryListResponse> {
  const { data } = await api.get<GenerationHistoryListResponse>("/history", { params: filters });
  return data;
}

export async function fetchHistoryById(id: string): Promise<GenerationHistoryItem> {
  const { data } = await api.get<GenerationHistoryItem>(`/history/${id}`);
  return data;
}
