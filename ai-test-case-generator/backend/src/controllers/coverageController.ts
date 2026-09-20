import { analyzeProjectCoverage } from "../services/coverageService";
import { asyncHandler } from "../utils/asyncHandler";

export const postAnalyzeCoverage = asyncHandler(async (req, res) => {
  const result = await analyzeProjectCoverage(req.body);
  res.json(result);
});
