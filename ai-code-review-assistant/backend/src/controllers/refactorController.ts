import type { Request, Response } from "express";
import { runCodeRefactor } from "../services/ai/refactorService";
import { HttpError } from "../utils/httpError";
import type { CreateRefactorBody } from "../validators/refactorSchemas";

export async function createRefactor(req: Request, res: Response) {
  const body = req.body as CreateRefactorBody;

  if (!body.code?.trim()) {
    throw new HttpError(400, "Code cannot be empty. Paste source code before requesting improvements.");
  }

  const result = await runCodeRefactor(body);
  res.status(200).json({ refactor: result });
}
