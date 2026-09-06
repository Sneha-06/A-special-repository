import { Router } from "express";
import * as ruleController from "../controllers/ruleController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const ruleRouter = Router();

ruleRouter.use(requireAuth);
ruleRouter.get("/", ruleController.list);
ruleRouter.post("/compare", validateBody(ruleController.compareSchema), ruleController.compare);
ruleRouter.get("/:id", ruleController.getById);
