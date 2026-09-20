export interface SseHandlers<TComplete> {
  onStage?: (data: { stage: string; message: string }) => void;
  onComplete?: (data: TComplete) => void;
  onError?: (message: string) => void;
}

export async function postSse<TComplete>(
  url: string,
  body: unknown,
  handlers: SseHandlers<TComplete>,
): Promise<TComplete> {
  const baseUrl = import.meta.env.VITE_API_URL ?? "/api";
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error((errorBody as { error?: string }).error ?? "Request failed");
  }

  if (!response.body) {
    throw new Error("No response stream available");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completeData: TComplete | null = null;
  let errorMessage: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      let event = "message";
      let dataLine = "";

      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) dataLine = line.slice(5).trim();
      }

      if (!dataLine) continue;
      const parsed = JSON.parse(dataLine) as Record<string, unknown>;

      if (event === "stage") {
        handlers.onStage?.(parsed as { stage: string; message: string });
      } else if (event === "complete") {
        completeData = parsed as TComplete;
        handlers.onComplete?.(completeData);
      } else if (event === "error") {
        errorMessage = (parsed.message as string) ?? "Generation failed";
        handlers.onError?.(errorMessage);
      }
    }
  }

  if (errorMessage) throw new Error(errorMessage);
  if (!completeData) throw new Error("Generation completed without result data");
  return completeData;
}
