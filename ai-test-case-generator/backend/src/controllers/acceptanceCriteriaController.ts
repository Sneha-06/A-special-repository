import {
  createAcceptanceCriterion,
  deleteAcceptanceCriterion,
  generateAcceptanceCriteria,
  listAcceptanceCriteria,
  updateAcceptanceCriterion,
} from "../services/acceptanceCriteriaService";
import { asyncHandler } from "../utils/asyncHandler";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const getAcceptanceCriteria = asyncHandler(async (req, res) => {
  const requirementId = req.query.requirementId;
  if (typeof requirementId !== "string" || !requirementId) {
    res.status(400).json({ error: "requirementId query parameter is required" });
    return;
  }
  const criteria = await listAcceptanceCriteria(requirementId);
  res.json({ acceptanceCriteria: criteria });
});

export const postGenerateAcceptanceCriteria = asyncHandler(async (req, res) => {
  const result = await generateAcceptanceCriteria(req.body);
  res.json(result);
});

export const postAcceptanceCriterion = asyncHandler(async (req, res) => {
  const criterion = await createAcceptanceCriterion(req.body);
  res.status(201).json(criterion);
});

export const putAcceptanceCriterion = asyncHandler(async (req, res) => {
  const criterion = await updateAcceptanceCriterion(paramId(req.params.id), req.body);
  res.json(criterion);
});

export const removeAcceptanceCriterion = asyncHandler(async (req, res) => {
  await deleteAcceptanceCriterion(paramId(req.params.id));
  res.status(204).send();
});
