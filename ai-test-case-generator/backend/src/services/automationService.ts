import { GenerationStatus, GenerationType, Prisma } from "@prisma/client";
import { generateAutomationCodeWithAi } from "./ai/automationGenerator";
import { getTestCaseById } from "./testCaseService";
import { HttpError } from "../utils/httpError";
import { prisma } from "../utils/prisma";
import { env } from "../utils/env";
import type { GenerateAutomationBody } from "../validators/automationSchemas";

export async function generateAutomationCode(body: GenerateAutomationBody) {
  const testCase = await getTestCaseById(body.testCaseId);

  if (testCase.steps.length === 0) {
    throw new HttpError(400, "Test case must have at least one step to generate automation code");
  }

  const historyEntry = await prisma.generationHistory.create({
    data: {
      requirementId: testCase.requirementId,
      generationType: GenerationType.AUTOMATION_CODE,
      model: env.openAiModel,
      status: GenerationStatus.PROCESSING,
      input: body as unknown as Prisma.InputJsonValue,
      output: {},
    },
  });

  try {
    const code = await generateAutomationCodeWithAi({
      testCaseId: testCase.testCaseId,
      title: testCase.title,
      category: testCase.category,
      priority: testCase.priority,
      severity: testCase.severity,
      preconditions: testCase.preconditions,
      expectedResult: testCase.expectedResult,
      postconditions: testCase.postconditions,
      steps: testCase.steps.map((step) => ({
        stepNumber: step.stepNumber,
        action: step.action,
        testData: step.testData,
        expectedResult: step.expectedResult,
      })),
      testData: testCase.testData.map((row) => ({
        field: row.field,
        value: row.value,
        dataType: row.dataType,
      })),
      framework: body.framework,
      language: body.language,
    });

    const automation = await prisma.automationCode.create({
      data: {
        testCaseId: body.testCaseId,
        framework: body.framework,
        language: body.language,
        code,
      },
    });

    await prisma.testCase.update({
      where: { id: body.testCaseId },
      data: { automationCandidate: true },
    });

    await prisma.generationHistory.update({
      where: { id: historyEntry.id },
      data: {
        status: GenerationStatus.COMPLETED,
        output: {
          automationId: automation.id,
          framework: body.framework,
          language: body.language,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      testCaseId: testCase.testCaseId,
      framework: body.framework,
      language: body.language,
      code: automation.code,
      automationId: automation.id,
      createdAt: automation.createdAt.toISOString(),
    };
  } catch (error) {
    await prisma.generationHistory.update({
      where: { id: historyEntry.id },
      data: {
        status: GenerationStatus.FAILED,
        output: {
          error: error instanceof Error ? error.message : "Automation generation failed",
        } as unknown as Prisma.InputJsonValue,
      },
    });
    throw error;
  }
}

export async function getLatestAutomationCode(testCaseDbId: string) {
  const record = await prisma.automationCode.findFirst({
    where: { testCaseId: testCaseDbId },
    orderBy: { createdAt: "desc" },
    include: {
      testCase: { select: { testCaseId: true, title: true } },
    },
  });

  if (!record) {
    throw new HttpError(404, "No automation code found for this test case");
  }

  return {
    testCaseId: record.testCase.testCaseId,
    framework: record.framework,
    language: record.language,
    code: record.code,
    automationId: record.id,
    createdAt: record.createdAt.toISOString(),
  };
}
