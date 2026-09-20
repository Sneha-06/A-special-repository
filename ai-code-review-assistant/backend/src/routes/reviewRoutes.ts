import { Router } from "express";
import * as reviewController from "../controllers/reviewController";
import { aiLimiter } from "../middleware/rateLimiters";
import { asyncHandler } from "../utils/asyncHandler";
import { createReviewSchema } from "../validators/reviewSchemas";
import { validateBody } from "../validators/validate";

const router = Router();

router.get("/history", asyncHandler(reviewController.getHistory));
router.get("/:id", asyncHandler(reviewController.getReview));
router.post("/", aiLimiter, validateBody(createReviewSchema), asyncHandler(reviewController.createReview));

export default router;
