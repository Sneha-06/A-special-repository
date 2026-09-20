import type { HealthResponse } from "../types";
import { api } from "./api";

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/health");
  return data;
}
