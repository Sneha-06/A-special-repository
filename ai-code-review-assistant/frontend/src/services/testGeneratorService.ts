import type { GenerateTestsRequest, TestGeneratorResult } from "../types/testGenerator";
import { api } from "./api";

export async function generateTests(payload: GenerateTestsRequest): Promise<TestGeneratorResult> {
  if (!payload.code.trim()) {
    throw new Error("Please paste code before generating tests.");
  }
  const { data } = await api.post<TestGeneratorResult>("/tests/generate", payload);
  return data;
}
