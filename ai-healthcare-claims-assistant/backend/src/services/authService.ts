import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../database/prisma";
import type { AuthUser } from "../middleware/auth";
import { env } from "../utils/env";
import { HttpError } from "../utils/httpError";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new HttpError(401, "Invalid email or password");
  }
  const payload: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
  return { token, user: payload };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) throw new HttpError(404, "User not found");
  return user;
}
