import type { AiResponse, Claim, Paginated } from "../types";
import { api } from "./api";

export async function fetchClaims(params: Record<string, string | number | undefined>) {
  const { data } = await api.get<Paginated<Claim>>("/claims", { params });
  return data;
}

export async function fetchClaim(id: string) {
  const { data } = await api.get<Claim>(`/claims/${id}`);
  return data;
}

export async function analyzeClaim(id: string) {
  const { data } = await api.post<{
    claim: Claim;
    analysis: AiResponse;
    provider: string;
  }>(`/claims/${id}/analyze`);
  return data;
}
