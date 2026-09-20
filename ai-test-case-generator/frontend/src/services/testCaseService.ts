import type {
  GenerateTestCasesRequest,
  GenerationProgressEvent,
  TestCase,
  UpdateTestCasePayload,
} from "../types/testCase";
import { api } from "./api";
import { postSse } from "./sseClient";

export async function fetchTestCases(requirementId?: string): Promise<TestCase[]> {
  const params = requirementId ? { requirementId } : undefined;
  const { data } = await api.get<TestCase[]>("/test-cases", { params });
  return data;
}

export async function fetchTestCase(id: string): Promise<TestCase> {
  const { data } = await api.get<TestCase>(`/test-cases/${id}`);
  return data;
}

export async function updateTestCase(
  id: string,
  payload: UpdateTestCasePayload,
): Promise<TestCase> {
  const { data } = await api.put<TestCase>(`/test-cases/${id}`, payload);
  return data;
}

export async function deleteTestCase(id: string): Promise<void> {
  await api.delete(`/test-cases/${id}`);
}

export async function duplicateTestCase(id: string): Promise<TestCase> {
  const { data } = await api.post<TestCase>(`/test-cases/${id}/duplicate`);
  return data;
}

export async function generateTestCases(
  payload: GenerateTestCasesRequest,
  onProgress: (event: GenerationProgressEvent) => void,
): Promise<TestCase[]> {
  const result = await postSse<{ testCases: TestCase[] }>(
    "/test-cases/generate",
    payload,
    {
      onStage: (data) => onProgress({ stage: data.stage as GenerationProgressEvent["stage"], message: data.message }),
    },
  );
  return result.testCases;
}

export async function regenerateTestCase(
  id: string,
  onProgress: (event: GenerationProgressEvent) => void,
): Promise<TestCase> {
  const result = await postSse<{ testCases: TestCase[] }>(
    `/test-cases/${id}/regenerate`,
    {},
    {
      onStage: (data) => onProgress({ stage: data.stage as GenerationProgressEvent["stage"], message: data.message }),
    },
  );
  return result.testCases[0];
}
