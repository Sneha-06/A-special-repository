import { listProjects } from "../services/projectService";
import { asyncHandler } from "../utils/asyncHandler";

export const getProjects = asyncHandler(async (_req, res) => {
  const projects = await listProjects();
  res.json(projects);
});
