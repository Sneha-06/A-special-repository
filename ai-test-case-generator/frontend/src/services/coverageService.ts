import type { CoverageAnalysisResult } from "../types/coverage";
import { api } from "./api";

export async function analyzeCoverage(projectId: string): Promise<CoverageAnalysisResult> {
  const { data } = await api.post<CoverageAnalysisResult>("/coverage/analyze", { projectId });
  return data;
}
