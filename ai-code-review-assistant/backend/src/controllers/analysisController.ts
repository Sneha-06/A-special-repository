import type { Request, Response } from "express";
import { analyzeCode, getDashboardStats, getSession, listSessions } from "../services/codeAnalysis/analysisService";
import { HttpError } from "../utils/httpError";
import type { AnalyzeCodeBody } from "../validators/analysisSchemas";

export async function analyze(req: Request, res: Response) {
  const result = await analyzeCode(req.body as AnalyzeCodeBody);
  res.status(201).json(result);
}

export async function history(_req: Request, res: Response) {
  const sessions = await listSessions(50);
  res.json({ sessions });
}

export async function getById(req: Request, res: Response) {
  const session = await getSession(String(req.params.id));
  if (!session) throw new HttpError(404, "Session not found");
  res.json({ session });
}

export async function dashboard(_req: Request, res: Response) {
  const stats = await getDashboardStats();
  res.json(stats);
}
