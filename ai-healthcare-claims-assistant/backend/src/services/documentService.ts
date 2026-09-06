import fs from "fs/promises";
import path from "path";
import { prisma } from "../database/prisma";
import { getAIProvider } from "../ai/providerFactory";
import { chunkText } from "../rag/chunking";
import { embedText } from "../rag/embeddings";
import { buildPrompt } from "../rag/promptBuilder";
import { env } from "../utils/env";
import { HttpError } from "../utils/httpError";

export async function listDocuments() {
  return prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chunks: true } } },
  });
}

export async function getDocument(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
    include: { chunks: { orderBy: { chunkIndex: "asc" } } },
  });
  if (!document) throw new HttpError(404, "Document not found");
  return document;
}

export async function ingestDocument(file: Express.Multer.File) {
  const text = await extractText(file);
  if (!text.trim()) {
    throw new HttpError(400, "Could not extract text from the uploaded file");
  }
  return analyzeAndStore(file, text);
}

export async function analyzeDocument(id: string) {
  const document = await getDocument(id);
  return {
    id: document.id,
    originalName: document.originalName,
    summary: document.summary,
    keyRules: document.keyRules,
    eligibilityConditions: document.eligibilityConditions,
    importantChanges: document.importantChanges,
    insights: document.insights,
    chunkCount: document.chunks.length,
  };
}

async function analyzeAndStore(file: Express.Multer.File, text: string) {
  const chunks = chunkText(text);
  const embeddings = await Promise.all(chunks.map((chunk) => embedText(chunk.content)));
  const provider = getAIProvider();
  const analysis = await provider.generate({
    messages: buildPrompt(
      "Extract document summary, key rules, eligibility conditions, important changes, and analyst insights from this mandate document. Use synthetic document content only.",
      text.slice(0, 6000),
    ),
    retrievedContext: text.slice(0, 6000),
  });

  const keyRules = extractLabeledLines(text, /rule\s+(mr-\d+)/gi);
  const eligibility = extractSection(text, "eligibility");
  const changes = extractSection(text, "change");

  const document = await prisma.document.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      textContent: text,
      summary: analysis.answer,
      keyRules: keyRules.length ? keyRules : ["See extracted summary for identified mandates."],
      eligibilityConditions: eligibility.length
        ? eligibility
        : ["Eligibility language was summarized by the AI layer."],
      importantChanges: changes.length ? changes : ["No explicit change log found; review effective dates."],
      insights: analysis.recommendations,
      chunks: {
        create: chunks.map((chunk, index) => ({
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          embedding: embeddings[index] as object,
        })),
      },
    },
    include: { chunks: true },
  });

  return {
    document: {
      id: document.id,
      originalName: document.originalName,
      summary: document.summary,
      keyRules: document.keyRules,
      eligibilityConditions: document.eligibilityConditions,
      importantChanges: document.importantChanges,
      insights: document.insights,
      chunkCount: document.chunks.length,
    },
    analysis,
    provider: provider.name,
  };
}

async function extractText(file: Express.Multer.File): Promise<string> {
  const absolute = path.resolve(file.path);
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    return [
      "PDF binary uploaded in the demo environment.",
      "Full OCR is a future enhancement. Extracted placeholder text follows for RAG indexing.",
      `Filename: ${file.originalname}`,
      "Upload a .txt mandate for complete rule extraction.",
    ].join("\n");
  }
  return fs.readFile(absolute, "utf8");
}

function extractLabeledLines(text: string, pattern: RegExp): string[] {
  const matches = new Set<string>();
  for (const match of text.matchAll(pattern)) {
    matches.add(match[1].toUpperCase());
  }
  return [...matches];
}

function extractSection(text: string, keyword: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().includes(keyword))
    .slice(0, 6);
}

export function uploadPath(): string {
  return path.resolve(process.cwd(), env.uploadDir);
}
