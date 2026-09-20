import { Router } from "express";
import * as analysisController from "../controllers/analysisController";
import { aiLimiter } from "../middleware/rateLimiters";
import { asyncHandler } from "../utils/asyncHandler";
import { analyzeCodeSchema } from "../validators/analysisSchemas";
import { validateBody } from "../validators/validate";

const router = Router();

router.get("/dashboard", asyncHandler(analysisController.dashboard));
router.get("/history", asyncHandler(analysisController.history));
router.get("/sessions/:id", asyncHandler(analysisController.getById));
router.post("/analyze", aiLimiter, validateBody(analyzeCodeSchema), asyncHandler(analysisController.analyze));

export default router;
