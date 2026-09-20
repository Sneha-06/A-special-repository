import type {
  AnalyzeResponse,
  Requirement,
  RequirementFormValues,
} from "../types/requirement";
import { api } from "./api";

export async function fetchRequirements(): Promise<Requirement[]> {
  const { data } = await api.get<Requirement[]>("/requirements");
  return data;
}

export async function fetchRequirement(id: string): Promise<Requirement> {
  const { data } = await api.get<Requirement>(`/requirements/${id}`);
  return data;
}

export async function createRequirement(
  payload: RequirementFormValues,
): Promise<Requirement> {
  const { data } = await api.post<Requirement>("/requirements", payload);
  return data;
}

export async function updateRequirement(
  id: string,
  payload: Partial<RequirementFormValues>,
): Promise<Requirement> {
  const { data } = await api.put<Requirement>(`/requirements/${id}`, payload);
  return data;
}

export async function deleteRequirement(id: string): Promise<void> {
  await api.delete(`/requirements/${id}`);
}

export async function analyzeRequirement(id: string): Promise<AnalyzeResponse> {
  const { data } = await api.post<AnalyzeResponse>(`/requirements/${id}/analyze`);
  return data;
}
