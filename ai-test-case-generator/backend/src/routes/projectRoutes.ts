import { Router } from "express";
import { getProjects } from "../controllers/projectController";

export const projectRouter = Router();

projectRouter.get("/", getProjects);
