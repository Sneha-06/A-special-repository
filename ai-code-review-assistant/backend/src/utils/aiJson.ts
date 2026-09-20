import { HttpError } from "./httpError";

export function extractJsonFromAi(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new HttpError(502, "AI response did not contain valid JSON");
    return JSON.parse(match[0]);
  }
}

export async function callOpenAiJson(systemPrompt: string, userPrompt: string): Promise<string> {
  const { env } = await import("./env");

  if (!env.openAiApiKey) {
    throw new HttpError(503, "OpenAI API key is not configured. Set OPENAI_API_KEY in the backend environment.");
  }

  const response = await fetch(`${env.openAiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 429) {
      throw new HttpError(503, "OpenAI rate limit exceeded. Please retry later.", {
        status: response.status,
        body: body.slice(0, 500),
      });
    }
    throw new HttpError(502, "OpenAI API request failed", {
      status: response.status,
      body: body.slice(0, 500),
    });
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new HttpError(502, "OpenAI returned an empty response");
  return content;
}
