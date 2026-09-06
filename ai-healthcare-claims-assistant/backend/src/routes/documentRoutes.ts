import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import * as documentController from "../controllers/documentController";
import { requireAuth } from "../middleware/auth";
import { uploadPath } from "../services/documentService";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = uploadPath();
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["text/plain", "application/pdf", "text/markdown"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) || [".txt", ".pdf", ".md"].includes(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only .txt, .md, or .pdf files are accepted"));
  },
});

export const documentRouter = Router();

documentRouter.use(requireAuth);
documentRouter.get("/", documentController.list);
documentRouter.post("/upload", upload.single("file"), documentController.upload);
documentRouter.post("/analyze", documentController.analyze);
documentRouter.post("/:id/analyze", documentController.analyzeById);
documentRouter.get("/:id", documentController.getById);
