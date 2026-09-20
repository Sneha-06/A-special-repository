import type { AcceptanceCriterion, AcceptanceCriterionInput } from "../types/acceptanceCriteria";
import { api } from "./api";

export async function fetchAcceptanceCriteria(
  requirementId: string,
): Promise<AcceptanceCriterion[]> {
  const { data } = await api.get<{ acceptanceCriteria: AcceptanceCriterion[] }>(
    "/acceptance-criteria",
    { params: { requirementId } },
  );
  return data.acceptanceCriteria;
}

export async function generateAcceptanceCriteria(
  requirementId: string,
  replaceExisting = false,
): Promise<AcceptanceCriterion[]> {
  const { data } = await api.post<{ acceptanceCriteria: AcceptanceCriterion[] }>(
    "/acceptance-criteria/generate",
    { requirementId, replaceExisting },
  );
  return data.acceptanceCriteria;
}

export async function createAcceptanceCriterion(
  requirementId: string,
  payload: AcceptanceCriterionInput,
): Promise<AcceptanceCriterion> {
  const { data } = await api.post<AcceptanceCriterion>("/acceptance-criteria", {
    requirementId,
    ...payload,
  });
  return data;
}

export async function updateAcceptanceCriterion(
  dbId: string,
  payload: Partial<AcceptanceCriterionInput>,
): Promise<AcceptanceCriterion> {
  const { data } = await api.put<AcceptanceCriterion>(
    `/acceptance-criteria/${dbId}`,
    payload,
  );
  return data;
}

export async function deleteAcceptanceCriterion(dbId: string): Promise<void> {
  await api.delete(`/acceptance-criteria/${dbId}`);
}
