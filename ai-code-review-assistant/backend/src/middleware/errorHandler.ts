import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  void next;
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      details: err.details ?? null,
    });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
