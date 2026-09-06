import { env } from "../utils/env";
import { fallbackFromContext, parseModelOutput } from "./responseParser";
import type { AIProvider, AiResponse, GenerateParams } from "./types";

export class LLMProvider implements AIProvider {
  name = "llm";

  async generate(params: GenerateParams): Promise<AiResponse> {
    if (!env.llmApiKey) {
      throw new Error("LLM_API_KEY is not set. Use AI_PROVIDER=mock or provide a key.");
    }

    const response = await fetch(`${env.llmBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.llmApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.llmModel,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: params.messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LLM request failed (${response.status}): ${body.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return fallbackFromContext(params);
    }
    return parseModelOutput(content, content);
  }
}
