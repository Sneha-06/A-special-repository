import { GenerationStatus, GenerationType, Prisma } from "@prisma/client";
import { analyzeRequirement } from "./ai/requirementAnalyzer";
import { HttpError } from "../utils/httpError";
import { prisma } from "../utils/prisma";
import { env } from "../utils/env";
import type { RequirementInput, RequirementUpdateInput } from "../types/requirement";
import type { CreateRequirementBody, UpdateRequirementBody } from "../validators/requirementSchemas";

function mapCreateBody(body: CreateRequirementBody): RequirementInput {
  return {
    projectId: body.projectId,
    title: body.title,
    description: body.description,
    userStory: body.userStory,
    applicationModule: body.applicationModule,
    priority: body.priority,
    acceptanceCriteria: body.acceptanceCriteria,
    additionalContext: body.additionalContext,
  };
}

function toDbData(input: RequirementInput | RequirementUpdateInput) {
  return {
    ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.userStory !== undefined ? { userStory: input.userStory || null } : {}),
    ...(input.applicationModule !== undefined ? { applicationModule: input.applicationModule || null } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.acceptanceCriteria !== undefined
      ? { acceptanceCriteriaText: input.acceptanceCriteria || null }
      : {}),
    ...(input.additionalContext !== undefined
      ? { additionalContext: input.additionalContext || null }
      : {}),
  };
}

export async function listRequirements() {
  return prisma.requirement.findMany({
    include: {
      project: { select: { id: true, name: true } },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRequirementById(id: string) {
  const requirement = await prisma.requirement.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      analyses: { orderBy: { createdAt: "desc" } },
      acceptanceCriteria: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!requirement) {
    throw new HttpError(404, "Requirement not found");
  }

  return requirement;
}

export async function createRequirement(body: CreateRequirementBody) {
  const project = await prisma.project.findUnique({ where: { id: body.projectId } });
  if (!project) {
    throw new HttpError(400, "Invalid projectId — project does not exist");
  }

  const input = mapCreateBody(body);

  return prisma.requirement.create({
    data: {
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      userStory: input.userStory || null,
      applicationModule: input.applicationModule || null,
      acceptanceCriteriaText: input.acceptanceCriteria || null,
      additionalContext: input.additionalContext || null,
      priority: input.priority ?? "MEDIUM",
    },
    include: {
      project: { select: { id: true, name: true } },
      analyses: true,
    },
  });
}

export async function updateRequirement(id: string, body: UpdateRequirementBody) {
  await getRequirementById(id);

  if (body.projectId) {
    const project = await prisma.project.findUnique({ where: { id: body.projectId } });
    if (!project) {
      throw new HttpError(400, "Invalid projectId — project does not exist");
    }
  }

  return prisma.requirement.update({
    where: { id },
    data: toDbData(body),
    include: {
      project: { select: { id: true, name: true } },
      analyses: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function deleteRequirement(id: string) {
  await getRequirementById(id);
  await prisma.requirement.delete({ where: { id } });
}

export async function analyzeRequirementById(id: string) {
  const requirement = await getRequirementById(id);

  const historyEntry = await prisma.generationHistory.create({
    data: {
      requirementId: id,
      generationType: GenerationType.REQUIREMENT_ANALYSIS,
      model: env.openAiModel,
      status: GenerationStatus.PROCESSING,
      input: {
        title: requirement.title,
        description: requirement.description,
        userStory: requirement.userStory,
        applicationModule: requirement.applicationModule,
        priority: requirement.priority,
        acceptanceCriteriaText: requirement.acceptanceCriteriaText,
        additionalContext: requirement.additionalContext,
      },
      output: {},
    },
  });

  try {
    const analysis = await analyzeRequirement({
      title: requirement.title,
      description: requirement.description,
      userStory: requirement.userStory,
      applicationModule: requirement.applicationModule,
      priority: requirement.priority,
      acceptanceCriteriaText: requirement.acceptanceCriteriaText,
      additionalContext: requirement.additionalContext,
    });

    const saved = await prisma.requirementAnalysis.create({
      data: {
        requirementId: id,
        summary: analysis.summary,
        actors: analysis.actors,
        preconditions: analysis.preconditions,
        businessRules: analysis.businessRules,
        functionalRequirements: analysis.functionalRequirements,
        nonFunctionalRequirements: analysis.nonFunctionalRequirements,
        assumptions: analysis.assumptions,
        ambiguities: analysis.ambiguities,
        missingInformation: analysis.missingInformation,
        riskAreas: analysis.riskAreas,
      },
    });

    await prisma.generationHistory.update({
      where: { id: historyEntry.id },
      data: {
        status: GenerationStatus.COMPLETED,
        output: analysis as unknown as Prisma.InputJsonValue,
      },
    });

    return { analysis: saved, result: analysis };
  } catch (error) {
    await prisma.generationHistory.update({
      where: { id: historyEntry.id },
      data: {
        status: GenerationStatus.FAILED,
        output: {
          error: error instanceof Error ? error.message : "Analysis failed",
        },
      },
    });
    throw error;
  }
}
