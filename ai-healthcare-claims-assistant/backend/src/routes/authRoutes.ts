import { Router } from "express";
import * as authController from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const authRouter = Router();

authRouter.post("/login", validateBody(authController.loginSchema), authController.login);
authRouter.get("/me", requireAuth, authController.me);
