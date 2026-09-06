import type { RequestHandler } from "express";
import { ZodSchema } from "zod";
import { HttpError } from "../utils/httpError";

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new HttpError(400, "Invalid request body", result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
}
