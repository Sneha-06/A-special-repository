import { prisma } from "../database/prisma";
import { embedText } from "./embeddings";
import { parseEmbedding, topKBySimilarity } from "./vectorSearch";

export interface RetrievedClaim {
  kind: "claim";
  claimId: string;
  status: string;
  rejectionReason: string | null;
  serviceName: string;
  ruleId: string | null;
  score: number;
}

export interface RetrievedRule {
  kind: "rule";
  ruleId: string;
  name: string;
  category: string;
  eligibilityConditions: string;
  authorizationRequirements: string;
  coverageConditions: string;
  serviceRestrictions: string;
  description: string;
  score: number;
}

export interface RetrievedDocument {
  kind: "document";
  documentId: string;
  title: string;
  content: string;
  score: number;
}

export type RetrievedItem = RetrievedClaim | RetrievedRule | RetrievedDocument;

export function processQuery(question: string): string {
  return question.replace(/\s+/g, " ").trim();
}

export async function retrieveRelevantContext(
  question: string,
  k = 5,
): Promise<RetrievedItem[]> {
  const queryEmbedding = await embedText(processQuery(question));

  const [claims, rules, chunks] = await Promise.all([
    prisma.claim.findMany({
      include: { applicableRule: true },
      take: 200,
    }),
    prisma.mandateRule.findMany(),
    prisma.documentChunk.findMany({
      include: { document: true },
      take: 400,
    }),
  ]);

  const claimHits = topKBySimilarity(
    queryEmbedding,
    claims
      .map((claim) => {
        const embedding = parseEmbedding(claim.embedding);
        return embedding ? { item: claim, embedding } : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    k,
  ).map(({ item, score }) => ({
    kind: "claim" as const,
    claimId: item.claimId,
    status: item.status,
    rejectionReason: item.rejectionReason,
    serviceName: item.serviceName,
    ruleId: item.applicableRule?.ruleId ?? null,
    score,
  }));

  const ruleHits = topKBySimilarity(
    queryEmbedding,
    rules
      .map((rule) => {
        const embedding = parseEmbedding(rule.embedding);
        return embedding ? { item: rule, embedding } : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    k,
  ).map(({ item, score }) => ({
    kind: "rule" as const,
    ruleId: item.ruleId,
    name: item.name,
    category: item.category,
    eligibilityConditions: item.eligibilityConditions,
    authorizationRequirements: item.authorizationRequirements,
    coverageConditions: item.coverageConditions,
    serviceRestrictions: item.serviceRestrictions,
    description: item.description,
    score,
  }));

  const documentHits = topKBySimilarity(
    queryEmbedding,
    chunks
      .map((chunk) => {
        const embedding = parseEmbedding(chunk.embedding);
        return embedding ? { item: chunk, embedding } : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    k,
  ).map(({ item, score }) => ({
    kind: "document" as const,
    documentId: item.documentId,
    title: item.document.originalName,
    content: item.content,
    score,
  }));

  return [...claimHits, ...ruleHits, ...documentHits]
    .sort((a, b) => b.score - a.score)
    .slice(0, k + 3);
}
