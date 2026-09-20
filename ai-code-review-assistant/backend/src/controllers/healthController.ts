import type { Request, Response } from "express";
import { env } from "../utils/env";

export function health(_req: Request, res: Response) {
  res.json({
    status: "ok",
    service: "ai-code-review-assistant",
    timestamp: new Date().toISOString(),
    openAiConfigured: Boolean(env.openAiApiKey),
    githubConfigured: Boolean(env.githubToken),
  });
}
