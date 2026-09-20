import { Router } from "express";
import { getTestData, postGenerateTestData } from "../controllers/testDataController";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../validators/validate";
import { generateTestDataSchema } from "../validators/testDataSchemas";

export const testDataRouter = Router();

testDataRouter.get("/", getTestData);
testDataRouter.post("/generate", aiRateLimiter, validateBody(generateTestDataSchema), postGenerateTestData);
