import { getGenerationHistoryById, listGenerationHistory } from "../services/historyService";
import { asyncHandler } from "../utils/asyncHandler";
import type { ListHistoryQuery } from "../validators/historySchemas";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const getHistory = asyncHandler(async (req, res) => {
  const result = await listGenerationHistory(req.query as unknown as ListHistoryQuery);
  res.json(result);
});

export const getHistoryById = asyncHandler(async (req, res) => {
  const result = await getGenerationHistoryById(paramId(req.params.id));
  res.json(result);
});
