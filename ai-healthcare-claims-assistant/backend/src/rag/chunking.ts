export interface TextChunk {
  chunkIndex: number;
  content: string;
}

export function chunkText(text: string, chunkSize = 700, overlap = 120): TextChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;
  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const slice = normalized.slice(start, end).trim();
    if (slice) {
      chunks.push({ chunkIndex: index, content: slice });
      index += 1;
    }
    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}
