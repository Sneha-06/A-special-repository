import {
  generateSyntheticTestData,
  listSyntheticTestData,
} from "../services/syntheticTestDataService";
import { asyncHandler } from "../utils/asyncHandler";

export const getTestData = asyncHandler(async (req, res) => {
  const requirementId = req.query.requirementId;
  if (typeof requirementId !== "string" || !requirementId) {
    res.status(400).json({ error: "requirementId query parameter is required" });
    return;
  }
  const result = await listSyntheticTestData(requirementId);
  res.json(result);
});

export const postGenerateTestData = asyncHandler(async (req, res) => {
  const result = await generateSyntheticTestData(req.body);
  res.json(result);
});
