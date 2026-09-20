import rateLimit from "express-rate-limit";
import { env } from "../utils/env";

export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later.", details: null },
});

export const aiRateLimiter = rateLimit({
  windowMs: env.aiRateLimitWindowMs,
  max: env.aiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI generation rate limit exceeded. Please wait before retrying.", details: null },
});
