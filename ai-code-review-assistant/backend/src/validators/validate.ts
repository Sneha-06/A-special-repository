import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { HttpError } from "../utils/httpError";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new HttpError(400, "Invalid request body", result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new HttpError(400, "Invalid query parameters", result.error.flatten()));
      return;
    }
    req.query = result.data as Request["query"];
    next();
  };
}
