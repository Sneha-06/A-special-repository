import type { AiResponse, Paginated, Rule } from "../types";
import { api } from "./api";

export async function fetchRules(params: Record<string, string | number | undefined>) {
  const { data } = await api.get<Paginated<Rule>>("/rules", { params });
  return data;
}

export async function fetchRule(id: string) {
  const { data } = await api.get<Rule>(`/rules/${id}`);
  return data;
}

export async function compareRules(leftRuleId: string, rightRuleId: string) {
  const { data } = await api.post<{
    left: Rule;
    right: Rule;
    differences: Array<{ field: string; left: string; right: string; differs: boolean }>;
    aiSummary: AiResponse;
    provider: string;
  }>("/rules/compare", { leftRuleId, rightRuleId });
  return data;
}
