import { Router } from "express";
import * as aiController from "../controllers/aiController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const aiRouter = Router();

aiRouter.use(requireAuth);
aiRouter.post("/chat", validateBody(aiController.chatSchema), aiController.chat);
aiRouter.post("/analyze-claim", validateBody(aiController.analyzeClaimSchema), aiController.analyzeClaim);
aiRouter.get("/conversations", aiController.conversations);
aiRouter.get("/conversations/:id", aiController.conversation);
