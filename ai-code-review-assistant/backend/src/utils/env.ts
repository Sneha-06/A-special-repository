import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // backend/.env (dev + prod)

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4002),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL", "postgresql://acra:acra_demo@localhost:5435/acra?schema=public"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5175",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  openAiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  githubToken: process.env.GITHUB_TOKEN ?? "",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 300),
  aiRateLimitWindowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  aiRateLimitMax: Number(process.env.AI_RATE_LIMIT_MAX ?? 30),
};
