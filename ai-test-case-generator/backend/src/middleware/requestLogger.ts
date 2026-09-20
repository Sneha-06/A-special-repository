import type { NextFunction, Request, Response } from "express";
import { env } from "../utils/env";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    if (env.nodeEnv === "test") return;

    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      console.error(message);
      return;
    }

    if (env.nodeEnv !== "production") {
      console.info(message);
    }
  });

  next();
}
