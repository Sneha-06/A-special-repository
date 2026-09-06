import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/authService";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
