import type { AnalyzeRequest, AnalyzeResponse, CodeSession, DashboardStats } from "../types/analysis";
import { api } from "./api";

export async function analyzeCode(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
  const { data } = await api.post<AnalyzeResponse>("/analysis/analyze", payload);
  return data;
}

export async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/analysis/dashboard");
  return data;
}

export async function fetchHistory(): Promise<CodeSession[]> {
  const { data } = await api.get<{ sessions: CodeSession[] }>("/analysis/history");
  return data.sessions;
}

export async function fetchSession(id: string): Promise<CodeSession> {
  const { data } = await api.get<{ session: CodeSession }>(`/analysis/sessions/${id}`);
  return data.session;
}
