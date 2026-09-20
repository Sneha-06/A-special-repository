import { Router } from "express";
import {
  getTestCase,
  getTestCases,
  postAutomationCode,
  postDuplicateTestCase,
  postGenerateTestCases,
  postRegenerateTestCase,
  putTestCase,
  removeTestCase,
} from "../controllers/testCaseController";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../validators/validate";
import { generateTestCasesSchema, updateTestCaseSchema } from "../validators/testCaseSchemas";

export const testCaseRouter = Router();

testCaseRouter.get("/", getTestCases);
testCaseRouter.post("/generate", aiRateLimiter, validateBody(generateTestCasesSchema), postGenerateTestCases);
testCaseRouter.get("/:id", getTestCase);
testCaseRouter.put("/:id", validateBody(updateTestCaseSchema), putTestCase);
testCaseRouter.delete("/:id", removeTestCase);
testCaseRouter.post("/:id/duplicate", postDuplicateTestCase);
testCaseRouter.post("/:id/regenerate", aiRateLimiter, postRegenerateTestCase);
testCaseRouter.post("/:id/automation", aiRateLimiter, postAutomationCode);
