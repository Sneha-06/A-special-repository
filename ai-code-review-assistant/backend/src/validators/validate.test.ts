import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { HttpError } from "../utils/httpError";
import { validateBody } from "./validate";

function runMiddleware(schema: z.ZodSchema, body: unknown) {
  const req = { body } as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  validateBody(schema)(req, res, next);
  return { req, next };
}

describe("validateBody", () => {
  const schema = z.object({
    code: z.string().min(1),
    language: z.enum(["typescript", "javascript"]),
  });

  it("passes valid body and replaces req.body with parsed data", () => {
    const { req, next } = runMiddleware(schema, { code: "x", language: "typescript" });
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ code: "x", language: "typescript" });
  });

  it("calls next with HttpError for invalid body", () => {
    const { next } = runMiddleware(schema, { code: "", language: "typescript" });
    expect(next).toHaveBeenCalledOnce();
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(400);
  });
});
