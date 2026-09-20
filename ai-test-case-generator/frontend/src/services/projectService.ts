import type { ProjectSummary } from "../types/requirement";
import { api } from "./api";

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const { data } = await api.get<ProjectSummary[]>("/projects");
  return data;
}
