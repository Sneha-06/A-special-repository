import type { InsightsPayload } from "../types";
import { api } from "./api";

export async function fetchInsights() {
  const { data } = await api.get<InsightsPayload>("/insights");
  return data;
}
