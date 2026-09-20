import { Router } from "express";
import * as documentationController from "../controllers/documentationController";
import { aiLimiter } from "../middleware/rateLimiters";
import { asyncHandler } from "../utils/asyncHandler";
import { createDocumentationSchema } from "../validators/documentationSchemas";
import { validateBody } from "../validators/validate";

const router = Router();

router.post("/", aiLimiter, validateBody(createDocumentationSchema), asyncHandler(documentationController.generateDocumentation));

export default router;
