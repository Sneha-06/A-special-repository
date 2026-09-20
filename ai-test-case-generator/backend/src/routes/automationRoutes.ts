import { Router } from "express";
import {
  getAutomationForTestCase,
  postGenerateAutomation,
} from "../controllers/automationController";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../validators/validate";
import { generateAutomationSchema } from "../validators/automationSchemas";

export const automationRouter = Router();

automationRouter.post("/generate", aiRateLimiter, validateBody(generateAutomationSchema), postGenerateAutomation);
automationRouter.get("/test-case/:testCaseId", getAutomationForTestCase);
