import { asyncHandler } from "../utils/asyncHandler";
import * as insightsService from "../services/insightsService";

export const get = asyncHandler(async (_req, res) => {
  const insights = await insightsService.getInsights();
  res.json(insights);
});
