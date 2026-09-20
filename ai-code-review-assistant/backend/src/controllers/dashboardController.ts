import type { Request, Response } from "express";
import { getReviewDashboardStats } from "../services/reviews/dashboardService";

export async function getDashboard(_req: Request, res: Response) {
  const stats = await getReviewDashboardStats();
  res.json(stats);
}
