import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { env } from "../utils/env";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      details: err.details ?? null,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected server error";
  if (env.nodeEnv !== "production") {
    console.error(err);
  }
  res.status(500).json({ error: message, details: null });
}
