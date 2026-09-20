import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(dashboardController.getDashboard));

export default router;
