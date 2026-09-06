import { prisma } from "../database/prisma";
import { runRagPipeline } from "../rag/pipeline";
import { HttpError } from "../utils/httpError";

export async function listConversations() {
  return prisma.aiConversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
}

export async function getConversation(id: string) {
  const conversation = await prisma.aiConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) throw new HttpError(404, "Conversation not found");
  return conversation;
}

export async function chat(question: string, conversationId?: string, userId?: string) {
  const title = question.slice(0, 72) || "New conversation";
  const conversation = conversationId
    ? await prisma.aiConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      })
    : await prisma.aiConversation.create({
        data: { title, userId },
      });

  await prisma.aiMessage.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: question,
    },
  });

  const result = await runRagPipeline(question);

  const assistantMessage = await prisma.aiMessage.create({
    data: {
      conversationId: conversation.id,
      role: "assistant",
      content: result.response.answer,
      structured: result.response as object,
    },
  });

  return {
    conversationId: conversation.id,
    title: conversation.title,
    message: assistantMessage,
    response: result.response,
    provider: result.provider,
    retrievedCount: result.retrievedCount,
  };
}
