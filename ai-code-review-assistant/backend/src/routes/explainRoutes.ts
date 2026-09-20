import { Router } from "express";
import * as explainController from "../controllers/explainController";
import { aiLimiter } from "../middleware/rateLimiters";
import { asyncHandler } from "../utils/asyncHandler";
import { explainCodeSchema } from "../validators/explainSchemas";
import { validateBody } from "../validators/validate";

const router = Router();

router.post("/", aiLimiter, validateBody(explainCodeSchema), asyncHandler(explainController.explainCode));

export default router;
