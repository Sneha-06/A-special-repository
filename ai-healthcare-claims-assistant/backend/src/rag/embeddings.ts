import { env } from "../utils/env";

const DIMENSIONS = 64;

/**
 * Deterministic mock embedding so semantic search works without an API key.
 * When LLM_API_KEY is set and AI_PROVIDER=llm, real embeddings are requested.
 */
export function mockEmbed(text: string): number[] {
  const vector = new Array(DIMENSIONS).fill(0);
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    const idx = (code + i * 7) % DIMENSIONS;
    vector[idx] += ((code % 13) + 1) / (i + 3);
  }
  const tokens = normalized.split(/[^a-z0-9-]+/).filter(Boolean);
  tokens.forEach((token, i) => {
    let hash = 0;
    for (let c = 0; c < token.length; c += 1) {
      hash = (hash * 31 + token.charCodeAt(c)) >>> 0;
    }
    const idx = hash % DIMENSIONS;
    vector[idx] += 1.4 / (1 + (i % 5));
  });
  return l2Normalize(vector);
}

export async function embedText(text: string): Promise<number[]> {
  if (env.aiProvider === "llm" && env.llmApiKey) {
    try {
      return await embedWithLlm(text);
    } catch {
      return mockEmbed(text);
    }
  }
  return mockEmbed(text);
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    results.push(await embedText(text));
  }
  return results;
}

async function embedWithLlm(text: string): Promise<number[]> {
  const response = await fetch(`${env.llmBaseUrl}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.llmApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.embeddingModel,
      input: text.slice(0, 8000),
    }),
  });
  if (!response.ok) {
    throw new Error(`Embedding request failed: ${response.status}`);
  }
  const payload = (await response.json()) as {
    data?: Array<{ embedding: number[] }>;
  };
  const embedding = payload.data?.[0]?.embedding;
  if (!embedding) {
    throw new Error("Embedding response missing vector");
  }
  return embedding;
}

export function l2Normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
