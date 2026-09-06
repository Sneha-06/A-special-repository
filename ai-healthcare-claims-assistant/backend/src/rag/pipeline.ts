import { getAIProvider } from "../ai/providerFactory";
import type { AiResponse } from "../ai/types";
import { buildContext } from "./contextBuilder";
import { buildPrompt } from "./promptBuilder";
import { retrieveRelevantContext } from "./retrieval";

export async function runRagPipeline(question: string): Promise<{
  response: AiResponse;
  retrievedCount: number;
  provider: string;
}> {
  const retrieved = await retrieveRelevantContext(question);
  const context = buildContext(retrieved);
  const messages = buildPrompt(question, context);
  const provider = getAIProvider();
  const response = await provider.generate({ messages, retrievedContext: context });
  return {
    response,
    retrievedCount: retrieved.length,
    provider: provider.name,
  };
}
