import { Router } from "express";
import { postAnalyzeCoverage } from "../controllers/coverageController";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../validators/validate";
import { analyzeCoverageSchema } from "../validators/coverageSchemas";

export const coverageRouter = Router();

coverageRouter.post("/analyze", aiRateLimiter, validateBody(analyzeCoverageSchema), postAnalyzeCoverage);
