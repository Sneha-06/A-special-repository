import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../utils/env";

export const getHealth = asyncHandler(async (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-test-case-generator",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
