import type { Request, Response } from "express";
import { runCodeExplanation } from "../services/ai/codeExplanationService";
import { HttpError } from "../utils/httpError";
import type { ExplainCodeBody } from "../validators/explainSchemas";

export async function explainCode(req: Request, res: Response) {
  const body = req.body as ExplainCodeBody;
  if (!body.code?.trim()) {
    throw new HttpError(400, "Code cannot be empty. Paste source code before requesting an explanation.");
  }
  const explanation = await runCodeExplanation(body);
  res.status(200).json({ explanation });
}
