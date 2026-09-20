import type { Request, Response } from "express";
import { runTestGeneration } from "../services/ai/testGeneratorService";
import { HttpError } from "../utils/httpError";
import type { GenerateTestsBody } from "../validators/testGeneratorSchemas";

export async function generateTests(req: Request, res: Response) {
  const body = req.body as GenerateTestsBody;

  if (!body.code?.trim()) {
    throw new HttpError(400, "Code cannot be empty. Paste source code before generating tests.");
  }

  const result = await runTestGeneration(body);
  res.status(200).json(result);
}
