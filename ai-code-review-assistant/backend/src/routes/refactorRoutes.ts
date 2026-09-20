import { Router } from "express";
import * as refactorController from "../controllers/refactorController";
import { aiLimiter } from "../middleware/rateLimiters";
import { asyncHandler } from "../utils/asyncHandler";
import { createRefactorSchema } from "../validators/refactorSchemas";
import { validateBody } from "../validators/validate";

const router = Router();

router.post("/", aiLimiter, validateBody(createRefactorSchema), asyncHandler(refactorController.createRefactor));

export default router;
