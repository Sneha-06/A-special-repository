import type { CodeExplanation, ExplainCodeRequest } from "../types/explanation";
import { api } from "./api";

export async function explainCode(payload: ExplainCodeRequest): Promise<CodeExplanation> {
  if (!payload.code.trim()) {
    throw new Error("Please paste code before requesting an explanation.");
  }
  const { data } = await api.post<{ explanation: CodeExplanation }>("/explain", payload);
  return data.explanation;
}
