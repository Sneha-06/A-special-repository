import { GenerationStatus, GenerationType, Prisma } from "@prisma/client";
import { generateTestDataWithAi } from "./ai/testDataGenerator";
import { getRequirementById } from "./requirementService";
import { listTestCases } from "./testCaseService";
import { prisma } from "../utils/prisma";
import { env } from "../utils/env";
import type { GenerateTestDataBody } from "../validators/testDataSchemas";

export async function listSyntheticTestData(requirementId: string) {
  const records = await prisma.syntheticTestData.findMany({
    where: { requirementId },
    orderBy: [{ field: "asc" }, { purpose: "asc" }],
  });

  return {
    testData: records.map((row) => ({
      id: row.id,
      field: row.field,
      value: row.value,
      dataType: row.dataType,
      purpose: row.purpose,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function generateSyntheticTestData(body: GenerateTestDataBody) {
  const requirement = await getRequirementById(body.requirementId);
  const testCases = await listTestCases(body.requirementId);

  const historyEntry = await prisma.generationHistory.create({
    data: {
      requirementId: body.requirementId,
      generationType: GenerationType.SYNTHETIC_TEST_DATA,
      model: env.openAiModel,
      status: GenerationStatus.PROCESSING,
      input: { type: "synthetic_test_data", ...body } as unknown as Prisma.InputJsonValue,
      output: {},
    },
  });

  try {
    const generated = await generateTestDataWithAi({
      requirement: {
        title: requirement.title,
        description: requirement.description,
        userStory: requirement.userStory,
        applicationModule: requirement.applicationModule,
        acceptanceCriteriaText: requirement.acceptanceCriteriaText,
      },
      testCases: testCases.map((tc) => ({
        testCaseId: tc.testCaseId,
        title: tc.title,
        category: tc.category,
        preconditions: tc.preconditions,
        steps: tc.steps.map((s) => ({ action: s.action, testData: s.testData })),
      })),
    });

    if (body.replaceExisting ?? true) {
      await prisma.syntheticTestData.deleteMany({ where: { requirementId: body.requirementId } });
    }

    const saved = await Promise.all(
      generated.map((item) =>
        prisma.syntheticTestData.create({
          data: {
            requirementId: body.requirementId,
            field: item.field,
            value: item.value,
            dataType: item.dataType,
            purpose: item.purpose,
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
      testData: saved.map((row) => ({
        id: row.id,
        field: row.field,
        value: row.value,
        dataType: row.dataType,
        purpose: row.purpose,
      })),
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
