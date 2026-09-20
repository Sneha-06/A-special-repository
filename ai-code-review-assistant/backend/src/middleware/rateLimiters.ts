import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../utils/env";

const passthrough = (_req: Request, _res: Response, next: NextFunction) => next();

export const generalLimiter = env.nodeEnv === "test" ? passthrough : rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

export const aiLimiter = env.nodeEnv === "test" ? passthrough : rateLimit({
  windowMs: env.aiRateLimitWindowMs,
  max: env.aiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit exceeded. Please wait before running more analyses." },
});
