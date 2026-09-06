import { Router } from "express";
import * as claimController from "../controllers/claimController";
import { requireAuth } from "../middleware/auth";

export const claimRouter = Router();

claimRouter.use(requireAuth);
claimRouter.get("/", claimController.list);
claimRouter.get("/:id", claimController.getById);
claimRouter.post("/:id/analyze", claimController.analyze);
