import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import { dashboardRouter } from "./routes/dashboardRoutes";
import { healthRouter } from "./routes/healthRoutes";
import { projectRouter } from "./routes/projectRoutes";
import { requirementRouter } from "./routes/requirementRoutes";
import { acceptanceCriteriaRouter } from "./routes/acceptanceCriteriaRoutes";
import { automationRouter } from "./routes/automationRoutes";
import { coverageRouter } from "./routes/coverageRoutes";
import { historyRouter } from "./routes/historyRoutes";
import { testCaseRouter } from "./routes/testCaseRoutes";
import { testDataRouter } from "./routes/testDataRoutes";
import { env } from "./utils/env";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(requestLogger);
  app.use("/api", apiRateLimiter);

  app.use("/api/health", healthRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/projects", projectRouter);
  app.use("/api/requirements", requirementRouter);
  app.use("/api/test-cases", testCaseRouter);
  app.use("/api/acceptance-criteria", acceptanceCriteriaRouter);
  app.use("/api/test-data", testDataRouter);
  app.use("/api/automation", automationRouter);
  app.use("/api/coverage", coverageRouter);
  app.use("/api/history", historyRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
