import { Router } from "express";
import * as testGeneratorController from "../controllers/testGeneratorController";
import { aiLimiter } from "../middleware/rateLimiters";
import { asyncHandler } from "../utils/asyncHandler";
import { generateTestsSchema } from "../validators/testGeneratorSchemas";
import { validateBody } from "../validators/validate";

const router = Router();

router.post("/generate", aiLimiter, validateBody(generateTestsSchema), asyncHandler(testGeneratorController.generateTests));

export default router;
