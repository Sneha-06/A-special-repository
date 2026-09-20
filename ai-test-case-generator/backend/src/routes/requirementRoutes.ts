import { Router } from "express";
import {
  getRequirement,
  getRequirements,
  postAnalyzeRequirement,
  postRequirement,
  putRequirement,
  removeRequirement,
} from "../controllers/requirementController";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../validators/validate";
import { createRequirementSchema, updateRequirementSchema } from "../validators/requirementSchemas";

export const requirementRouter = Router();

requirementRouter.get("/", getRequirements);
requirementRouter.get("/:id", getRequirement);
requirementRouter.post("/", validateBody(createRequirementSchema), postRequirement);
requirementRouter.put("/:id", validateBody(updateRequirementSchema), putRequirement);
requirementRouter.delete("/:id", removeRequirement);
requirementRouter.post("/:id/analyze", aiRateLimiter, postAnalyzeRequirement);
