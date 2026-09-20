import { generateAutomationCode, getLatestAutomationCode } from "../services/automationService";
import { asyncHandler } from "../utils/asyncHandler";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const postGenerateAutomation = asyncHandler(async (req, res) => {
  const result = await generateAutomationCode(req.body);
  res.json(result);
});

export const getAutomationForTestCase = asyncHandler(async (req, res) => {
  const result = await getLatestAutomationCode(paramId(req.params.testCaseId));
  res.json(result);
});
