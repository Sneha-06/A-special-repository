import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { routeParam } from "../utils/routeParam";
import * as documentService from "../services/documentService";

export const list = asyncHandler(async (_req, res) => {
  const items = await documentService.listDocuments();
  res.json({ items });
});

export const getById = asyncHandler(async (req, res) => {
  const document = await documentService.getDocument(routeParam(req.params.id));
  res.json(document);
});

export const upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, "Select a .txt or .pdf file to upload");
  }
  const result = await documentService.ingestDocument(req.file);
  res.status(201).json(result);
});

export const analyzeById = asyncHandler(async (req, res) => {
  const result = await documentService.analyzeDocument(routeParam(req.params.id));
  res.json(result);
});

export const analyze = asyncHandler(async (req, res) => {
  const id = String(req.body.documentId ?? "");
  if (!id) {
    throw new HttpError(400, "documentId is required");
  }
  const result = await documentService.analyzeDocument(id);
  res.json(result);
});
