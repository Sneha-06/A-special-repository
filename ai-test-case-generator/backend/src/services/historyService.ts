import { GenerationType, Prisma } from "@prisma/client";
import { HttpError } from "../utils/httpError";
import { prisma } from "../utils/prisma";
import { sanitizeHistoryPayload } from "../utils/sanitizeHistory";
import type { ListHistoryQuery } from "../validators/historySchemas";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function countGeneratedItems(
  generationType: GenerationType,
  output: unknown,
): number {
  if (!isRecord(output)) return 0;

  if (typeof output.count === "number") return output.count;
  if (Array.isArray(output.testCaseIds)) return output.testCaseIds.length;
  if (generationType === GenerationType.REQUIREMENT_ANALYSIS && output.summary) return 1;
  if (generationType === GenerationType.AUTOMATION_CODE && output.automationId) return 1;
  if (generationType === GenerationType.COVERAGE_ANALYSIS && typeof output.coverageScore === "number") {
    return 1;
  }
  if (Array.isArray(output.acceptanceCriteria)) return output.acceptanceCriteria.length;
  if (Array.isArray(output.testData)) return output.testData.length;

  return 0;
}

function formatGenerationType(type: GenerationType): string {
  return type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function mapHistoryRecord(record: {
  id: string;
  requirementId: string;
  generationType: GenerationType;
  model: string;
  status: string;
  input: unknown;
  output: unknown;
  createdAt: Date;
  requirement: {
    id: string;
    title: string;
    project: { id: string; name: string };
  };
}) {
  const sanitizedInput = sanitizeHistoryPayload(record.input);
  const sanitizedOutput = sanitizeHistoryPayload(record.output);

  return {
    id: record.id,
    requirementId: record.requirementId,
    requirementTitle: record.requirement.title,
    projectId: record.requirement.project.id,
    projectName: record.requirement.project.name,
    generationType: record.generationType,
    generationTypeLabel: formatGenerationType(record.generationType),
    model: record.model,
    status: record.status,
    generatedItemCount: countGeneratedItems(record.generationType, sanitizedOutput),
    input: sanitizedInput,
    output: sanitizedOutput,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function listGenerationHistory(query: ListHistoryQuery) {
  const where: Prisma.GenerationHistoryWhereInput = {};

  if (query.generationType) where.generationType = query.generationType;
  if (query.status) where.status = query.status;
  if (query.requirementId) where.requirementId = query.requirementId;

  if (query.fromDate || query.toDate) {
    where.createdAt = {};
    if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
    if (query.toDate) where.createdAt.lte = new Date(query.toDate);
  }

  const skip = (query.page - 1) * query.pageSize;

  const [total, records] = await Promise.all([
    prisma.generationHistory.count({ where }),
    prisma.generationHistory.findMany({
      where,
      include: {
        requirement: {
          select: {
            id: true,
            title: true,
            project: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.pageSize,
    }),
  ]);

  return {
    items: records.map(mapHistoryRecord),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getGenerationHistoryById(id: string) {
  const record = await prisma.generationHistory.findUnique({
    where: { id },
    include: {
      requirement: {
        select: {
          id: true,
          title: true,
          project: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!record) {
    throw new HttpError(404, "Generation history entry not found");
  }

  return mapHistoryRecord(record);
}
