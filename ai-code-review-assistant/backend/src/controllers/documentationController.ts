import type { Request, Response } from "express";
import { runDocumentationGeneration } from "../services/ai/documentationService";
import { HttpError } from "../utils/httpError";
import type { CreateDocumentationBody } from "../validators/documentationSchemas";

export async function generateDocumentation(req: Request, res: Response) {
  const body = req.body as CreateDocumentationBody;
  if (!body.code?.trim()) {
    throw new HttpError(400, "Code cannot be empty. Paste source code before generating documentation.");
  }
  const documentation = await runDocumentationGeneration(body);
  res.status(200).json({ documentation });
}
