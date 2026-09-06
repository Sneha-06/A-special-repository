import { cosineSimilarity } from "./embeddings";

export interface VectorRecord<T> {
  item: T;
  embedding: number[];
}

export function topKBySimilarity<T>(
  query: number[],
  records: VectorRecord<T>[],
  k = 5,
  minScore = 0.05,
): Array<{ item: T; score: number }> {
  return records
    .map((record) => ({
      item: record.item,
      score: cosineSimilarity(query, record.embedding),
    }))
    .filter((entry) => entry.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function parseEmbedding(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const numbers = value.filter((item): item is number => typeof item === "number");
  return numbers.length ? numbers : null;
}
