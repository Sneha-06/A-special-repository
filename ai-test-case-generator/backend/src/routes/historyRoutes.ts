import { Router } from "express";
import { getHistory, getHistoryById } from "../controllers/historyController";
import { validateQuery } from "../validators/validate";
import { listHistoryQuerySchema } from "../validators/historySchemas";

export const historyRouter = Router();

historyRouter.get("/", validateQuery(listHistoryQuerySchema), getHistory);
historyRouter.get("/:id", getHistoryById);
