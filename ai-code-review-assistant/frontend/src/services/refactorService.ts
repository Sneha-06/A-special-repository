import type { CreateRefactorRequest, RefactorResult } from "../types/refactor";
import { api } from "./api";

export async function createRefactor(payload: CreateRefactorRequest): Promise<RefactorResult> {
  if (!payload.code.trim()) {
    throw new Error("Please paste code before requesting improvements.");
  }

  const { data } = await api.post<{ refactor: RefactorResult }>("/refactor", payload);
  return data.refactor;
}
