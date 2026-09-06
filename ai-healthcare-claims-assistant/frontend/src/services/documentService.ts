import { api } from "./api";
import type { AiResponse } from "../types";

export async function fetchDocuments() {
  const { data } = await api.get<{
    items: Array<{
      id: string;
      originalName: string;
      summary: string | null;
      createdAt: string;
      _count: { chunks: number };
    }>;
  }>("/documents");
  return data.items;
}

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{
    document: {
      id: string;
      originalName: string;
      summary: string;
      keyRules: string[];
      eligibilityConditions: string[];
      importantChanges: string[];
      insights: string[];
      chunkCount: number;
    };
    analysis: AiResponse;
    provider: string;
  }>("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
