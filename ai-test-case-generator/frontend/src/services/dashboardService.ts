import type { DashboardResponse } from "../types/dashboard";
import { api } from "./api";

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
}
