import { Router } from "express";
import {
  getAcceptanceCriteria,
  postAcceptanceCriterion,
  postGenerateAcceptanceCriteria,
  putAcceptanceCriterion,
  removeAcceptanceCriterion,
} from "../controllers/acceptanceCriteriaController";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../validators/validate";
import {
  createAcceptanceCriterionSchema,
  generateAcceptanceCriteriaSchema,
  updateAcceptanceCriterionSchema,
} from "../validators/acceptanceCriteriaSchemas";

export const acceptanceCriteriaRouter = Router();

acceptanceCriteriaRouter.get("/", getAcceptanceCriteria);
acceptanceCriteriaRouter.post(
  "/generate",
  aiRateLimiter,
  validateBody(generateAcceptanceCriteriaSchema),
  postGenerateAcceptanceCriteria,
);
acceptanceCriteriaRouter.post(
  "/",
  validateBody(createAcceptanceCriterionSchema),
  postAcceptanceCriterion,
);
acceptanceCriteriaRouter.put(
  "/:id",
  validateBody(updateAcceptanceCriterionSchema),
  putAcceptanceCriterion,
);
acceptanceCriteriaRouter.delete("/:id", removeAcceptanceCriterion);
