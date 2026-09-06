import { env } from "../utils/env";
import { LLMProvider } from "./LLMProvider";
import { MockAIProvider } from "./MockAIProvider";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  if (env.aiProvider === "llm") {
    if (!env.llmApiKey) {
      return new MockAIProvider();
    }
    return new LLMProvider();
  }
  return new MockAIProvider();
}
