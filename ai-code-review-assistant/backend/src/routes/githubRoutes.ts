import { Router } from "express";
import * as githubController from "../controllers/githubController";
import { aiLimiter } from "../middleware/rateLimiters";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Connection status
router.get("/status", asyncHandler(githubController.status));

// Repositories
router.get("/repositories", asyncHandler(githubController.repositories));
router.get("/repos", asyncHandler(githubController.repos)); // legacy

// Repository resources
router.get("/repositories/:owner/:repo/branches", asyncHandler(githubController.branches));
router.get("/repositories/:owner/:repo/files", asyncHandler(githubController.files));
router.get("/repositories/:owner/:repo/file", asyncHandler(githubController.file));
router.get("/repositories/:owner/:repo/pulls", asyncHandler(githubController.pulls));
router.post("/repositories/:owner/:repo/review-file", aiLimiter, asyncHandler(githubController.reviewFile));
router.post(
  "/repositories/:owner/:repo/pulls/:number/review",
  aiLimiter,
  asyncHandler(githubController.reviewPullRequest),
);

// Legacy routes
router.get("/repos/:owner/:repo/contents", asyncHandler(githubController.contents));
router.get("/repos/:owner/:repo/pulls", asyncHandler(githubController.pulls));
router.post("/repos/:owner/:repo/pulls/:number/review", aiLimiter, asyncHandler(githubController.reviewPullRequest));

export default router;
