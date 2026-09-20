import { Router } from "express";
import * as healthController from "../controllers/healthController";
import analysisRoutes from "./analysisRoutes";
import dashboardRoutes from "./dashboardRoutes";
import githubRoutes from "./githubRoutes";
import documentationRoutes from "./documentationRoutes";
import explainRoutes from "./explainRoutes";
import refactorRoutes from "./refactorRoutes";
import reviewRoutes from "./reviewRoutes";
import testRoutes from "./testRoutes";

const router = Router();

router.get("/health", healthController.health);
router.use("/reviews", reviewRoutes);
router.use("/refactor", refactorRoutes);
router.use("/explain", explainRoutes);
router.use("/documentation", documentationRoutes);
router.use("/tests", testRoutes);
router.use("/analysis", analysisRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/github", githubRoutes);

export default router;
