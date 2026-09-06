import cors from "cors";
import express from "express";
import path from "path";
import { prisma } from "./database/prisma";
import { errorHandler } from "./middleware/errorHandler";
import { aiRouter } from "./routes/aiRoutes";
import { authRouter } from "./routes/authRoutes";
import { claimRouter } from "./routes/claimRoutes";
import { documentRouter } from "./routes/documentRoutes";
import { insightsRouter } from "./routes/insightsRoutes";
import { ruleRouter } from "./routes/ruleRoutes";
import { env } from "./utils/env";

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), env.uploadDir)));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-healthcare-claims-assistant",
    aiProvider: env.aiProvider,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/claims", claimRouter);
app.use("/api/rules", ruleRouter);
app.use("/api/ai", aiRouter);
app.use("/api/documents", documentRouter);
app.use("/api/insights", insightsRouter);

app.use(errorHandler);

async function start() {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`AHCA API listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
