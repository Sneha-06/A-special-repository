import type { AiResponse } from "../types";
import { api } from "./api";

export async function sendChat(question: string, conversationId?: string) {
  const { data } = await api.post<{
    conversationId: string;
    title: string;
    response: AiResponse;
    provider: string;
    retrievedCount: number;
  }>("/ai/chat", { question, conversationId });
  return data;
}

export async function fetchConversations() {
  const { data } = await api.get<{
    items: Array<{
      id: string;
      title: string;
      updatedAt: string;
      messages: Array<{ content: string; role: string }>;
    }>;
  }>("/ai/conversations");
  return data.items;
}

export async function fetchConversation(id: string) {
  const { data } = await api.get<{
    id: string;
    title: string;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      structured: AiResponse | null;
      createdAt: string;
    }>;
  }>(`/ai/conversations/${id}`);
  return data;
}
