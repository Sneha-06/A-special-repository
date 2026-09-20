import {
  analyzeRequirementById,
  createRequirement,
  deleteRequirement,
  getRequirementById,
  listRequirements,
  updateRequirement,
} from "../services/requirementService";
import { asyncHandler } from "../utils/asyncHandler";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const getRequirements = asyncHandler(async (_req, res) => {
  const requirements = await listRequirements();
  res.json(requirements);
});

export const getRequirement = asyncHandler(async (req, res) => {
  const requirement = await getRequirementById(paramId(req.params.id));
  res.json(requirement);
});

export const postRequirement = asyncHandler(async (req, res) => {
  const requirement = await createRequirement(req.body);
  res.status(201).json(requirement);
});

export const putRequirement = asyncHandler(async (req, res) => {
  const requirement = await updateRequirement(paramId(req.params.id), req.body);
  res.json(requirement);
});

export const removeRequirement = asyncHandler(async (req, res) => {
  await deleteRequirement(paramId(req.params.id));
  res.status(204).send();
});

export const postAnalyzeRequirement = asyncHandler(async (req, res) => {
  const result = await analyzeRequirementById(paramId(req.params.id));
  res.json(result);
});
