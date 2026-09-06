import { Router } from "express";
import * as insightsController from "../controllers/insightsController";
import { requireAuth } from "../middleware/auth";

export const insightsRouter = Router();

insightsRouter.use(requireAuth);
insightsRouter.get("/", insightsController.get);
