import { getDashboardData } from "../services/dashboardService";
import { asyncHandler } from "../utils/asyncHandler";

export const getDashboard = asyncHandler(async (_req, res) => {
  const data = await getDashboardData();
  res.json(data);
});
