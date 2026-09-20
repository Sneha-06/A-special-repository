import type { CreateDocumentationRequest, DocumentationResult } from "../types/documentation";
import { api } from "./api";

export async function generateDocumentation(payload: CreateDocumentationRequest): Promise<DocumentationResult> {
  if (!payload.code.trim()) {
    throw new Error("Please paste code before generating documentation.");
  }
  const { data } = await api.post<{ documentation: DocumentationResult }>("/documentation", payload);
  return data.documentation;
}
