import { GenerationStatus, GenerationType, Prisma } from "@prisma/client";
import { generateAcceptanceCriteriaWithAi } from "./ai/acceptanceCriteriaGenerator";
import { getRequirementById } from "./requirementService";
import { HttpError } from "../utils/httpError";
import { prisma } from "../utils/prisma";
import { env } from "../utils/env";
import type {
  CreateAcceptanceCriterionBody,
  GenerateAcceptanceCriteriaBody,
  UpdateAcceptanceCriterionBody,
} from "../validators/acceptanceCriteriaSchemas";

function mapToResponse(record: {
  id: string;
  criteriaKey: string | null;
  given: string;
  when: string;
  then: string;
  requirementId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.criteriaKey ?? record.id,
    dbId: record.id,
    given: record.given,
    when: record.when,
    then: record.then,
    requirementId: record.requirementId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listAcceptanceCriteria(requirementId: string) {
  const records = await prisma.acceptanceCriteria.findMany({
    where: { requirementId },
    orderBy: { createdAt: "asc" },
  });
  return records.map(mapToResponse);
}

export async function generateAcceptanceCriteria(body: GenerateAcceptanceCriteriaBody) {
  const requirement = await getRequirementById(body.requirementId);
  const latestAnalysis = requirement.analyses[0];

  const historyEntry = await prisma.generationHistory.create({
    data: {
      requirementId: body.requirementId,
      generationType: GenerationType.ACCEPTANCE_CRITERIA,
      model: env.openAiModel,
      status: GenerationStatus.PROCESSING,
      input: body as unknown as Prisma.InputJsonValue,
      output: {},
    },
  });

  try {
    const generated = await generateAcceptanceCriteriaWithAi({
      title: requirement.title,
      description: requirement.description,
      userStory: requirement.userStory,
      applicationModule: requirement.applicationModule,
      acceptanceCriteriaText: requirement.acceptanceCriteriaText,
      additionalContext: requirement.additionalContext,
      analysisSummary: latestAnalysis?.summary ?? null,
    });

    if (body.replaceExisting) {
      await prisma.acceptanceCriteria.deleteMany({ where: { requirementId: body.requirementId } });
    }

    const saved = await Promise.all(
      generated.map((item) =>
        prisma.acceptanceCriteria.create({
          data: {
            requirementId: body.requirementId,
            criteriaKey: item.id,
            given: item.given,
            when: item.when,
            then: item.then,
          },
        }),
      ),
    );

    await prisma.generationHistory.update({
      where: { id: historyEntry.id },
      data: {
        status: GenerationStatus.COMPLETED,
        output: { count: saved.length } as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      acceptanceCriteria: saved.map(mapToResponse),
    };
  } catch (error) {
    await prisma.generationHistory.update({
      where: { id: historyEntry.id },
      data: {
        status: GenerationStatus.FAILED,
        output: {
          error: error instanceof Error ? error.message : "Generation failed",
        } as unknown as Prisma.InputJsonValue,
      },
    });
    throw error;
  }
}

export async function createAcceptanceCriterion(body: CreateAcceptanceCriterionBody) {
  await getRequirementById(body.requirementId);

  const record = await prisma.acceptanceCriteria.create({
    data: {
      requirementId: body.requirementId,
      criteriaKey: body.criteriaKey,
      given: body.given,
      when: body.when,
      then: body.then,
    },
  });

  return mapToResponse(record);
}

export async function updateAcceptanceCriterion(id: string, body: UpdateAcceptanceCriterionBody) {
  const existing = await prisma.acceptanceCriteria.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Acceptance criterion not found");

  const record = await prisma.acceptanceCriteria.update({
    where: { id },
    data: body,
  });

  return mapToResponse(record);
}

export async function deleteAcceptanceCriterion(id: string) {
  const existing = await prisma.acceptanceCriteria.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Acceptance criterion not found");
  await prisma.acceptanceCriteria.delete({ where: { id } });
}
